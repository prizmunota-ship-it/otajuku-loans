// 【池田版】内装状況管理アプリのデータAPI（本村版のGASの代替＝Cloudflare KV）
// 本村版はGoogleスプレッドシート＋GASだが、池田版は手動デプロイ不要にするため
// 同等の getAll / update / add インターフェイスをこの Pages Function で提供する。
// バインディングは在庫表と同じ ZAIKO_KV を流用（新規設定不要）。保存キー: "naiso_ikeda_rooms"
//
//   GET /api/naiso-ikeda?action=getAll                         → 部屋オブジェクトの配列（本村版 getAll と同形）
//   GET /api/naiso-ikeda?action=update&id=1&status=完了&...     → 該当idに指定フィールドのみマージ更新
//   GET /api/naiso-ikeda?action=add&name=P○○&room=101&...      → 新規行追加（id=既存最大+1）
//
// 初回 getAll 時に KV が空なら現況シード（鷹の巣405）を自動投入する。

const KEY = 'naiso_ikeda_rooms';
const FIELDS = ['name', 'room', 'takyobi', 'kanri', 'kagi', 'status', 'kanryoYotei', 'kojihi', 'itsukin', 'notes'];

const SEED = [
  { id: '1', name: 'P鷹の巣', room: '405', takyobi: '2026-08-27', kanri: '', kagi: '403号室横PS内KEYBOX（4649）', status: '未内装', kanryoYotei: '', kojihi: '', itsukin: '', notes: '退去8/27・原状回復確認中（要見積）' },
];

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
  if (!KV) return json({ error: 'kv_unbound' }, 500);

  const url = new URL(request.url);
  const p = Object.fromEntries(url.searchParams.entries());
  // POST（JSON本文）も受け付ける
  if (request.method === 'POST') {
    try { const b = await request.json(); Object.assign(p, b); } catch (e) {}
  }
  const action = p.action || 'getAll';

  async function load() {
    const raw = await KV.get(KEY);
    if (raw == null) { await KV.put(KEY, JSON.stringify(SEED)); return SEED.slice(); }
    try { const a = JSON.parse(raw); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }
  const save = (arr) => KV.put(KEY, JSON.stringify(arr));

  if (action === 'getAll') {
    return json(await load());
  }

  if (action === 'update') {
    if (p.id == null) return json({ success: false, error: 'no_id' }, 400);
    const arr = await load();
    const row = arr.find(r => String(r.id) === String(p.id));
    if (!row) return json({ success: false, error: 'not_found', id: p.id }, 404);
    FIELDS.forEach(f => { if (p[f] !== undefined) row[f] = p[f]; });
    await save(arr);
    return json({ success: true, id: String(p.id) });
  }

  if (action === 'add') {
    const arr = await load();
    const nextId = String(arr.reduce((m, r) => Math.max(m, parseInt(r.id) || 0), 0) + 1);
    const row = { id: nextId };
    FIELDS.forEach(f => { row[f] = p[f] !== undefined ? p[f] : ''; });
    arr.push(row);
    await save(arr);
    return json({ success: true, id: nextId, row });
  }

  if (action === 'remove' && p.id != null) {
    const arr = (await load()).filter(r => String(r.id) !== String(p.id));
    await save(arr);
    return json({ success: true, id: String(p.id) });
  }

  return json({ error: 'bad_action', action }, 400);
}
