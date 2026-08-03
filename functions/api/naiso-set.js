// 内装アプリ「セット設置／セット回収」の完了フラグをクラウド保存（Cloudflare KV）
// バインディングは在庫表と同じ ZAIKO_KV を流用（新規設定不要）。保存キー: "naiso_set"
// 保存形: { flags: { "<roomId>": { install: bool, recover: bool } }, updated }
// GET  /api/naiso-set                                  → { configured, data:{flags} }
// POST /api/naiso-set  {action:"setRoom", id, fields:{install:true|false, recover:...}}
//                                                       → 該当部屋のフラグをマージ更新
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
  if (!KV) return json({ configured: false }); // 未設定→アプリはローカルのみで動作

  const KEY = 'naiso_set';

  if (request.method === 'GET') {
    const raw = await KV.get(KEY);
    let data; try { data = raw ? JSON.parse(raw) : { flags: {} }; } catch { data = { flags: {} }; }
    if (!data || typeof data !== 'object' || !data.flags) data = { flags: {} };
    return json({ configured: true, data });
  }

  if (request.method === 'POST') {
    let body; try { body = await request.json(); } catch { return json({ error: 'bad_json' }, 400); }
    const now = body.updated || new Date().toISOString();

    if (body.action === 'setRoom' && body.id != null && body.fields) {
      const raw = await KV.get(KEY);
      let cur; try { cur = raw ? JSON.parse(raw) : null; } catch { cur = null; }
      if (!cur || typeof cur !== 'object' || !cur.flags) cur = { flags: {} };
      const id = String(body.id);
      cur.flags[id] = Object.assign({}, cur.flags[id], body.fields);
      cur.updated = now;
      await KV.put(KEY, JSON.stringify(cur));
      return json({ ok: true, updated: now });
    }

    return json({ error: 'bad_action' }, 400);
  }

  return json({ error: 'method' }, 405);
}
