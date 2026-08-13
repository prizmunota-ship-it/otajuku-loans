// 周辺の募集中物件（SUUMO一覧）＋物件ごとの駐車場代
//
// これまで類似物件はGAS経由でSUUMOの一覧「1ページ目・最大10件」しか見ておらず、
// 母数が小さすぎて調査対象範囲(半径1.5km)内に2件しか残らない、ということが起きていた
// （太田指摘 2026-08-13。八幡西区1Kは実際には4,534件ある）。ここではページ送りで母数を広げ、
// さらに各物件の詳細ページから「駐車場」欄を取って周辺の駐車場相場（中央値）も返す。
//
// GET /api/chintai?pref=fukuoka&sc=sc_kitakyushushiyahatanishi&md=02&pages=5&detail=12
// GET /api/chintai?pref=福岡県&city=北九州市八幡西区&md=1K   （日本語でも可・sc_を自動解決）
//   → {found:true, url, total, items:[{name,addr,age,md,men,rent,admin,total,href,park,parkFee}],
//      park:{n, median, min, max, noneCount}, src}
//
// ⚠️SUUMO側の負荷に配慮して pages は最大8、詳細ページの取得は最大15件までに制限する。

const MD = { '1R': '01', '1K': '02', '1DK': '03', '1LDK': '04', '2K': '05', '2DK': '06', '2LDK': '07', '3K': '08', '3DK': '09', '3LDK': '10', '4K': '11', '4DK': '12', '4LDK': '13' };
const PREF = { '北海道': 'hokkaido', '青森県': 'aomori', '岩手県': 'iwate', '宮城県': 'miyagi', '秋田県': 'akita', '山形県': 'yamagata', '福島県': 'fukushima', '茨城県': 'ibaraki', '栃木県': 'tochigi', '群馬県': 'gumma', '埼玉県': 'saitama', '千葉県': 'chiba', '東京都': 'tokyo', '神奈川県': 'kanagawa', '新潟県': 'niigata', '富山県': 'toyama', '石川県': 'ishikawa', '福井県': 'fukui', '山梨県': 'yamanashi', '長野県': 'nagano', '岐阜県': 'gifu', '静岡県': 'shizuoka', '愛知県': 'aichi', '三重県': 'mie', '滋賀県': 'shiga', '京都府': 'kyoto', '大阪府': 'osaka', '兵庫県': 'hyogo', '奈良県': 'nara', '和歌山県': 'wakayama', '鳥取県': 'tottori', '島根県': 'shimane', '岡山県': 'okayama', '広島県': 'hiroshima', '山口県': 'yamaguchi', '徳島県': 'tokushima', '香川県': 'kagawa', '愛媛県': 'ehime', '高知県': 'kochi', '福岡県': 'fukuoka', '佐賀県': 'saga', '長崎県': 'nagasaki', '熊本県': 'kumamoto', '大分県': 'oita', '宮崎県': 'miyazaki', '鹿児島県': 'kagoshima', '沖縄県': 'okinawa' };
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

