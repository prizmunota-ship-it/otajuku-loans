import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const source = fs.readFileSync(new URL('../functions/api/join.js', import.meta.url), 'utf8');
const TOKEN = 'test-admin-token';
const patched = source.replace(/const ADMIN_TOKEN_HASH = '[0-9a-f]+';/, `const ADMIN_TOKEN_HASH = '${createHash('sha256').update(TOKEN).digest('hex')}';`);
const {createHandler} = await import('data:text/javascript;base64,' + Buffer.from(patched).toString('base64'));
class MemoryKV {
  data = new Map();
  async get(key, type) { const v = this.data.get(key); return v === undefined ? null : type === 'json' ? JSON.parse(v) : v; }
  async put(key, value) { this.data.set(key, value); }
  async delete(key) { this.data.delete(key); }
  async list({prefix}) { return {keys: [...this.data.keys()].filter(k => k.startsWith(prefix)).map(name => ({name})), list_complete: true}; }
}
function setup({formOk = true} = {}) {
  const kv = new MemoryKV(); const posted = [];
  const handler = createHandler(async (url, init) => { posted.push(new URLSearchParams(init.body)); return new Response(formOk ? '<html>回答を記録しました</html>' : '<html>error</html>', {status: 200}); });
  const send = async (body, ip = '1.1.1.1') => { const res = await handler({request: new Request('https://otajuku-loans.pages.dev/api/join', {method: 'POST', headers: {'Content-Type': 'application/json', 'CF-Connecting-IP': ip}, body: JSON.stringify(body)}), env: {ZAIKO_KV: kv}}); return {status: res.status, ...await res.json()}; };
  return {kv, send, posted};
}
const apply = {action: 'apply', nameKanji: '確認 太郎', kana: 'かくにん たろう', age: '40', phone: '090-0000-0000', zip: '819-0000', address: '福岡県糸島市1-1', email: 'Member@Example.test', line: 'https://line.me/ti/p/abc', referrer: '', job: '会社員', property: 'なし', family: '妻', hobby: '読書', expect: '1棟目', website: ''};
test('apply stores the record, mirrors to the Google Form, and never exposes admin data', async () => {
  const {send, kv, posted} = setup();
  const r = await send(apply); assert.equal(r.ok, true); assert.equal(r.sheet, 'ok');
  const rec = await kv.get('member:v1:' + r.id, 'json');
  assert.equal(rec.name, '確認 太郎（かくにん たろう）　40歳'); assert.equal(rec.email, 'member@example.test'); assert.equal(rec.status, 'applied'); assert.equal(rec.address, '〒819-0000　福岡県糸島市1-1');
  assert.equal(posted.length, 1); assert.equal(posted[0].get('entry.2097584207'), 'member@example.test'); assert.equal(posted[0].get('entry.262646661'), 'なし');
  assert.equal((await send({action: 'list'})).status, 403);
});
test('honeypot, invalid input, and rate limiting are enforced', async () => {
  const {send, kv} = setup();
  assert.equal((await send({...apply, website: 'spam'})).id, 'ignored'); assert.equal(kv.data.size, 0);
  assert.equal((await send({...apply, email: 'not-an-email'})).status, 400);
  assert.equal((await send({...apply, expect: ''})).status, 400);
  for (let i = 0; i < 5; i++) assert.equal((await send(apply)).ok, true);
  assert.equal((await send(apply)).status, 429);
  assert.equal((await send(apply, '2.2.2.2')).ok, true);
});
test('a failed mirror is recorded and can be retried by the admin', async () => {
  const {send, kv} = setup({formOk: false});
  const r = await send(apply); assert.equal(r.sheet, 'failed');
  const list = await send({action: 'list', token: TOKEN}); assert.equal(list.count, 1); assert.equal(list.members[0].sheet, 'failed');
  const retry = await send({action: 'retrySheet', token: TOKEN, id: r.id}); assert.equal(retry.sheet, 'failed');
  assert.equal((await kv.get('member:v1:' + r.id, 'json')).sheet, 'failed');
});
test('admin update, create, import and delete work only with the token', async () => {
  const {send} = setup();
  const r = await send(apply);
  assert.equal((await send({action: 'update', token: 'wrong', id: r.id, patch: {status: 'active'}})).status, 403);
  const u = await send({action: 'update', token: TOKEN, id: r.id, patch: {status: 'active', steps: {card: '9/14', oc: '9/15'}, memo: 'OK', source: 'hacked'}});
  assert.equal(u.member.status, 'active'); assert.equal(u.member.steps.card, '9/14'); assert.equal(u.member.steps.drive, ''); assert.equal(u.member.source, 'form');
  const c = await send({action: 'create', token: TOKEN, record: {name: '手入力 花子', email: 'HANA@example.test'}}); assert.equal(c.member.status, 'active'); assert.equal(c.member.email, 'hana@example.test');
  const imp = await send({action: 'import', token: TOKEN, records: [{id: 'imp1', name: '取込 一郎', status: 'active', steps: {oc: '4/21'}}, {id: 'imp1', name: '重複'}, {name: ''}]});
  assert.equal(imp.written, 1); assert.equal(imp.skipped, 2);
  const list = await send({action: 'list', token: TOKEN}); assert.equal(list.count, 3);
  assert.equal((await send({action: 'delete', token: TOKEN, id: 'imp1'})).ok, true);
  assert.equal((await send({action: 'list', token: TOKEN})).count, 2);
});
test('admin test submissions skip the Google Form mirror', async () => {
  const {send, posted} = setup();
  const r = await send({...apply, token: TOKEN, test: true}); assert.equal(r.sheet, 'n/a'); assert.equal(posted.length, 0);
});
