// 番地から建物を逆引きする（改名物件の救済）
//
// 太田の物件は購入後に「プライマリー〇〇」へ改名しているものが多く、SUUMO・HOME'S には
// 旧名で載っている。そのため物件名では建物情報（間取り・面積・築年・構造）が一切取れず、
// 類似物件の絞り込み条件がゼロになって「全然類似していない一覧」が出ていた
// （プライマリー合川A棟＝久留米市合川町235-1 で実測 2026-08-14。合川町の273棟に
//   「プライマリー」で始まる建物は1件も無い＝旧名で載っていることが確定）。
//
// ここでは LIFULL HOME'S 不動産アーカイブの町ページ（建物一覧）を巡回し、
// 各建物ページの所在地が入力の番地と一致するものを探す＝物件名に依存しない特定を行う。
//
// GET /api/byaddr?pref=福岡県&city=久留米市&addr=福岡県久留米市合川町235-1&offset=0
//   → {found:true, name, addr, kind, struct, built, floors, rooms, history, url, src}
//   → まだ見つからない: {found:false, reason:'not_yet', next:40, total:273}
//     クライアントは next を offset に入れて続きを要求する（1回の呼び出しで調べる件数を
//     絞るのは、Cloudflare Functions のサブリクエスト上限に収めるため）。
//
// ⚠️建物ページは cf.cacheTtl で1日キャッシュされるので、2回目以降の同一エリアは速い。

const PREF_SLUG = { '北海道': 'hokkaido', '青森県': 'aomori', '岩手県': 'iwate', '宮城県': 'miyagi', '秋田県': 'akita', '山形県': 'yamagata', '福島県': 'fukushima', '茨城県': 'ibaraki', '栃木県': 'tochigi', '群馬県': 'gumma', '埼玉県': 'saitama', '千葉県': 'chiba', '東京都': 'tokyo', '神奈川県': 'kanagawa', '新潟県': 'niigata', '富山県': 'toyama', '石川県': 'ishikawa', '福井県': 'fukui', '山梨県': 'yamanashi', '長野県': 'nagano', '岐阜県': 'gifu', '静岡県': 'shizuoka', '愛知県': 'aichi', '三重県': 'mie', '滋賀県': 'shiga', '京都府': 'kyoto', '大阪府': 'osaka', '兵庫県': 'hyogo', '奈良県': 'nara', '和歌山県': 'wakayama', '鳥取県': 'tottori', '島根県': 'shimane', '岡山県': 'okayama', '広島県': 'hiroshima', '山口県': 'yamaguchi', '徳島県': 'tokushima', '香川県': 'kagawa', '愛媛県': 'ehime', '高知県': 'kochi', '福岡県': 'fukuoka', '佐賀県': 'saga', '長崎県': 'nagasaki', '熊本県': 'kumamoto', '大分県': 'oita', '宮崎県': 'miyazaki', '鹿児島県': 'kagoshima', '沖縄県': 'okinawa' };
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BATCH = 36; // 1回の呼び出しで見る建物ページ数（サブリクエスト上限に収める）

