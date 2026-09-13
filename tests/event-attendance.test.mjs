import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const events = JSON.parse(fs.readFileSync(new URL('../events.json', import.meta.url)));
const source = fs.readFileSync(new URL('../functions/api/event-attendance.js', import.meta.url), 'utf8').replace("import schedule from '../../events.json';", 'const schedule = '+JSON.stringify(events)+';');
const {createHandler} = await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const eventId='2026-09-26-hibaru';
class MemoryKV {
  data=new Map();
  async get(key,type){const value=this.data.get(key);return value===undefined?null:type==='json'?JSON.parse(value):value;}
  async put(key,value){this.data.set(key,value);}
  async list({prefix,cursor}){const all=[...this.data.keys()].filter(k=>k.startsWith(prefix)).sort();const start=+(cursor||0);return {keys:all.slice(start,start+1).map(name=>({name})),list_complete:start+1>=all.length,cursor:String(start+1)};}
}
function setup({member=true,date='2026-09-13T00:00:00Z',fail=false}={}) {
  const kv=new MemoryKV();
  const handler=createHandler(async()=>{if(fail)throw new Error('member_unavailable');return new Response(member?'_member("ok")':'_member("ng")');},()=>new Date(date));
  const send=async(body,opts={})=>{const response=await handler({request:new Request('https://otajuku-loans.pages.dev/api/event-attendance',{method:'POST',headers:{'Content-Type':'application/json',...(opts.headers||{})},body:JSON.stringify({eventId,email:'member@example.test',action:'read',...body})}),env:opts.noKV?{}:{ZAIKO_KV:kv}});return {status:response.status,...await response.json()};};
  return {kv,send};
}
const reply={action:'save',name:'確認 メンバー',comment:'よろしくお願いします',answers:{viewing:'yes',dinner:'no'}};
test('multiple simultaneous members persist independently; own update is not a duplicate',async()=>{
 const {send}=setup();await Promise.all([send(reply),send({...reply,name:'別のメンバー',email:'other@example.test'})]);
 let r=await send({});assert.equal(r.replies.length,2);assert.equal(r.totals.viewing.yes,2);assert.equal(r.totals.dinner.no,2);
 assert.equal((await send({...reply,answers:{viewing:'no',dinner:'yes'}})).ok,true);
 r=await send({});assert.equal(r.replies.length,2);assert.equal(r.totals.viewing.yes,1);assert.equal(r.totals.dinner.yes,1);
 assert.equal(JSON.stringify(r).includes('@'),false);assert.equal(r.mine.name,reply.name);
});
test('no maybe, incomplete sections, unknown sections or oversized name',async()=>{
 const {send,kv}=setup();
 for(const invalid of [{answers:{viewing:'maybe',dinner:'no'}},{answers:{viewing:'yes'}},{answers:{viewing:'yes',dinner:'no',other:'yes'}},{name:'a'.repeat(61)}])assert.equal((await send({...reply,...invalid})).status,400);
 assert.equal(kv.data.size,0);
});
test('server denies missing/non-member identity, wrong origin, unknown event and closed event',async()=>{
 assert.equal((await setup().send({...reply,email:''})).status,401);
 assert.equal((await setup({member:false}).send(reply)).status,403);
 assert.equal((await setup().send(reply,{headers:{Origin:'https://other.example'}})).status,403);
 assert.equal((await setup().send({...reply,eventId:'invented'})).status,404);
 assert.equal((await setup({date:'2026-09-26T11:00:00Z'}).send(reply)).status,409);
});
test('membership and storage errors never report success',async()=>{
 assert.equal((await setup({fail:true}).send(reply)).status,503);
 assert.equal((await setup().send(reply,{noKV:true})).status,503);
 const {send,kv}=setup();kv.put=async()=>{throw new Error('write failed');};assert.equal((await send(reply)).ok,false);
});
test('clearing a reply does not erase another member response',async()=>{
 const {send}=setup();await send(reply);await send({...reply,email:'other@example.test',name:'別のメンバー'});
 await send({action:'clear'});const r=await send({});assert.equal(r.mine,null);assert.equal(r.replies.length,1);
});
test('existing festival attendance remains external and is not overwritten',async()=>{
 const {send,kv}=setup();assert.equal((await send({...reply,eventId:'2026-10-22-festival'})).status,409);assert.equal(kv.data.size,0);
});
test('clear persists even if a replica has not seen the preceding write',async()=>{
 const {send,kv}=setup();await send(reply);
 const original=kv.get.bind(kv);kv.get=async()=>null;
 await send({action:'clear'});kv.get=original;
 assert.equal((await send({})).replies.length,0);
});
test('event data is unique with separate viewing/dinner and complete existing schedule',()=>{
 const all=events.flatMap(m=>m.events);assert.equal(new Set(all.map(e=>e.id)).size,all.length);
 assert.equal(all.filter(e=>e.id===eventId).length,1);assert.equal(all.find(e=>e.id===eventId).sessions.length,2);
 assert.equal(all.find(e=>e.id==='2026-10-22-festival').fee,'8,000円（税込） ※飲食含む');
 assert.ok(all.every(e=>e.endAt && e.sessions.length && !e.chousei));
});
