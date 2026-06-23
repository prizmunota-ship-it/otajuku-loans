// 久留米倉庫 在庫データのクラウド保存API（Cloudflare KV）
// バインディング: ZAIKO_KV（Pages の Functions > KV namespace bindings で設定）
// 保存キー: "inventory" に {items:[...], updated} のJSONを丸ごと保存
// GET  /api/zaiko            → 保存中の在庫JSONを返す（未設定/未保存は {configured:false} 等）
// POST /api/zaiko  body:
//   {action:"replaceAll", data:{items,updated}}   → 全置換（初期投入・追加/編集/削除）
//   {action:"setItem", id, fields:{qty:..}, updated}→ 1品目だけ更新（±在庫。同時編集に強い）

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
  if (!KV) return json({ configured: false }); // バインディング未設定→アプリはlocalStorageで動作

  if (request.method === 'GET') {
    const raw = await KV.get('inventory');
    if (!raw) return json({ configured: true, empty: true });
    let data; try { data = JSON.parse(raw); } catch { data = null; }
    return json({ configured: true, data });
  }

  if (request.method === 'POST') {
    let body; try { body = await request.json(); } catch { return json({ error: 'bad_json' }, 400); }
    const now = body.updated || new Date().toISOString();

    if (body.action === 'replaceAll' && body.data && Array.isArray(body.data.items)) {
      const out = { items: body.data.items, updated: now };
      await KV.put('inventory', JSON.stringify(out));
      return json({ ok: true, updated: now });
    }

    if (body.action === 'setItem' && body.id != null && body.fields) {
      const raw = await KV.get('inventory');
      let cur; try { cur = JSON.parse(raw); } catch { cur = null; }
      if (!cur || !Array.isArray(cur.items)) cur = { items: [] };
      const it = cur.items.find((x) => String(x.id) === String(body.id));
      if (it) Object.assign(it, body.fields);
      cur.updated = now;
      await KV.put('inventory', JSON.stringify(cur));
      return json({ ok: true, updated: now });
    }

    return json({ error: 'bad_action' }, 400);
  }

  return json({ error: 'method' }, 405);
}