export async function onRequest(context) {
  const u = new URL(context.request.url);
  const json = (o) => new Response(JSON.stringify(o), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=86400', 'access-control-allow-origin': '*' },
  });

  const addr = (u.searchParams.get('addr') || '').trim();
  const pref = (u.searchParams.get('pref') || '').trim() || (addr.match(/(北海道|東京都|京都府|大阪府|.{2,3}県)/) || [])[1] || '';
  let city = (u.searchParams.get('city') || '').trim();
  const offset = Math.max(0, parseInt(u.searchParams.get('offset') || '0', 10) || 0);
  const dbg = u.searchParams.get('debug') ? [] : null;
  const banti = bantiKey(addr);
  if (!addr || !banti) return json({ found: false, reason: 'no_banti' });

  const slug = PREF_SLUG[pref];
  if (!slug) return json({ found: false, reason: 'no_pref' });
  if (!city) {
    const rest = addr.replace(/^.*?(北海道|東京都|京都府|大阪府|.{2,3}県)/, '');
    const m = rest.match(/^\s*(.{2,6}?[市郡])(.{1,5}?[区町村])?/);
    if (m) city = /郡$/.test(m[1]) ? (m[2] || m[1]) : m[1] + (m[2] && /区$/.test(m[2]) ? m[2] : '');
  }
  if (!city) return json({ found: false, reason: 'no_city' });

  const get = async (url, tag) => {
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'ja,en;q=0.8' }, cf: { cacheTtl: 86400, cacheEverything: true } });
      const t = await r.text();
      if (dbg) dbg.push({ tag: tag, status: r.status, len: t.length });
      return r.ok ? t : '';
    } catch (e) { if (dbg) dbg.push({ tag: tag, err: String(e && e.message) }); return ''; }
  };

  try {
    // ① 市区町村ページ → ② 町（-town）/丁目（-addr）ページのURL
    const cityHtml = await get(`https://www.homes.co.jp/archive/address/${slug}/`, 'pref');
    const cityUrl = pickLink(cityHtml, /\/archive\/address\/[a-z0-9-]+\/[a-z0-9-]+\/$/, (t) => t === city);
    if (!cityUrl) return json({ found: false, reason: 'no_city_page', debug: dbg || undefined });
    const townHtml = await get(cityUrl, 'city');
    const town = townKey(addr, city);
    const townUrl = pickLink(townHtml, /-(town|addr)\/$/, (t) => {
      const k = norm(t);
      return k && town && (k === town || k.startsWith(town) || town.startsWith(k));
    });
    if (!townUrl) return json({ found: false, reason: 'no_town_page', debug: dbg || undefined });

    // ③ 町ページ（1ページ30棟）を必要な分だけ辿って建物一覧を作る
    const list = [];
    const needPages = Math.ceil((offset + BATCH) / 30);
    for (let pg = 1; pg <= Math.min(needPages, 14); pg++) {
      const html = await get(pg === 1 ? townUrl : townUrl + '?page=' + pg, 'townpage');
      if (!html) break;
      const got = listBuildings(html);
      if (!got.length) break;
      got.forEach((b) => { if (!list.some((x) => x.id === b.id)) list.push(b); });
      if (got.length < 30) break;
    }
    if (!list.length) return json({ found: false, reason: 'no_buildings', debug: dbg || undefined });

    // ④ 建物ページの所在地が入力の番地と一致するものを探す
    const slice = list.slice(offset, offset + BATCH);
    for (const b of slice) {
      const html = await get('https://www.homes.co.jp/archive/' + b.id + '/', 'building');
      if (!html) continue;
      const info = readBuilding(html);
      if (!info || !info.addr) continue;
      if (bantiKey(info.addr) !== banti) continue;
      return json(Object.assign({ found: true, url: 'https://www.homes.co.jp/archive/' + b.id + '/', src: "LIFULL HOME'S 建物情報", via: 'banti' }, info));
    }
    const next = offset + slice.length;
    return json({ found: false, reason: next < list.length || list.length % 30 === 0 ? 'not_yet' : 'no_match', next: next, scanned: next, debug: dbg || undefined });
  } catch (e) {
    return json({ found: false, reason: 'exception: ' + (e && e.message), debug: dbg || undefined });
  }
}

/* 「福岡県久留米市合川町235-1」→「合川町235-1」を比較用に正規化した鍵にする。
   HOME'Sは「235-1、235-3」と複数を並べることがあるので先頭だけ見る。 */
