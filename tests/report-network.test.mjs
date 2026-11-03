import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(process.env.REPORT_HTML||new URL('../report.html',import.meta.url),'utf8');
const source=fs.readFileSync(new URL('../report-network.js',import.meta.url),'utf8');
function setup(fetch){const document=new EventTarget(),events=new EventTarget();const c={fetch,document,addEventListener:events.addEventListener.bind(events),removeEventListener:events.removeEventListener.bind(events),AbortController,Response,setTimeout,clearTimeout,Date};vm.createContext(c);vm.runInContext(source,c);return c;}
test('request timeout also aborts stalled response body',async()=>{
 const c=setup(async(_url,{signal})=>({arrayBuffer:()=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted'))))}));
 await assert.rejects(c.ReportNetwork.fetch('/test',{},15),/aborted/);
});
test('switching tabs does not cancel a healthy request; original content and status survive',async()=>{
 let finish,signal;const c=setup((_url,opts)=>{signal=opts.signal;return new Promise(r=>finish=r);});
 const pending=c.ReportNetwork.fetch('/test');c.document.dispatchEvent(new Event('visibilitychange'));assert.equal(signal.aborted,false);
 finish(new Response('{"ok":true}',{status:200}));assert.equal((await (await pending).json()).ok,true);
});
test('caller cancellation is respected',async()=>{
 const c=setup(async(_url,{signal})=>{assert.equal(signal.aborted,true);throw new Error('aborted');});
 const ac=new AbortController();ac.abort();await assert.rejects(c.ReportNetwork.fetch('/test',{signal:ac.signal}),/aborted/);
});
function fn(name){const start=html.indexOf('async function '+name+'(');return html.slice(start,html.indexOf('\n}',start)+2);}
test('nearby provider failure and incomplete JSON do not mask another valid provider',async()=>{
 let calls=0;const c={ReportNetwork:{fetch:async()=>{calls++;return {ok:true,json:async()=>calls<=2?{remark:'timeout',elements:[]}:{elements:[{id:1}]}};}}};
 vm.createContext(c);vm.runInContext(fn('overpass'),c);const value=await c.overpass(33,130,1500);assert.equal(value[0].id,1);assert.equal(calls,4);
});
test('all provider failures return null, while valid empty response is not failure',async()=>{
 for(const valid of [false,true]){const c={ReportNetwork:{fetch:async()=>({ok:true,json:async()=>valid?{elements:[]}:{error:'bad'}})}};vm.createContext(c);vm.runInContext(fn('overpass'),c);const value=await c.overpass(33,130,1500);assert.equal(value===null,!valid);}
});
test('build excludes overlapping runs and releases button after an error',async()=>{
 let finish,calls=0;const go={disabled:true};const c={reportRunning:false,nearbyUnavailable:false,document:{title:'original',getElementById:()=>go},buildReportContent:()=>{calls++;return new Promise((_,reject)=>finish=reject);},placeCmpEdit:()=>{},setStatus:()=>{},hideStatus:()=>{},console:{error:()=>{}}};vm.createContext(c);vm.runInContext(fn('buildReport'),c);
 const first=c.buildReport({});await c.buildReport({});assert.equal(calls,1);finish(new Error('test'));await first;assert.equal(go.disabled,false);assert.equal(c.reportRunning,false);
});
test('unavailable nearby data still reaches rendering and is not reported as absent facilities',()=>{
 assert.match(html,/classify\(els\|\|\[\]/);assert.ok(!html.includes('if(els===null){setStatus'));
 assert.ok(html.includes('施設が存在しないことを示すものではありません'));
});
