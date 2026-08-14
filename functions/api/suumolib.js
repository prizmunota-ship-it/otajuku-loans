// 本物件そのものの実データ（SUUMO物件ライブラリー）
//
// これまでこの照会はGAS経由で、しかも `|ラベル|値|` の並びを前提にパースしていた。
// 実際のページは `|種別 | |アパート| |築年月| |1996年2月|` のようにラベルと値の間に
// 空セルが入るため、ヒットしているのに中身が全部空になっていた。
// その結果「本物件の間取り・面積・構造・築年が未取得」→ 類似物件の絞り込み条件がゼロ→
// 近い順に並べただけの「全然類似していない一覧」が出ていた
// （プライマリー合川A棟で実測 2026-08-14。SUUMOには木造・1996年2月築・アパート・
//   2階建・ワンルーム19㎡2.9万円まで全部載っている）。
//
// GET /api/suumolib?name=プライマリー合川A棟&city=久留米市&pref=福岡県
//   → {found:true, name, addr, station, kind, struct, built, floors, units, parking,
//      rooms:[{md,men,rent}], equip:[...], url, src}
//
// GASの改修は Monaco+base64+デプロイの儀式が要るので、Pages Function に移して
// 「ファイルを直して git push」だけで直せるようにする（この判断は既に正解パターン）。

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

