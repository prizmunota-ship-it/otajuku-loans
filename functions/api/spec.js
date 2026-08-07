// 物件名 → 建物の実データ（種別・構造・築年月・階建・所在地）
// 出典：LIFULL HOME'S 不動産アーカイブの建物ページ（/archive/b-XXXXXXX/）
//
// なぜ必要か：SUUMO物件ライブラリーに載っていない物件（掲載終了・アーカイブのみ）は
// 構造・築年が取得できず、レポートに「未取得」しか出せない。フォームの初期値（RC・築0年）を
// 代わりに出すのは誤情報になるため厳禁（太田指摘 2026-08-07）。ここで実データを取りに行く。
//
// GET /api/spec?name=セレストガーデン&addr=福岡県糸島市有田中央2丁目14-64&city=糸島市&pref=福岡県
//  → {found:true, name, addr, kind, struct, built, floors, url, src, via}
//  → 見つからない/照合できない場合は {found:false, reason}
//
// ★取得経路（この順に試す）
//   A) 住所ナビ（本命）：/archive/address/{県}/ → 市区町村 → 丁目(-addr) → 建物一覧 → 建物ページ
//      検索エンジンに依存しないので安定。⚠️DuckDuckGo/Bingはデータセンター(Cloudflare)IPからだと
//      202のbot判定ページを返すことがあり、検索頼みだと「取れたり取れなかったり」になる（実測済）。
//   B) 検索エンジン（保険）：住所が無い/住所ナビで見つからない場合のみ
//
// ★照合ルール（誤った物件の情報を絶対に載せない）
//   ・建物名が完全一致、または「A棟・Ⅱ・2号館」程度の短い枝番違いのみ許容
//   ・city が渡された場合、建物ページの所在地にその市区町村が含まれること
//   どちらかでも満たさなければ found:false（推測では返さない）

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const PREF_SLUG = {
  北海道: 'hokkaido', 青森県: 'aomori', 岩手県: 'iwate', 宮城県: 'miyagi', 秋田県: 'akita',
  山形県: 'yamagata', 福島県: 'fukushima', 茨城県: 'ibaraki', 栃木県: 'tochigi', 群馬県: 'gunma',
  埼玉県: 'saitama', 千葉県: 'chiba', 東京都: 'tokyo', 神奈川県: 'kanagawa', 新潟県: 'niigata',
  富山県: 'toyama', 石川県: 'ishikawa', 福井県: 'fukui', 山梨県: 'yamanashi', 長野県: 'nagano',
  岐阜県: 'gifu', 静岡県: 'shizuoka', 愛知県: 'aichi', 三重県: 'mie', 滋賀県: 'shiga',
  京都府: 'kyoto', 大阪府: 'osaka', 兵庫県: 'hyogo', 奈良県: 'nara', 和歌山県: 'wakayama',
  鳥取県: 'tottori', 島根県: 'shimane', 岡山県: 'okayama', 広島県: 'hiroshima', 山口県: 'yamaguchi',
  徳島県: 'tokushima', 香川県: 'kagawa', 愛媛県: 'ehime', 高知県: 'kochi', 福岡県: 'fukuoka',
  佐賀県: 'saga', 長崎県: 'nagasaki', 熊本県: 'kumamoto', 大分県: 'oita', 宮崎県: 'miyazaki',
  鹿児島県: 'kagoshima', 沖縄県: 'okinawa',
};

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const name = (url.searchParams.get('name') || '').trim();
  const addr = (url.searchParams.get('addr') || '').trim();
  const city = (url.searchParams.get('city') || '').trim();
  const pref = (url.searchParams.get('pref') || '').trim();
  const dbg = url.searchParams.get('debug') ? [] : null;
  const json = (o, s = 200) =>
    new Response(JSON.stringify(o), {
      status: s,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=86400',
        'access-control-allow-origin': '*',
      },
    });

  if (!name) return json({ found: false, reason: 'no_name' }, 400);

  try {
    let cands = [];
    let via = '';
    if (addr || (pref && city)) {
      cands = await byAddress(name, addr, city, pref, dbg);
      if (cands.length) via = 'address';
    }
    if (!cands.length) {
      cands = await bySearch(name, city, pref, dbg);
      if (cands.length) via = 'search';
    }
    if (!cands.length) return json({ found: false, reason: 'not_listed', debug: dbg || undefined });

    const tried = [];
    for (const u of cands.slice(0, 3)) {
      const spec = await readBuilding(u);
      if (!spec) { tried.push({ url: u, ng: 'fetch_or_parse' }); continue; }
      const nameOk = sameName(spec.name, name);
      const cityOk = !city || (spec.addr || '').includes(city);
      if (!nameOk || !cityOk) {
        tried.push({ url: u, ng: !nameOk ? 'name_mismatch:' + spec.name : 'city_mismatch:' + spec.addr });
        continue;
      }
      return json({ found: true, ...spec, url: u, src: "LIFULL HOME'S 建物情報", via, debug: dbg || undefined });
    }
    return json({ found: false, reason: 'no_verified_match', tried, debug: dbg || undefined });
  } catch (e) {
    return json({ found: false, reason: 'exception: ' + (e && e.message), debug: dbg || undefined });
  }
}