function bantiKey(a) {
  const s = norm(String(a || '').replace(/^.*?[都道府県]/, '').replace(/^.{2,6}?[市郡].{0,5}?[区町村]?/, (m) => m));
  const m = String(norm(a)).replace(/^.*?[都道府県]/, '').match(/([^\d]{1,12}?)(\d+(?:[-−‐]\d+)*)/);
  if (!m) return '';
  const town = m[1].replace(/^.{2,6}?[市郡]/, '').replace(/^.{1,5}?区/, '');
  const num = m[2].replace(/[−‐]/g, '-').split(',')[0];
  return town.replace(/[\s　]/g, '') + num;
}
function townKey(addr, city) {
  const rest = norm(addr).replace(/^.*?[都道府県]/, '').replace(city, '');
  const m = rest.match(/^([^\d]{1,10}?)(\d+)?(?:丁目)?/);
  if (!m) return '';
  return (m[1] || '').replace(/[\s　]/g, '') + (m[2] && rest.indexOf('丁目') >= 0 ? m[2] + '丁目' : '');
}
function norm(s) {
  return String(s || '').replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/[\s　]/g, '').replace(/（\d+）$/, '').replace(/\(\d+\)$/, '');
}
function pickLink(html, urlRe, textOk) {
  const re = /<a[^>]+href="(https:\/\/www\.homes\.co\.jp\/archive\/[^"]+)"[^>]*>([\s\S]{0,400}?)<\/a>/g;
  let m;
  while ((m = re.exec(html))) {
    if (!urlRe.test(m[1])) continue;
    const t = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (textOk(norm(t))) return m[1];
  }
  return '';
}
function listBuildings(html) {
  const out = [];
  const re = /\/archive\/(b-\d+)\/"[\s\S]{0,900}?font-bold[^>]*>([^<]{1,60})</g;
  let m;
  while ((m = re.exec(html))) if (!out.some((x) => x.id === m[1])) out.push({ id: m[1], name: m[2].trim() });
  return out;
}

/* 建物ページ→種別・構造・築年月・階建・所在地・部屋情報・掲載履歴（/api/spec と同じ読み方） */
function readBuilding(html) {
  const text = html.replace(/<[^>]+>/g, '|').replace(/&nbsp;/g, ' ').replace(/[ \t]+/g, ' ').replace(/\|{2,}/g, '|');
  const pick = (label, pat) => {
    const m = text.match(new RegExp('\\|' + label + '\\|(' + pat + ')\\|'));
    return m ? m[1].trim() : '';
  };
  const name = (html.match(/<h1[^>]*>([\s\S]{1,80}?)<\/h1>/) || [])[1] ? (html.match(/<h1[^>]*>([\s\S]{1,80}?)<\/h1>/) || [])[1].replace(/<[^>]+>/g, '').trim() : '';
  const addr = pick('所在地', '[^|]{4,60}');
  const struct = pick('建物構造', '[^|]{1,16}');
  const built = pick('築年月', '[^|]{1,16}') || pick('竣工年月', '[^|]{1,16}');
  const floors = pick('階建', '[^|]{1,12}');
  const kind = pick('建物種別', '[^|]{1,12}');
  const rooms = [];
  {
    const re = /\|(\d{1,2})階\|([\d.]{1,6})m²\|([^|]{1,8})\|/g;
    let m;
    while ((m = re.exec(text)) && rooms.length < 40) rooms.push({ floor: +m[1], men: parseFloat(m[2]), md: m[3].trim() });
  }
  const history = [];
  {
    const re = /\|(\d{4})年(\d{1,2})月([^|]{0,20})\|([\d.]{1,5})万円[^|]*\|([^|]*)\|([^|]*)\|([^|]*)\|/g;
    let m;
    while ((m = re.exec(text)) && history.length < 40) {
      history.push({ y: +m[1], mo: +m[2], period: m[1] + '年' + m[2] + '月' + (m[3] || ''), rent: Math.round(parseFloat(m[4]) * 10000), men: parseFloat(String(m[5]).replace(/[^\d.]/g, '')) || null, md: /[0-9]?[SLDK]/.test(m[6]) ? m[6].trim() : '', floor: m[7].trim() });
    }
    history.sort((a, b) => b.y * 12 + b.mo - (a.y * 12 + a.mo));
  }
  if (!name || (!struct && !built)) return null;
  return { name: name, addr: addr, kind: kind, struct: struct, built: built, floors: floors, rooms: rooms, history: history.slice(0, 12) };
}
