import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(process.env.REPORT_HTML||new URL('../report.html',import.meta.url),'utf8');
function setup(statusFor=()=> 'ZERO_RESULTS'){
 const timers=[];
 const c={document:{createElement:()=>({}),getElementById:()=>({checked:true})},google:{maps:{places:{PlacesService:class{nearbySearch(req,cb){cb([],statusFor(req));}textSearch(req,cb){this.nearbySearch(req,cb);}}}}},setTimeout:(fn,ms)=>{if(ms===8000){timers.push(fn);return 0;}return setTimeout(fn,0);},console};
 vm.createContext(c);vm.runInContext(html.slice(html.indexOf('let PQ=Promise.resolve();'),html.indexOf('function placesRanked(')),c);return c;
}
const keys=['train_station','subway_station','バス停','shopping_mall','department_store','supermarket','convenience_store','drugstore','hospital','doctor','dentist','post_office','bank','police','老人ホーム 介護施設','school','park','幼稚園 保育園'];
test('complete Google recovery clears every nearby warning even when OSM is unavailable',async()=>{
 const c=setup();for(const type of keys)await c.psearch('near',{type});assert.equal(c.missingNearbyPages().length,0);
});
test('real denied request is not treated as empty success and only its page remains unavailable',async()=>{
 const c=setup(req=>req.type==='park'?'REQUEST_DENIED':'ZERO_RESULTS');for(const type of keys)await c.psearch('near',{type});assert.deepEqual(Array.from(c.missingNearbyPages()),['教育施設・公園']);assert.equal(c.nearbyPageUnavailable('最寄り駅情報'),false);
});
test('transient Google failure retries and only final result determines availability',async()=>{
 let calls=0;const c=setup(()=>++calls===1?'UNKNOWN_ERROR':'ZERO_RESULTS');await c.psearch('near',{type:'老人ホーム 介護施設'});assert.equal(calls,2);assert.equal(c.nearbyPageUnavailable('福祉施設'),false);
});
test('exhausted Google retries remain unavailable',async()=>{
 let calls=0;const c=setup(()=>{calls++;return 'OVER_QUERY_LIMIT';});await c.psearch('near',{type:'老人ホーム 介護施設'});assert.equal(calls,3);assert.equal(c.nearbyPageUnavailable('福祉施設'),true);
});
test('successful OSM categories do not depend on optional Google enrichment',()=>{
 const c=setup();vm.runInContext("nearbyOsmGroups=new Set(['shops','services','education','transport'])",c);assert.equal(c.missingNearbyPages().length,0);
});
test('J-SHIS retries a transient error and retains failure when both attempts fail',async()=>{
 const start=html.indexOf('async function jshis('),src=html.slice(start,html.indexOf('\n}',start)+2);let calls=0;
 const c={ReportNetwork:{fetch:async()=>++calls===1?{ok:false}:{ok:true,json:async()=>({features:[{properties:{value:1}}]})}}};vm.createContext(c);vm.runInContext(src,c);assert.equal((await c.jshis(33,130)).value,1);assert.equal(calls,2);
 c.ReportNetwork.fetch=async()=>{throw Error('offline');};assert.equal(await c.jshis(33,130),null);
});
