// 地点周辺の年齢別人口統計（全国対応）
// 出典：国土交通省 不動産情報ライブラリ XKT013「国土数値情報（将来推計人口250mメッシュ）」
//
// これまでは福岡県・佐賀県の1kmメッシュを pop2024.json に同梱していたため他県で「データなし」に
// なっていた（太田指摘 2026-08-07）。同じ国土数値情報をAPIで引けば全国どこでも出せる。
//
// GET /api/pop?lat=33.55&lon=130.19&r=1500
//  → {found:true, n, p25, a, b, c, p30, g5:[19], pn20, pn25, src}
//  → {found:false, reason}
// 値は250mメッシュの推計値（小数）を合算し、四捨五入して返す。

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const lat = parseFloat(url.searchParams.get('lat'));
  const lon = parseFloat(url.searchParams.get('lon'));
  const r = Math.max(parseInt(url.searchParams.get('r') || '1500', 10) || 1500, 800);
  const json = (o, s = 200) =>
    new Response(JSON.stringify(o), {
      status: s,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=604800',
        'access-control-allow-origin': '*',
      },
    });
  if (!isFinite(lat) || !isFinite(lon)) return json({ found: false, reason: 'no_latlon' }, 400);
  const key = env.REINFOLIB_KEY;
  if (!key) return json({ found: false, reason: 'not_configured' });

  try {
    const z = 13;
    const tiles = tilesFor(lat, lon, r, z);
    let feats = [];
    for (const t of tiles) {
      const fc = await getJson(
        `https://www.reinfolib.mlit.go.jp/ex-api/external/XKT013?response_format=geojson&z=${z}&x=${t.x}&y=${t.y}`,
        key
      );
      if (fc && fc.features) feats = feats.concat(fc.features);
    }
    if (!feats.length) return json({ found: false, reason: 'no_data', tiles: tiles.length });
    // ?probe=1 でメッシュが持つ属性名を確認する（世帯数など使える項目を調べる用）
    if (url.searchParams.get('probe')) {
      const p = (feats[0] && feats[0].properties) || {};
      return json({ probe: true, keys: Object.keys(p), sample: p });
    }

    const acc = { p25: 0, a: 0, b: 0, c: 0, p30: 0, pn20: 0, pn25: 0, n: 0 };
    const g5 = new Array(19).fill(0);
    // 人口の推移（太田要望 2026-08-13）。PTN_YYYY＝総人口。2020は国勢調査実績、以降は推計。
    // ※このデータセットに世帯数は含まれない（属性を実査して確認済み・2026-08-13）
    const YEARS = [2020, 2025, 2030, 2035, 2040, 2045, 2050];
    const ser = {};
    YEARS.forEach((y) => (ser[y] = 0));
    const seen = new Set();
    for (const f of feats) {
      const p = f.properties || {};
      if (p.MESH_ID) { if (seen.has(p.MESH_ID)) continue; seen.add(p.MESH_ID); }
      const c = center(f.geometry);
      if (!c || dist(lat, lon, c[1], c[0]) > r) continue;
      acc.n++;
      acc.p25 += num(p.PT00_2025);
      acc.a += num(p.PTA_2025);
      acc.b += num(p.PTB_2025);
      acc.c += num(p.PTC_2025);
      acc.p30 += num(p.PT00_2030);
      acc.pn20 += num(p.PTN_2020);
      acc.pn25 += num(p.PTN_2025);
      for (let i = 1; i <= 19; i++) g5[i - 1] += num(p['PT' + String(i).padStart(2, '0') + '_2025']);
      YEARS.forEach((y) => (ser[y] += num(p['PTN_' + y])));
    }
    if (!acc.n || acc.p25 <= 0) return json({ found: false, reason: 'no_mesh_in_radius' });

    return json({
      found: true,
      n: acc.n,
      p25: Math.round(acc.p25),
      a: Math.round(acc.a),
      b: Math.round(acc.b),
      c: Math.round(acc.c),
      p30: Math.round(acc.p30),
      pn20: Math.round(acc.pn20),
      pn25: Math.round(acc.pn25),
      g5: g5.map((v) => Math.round(v)),
      series: YEARS.map((y) => ({ y: y, v: Math.round(ser[y]) })).filter((o) => o.v > 0),
      households: null, // 世帯数はこのデータセットに無い（不動産情報ライブラリに世帯数APIも無い）
      src: '国土交通省 不動産情報ライブラリ「将来推計人口250mメッシュ（令和6年推計・2020年国勢調査ベース）」',
    });
  } catch (e) {
    return json({ found: false, reason: 'exception: ' + (e && e.message) });
  }
}

function num(v) { const n = parseFloat(v); return isFinite(n) ? n : 0; }

/* 円（中心＋半径m）を覆うXYZタイルを列挙。半径2km・z=13なら通常1〜4枚 */
export function tilesFor(lat, lon, r, z) {
  const dLat = (r / 111320) * 1.05;
  const dLon = (r / (111320 * Math.cos((lat * Math.PI) / 180))) * 1.05;
  const x1 = lon2x(lon - dLon, z), x2 = lon2x(lon + dLon, z);
  const y1 = lat2y(lat + dLat, z), y2 = lat2y(lat - dLat, z);
  const out = [];
  for (let x = x1; x <= x2; x++) for (let y = y1; y <= y2; y++) out.push({ x, y });
  return out.slice(0, 12); // 念のための上限
}
function lon2x(lon, z) { return Math.floor(((lon + 180) / 360) * Math.pow(2, z)); }
function lat2y(lat, z) {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * Math.pow(2, z));
}
function center(g) {
  if (!g) return null;
  if (g.type === 'Point') return g.coordinates;
  const ring = g.type === 'Polygon' ? g.coordinates[0] : g.type === 'MultiPolygon' ? g.coordinates[0][0] : null;
  if (!ring || !ring.length) return null;
  let x = 0, y = 0;
  for (const c of ring) { x += c[0]; y += c[1]; }
  return [x / ring.length, y / ring.length];
}
function dist(la1, lo1, la2, lo2) {
  const R = 6371000, t = (d) => (d * Math.PI) / 180;
  const dla = t(la2 - la1), dlo = t(lo2 - lo1);
  const a = Math.sin(dla / 2) ** 2 + Math.cos(t(la1)) * Math.cos(t(la2)) * Math.sin(dlo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
export async function getJson(u, key) {
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(u, {
        headers: { 'Ocp-Apim-Subscription-Key': key },
        cf: { cacheTtl: 604800, cacheEverything: true },
      });
      if (r.ok) return await r.json();
    } catch (e) { /* リトライ */ }
  }
  return null;
}
