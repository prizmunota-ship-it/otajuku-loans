// 地点周辺の地価公示・地価調査ポイント（全国対応）
// 出典：国土交通省 不動産情報ライブラリ XPT002「地価公示・地価調査のポイント」
//
// これまでは福岡県・佐賀県の公示地点を chika2025.json に同梱していたため他県で概算できなかった。
// 同じデータをAPIで引けば全国対応になる（太田指摘 2026-08-07）。
//
// GET /api/chika?lat=33.55&lon=130.19&r=3000
//  → {found:true, price(住宅地の中央値・円/㎡), year, refs:[{addr,price,d,use}], src}
//  → {found:false, reason}

import { tilesFor, getJson } from './pop.js';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const lat = parseFloat(url.searchParams.get('lat'));
  const lon = parseFloat(url.searchParams.get('lon'));
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

  const thisYear = new Date().getFullYear();
  try {
    // 近い順に広げる：3km(z=13) → 12km(z=11)。郊外は公示地点が疎なので段階的に探す
    for (const [z, r] of [[13, 3000], [11, 12000]]) {
      const pts = [];
      for (const year of [thisYear, thisYear - 1]) {
        for (const t of tilesFor(lat, lon, r, z)) {
          const fc = await getJson(
            `https://www.reinfolib.mlit.go.jp/ex-api/external/XPT002?response_format=geojson&z=${z}&x=${t.x}&y=${t.y}&year=${year}`,
            key
          );
          for (const f of (fc && fc.features) || []) {
            const p = f.properties || {};
            const price = parseInt(String(p.u_current_years_price_ja || '').replace(/[^\d]/g, ''), 10);
            const c = f.geometry && f.geometry.coordinates;
            if (!price || !c) continue;
            const id = (p.location_number_ja || '') + '/' + price;
            if (pts.some((q) => q.id === id)) continue;
            pts.push({
              id,
              price,
              use: p.use_category_name_ja || '',
              addr: p.residence_display_name_ja || p.location_number_ja || '',
              year,
              d: Math.round(dist(lat, lon, c[1], c[0])),
            });
          }
        }
        if (pts.length >= 3) break; // 最新年で足りたら前年は見ない
      }
      if (!pts.length) continue;
      pts.sort((a, b) => a.d - b.d);
      let sel = pts.filter((p) => p.use === '住宅地').slice(0, 5);
      if (sel.length < 3) sel = pts.slice(0, 5);
      const prices = sel.map((p) => p.price).sort((a, b) => a - b);
      return json({
        found: true,
        price: prices[Math.floor(prices.length / 2)],
        year: sel[0].year,
        refs: sel.slice(0, 3).map((p) => ({ addr: p.addr, price: p.price, d: p.d, use: p.use })),
        src: '国土交通省 不動産情報ライブラリ「地価公示・地価調査」',
      });
    }
    return json({ found: false, reason: 'no_point_nearby' });
  } catch (e) {
    return json({ found: false, reason: 'exception: ' + (e && e.message) });
  }
}
function dist(la1, lo1, la2, lo2) {
  const R = 6371000, t = (d) => (d * Math.PI) / 180;
  const dla = t(la2 - la1), dlo = t(lo2 - lo1);
  const a = Math.sin(dla / 2) ** 2 + Math.cos(t(la1)) * Math.cos(t(la2)) * Math.sin(dlo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
