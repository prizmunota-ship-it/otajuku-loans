// 物件名 → 建物の実データ（種別・構造・築年月・階建・所在地）
// 出典：LIFULL HOME'S 不動産アーカイブの建物ページ（/archive/b-XXXXXXX/）
//
// なぜ必要か：SUUMO物件ライブラリーに載っていない物件（掲載終了・アーカイブのみ）は
// 構造・築年が取得できず、レポートに「未取得」しか出せない。フォームの初期値（RC・築0年）を
// 代わりに出すのは誤情報になるため厳禁（太田指摘 2026-08-07）。ここで実データを取りに行く。
//
// GET /api/spec?name=セレストガーデン&city=糸島市&pref=福岡県
//  → {found:true, name, addr, kind, struct, built, floors, url, src}
//  → 見つからない/照合できない場合は {found:false, reason}
//
// ★照合ルール（誤った物件の情報を載せない）：
//   ・建物ページの建物名が、検索した物件名と一致すること（全半角・空白を無視して包含判定）
//   ・city が渡された場合、建物ページの所在地にその市区町村が含まれること
//   どちらか一方でも満たさなければ found:false（推測で返さない）

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const name = (url.searchParams.get('name') || '').trim();
  const city = (url.searchParams.get('city') || '').trim();
  const pref = (url.searchParams.get('pref') || '').trim();
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
    const dbg = url.searchParams.get('debug') ? [] : null;
    const cands = await findBuildingUrls(name, city, pref, dbg);
    if (!cands.length) return json({ found: false, reason: 'not_listed', tried: 'search', debug: dbg || undefined });

    const tried = [];
    for (const u of cands.slice(0, 3)) {
      const spec = await readBuilding(u);
      if (!spec) { tried.push({ url: u, ng: 'fetch_or_parse' }); continue; }
      const nameOk = sameName(spec.name, name);
      const cityOk = !city || (spec.addr || '').includes(city);
      if (!nameOk || !cityOk) { tried.push({ url: u, ng: !nameOk ? 'name_mismatch:' + spec.name : 'city_mismatch:' + spec.addr }); continue; }
      return json({ found: true, ...spec, url: u, src: "LIFULL HOME'S 建物情報" });
    }
    return json({ found: false, reason: 'no_verified_match', tried });
  } catch (e) {
    return json({ found: false, reason: 'exception: ' + (e && e.message) });
  }
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

/* 検索エンジン3系統から homes.co.jp/archive/b-XXXX/ を集める（1つ落ちても止まらないように） */
async function findBuildingUrls(name, city, pref, dbg) {
  const where = city || pref || '';
  // 検索エンジンはデータセンターIPからだと空で返ることがあるため、言い回しを変えて数パターン試す
  const queries = [
    [name, where, 'homes.co.jp 建物情報'].filter(Boolean).join(' '),
    [name, where, '不動産アーカイブ 建物'].filter(Boolean).join(' '),
  ];
  const engines = [];
  for (const q of queries) {
    engines.push('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(q));
    engines.push('https://lite.duckduckgo.com/lite/?q=' + encodeURIComponent(q));
    engines.push('https://www.bing.com/search?q=' + encodeURIComponent(q) + '&setlang=ja');
  }
  const out = [];
  for (const e of engines) {
    let html = '';
    try {
      const r = await fetch(e, { headers: { 'user-agent': UA, 'accept-language': 'ja,en;q=0.8' } });
      html = r.ok ? await r.text() : '';
      if (dbg) dbg.push({ e: e.slice(8, 40), st: r.status, len: html.length, arch: (html.match(/archive/g) || []).length });
      if (!r.ok) continue;
    } catch (err) { if (dbg) dbg.push({ e: e.slice(8, 40), err: String(err && err.message).slice(0, 60) }); continue; }
    // 生URL（…/archive/b-123/）と、検索エンジンのリダイレクト用にエンコードされた形（…%2Fb%2D123%2F）の両方を拾う。
    // ⚠️ページ全体を decodeURIComponent すると "50%" 等の裸の%で URI malformed 例外になるので、必ず部分一致で拾うこと
    const pats = [/homes\.co\.jp\/archive\/b-(\d+)\//g, /homes\.co\.jp%2Farchive%2Fb(?:%2D|-)(\d+)%2F/gi];
    for (const re of pats) {
      let m;
      while ((m = re.exec(html))) {
        const u = 'https://www.homes.co.jp/archive/b-' + m[1] + '/';
        if (out.indexOf(u) < 0) out.push(u);
      }
    }
    if (out.length) break; // 1つのエンジンで取れたらそれ以上叩かない
  }
  return out;
}

/* 建物ページを読み、物件概要（種別・築年月・構造・階数）と建物名・所在地を取り出す */
async function readBuilding(u) {
  let html = '';
  try {
    const r = await fetch(u, { headers: { 'user-agent': UA, 'accept-language': 'ja' } });
    if (!r.ok) return null;
    html = await r.text();
  } catch (e) { return null; }

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
