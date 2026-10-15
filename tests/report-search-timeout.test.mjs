import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../report.html',import.meta.url),'utf8');
function fn(name){const start=html.search(new RegExp('^(?:async )?function '+name+'\\(','m'));return html.slice(start,html.indexOf('\n}',start)+2);}
function setup(){
 const fields=new Map();const get=id=>{if(!fields.has(id))fields.set(id,{value:'',style:{},disabled:false});return fields.get(id);};
 const status=[],calls=[];const c={AbortController,Promise,Date,Math,location:{protocol:'https:'},window:{},
 setTimeout:(f,ms)=>setTimeout(f,Math.min(ms,25)),clearTimeout,document:{getElementById:get},
 val:id=>get(id).value,resetSubjectLookup:()=>{},setStatus:s=>status.push(s),hideStatus:()=>{},
 looksLikeName:()=>true,histLoad:()=>[],googleGeocodeFull:async q=>{calls.push(q);return {title:q,locType:'ROOFTOP'};},
 placesText:async()=>null,geocode:async()=>null,showConfirm:(r,q)=>{c.confirmed={r,q};},fetch:()=>new Promise(()=>{})};
 get('paddr').value='検索物件';vm.createContext(c);vm.runInContext("const APIV='30';",c);
 for(const n of ['withinTime','apiJson','locate'])vm.runInContext(fn(n),c);
 return {c,get,calls,status};
}
test('stalled property API falls back to parallel map search and restores button',async()=>{
 const {c,get,calls}=setup();await c.locate();assert.ok(c.confirmed);assert.deepEqual(calls,['検索物件']);assert.equal(get('go').disabled,false);
});
test('response body stall is bounded and aborted',async()=>{
 const {c}=setup();let signal;c.fetch=async(_u,o)=>{signal=o.signal;return {ok:true,text:()=>new Promise(()=>{})};};
 assert.equal(await c.apiJson('/api/test',{timeoutMs:10,attempts:1}),null);assert.equal(signal.aborted,true);
});
test('unresponsive map services finish without a false location',async()=>{
 const {c,get,status}=setup();c.googleGeocodeFull=c.placesText=c.geocode=()=>new Promise(()=>{});await c.locate();
 assert.equal(c.confirmed,undefined);assert.equal(get('go').disabled,false);assert.match(status.at(-1),/見つかりません/);
});
test('official address wins over a fast ambiguous map result',async()=>{
 const {c,calls}=setup();c.fetch=async()=>({ok:true,text:async()=>JSON.stringify({found:true,name:'正式名',addr:'福岡市1-2-3'})});await c.locate();
 assert.equal(calls[1],'福岡市1-2-3 正式名');assert.match(c.confirmed.r.title,/福岡市1-2-3/);
});
test('local file explains the correct entry point without searching',async()=>{
 const {c,calls,status}=setup();c.location.protocol='file:';await c.locate();assert.equal(calls.length,0);assert.match(status.at(-1),/https:\/\/otajuku-loans.pages.dev\/report/);
});
test('unexpected failure releases search button',async()=>{
 const {c,get,status}=setup();c.resetSubjectLookup=()=>{throw Error('test');};await c.locate();assert.equal(get('go').disabled,false);assert.match(status.at(-1),/検索を完了できません/);
});