/* ===== 取得経路A：住所ナビ ===== */
async function byAddress(name, addr, city, pref, dbg) {
  const p = pref || (addr.match(/(北海道|東京都|京都府|大阪府|.{2,3}県)/) || [])[1] || '';
  const slug = PREF_SLUG[p];
  if (!slug) { if (dbg) dbg.push({ addrnav: 'no_pref_slug:' + p }); return []; }

  // 市区町村（政令市は「福岡市東区」の形で来る）
  let cityName = city;
  if (!cityName && addr) {
    const rest = addr.replace(/^.*?(北海道|東京都|京都府|大阪府|.{2,3}県)/, '');
    const m = rest.match(/^\s*(.{2,6}?[市郡])(.{1,5}?[区町村])?/);
    if (m) cityName = /郡$/.test(m[1]) ? m[2] || m[1] : m[1] + (m[2] && /区$/.test(m[2]) ? m[2] : '');
  }
  if (!cityName) return [];

  const cityUrl = await pickLink(
    'https://www.homes.co.jp/archive/' + 'address/' + slug + '/',
    /\/archive\/address\/[a-z0-9-]+\/[a-z0-9-]+\/$/,
    (t) => t === cityName || t.replace(/\s/g, '') === cityName,
    dbg, 'city'
  );
  if (!cityUrl) return [];

  // 丁目（-addr）ページ。住所から「有田中央２丁目」を作って一致させる
  const town = townKey(addr, cityName);
  const addrUrls = await pickLinks(cityUrl, /-addr\/$/, (t) => {
    const k = normAddr(t);
    return town && (k === town || (town.length > 2 && k.startsWith(town)) || (k.length > 2 && town.startsWith(k)));
  }, dbg, 'town');
  if (!addrUrls.length) return [];

  // 丁目ページの建物一覧から、名前が一致する建物ページを拾う
  const out = [];
  for (const au of addrUrls.slice(0, 3)) {
    const html = await getText(au, dbg, 'addrpage');
    if (!html) continue;
    const re = /\/archive\/(b-\d+)\/"[\s\S]{0,900}?font-bold[^>]*>([^<]{1,60})</g;
    let m;
    while ((m = re.exec(html))) {
      if (!sameName(m[2].trim(), name)) continue;
      const u = 'https://www.homes.co.jp/archive/' + m[1] + '/';
      if (out.indexOf(u) < 0) out.push(u);
    }
    if (out.length) break;
  }
  return out;
}

/* 住所から「町名＋丁目」を取り出して比較用に正規化（全角数字→半角・丁目表記ゆれ吸収） */
function townKey(addr, cityName) {
  if (!addr) return '';
  let s = addr.replace(/^〒?\s*[0-9０-９]{3}[-−ー－]?[0-9０-９]{4}\s*/, '');
  s = s.replace(/^.*?(北海道|東京都|京都府|大阪府|.{2,3}県)/, '');
  if (cityName) {
    const i = s.indexOf(cityName);
    if (i >= 0) s = s.slice(i + cityName.length);
    else s = s.replace(/^.*?[市区町村]/, '');
  }
  // 「有田中央２丁目１４−６４」→「有田中央2丁目」
  const m = s.match(/^\s*([^\d０-９]+)([\d０-９]+)?\s*(丁目)?/);
  if (!m) return '';
  const base = m[1].replace(/\s/g, '');
  const nStr = m[2] ? han(m[2]) : '';
  return normAddr(base + (nStr ? nStr + '丁目' : ''));
}
function han(s) {
  return String(s).replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
}
function normAddr(s) {
  return han(String(s || ''))
    .replace(/[\s　]/g, '')
    .replace(/（\d+）$/, '')
    .replace(/\(\d+\)$/, '');
}