export async function onRequest(context) {
  const { request } = context;
  const u = new URL(request.url);
  const json = (o, s = 200) =>
    new Response(JSON.stringify(o), {
      status: s,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=21600',
        'access-control-allow-origin': '*',
      },
    });

  const prefIn = (u.searchParams.get('pref') || '').trim();
  const pref = PREF[prefIn] || (/^[a-z]+$/.test(prefIn) ? prefIn : '');
  const city = (u.searchParams.get('city') || '').trim();
  let sc = (u.searchParams.get('sc') || '').trim();
  const mdIn = (u.searchParams.get('md') || '').trim();
  const md = MD[mdIn] || (/^\d{2}$/.test(mdIn) ? mdIn : '');
  const pages = Math.min(Math.max(parseInt(u.searchParams.get('pages') || '8', 10) || 8, 1), 15);
  const detail = Math.min(Math.max(parseInt(u.searchParams.get('detail') || '12', 10) || 12, 0), 15);
  const dbg = u.searchParams.get('debug');

  const log = [];
  const get = async (url) => {
    try {
      const r = await fetch(url, {
        headers: { 'user-agent': UA, 'accept-language': 'ja,en;q=0.8' },
        cf: { cacheTtl: 21600, cacheEverything: true },
      });
      const t = await r.text();
      log.push({ url, status: r.status, len: t.length });
      return r.ok ? t : '';
    } catch (e) {
      log.push({ url, err: String(e && e.message) });
      return '';
    }
  };

  // ★POST＝enrich（後追い取得）モード。
  //   一覧だけ先に返し、クライアントが「本物件からの距離」で絞ってから、
  //   残った物件についてだけ駐車場代と番地までの住所を取りに来る。
  //   （GETの先頭N件方式だと、市域が広い地域では遠方の物件ばかりを調べてしまい、
  //     「周辺の駐車場相場」が市内ランダムの中央値になっていた＝久留米で実測 2026-08-14）
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const rows = (body && body.rows || []).slice(0, 15);
      if (!rows.length) return json({ found: false, reason: 'no_rows' });
      const r = await enrich(rows, get, new URL(request.url).origin, 15, 15);
      return json({ found: true, items: rows, park: r.park, debug: dbg ? log : undefined });
    } catch (e) {
      return json({ found: false, reason: 'exception: ' + (e && e.message) });
    }
  }
  if (!pref) return json({ found: false, reason: 'no_pref' }, 400);

  try {
    // ① 市区町村名 → SUUMOの sc_ コード（公式の市区町村インデックスから引く）
    if (!sc && city) {
      const idx = await get(`https://suumo.jp/chintai/${pref}/city/`);
      const re = new RegExp('/chintai/' + pref + '/(sc_[a-z0-9]+)/"[^>]*>\\s*' + esc(city), 'i');
      const m = idx.match(re) || idx.match(new RegExp('(sc_[a-z0-9]+)/"[^>]*>[^<]*' + esc(city)));
      if (m) sc = m[1];
    }
    if (!sc) return json({ found: false, reason: 'no_city_code', debug: dbg ? log : undefined });

    // ② 一覧をページ送りで取得
    // pc=50 で1ページ50棟（既定は20棟）。市域が広いと母数が足りず、
    // 半径1.5km内に数件しか残らない事故が起きた（久留米で実測・太田指摘 2026-08-13）。
    const base = `https://suumo.jp/chintai/${pref}/${sc}/?pc=50` + (md ? `&md=${md}` : '');
    const items = [];
    let total = 0;
    for (let p = 1; p <= pages; p++) {
      const url = base + '&page=' + p;
      const html = await get(url);
      if (!html) break;
      if (p === 1) {
        const t = html.match(/pagination_set-hit[^>]*>[\s\S]*?([\d,]+)\s*件/);
        if (t) total = parseInt(t[1].replace(/,/g, ''), 10) || 0;
      }
      const got = parseList(html);
      items.push(...got);
      if (got.length === 0) break;
    }
    if (!items.length) return json({ found: false, reason: 'no_items', url: base, debug: dbg ? log : undefined });

    // ③④ 駐車場（詳細ページ）と番地までの住所（HOME'S）は、要求があったときだけ先頭N件を調べる。
    //     クライアントは detail=0&addr=0 で一覧だけ取り、距離で絞ってからPOSTで取りに来る。
    const wantAddr = u.searchParams.get('addr') !== '0';
    const en = await enrich(items, get, new URL(request.url).origin, detail, wantAddr ? 12 : 0);

    return json({
      found: true,
      url: base,
      sc: sc,
      total: total,
      items: items,
      park: en.park,
      src: 'SUUMO 賃貸（募集中物件一覧）',
      debug: dbg ? log : undefined,
    });
  } catch (e) {
    return json({ found: false, reason: 'exception: ' + (e && e.message), debug: dbg ? log : undefined });
  }
}

