// 市区町村の世帯数・人口の推移（全国対応）
// 出典：e-Stat「社会・人口統計体系（市区町村データ）Ａ 人口・世帯」statsDataId=0000020101
//   A7101_世帯数 ／ A1101_総人口 （いずれも国勢調査ベース＝5年ごと）
//
// 不動産情報ライブラリ側には世帯数のAPIが無いため（API全31本を確認・2026-08-13）、
// 世帯数だけは e-Stat から取る。appIdは Cloudflare の環境変数 ESTAT_APPID に入れること
// （公開リポジトリなのでコードに直書きしない）。
//
// GET /api/setai?city=40135
//  → {found:true, city, series:[{y, h, p, pph}], src}
//     h=世帯数, p=総人口, pph=1世帯当たり人員
//  → {found:false, reason}
//
// ⚠️市町村合併・政令市の区の再編があるため、古い年を出すと不連続になる（例：福岡市西区は
//   1982年に早良区・城南区が分区し、1980年の値が3倍近く出る）。よって2000年以降に絞る。

const YEARS = [2000, 2005, 2010, 2015, 2020];

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const city = (url.searchParams.get('city') || '').trim();
  const json = (o, s = 200) =>
    new Response(JSON.stringify(o), {
      status: s,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=604800',
        'access-control-allow-origin': '*',
      },
    });
  if (!/^\d{5}$/.test(city)) return json({ found: false, reason: 'no_city' }, 400);
  const appId = env.ESTAT_APPID;
  if (!appId) return json({ found: false, reason: 'not_configured' });

  try {
    const u =
      'https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData' +
      `?appId=${encodeURIComponent(appId)}&statsDataId=0000020101` +
      `&cdCat01=A7101,A1101&cdArea=${city}&limit=300`;
    const r = await fetch(u, { cf: { cacheTtl: 604800, cacheEverything: true } });
    if (!r.ok) return json({ found: false, reason: 'http_' + r.status });
    const j = await r.json();
    const g = j && j.GET_STATS_DATA;
    if (!g || !g.RESULT || g.RESULT.STATUS !== 0)
      return json({ found: false, reason: 'estat_' + ((g && g.RESULT && g.RESULT.STATUS) || 'ng') });

    const vals = (((g.STATISTICAL_DATA || {}).DATA_INF || {}).VALUE) || [];
    const by = {};
    for (const v of Array.isArray(vals) ? vals : [vals]) {
      const y = parseInt(String(v['@time']).slice(0, 4), 10);
      if (!YEARS.includes(y)) continue;
      const n = parseFloat(v['$']);
      if (!isFinite(n)) continue;
      by[y] = by[y] || {};
      by[y][v['@cat01']] = n;
    }
    const series = YEARS.filter((y) => by[y] && by[y].A7101 > 0).map((y) => ({
      y: y,
      h: Math.round(by[y].A7101),
      p: by[y].A1101 > 0 ? Math.round(by[y].A1101) : null,
      pph: by[y].A1101 > 0 ? Math.round((by[y].A1101 / by[y].A7101) * 100) / 100 : null,
    }));
    if (series.length < 2) return json({ found: false, reason: 'no_series' });

    // 地域名（レポートの見出しに使う）
    let name = '';
    try {
      const co = ((((g.STATISTICAL_DATA || {}).CLASS_INF || {}).CLASS_OBJ) || []).find((c) => c['@id'] === 'area');
      const cl = co && (Array.isArray(co.CLASS) ? co.CLASS[0] : co.CLASS);
      name = (cl && cl['@name']) || '';
    } catch (e) {}

    return json({
      found: true,
      city: city,
      name: name,
      series: series,
      src: 'e-Stat 社会・人口統計体系（市区町村データ「Ａ 人口・世帯」）／国勢調査',
    });
  } catch (e) {
    return json({ found: false, reason: 'exception: ' + (e && e.message) });
  }
}