/* ===== 取得経路B：検索エンジン（保険） ===== */
async function bySearch(name, city, pref, dbg) {
  const where = city || pref || '';
  const q = [name, where, 'homes.co.jp 建物情報'].filter(Boolean).join(' ');
  const engines = [
    'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(q),
    'https://lite.duckduckgo.com/lite/?q=' + encodeURIComponent(q),
    'https://www.bing.com/search?q=' + encodeURIComponent(q) + '&setlang=ja',
  ];
  const out = [];
  for (const e of engines) {
    const html = await getText(e, dbg, 'search');
    if (!html) continue;
    // 生URLと、検索エンジンのリダイレクト用にエンコードされた形の両方。
    // ⚠️ページ全体を decodeURIComponent すると "50%" 等の裸の%で URI malformed 例外になる
    const pats = [/homes\.co\.jp\/archive\/b-(\d+)\//g, /homes\.co\.jp%2Farchive%2Fb(?:%2D|-)(\d+)%2F/gi];
    for (const re of pats) {
      let m;
      while ((m = re.exec(html))) {
        const u = 'https://www.homes.co.jp/archive/b-' + m[1] + '/';
        if (out.indexOf(u) < 0) out.push(u);
      }
    }
    if (out.length) break;
  }
  return out;
}

/* ===== 共通 ===== */
/* 一時的な失敗（混雑・レート制限）で「未取得」になってしまうのを防ぐため、1回だけ取り直す。
   ⚠️取れなければ黙って未取得にする（推測で埋めない）のがこのAPIの原則。 */
async function getText(u, dbg, tag) {
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(u, {
        headers: { 'user-agent': UA, 'accept-language': 'ja,en;q=0.8' },
        cf: { cacheTtl: 86400, cacheEverything: true }, // 同じ市区町村の照会を繰り返しても速い
      });
      const t = r.ok ? await r.text() : '';
      if (dbg) dbg.push({ tag, try: i + 1, u: u.slice(8, 70), st: r.status, len: t.length });
      if (t) return t;
    } catch (e) {
      if (dbg) dbg.push({ tag, try: i + 1, u: u.slice(8, 70), err: String(e && e.message).slice(0, 60) });
    }
    if (i === 0) await new Promise((r) => setTimeout(r, 500));
  }
  return '';
}
async function pickLinks(pageUrl, urlRe, textOk, dbg, tag) {
  const html = await getText(pageUrl, dbg, tag);
  if (!html) return [];
  const out = [];
  const re = /<a[^>]+href="(https:\/\/www\.homes\.co\.jp\/archive\/[^"]+)"[^>]*>([\s\S]{0,400}?)<\/a>/g;
  let m;
  while ((m = re.exec(html))) {
    if (!urlRe.test(m[1])) continue;
    const t = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (!textOk(t)) continue;
    if (out.indexOf(m[1]) < 0) out.push(m[1]);
  }
  return out;
}
async function pickLink(pageUrl, urlRe, textOk, dbg, tag) {
  const a = await pickLinks(pageUrl, urlRe, textOk, dbg, tag);
  return a[0] || '';
}

/* 建物ページを読み、物件概要（種別・築年月・構造・階数）と建物名・所在地を取り出す */
async function readBuilding(u) {
  const html = await getText(u, null, 'building');
  if (!html) return null;

  // 建物名は JSON-LD(Product) が最も確実。無ければ <title>【ホームズ】○○(市区町村)…
  let name = '';
  const ld = html.match(/"@type"\s*:\s*"Product"\s*,\s*"name"\s*:\s*"([^"]+)"/);
  if (ld) name = unesc(ld[1]);
  if (!name) {
    const t = html.match(/<title>[^<]*?【ホームズ】([^(（<]+)/);
    if (t) name = unesc(t[1]).trim();
  }

  const text = toText(html);
  const pick = (label, re) => {
    const m = text.match(new RegExp('\\|' + label + '[^|]*\\|(' + re + ')'));
    return m ? m[1].trim() : '';
  };
  const addr = pick('所在地', '[^|]{4,60}');
  const kind = pick('物件種別', '[^|]{1,12}');
  const struct = pick('建物構造', '[^|]{1,16}');
  const floors = pick('建物階数', '[^|]{1,16}');
  let built = '';
  const bm = text.match(/\|築年月[^|]*\|\s*(\d{4}年\s*\d{1,2}月)/);
  if (bm) built = bm[1].replace(/\s+/g, '');

  if (!name || (!struct && !built)) return null;
  return { name, addr, kind, struct, built, floors };
}

/* 全角英数→半角・空白除去。過剰に丸めると別物件を誤って一致させるので、ここまでに留める */
function norm(s) {
  return String(s || '')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[\s　]/g, '')
    .toUpperCase();
}
/* 建物名の一致判定。単なる部分一致だと「キャナルシティ博多」で
   「キャナルシティ博多ビジネスセンタービル」を拾ってしまう＝別の建物の構造・築年を載せる事故になる。
   一致とみなすのは「完全一致」か「棟・号・A/B・Ⅰ/Ⅱ 等の短い枝番違いだけ」に限定する。 */
function sameName(a, b) {
  const x = norm(a), y = norm(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const okTail = (s) => s.length <= 4 && /^[A-Z0-9ⅠⅡⅢⅣⅤⅥ棟館号番第・\-－ー]+$/.test(s);
  if (x.startsWith(y)) return okTail(x.slice(y.length));
  if (y.startsWith(x)) return okTail(y.slice(x.length));
  return false;
}

function toText(html) {
  return unesc(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '|')
  ).replace(/[\s|]*\|[\s|]*/g, '|');
}
function unesc(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}