export async function onRequest(context) {
  const u = new URL(context.request.url);
  const json = (o) => new Response(JSON.stringify(o), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=86400', 'access-control-allow-origin': '*' },
  });
  const name = (u.searchParams.get('name') || '').trim();
  const city = (u.searchParams.get('city') || '').trim();
  const dbg = u.searchParams.get('debug') ? [] : null;
  if (!name) return json({ found: false, reason: 'no_name' });

  const get = async (url, tag) => {
    for (let i = 0; i < 2; i++) {
      try {
        const r = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'ja,en;q=0.8' }, cf: { cacheTtl: 86400, cacheEverything: true } });
        const t = await r.text();
        if (dbg) dbg.push({ tag: tag, status: r.status, len: t.length });
        if (r.ok) return t;
      } catch (e) { if (dbg) dbg.push({ tag: tag, err: String(e && e.message) }); }
    }
    return '';
  };

  try {
    // ① 物件名で検索 →（ヒットしなければ「A棟」等の枝番を落として再検索）
    let cands = [];
    for (const q of [name, name.replace(/\s*[A-ZＡ-Ｚ]?棟$/, '').replace(/\s*[0-9０-９]+号館$/, '')]) {
      if (!q || (cands.length && q === name)) continue;
      const html = await get('https://suumo.jp/library/search/ichiran.html?qr=' + encodeURIComponent(q), 'search');
      if (!html) continue;
      cands = listHits(html);
      if (cands.length) break;
    }
    if (!cands.length) return json({ found: false, reason: 'not_listed', debug: dbg || undefined });

    // ② 名前と市区町村で1件に絞る（別物件を掴まないための照合）
    let hit = cands.find((c) => sameName(c.name, name) && (!city || (c.addr || '').indexOf(city) >= 0))
           || cands.find((c) => sameName(c.name, name))
           || (cands.length === 1 ? cands[0] : null);
    if (!hit) return json({ found: false, reason: 'name_mismatch', cands: cands.map((c) => c.name).slice(0, 5), debug: dbg || undefined });

    // ③ 物件ページから実データを読む
    const purl = 'https://suumo.jp/library/' + hit.path + '/';
    const html = await get(purl, 'page');
    if (!html) return json({ found: false, reason: 'page_failed', debug: dbg || undefined });
    const info = readPage(html);
    if (!info) return json({ found: false, reason: 'parse_failed', debug: dbg || undefined });
    // ★物件ライブラリーの一覧の「価格」は家賃のみで管理費・共益費が入っていない。
    //   比較物件（/api/chintai）は月額総額（家賃＋管理費）なので、そのままだと
    //   本物件だけ安く見えて比較にならない（太田指摘 2026-08-14）。
    //   各部屋の詳細ページ（bc_）に「管理費・共益費」があるので上位3室だけ取りに行く。
    const bcs = [];
    { const re = /suumo\.jp\/chintai\/(bc_\d+)\//g; let m2;
      while ((m2 = re.exec(html))) if (bcs.indexOf(m2[1]) < 0) bcs.push(m2[1]); }
    for (let i = 0; i < Math.min(3, info.rooms.length); i++) {
      const r = info.rooms[i];
      r.admin = null; r.total = r.rent;
      if (!bcs[i]) continue;
      const dh = await get('https://suumo.jp/chintai/' + bcs[i] + '/', 'room');
      if (!dh) continue;
      const dt = flat(dh);
      const am = dt.match(/\|\s*管理費[・･]?共益費?\s*\|(?:\s*\|)*\s*([\d,]+)\s*円/) ||
                 dt.match(/\|\s*管理費\s*\|(?:\s*\|)*\s*([\d,]+)\s*円/);
      if (am) { r.admin = parseInt(am[1].replace(/,/g, ''), 10) || 0; r.total = r.rent + r.admin; }
      r.url = 'https://suumo.jp/chintai/' + bcs[i] + '/';
    }
    const h1 = (flat(html).match(/\|\s*([^|]{2,40}?)の賃貸物件情報\s*\|/) || [])[1] || '';
    const nm = h1.trim() || (/[\/">]/.test(hit.name) ? '' : hit.name);
    if (nm && !sameName(nm, name)) return json({ found: false, reason: 'name_mismatch', got: nm, debug: dbg || undefined });
    return json(Object.assign({ found: true, url: purl, src: 'SUUMO物件ライブラリー（実データ）' }, info, { name: nm || name, addr: info.addr || hit.addr, station: info.station || hit.station }));
  } catch (e) {
    return json({ found: false, reason: 'exception: ' + (e && e.message), debug: dbg || undefined });
  }
}

/* 検索結果の一覧から {path,name,addr,station} を取り出す */
function listHits(html) {
  const out = [];
  const re = /\/library\/(tf_\w+\/sc_\w+\/to_\w+)\/"[\s\S]{0,600}?/g;
  let m;
  while ((m = re.exec(html))) {
    const path = m[1];
    if (out.some((x) => x.path === path)) continue;
    // リンク以降のテキストに「物件名｜住所｜駅」が並ぶ
    const tail = flat(html.slice(m.index, m.index + 1200));
    const cells = tail.split('|').map((s) => s.trim()).filter(Boolean);
    const nm = cells.find((c) => /[^\s\d]/.test(c) && !/[\/">]/.test(c) && !/^(https?|tf_|築年月|賃貸|売買|イメージ|間取り)/.test(c) && c.length <= 40 && !/[都道府県]$/.test(c)) || '';
    const ad = cells.find((c) => /(北海道|東京都|京都府|大阪府|.{2,3}県).{2,20}/.test(c)) || '';
    const st = cells.find((c) => /歩\d+分/.test(c)) || '';
    out.push({ path: path, name: nm, addr: ad, station: st });
  }
  return out;
}

/* 物件ページ本体。⚠️ラベルと値の間に空セルが入る（|種別 | |アパート|）ので、
   ラベルの後ろの空セルを読み飛ばしてから値を取る。ここが従来の取りこぼしの原因だった。 */
function readPage(html) {
  const t = flat(html);
  const val = (label, max) => {
    const m = t.match(new RegExp('\\|\\s*' + label + '\\s*\\|(?:\\s*\\|)*\\s*([^|]{1,' + (max || 24) + '})\\|'));
    const v = m ? m[1].trim() : '';
    return v === '‐' || v === '-' || v === '−' ? '' : v;
  };
  // 住所は「|福岡県| |久留米市| 合川町|」のように分かれて入る
  let addr = '';
  {
    const m = t.match(/\|\s*住所\s*\|((?:\s*\|?\s*[^|]{0,20}){1,6})/);
    if (m) {
      const parts = m[1].split('|').map((s) => s.trim()).filter(Boolean);
      const idx = parts.findIndex((p) => /(北海道|東京都|京都府|大阪府|.{2,3}県)$/.test(p));
      if (idx >= 0) addr = parts.slice(idx, idx + 4).join('').replace(/最寄駅.*$/, '');
      else addr = parts.slice(0, 3).join('');
    }
  }
  const station = (t.match(/\|\s*最寄駅\s*\|(?:\s*\|)*\s*([^|]{4,40}歩\d+分)/) || [])[1] || '';
  const kind = val('種別', 12);
  const struct = val('構造', 16);
  const built = val('築年月', 16);
  const floors = val('階建', 12);
  const units = val('総戸数', 12);
  const parking = val('駐車場', 16);
  // 募集中の部屋：|ワンルーム| |2.9万円| |19平米| |-| |即|
  const rooms = [];
  {
    const re = /\|\s*(ワンルーム|[0-9]{1,2}[SLDKR]{1,4})\s*\|(?:\s*\|)*\s*([\d.]{1,6})万円\s*\|(?:\s*\|)*\s*([\d.]{1,6})平米/g;
    let m;
    while ((m = re.exec(t)) && rooms.length < 20) {
      rooms.push({ md: m[1] === 'ワンルーム' ? '1R' : m[1], rent: Math.round(parseFloat(m[2]) * 10000), men: parseFloat(m[3]) });
    }
  }
  const equip = [];
  {
    const m = t.match(/\|\s*設備[・･]特徴\s*\|([\s\S]{0,600}?)\|\s*周辺情報/);
    if (m) m[1].split('|').map((s) => s.trim()).filter((s) => s && s.length <= 14).forEach((s) => { if (equip.indexOf(s) < 0) equip.push(s); });
  }
  if (!struct && !built && !rooms.length) return null;
  return { addr: addr, station: station, kind: kind, struct: struct, built: built, floors: floors, units: units, parking: parking, rooms: rooms, equip: equip.slice(0, 20) };
}

function flat(h) {
  return h.replace(/<[^>]+>/g, '|').replace(/&nbsp;/g, ' ').replace(/&gt;/g, '>').replace(/[ \t\r\n]+/g, ' ').replace(/\|{2,}/g, '|');
}
/* 完全一致か「A棟・Ⅱ・2号館」程度の短い枝番違いのみ許容（部分一致だと別物件を掴む） */
function sameName(a, b) {
  const n = (s) => String(s || '').replace(/[\s　・･]/g, '').replace(/[ａ-ｚＡ-Ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).toUpperCase();
  const x = n(a), y = n(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const strip = (s) => s.replace(/(棟|号館|番館|館)?$/, '').replace(/[A-Z0-9ⅠⅡⅢⅣⅤ]{1,3}$/, '');
  return strip(x) === strip(y) && Math.abs(x.length - y.length) <= 3;
}
