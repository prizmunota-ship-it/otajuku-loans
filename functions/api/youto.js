// 住所 → 用途地域（＋建蔽率・容積率）
// 1) 国土地理院ジオコーディング（無料・キー不要）で住所→緯度経度
// 2) 国土交通省 不動産情報ライブラリ XKT002（用途地域）をタイル取得し、点が含まれるポリゴンを判定
// APIキーは Cloudflare Pages の環境変数 REINFOLIB_KEY に設定（未設定なら not_configured を返す）

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const addr = (url.searchParams.get('addr') || '').trim();
  const json = (o, s = 200) => new Response(JSON.stringify(o), {
    status: s,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=86400' },
  });

  if (!addr) return json({ error: 'no_addr' }, 400);
  const key = env.REINFOLIB_KEY;
  if (!key) return json({ error: 'not_configured' });

  try {
    // 1) ジオコーディング
    const g = await fetch('https://msearch.gsi.go.jp/address-search/AddressSearch?q=' + encodeURIComponent(addr));
    const ga = await g.json();
    if (!Array.isArray(ga) || !ga.length) return json({ error: 'geocode_failed' });
    const [lng, lat] = ga[0].geometry.coordinates;

    // 2) タイル座標（Web Mercator, z=15）
    const z = 15;
    const x = Math.floor(((lng + 180) / 360) * Math.pow(2, z));
    const latRad = (lat * Math.PI) / 180;
    const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, z));

    const t = await fetch(
      `https://www.reinfolib.mlit.go.jp/ex-api/external/XKT002?response_format=geojson&z=${z}&x=${x}&y=${y}`,
      { headers: { 'Ocp-Apim-Subscription-Key': key } }
    );
    if (!t.ok) return json({ error: 'api_' + t.status });
    const fc = await t.json();

    const feat = (fc.features || []).find((f) => pointInFeature([lng, lat], f.geometry));
    if (!feat) return json({ error: 'no_match', lat, lng });

    const p = feat.properties || {};
    const numOnly = (s) => { const m = String(s == null ? '' : s).match(/\d+(\.\d+)?/); return m ? m[0] : null; };
    return json({
      youto: p.use_area_ja || '',
      kenpei: numOnly(p.u_building_coverage_ratio_ja),
      yoseki: numOnly(p.u_floor_area_ratio_ja),
      source: '公式データ',
      lat, lng,
    });
  } catch (e) {
    return json({ error: 'exception: ' + (e && e.message) });
  }
}

function pointInFeature(pt, geom) {
  if (!geom) return false;
  if (geom.type === 'Polygon') return pip(pt, geom.coordinates);
  if (geom.type === 'MultiPolygon') return geom.coordinates.some((poly) => pip(pt, poly));
  return false;
}
function pip(pt, rings) {
  if (!rings || !rings.length) return false;
  let inside = ringContains(pt, rings[0]);
  for (let i = 1; i < rings.length; i++) { if (ringContains(pt, rings[i])) inside = false; } // 穴
  return inside;
}
function ringContains(pt, ring) {
  const x = pt[0], y = pt[1];
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
