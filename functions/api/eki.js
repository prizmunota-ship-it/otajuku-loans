// 駅別乗降客数（全国対応）
// 出典：国土交通省 不動産情報ライブラリ XKT015「国土数値情報（駅別乗降客数）」
//
// 金融機関向け資料では「駅の乗降客数」が定量的な立地根拠になる（太田指示：公表データの数字で裏付ける）。
// レポートの「最寄り駅情報」ページの表に、駅名で突き合わせて人数と推移を出すために使う。
//
// GET /api/eki?lat=33.55&lon=130.19&r=2000
//  → {found:true, stations:[{name, op, line, lat, lon, d, latest:{y,v}, series:[{y,v}]}], src}
//  → {found:false, reason}
//
// ※プロパティは S12_001_ja=駅名 / S12_002_ja=運営会社 / S12_003_ja=路線名 で、
//   年別乗降客数は S12_009 から4つおき（009,013,017…057）に 2011〜2023 が並ぶ。
//   並びは実データで検証してから確定させること（?probe=1 で生プロパティを確認できる）。

import { tilesFor, getJson } from './pop.js';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const lat = parseFloat(url.searchParams.get('lat'));
  const lon = parseFloat(url.searchParams.get('lon'));
  const r = Math.max(parseInt(url.searchParams.get('r') || '2000', 10) || 2000, 800);
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
        `https://www.reinfolib.mlit.go.jp/ex-api/external/XKT015?response_format=geojson&z=${z}&x=${t.x}&y=${t.y}`,
        key
      );
      if (fc && fc.features) feats = feats.concat(fc.features);
    }
    if (!feats.length) return json({ found: false, reason: 'no_data', tiles: tiles.length });
    if (url.searchParams.get('probe')) {
      const p = (feats[0] && feats[0].properties) || {};
      return json({ probe: true, keys: Object.keys(p), sample: p });
    }

    // 同一駅が路線ごと・タイルごとに重複するので、駅名＋運営会社で名寄せし最大値を採る
    const map = new Map();
    for (const f of feats) {
      const p = f.properties || {};
      const name = p.S12_001_ja || p.S12_001;
      if (!name) continue;
      const c = center(f.geometry);
      if (!c) continue;
      const d = Math.round(distm(lat, lon, c[1], c[0]));
      if (d > r) continue;
      const series = readSeries(p);
      const k = String(name) + '|' + (p.S12_002_ja || '');
      const cur = map.get(k);
      const rec = {
        name: String(name),
        op: p.S12_002_ja || '',
        line: p.S12_003_ja || '',
        lat: c[1],
        lon: c[0],
        d: d,
        series: series,
        latest: series.length ? series[series.length - 1] : null,
      };
      if (!cur || (rec.latest && (!cur.latest || rec.latest.v > cur.latest.v))) map.set(k, rec);
    }
    const stations = [...map.values()].filter((s) => s.latest && s.latest.v > 0).sort((a, b) => a.d - b.d);
    if (!stations.length) return json({ found: false, reason: 'no_station_in_radius' });
    return json({
      found: true,
      stations: stations.slice(0, 8),
      src: '国土交通省 不動産情報ライブラリ「国土数値情報（駅別乗降客数）」',
    });
  } catch (e) {
    return json({ found: false, reason: 'exception: ' + (e && e.message) });
  }
}

// S12_009 から4つおきに 2011年〜 の乗降客数が並ぶ。値が数値のものだけ拾う。
function readSeries(p) {
  const out = [];
  let year = 2011;
  for (let i = 9; i <= 57; i += 4) {
    const v = parseFloat(p['S12_0' + String(i).padStart(2, '0')]);
    if (isFinite(v) && v > 0) out.push({ y: year, v: Math.round(v) });
    year += 1;
  }
  return out;
}
function center(g) {
  if (!g) return null;
  if (g.type === 'Point') return g.coordinates;
  const line = g.type === 'LineString' ? g.coordinates : g.type === 'MultiLineString' ? g.coordinates[0] : null;
  if (line && line.length) {
    let x = 0, y = 0;
    for (const c of line) { x += c[0]; y += c[1]; }
    return [x / line.length, y / line.length];
  }
  const ring = g.type === 'Polygon' ? g.coordinates[0] : g.type === 'MultiPolygon' ? g.coordinates[0][0] : null;
  if (!ring || !ring.length) return null;
  let x = 0, y = 0;
  for (const c of ring) { x += c[0]; y += c[1]; }
  return [x / ring.length, y / ring.length];
}
function distm(la1, lo1, la2, lo2) {
  const R = 6371000, t = (d) => (d * Math.PI) / 180;
  const dla = t(la2 - la1), dlo = t(lo2 - lo1);
  const a = Math.sin(dla / 2) ** 2 + Math.cos(t(la1)) * Math.cos(t(la2)) * Math.sin(dlo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
