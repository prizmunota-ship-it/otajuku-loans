import {test} from 'node:test';
import assert from 'node:assert/strict';
import {onRequest} from '../functions/api/nearby.js';
const request=new Request('https://example.com/api/nearby?lat=33.29&lon=130.54&r=2000');
test('invalid coordinates never cause an upstream request',async()=>{
 const r=await onRequest({request:new Request('https://example.com/api/nearby?lat=no&lon=130&r=2000')});assert.equal(r.status,400);
});
test('split recovery retries failing provider and deduplicates data',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;if(calls===1)return new Response('busy',{status:503});return Response.json({elements:[{type:'node',id:1,tags:{name:'test'}}]});};
 try{const r=await onRequest({request});const j=await r.json();assert.equal(j.complete,true);assert.equal(j.elements.length,1);assert.deepEqual(j.missing,[]);assert.equal(calls,5);assert.match(r.headers.get('cache-control'),/3600/);}finally{globalThis.fetch=original;}
});
test('partial failures retain successful categories, flag missing data and disable caching',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async(_url,options)=>decodeURIComponent(options.body).includes('amenity=school')?Response.json({elements:[],remark:'timeout'}):Response.json({elements:[{type:'node',id:2}]});
 try{const r=await onRequest({request});const j=await r.json();assert.equal(j.complete,false);assert.deepEqual(j.missing,['education']);assert.equal(j.elements.length,1);assert.equal(r.headers.get('cache-control'),'no-store');}finally{globalThis.fetch=original;}
});
test('valid empty responses are successful while total failure remains incomplete',async()=>{
 const original=globalThis.fetch;
 try{for(const failure of [false,true]){globalThis.fetch=async()=>failure?Response.json({remark:'timeout',elements:[]}):Response.json({elements:[]});const j=await(await onRequest({request})).json();assert.equal(j.complete,!failure);assert.equal(j.elements.length,0);assert.equal(j.missing.length,failure?4:0);}}finally{globalThis.fetch=original;}
});

test('Google recovery retains prior data, classifies schools and deduplicates names',async()=>{
 const fs=await import('node:fs'),vm=await import('node:vm');
 const html=fs.readFileSync(process.env.REPORT_HTML||new URL('../report.html',import.meta.url),'utf8');
 const start=html.indexOf('async function recoverNearbyPlaces('),source=html.slice(start,html.indexOf('\n}',start)+2);
 const F={station:[{name:'existing',d:100}],park:[],kinder:[],welfare:[],elem:[{name:'中央小学校',d:300}],jhs:[],hs:[],school:[]};
 const c={addPlaces:async(list,g,r,opt)=>opt.types?.[0]==='school'?[{name:'中央小学校',d:300},{name:'中央中学校',d:200}]:[...list,{name:opt.types?.[0]||opt.text[0],d:50}]};
 vm.createContext(c);vm.runInContext(source,c);assert.equal(await c.recoverNearbyPlaces(F,{},2000),true);assert.equal(F.station.length,2);assert.equal(F.elem.length,1);assert.equal(F.jhs[0].name,'中央中学校');assert.equal(F.station[0].d,50);
});