// 駐車場代（SUUMOの詳細ページ）と番地までの住所（LIFULL HOME'S 建物ページ）を後追いで埋める。
// 渡された順に nPark 件／nAddr 件だけ調べるので、呼ぶ側が「近い順」に並べてから渡すこと。
async function enrich(items, get, origin, nPark, nAddr) {
  const fees = [];
  let none = 0;
  for (let i = 0; i < Math.min(nPark, items.length); i++) {
    const it = items[i];
    if (!it.href) continue;
    const html = await get('https://suumo.jp' + it.href);
    if (!html) continue;
    const pk = parseParking(html);
    it.park = pk.text;
    it.parkFee = pk.fee;
    if (pk.fee > 0) fees.push(pk.fee);
    else if (pk.text && /無|なし|-/.test(pk.text)) none++;
    // 構造も同じ詳細ページにある（「構造・階建て 木造2階建」等）。
    // 類似物件の選定条件に構造を使う（太田指示 2026-08-14：間取り・構造・築年が近くないと比較にならない）
    const st = parseStruct(html);
    if (st) it.bstruct = st;
  }
  // SUUMOは一覧も詳細も丁目までしか出さないため、比較物件のピンが丁目の概算位置になる
  // （太田指摘 2026-08-13「HOME'Sは詳細な住所が載っている」）。経路は /api/spec と同じ。
  const seen = new Map();
  for (let i = 0; i < Math.min(nAddr, items.length); i++) {
    const it = items[i];
    if (!it.name || it.anon) continue; // 名称非公開はHOME'Sで引けない
    const key = it.name + '|' + it.addr;
    if (seen.has(key)) { it.addr2 = seen.get(key); continue; }
    const cityName = (String(it.addr || '').replace(/^.*?[都道府県]/, '').match(/^(.{2,8}?[市区町村])/) || [])[1] || '';
    const prefName = (String(it.addr || '').match(/(北海道|東京都|京都府|大阪府|.{2,3}県)/) || [])[1] || '';
    const su = `${origin}/api/spec?name=${encodeURIComponent(it.name)}&city=${encodeURIComponent(cityName)}&pref=${encodeURIComponent(prefName)}&addr=${encodeURIComponent(it.addr || '')}`;
    try {
      const r = await fetch(su, { cf: { cacheTtl: 86400, cacheEverything: true } });
      const j = await r.json();
      if (j && j.found && j.addr && /\d/.test(j.addr.replace(/^.*?[都道府県]/, ''))) {
        // 「波多江駅南1丁目729-6、729-32、731-2」のように番地が並ぶことがある。
        // 住所検索に通らないので先頭の1つだけ使う。
        const a = String(j.addr).split(/[、，,]/)[0].trim();
        it.addr2 = a;
        seen.set(key, a);
      }
      if (j && j.found) {
        // 構造（SUUMO詳細で取れなかった物件の補完）と、募集終了事例（掲載履歴）。
        // 履歴は「過去の募集時点の賃料」であって成約賃料ではない——表示側で必ず明記する。
        if (!it.bstruct && j.struct) it.bstruct = j.struct;
        if (j.history && j.history.length) it.hist = j.history.filter((h) => h.rent > 0).slice(0, 4);
      }
    } catch (e) { /* 取れなければ丁目までの住所のまま使う */ }
  }
  fees.sort((a, b) => a - b);
  const med = fees.length ? (fees.length % 2 ? fees[(fees.length - 1) / 2] : Math.round((fees[fees.length / 2 - 1] + fees[fees.length / 2]) / 2)) : 0;
  return { park: { n: fees.length, median: med, min: fees[0] || 0, max: fees[fees.length - 1] || 0, noneCount: none } };
}

