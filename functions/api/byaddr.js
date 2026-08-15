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
import { readBuilding } from './spec.js';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BATCH = 36; // 1回の呼び出しで見る建物ページ数（サブリクエスト上限に収める）

export async function onRequest(context) {
  const u = new URL(context.request.url);
  const json = (o) => new Response(JSON.stringify(o), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=86400', 'access-control-allow-origin': '*' },
  });

  /* ★郵便番号を先に落とす。Googleの逆ジオコーディングは「〒819-1127 福岡県…」の形で返すため、
     そのままだと都道府県の判定が「 福岡県」（先頭に空白）になり PREF_SLUG に当たらず no_pref で
     落ちていた＝番地逆引きが一切走らない状態だった（2026-08-15 実測）。 */
  const addr = (u.searchParams.get('addr') || '').replace(/〒?\s*[0-9０-９]{3}[-−ー－][0-9０-９]{4}/g, ' ').trim();
  const pref = ((u.searchParams.get('pref') || '').trim() || (addr.match(/(北海道|東京都|京都府|大阪府|[^\s\d]{2,3}県)/) || [])[1] || '').trim();
  let city = (u.searchParams.get('city') || '').trim();
  const offset = Math.max(0, parseInt(u.searchParams.get('offset') || '0', 10) || 0);
  const dbg = u.searchParams.get('debug') ? [] : null;
  const banti = bantiKey(addr);
  /* ★番地（丁目だけでなく、その先の枝番）まで無いと照合しない。
     「有田中央2丁目」だけで走らせると同じ丁目の別の建物を掴む＝誤情報になる。 */
  const segs = ((banti.match(/\d[\d-]*$/) || [''])[0].split('-').filter(Boolean)).length;
  if (!addr || !banti) return json({ found: false, reason: 'no_banti' });
  if (segs < 2) return json({ found: false, reason: 'need_banti', key: banti });

  const slug = PREF_SLUG[pref];
  if (!slug) return json({ found: false, reason: 'no_pref' });
  if (!city) {
    const rest = addr.replace(/^.*?(北海道|東京都|京都府|大阪府|[^\s\d]{2,3}県)/, '');
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
    //    ★1件でも「番地が一致した」だけで確定させる。名前は改名で違って当たり前なので
    //      照合には使わない（＝旧名の建物を当てるのがこのAPIの目的）。
    const slice = list.slice(offset, offset + BATCH);
    for (const b of slice) {
      const info = await readBuilding('https://www.homes.co.jp/archive/' + b.id + '/');
      if (dbg) dbg.push({ tag: 'building', id: b.id, addr: (info && info.addr) || '', key: info ? bantiKey(info.addr) : '' });
      if (!info || !info.addr) continue;
      if (!bantiSame(bantiKey(info.addr), banti)) continue;
      return json(Object.assign({ found: true, url: 'https://www.homes.co.jp/archive/' + b.id + '/', src: "LIFULL HOME'S 建物情報", via: 'banti', matched: info.addr }, info));
    }
    const next = offset + slice.length;
    return json({ found: false, reason: next < list.length || list.length % 30 === 0 ? 'not_yet' : 'no_match', next: next, scanned: next, debug: dbg || undefined });
  } catch (e) {
    return json({ found: false, reason: 'exception: ' + (e && e.message), debug: dbg || undefined });
  }
}

/* 「福岡県久留米市合川町235-1」→「合川町235-1」、
   「福岡県糸島市有田中央2丁目14-64」→「有田中央2-14-64」を比較用の鍵にする。
   ★以前は「丁目」で数字の並びが切れるため 有田中央2丁目14-64 の鍵が「有田中央2」になり、
     同じ丁目の**別の建物**に一致してしまう状態だった（2026-08-15 修正）。
     本物件の情報は1文字も間違えられないので、丁目・番地・号はすべて「-」に統一して比べる。
   HOME'Sは「14-64、14-65」と複数を並べることがあるので先頭だけ見る。 */
function bantiKey(a) {
  let s = norm(a).replace(/^.*?[都道府県]/, '');
  s = s.replace(/^.{2,6}?[市郡]/, '').replace(/^.{1,5}?区/, '');
  s = s.split(/[,、･・]/)[0];
  s = s.replace(/丁目|丁|番地|番|号地|号/g, '-').replace(/[−‐ー―の]/g, '-');
  const m = s.match(/^([^\d]{1,14}?)(\d[\d-]*)/);
  if (!m) return '';
  const num = m[2].replace(/-{2,}/g, '-').replace(/-+$/, '');
  return m[1].replace(/[\s　-]/g, '') + num;
}
/* 番地の一致判定。完全一致が原則。
   建物ページ側が「有田中央2-14」までしか書いていない場合に限り、
   区切りの境目で前方一致していて、かつ数字が2区画以上あるときだけ同一と見なす。 */
function bantiSame(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const seg = (s) => (s.match(/\d[\d-]*$/) || [''])[0].split('-').filter(Boolean).length;
  const pre = (x, y) => y.indexOf(x) === 0 && y.charAt(x.length) === '-' && seg(x) >= 2;
  return pre(a, b) || pre(b, a);
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

/* 建物ページの読み取りは /api/spec の readBuilding を共用する（上部で import）。
   ⚠️以前はここに自前のパーサーを持っていたが、HTMLの改行を潰していないため
   「|所在地|\n |福岡県…|」の形を読めず、所在地が必ず空＝どの物件も no_match になっていた
   （セレストガーデン／糸島市有田中央2丁目14-64 で実測 2026-08-15）。
   パーサーを2本持つと片方だけ腐るので、以後は spec.js の1本に集約する。 */
