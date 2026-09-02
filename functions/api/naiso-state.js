// 内装アプリの「編集状態」をクラウド保存（Cloudflare KV）。本村版・池田版 共通。
// 部屋リスト自体は空室一覧(build.py)が /naiso-moto.json・/naiso-ikeda.json として配信し、
// このAPIはその各部屋に対する 内装業者の編集値（状況/工事費/鍵/退去精算/セット等）だけを持つ。
// ＝二重登録の解消：太田さんは空室一覧だけ更新、内装アプリは同じ部屋を自動表示し状態だけ上書き。
//
// バインディングは在庫表と同じ ZAIKO_KV を流用。保存キー: "naiso_state_<app>"
// 部屋キー(roomKey) = "<物件略称>|<号室>"（例 "P鷹の巣|405"）。
//
//   GET  /api/naiso-state?app=moto|ikeda                       → { ok, state:{ "<物件|号室>": {..fields..} } }
//   POST /api/naiso-state?app=moto  {key, fields}              → 該当部屋にフィールドをマージ
//   POST /api/naiso-state?app=moto  {seed:{ key:{fields} }}    → 一括マージ（移行/初期投入用）
//
// fields例: status, kanryoYotei, kojihi, itsukin, kagi, notes,
//           install, recover, seiIyaku, seiSeiso, seiGenjo, kaishuGaku, kaishuMonth

const APPS = { moto: 'naiso_state_moto', ikeda: 'naiso_state_ikeda' };

export async function onRequest(context) {
  const { request, env } = context;
  const json = (o, s = 200) => new Response(JSON.stringify(o), {
    status: s,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });

  if (request.method === 'OPTIONS') return json({ ok: true });

  const KV = env.ZAIKO_KV;
  if (!KV) return json({ ok: false, configured: false });

  const url = new URL(request.url);
  const app = url.searchParams.get('app') || 'moto';
  const KEY = APPS[app];
  if (!KEY) return json({ ok: false, error: 'bad_app', app }, 400);

  async function load() {
    const raw = await KV.get(KEY);
    let s; try { s = raw ? JSON.parse(raw) : {}; } catch { s = {}; }
    return (s && typeof s === 'object') ? s : {};
  }

  if (request.method === 'GET') {
    return json({ ok: true, app, state: await load() });
  }

  if (request.method === 'POST') {
    let body; try { body = await request.json(); } catch { return json({ ok: false, error: 'bad_json' }, 400); }
    const state = await load();

    if (body.seed && typeof body.seed === 'object') {
      for (const k of Object.keys(body.seed)) {
        if (body.seed[k] && typeof body.seed[k] === 'object') {
          state[k] = Object.assign({}, state[k], body.seed[k]);
        }
      }
      await KV.put(KEY, JSON.stringify(state));
      return json({ ok: true, seeded: Object.keys(body.seed).length });
    }

    if (body.key && body.fields && typeof body.fields === 'object') {
      state[String(body.key)] = Object.assign({}, state[String(body.key)], body.fields);
      await KV.put(KEY, JSON.stringify(state));
      return json({ ok: true, key: String(body.key) });
    }

    return json({ ok: false, error: 'bad_body' }, 400);
  }

  return json({ ok: false, error: 'method' }, 405);
}
