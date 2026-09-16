import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const c=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../report-comparison.js',import.meta.url),'utf8'),c);
const M=c.ReportComparison;
const dist=(a,b,c,d)=>Math.hypot(a-c,b-d)*100000;
function pairs(differences){
  return differences.flatMap((d,i)=>{
    const base={md:'1K',age:36,men:22,lat:33+i*0.02,lon:131,addr:'山津町'+i};
    return [{...base,name:'RC'+i,struct:'RC',total:33000,_baseAdj:33000},{...base,name:'木造'+i,struct:'木造',lon:131.001,total:33000-d,_baseAdj:33000-d}];
  });
}
test('normalizes full-width structures and distinguishes light steel / steel / SRC',()=>{
  assert.equal(M.structure('ＳＲＣ（鉄骨鉄筋コンクリート）'),'SRC');
  assert.equal(M.structure('ＲＣ'),'RC');assert.equal(M.structure('軽量鉄骨造'),'軽量鉄骨');
  assert.equal(M.structure('重量鉄骨造'),'鉄骨');assert.equal(M.structure('不明'),'');
  assert.ok(M.single('ワンルーム'));assert.ok(M.single('１Ｋ'));assert.equal(M.single('1LDK'),false);
});
test('matched local differences have the correct sign in both directions',()=>{
  const rows=pairs([3000,4000,3000,2000,3000]);
  assert.equal(M.estimate(rows,'RC',dist).effects['木造'].amount,3000);
  assert.equal(M.estimate(rows,'木造',dist).effects.RC.amount,-3000);
  assert.equal(M.estimate(rows,'RC',dist).effects.RC.amount,0);
  assert.equal(M.estimate(pairs([-3000,-4000,-3000,-2000,-3000]),'RC',dist).effects['木造'].amount,-3000);
});
test('one building with many rooms cannot masquerade as independent evidence',()=>{
  const one=pairs([3000]);const rows=Array.from({length:50},(_,i)=>one.map(r=>({...r,total:r.total+i,_baseAdj:r._baseAdj+i}))).flat();
  assert.equal(M.estimate(rows,'RC',dist).effects['木造'].amount,null);
  assert.equal(M.estimate(rows,'RC',dist).effects['木造'].sourceBuildings,1);
});
test('insufficient, distant, dissimilar and unstable evidence never becomes a zero correction',()=>{
  const samples=[pairs([3000,3000,3000,3000]),pairs([3000,3000,3000,3000,3000]).map(r=>r.struct==='木造'?{...r,lon:140}:r),pairs([3000,3000,3000,3000,3000]).map(r=>r.struct==='木造'?{...r,age:1}:r),pairs([-4000,-3000,0,3000,4000])];
  for(const rows of samples)assert.equal(M.estimate(rows,'RC',dist).effects['木造'].amount,null);
  assert.equal(M.correction({struct:''},M.estimate([], 'RC',dist)).amount,null);
});
test('duplicate ads collapse; distinct rooms in the same building remain',()=>{
  const r=pairs([3000])[0];const rooms=M.uniqueRooms([r,{...r,href:'/different-agent'},{...r,total:34000},{...r,men:24}]);
  assert.equal(rooms.length,3);
});