function esc(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function txt(s) { return String(s || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }

// 建物ブロック（cassetteitem）→ 部屋行（js-cassette_link）単位で1件ずつ返す。
// 1棟に複数の部屋があっても賃料・間取り・面積が必ず対応するようにする。
function parseList(html) {
  const out = [];
  const blocks = html.split('<div class="cassetteitem"');
  for (let i = 1; i < blocks.length; i++) {
    const b = blocks[i];
    let name = txt((b.match(/cassetteitem_content-title"[^>]*>([^<]+)</) || [])[1]);
    // SUUMOは建物名非公開の物件だと「◯◯線 ◯◯駅 10階建 築12年」をタイトルに出す。
    // 築年は表に別列があるので落とし、名称非公開だと分かる形に整える。
    let anon = false;
    if (/階建/.test(name) && /築|新築/.test(name)) {
      anon = true;
      name = name.replace(/\s*(築\s*\d+年|新築)\s*$/, '').trim();
    }
    const addr = txt((b.match(/cassetteitem_detail-col1"[^>]*>([^<]+)</) || [])[1]);
    const ageM = b.match(/cassetteitem_detail-col3"[^>]*>\s*<div>([^<]+)</);
    const ageT = txt(ageM && ageM[1]);
    const age = /新築/.test(ageT) ? 0 : parseInt((ageT.match(/築\s*(\d+)/) || [])[1] || '', 10);
    if (!name) continue;
    const rows = b.split('js-cassette_link');
    for (let j = 1; j < rows.length; j++) {
      const r = rows[j];
      const rentM = r.match(/cassetteitem_other-emphasis[^>]*>\s*([\d.]+)万円/);
      if (!rentM) continue;
      const rent = Math.round(parseFloat(rentM[1]) * 10000);
      const adm = (r.match(/cassetteitem_price--administration"[^>]*>\s*([\d,]+)円/) || [])[1];
      const admin = adm ? parseInt(adm.replace(/,/g, ''), 10) : 0;
      const mdT = txt((r.match(/cassetteitem_madori"[^>]*>([^<]+)</) || [])[1]);
      const menM = r.match(/cassetteitem_menseki"[^>]*>\s*([\d.]+)m/);
      const men = menM ? parseFloat(menM[1]) : 0;
      const href = (r.match(/href="(\/chintai\/jnc_[^"]+)"/) || [])[1] || '';
      if (!rent) continue;
      out.push({
        name, addr, anon,
        age: isFinite(age) ? age : null,
        md: mdT, men: men || null,
        rent, admin, total: rent + admin, href,
      });
    }
  }
  return out;
}

// 詳細ページの「駐車場」欄。'近隣 5,500円' / '空有 5,000円' / '敷地内 3300円' / '-' 等。
// SUUMO詳細ページの「構造・階建て」から構造だけを抜く（例：木造2階建→木造）
function parseStruct(html) {
  const m = html.match(/構造[・･]?階建て?<\/th>\s*<td[^>]*>([\s\S]{0,60}?)<\/td>/) ||
            html.match(/>建物構造<[\s\S]{0,120}?<td[^>]*>([\s\S]{0,40}?)<\/td>/);
  if (!m) return '';
  const t = txt(m[1]);
  const s = t.match(/(木造|軽量鉄骨|重量鉄骨|鉄骨鉄筋コンクリート|鉄筋コンクリート|鉄骨|SRC|RC|ALC|ブロック)/);
  return s ? s[1] : '';
}

function parseParking(html) {
  const m = html.match(/駐車場<\/th>\s*<td[^>]*>([\s\S]{0,160}?)<\/td>/);
  let t = m ? txt(m[1]) : '';
  if (!t) {
    const m2 = html.match(/>駐車場<[\s\S]{0,200}?<td[^>]*>([\s\S]{0,120}?)<\/td>/);
    t = m2 ? txt(m2[1]) : '';
  }
  if (!t) return { text: '', fee: 0 };
  const f = t.match(/([\d,]+)\s*円/);
  return { text: t.slice(0, 40), fee: f ? parseInt(f[1].replace(/,/g, ''), 10) : 0 };
}
