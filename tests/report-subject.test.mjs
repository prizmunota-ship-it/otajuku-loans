import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync(new URL('../report.html',import.meta.url),'utf8');
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/yamazu-building.json',import.meta.url)));
class TestDate extends Date {constructor(...args){super(...(args.length?args:['2026-09-16T00:00:00Z']));}}
// Public HOME'S b-1126742, retrieved through /api/byaddr on 2026-09-16.
function fn(name,source=html){
  const start=source.search(new RegExp('^(?:async )?function '+name+'\\(', 'm'));
  assert.ok(start>=0,name);
  const lineEnd=source.indexOf('\n',start),line=source.slice(start,lineEnd);
  const end=line.endsWith('}')?lineEnd:source.indexOf('\n}',lineEnd)+2;
  return source.slice(start,end);
}
function setup(){
  const fields=new Map();
  const get=id=>{if(!fields.has(id))fields.set(id,{value:'',dataset:{},style:{}});return fields.get(id);};
  const context={window:{SELF:null,SELFSRC:[]},document:{getElementById:get},Date:TestDate,Map,Set,
    val:id=>String(get(id).value).trim(),num:id=>parseFloat(get(id).value)||0,
    structIn:()=>'',setStatus:()=>{},clearCmpRows:()=>{},esc:s=>String(s),
    paper:(_title,_subtitle,body)=>body,parkTxt:()=> '—',MAPS:[],mapDiv:()=>({id:'test',html:''}),
    dist:(a,b,c,d)=>Math.hypot(a-c,b-d)*100000,collectCmp:()=>[],parkCmpEdit:()=>{},
    overpass:async()=>null,apiJson:async()=>structuredClone(fixture)};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(new URL('../report-comparison.js',import.meta.url),'utf8'),context);
  vm.runInContext("const MD_GROUP=[['1R','1K'],['1DK','1LDK'],['2K','2DK'],['2LDK','3K']];",context);
  for(const name of ['setByData','srcOf','userNum','looksLikeName','prefOf','cityOf','addrOnly',
    'selfNeed','selfNeedsBuilding','applySelfBuilding','resetSubjectLookup','applySelfRooms',
    'bantiAddrs','selfByAddr','selfBySpecScan','ownAgeNow','ageTol','mdGroup','sameMd',
    'buildCompPaper','manEn','nzName','buildReport'])vm.runInContext(fn(name),context);
  vm.runInContext("const RE_BANTI=/[0-9０-９]\\s*[-−ー－‐]\\s*[0-9０-９]|[0-9０-９]+\\s*丁目\\s*[-−ー－‐]?\\s*[0-9０-９]|番地?\\s*[0-9０-９]/;",context);
  get('paddr').value='大分県大分市山津町2-1-13';get('pradius').value='1500';
  return {c:context,get};
}
const location={title:'〒870-0136 大分県大分市山津町２丁目１−１３ Prince ヴィラ',lat:33.2432847,lon:131.6690493,locType:'ROOFTOP'};

test('address-only lookup retains identity, building data, historical period and source in actual report',async()=>{
  const {c,get}=setup();
  await c.selfByAddr(location,'大分市');
  assert.equal(c.window.SELF.name,'プリンスヴィラ');assert.equal(c.window.SELF.addr,fixture.addr);
  assert.equal(c.window.SELF.built,'1990年3月');assert.equal(c.window.SELF.struct,'RC(鉄筋コンクリート)');
  assert.equal(c.val('pmadori'),'1K');assert.equal(c.num('pmens'),22.58);
  assert.equal(c.window.SELF.rentPeriod,'2021年8月');
  const out=c.buildCompPaper([],{min:24000,max:24000,men:22.58},'','高城駅 徒歩17分',null,location.title,{name:c.val('paddr'),md:c.val('pmadori')});
  for(const value of ['プリンスヴィラ','1990年3月築','RC(鉄筋コンクリート)','地上4階','2021年8月時点',"LIFULL HOME'S 建物情報"])assert.ok(out.includes(value),value);
  assert.ok(!out.includes('SUUMO物件ライブラリー（実データ）'));
  assert.ok(!out.includes('—（未取得）'));
});

test('subject is resolved before the first comparable search, including when rooms are already populated',async()=>{
  for(const prefilled of [false,true]){
    const {c,get}=setup();
    if(prefilled){c.setByData('pmadori','1K','homes');c.setByData('pmens',22.58,'homes');}
    let calls=0;
    c.suumoSearchCmp=async()=>{
      calls++;assert.equal(c.window.SELF.name,'プリンスヴィラ');
      assert.equal(c.ownAgeNow(),36);assert.equal(c.window.SELF.struct,fixture.struct);
      assert.equal(c.num('pmens'),22.58);return 10;
    };
    c.titleNameCands=()=>[];
    await c.buildReport({...location});assert.equal(calls,1);
  }
});

test('a partial building response is still incomplete, while explicit zero-year age is valid',()=>{
  const {c,get}=setup();c.window.SELF={name:'建物',addr:'住所',struct:'RC'};
  assert.equal(c.selfNeedsBuilding(),true);
  get('page').value='0';get('page').dataset.t='1';
  assert.equal(c.selfNeedsBuilding(),false);
});

test('switching property clears automatic subject data but preserves deliberate user edits',()=>{
  const {c,get}=setup();c.applySelfBuilding(fixture);c.applySelfRooms(fixture,'homes','掲載');
  get('pmadori').value='1DK';get('pmadori').dataset.t='1';c.window.CHINTAI={found:true};
  let cleared=false;c.clearCmpRows=()=>{cleared=true;};
  c.resetSubjectLookup();
  assert.equal(c.window.SELF,null);assert.equal(c.num('pmens'),0);
  assert.equal(c.val('pmadori'),'1DK');assert.equal(cleared,true);
});

test('comparison includes the recovered building age in rent adjustment',async()=>{
  const {c}=setup();await c.selfByAddr(location,'大分市');
  const cmp={name:'比較用マンション',addr:'大分県大分市山津町2丁目2-2',age:40,men:22.58,total:30000,struct:'RC'};
  const out=c.buildCompPaper([cmp],{min:24000,max:24000,men:22.58},'','',null,fixture.addr,{name:c.val('paddr'),md:'1K'});
  assert.equal(cmp._adj,32000);assert.ok(cmp._adjUsed.includes('築年数'));
  assert.ok(out.includes('2021年8月の掲載賃料'));
  assert.ok(!out.includes('早期の成約が十分見込める'));
});

test('full lot numbers match across notation changes; neighboring and truncated lots do not',()=>{
  const src=fs.readFileSync(new URL('../functions/api/byaddr.js',import.meta.url),'utf8');
  const c=vm.createContext({});for(const name of ['norm','bantiKey','bantiSame'])vm.runInContext(fn(name,src),c);
  const base=c.bantiKey('大分県大分市山津町2-1-13');
  for(const addr of ['大分県大分市山津町２丁目１－１３','大分県大分市山津町2丁目1番13号'])assert.ok(c.bantiSame(base,c.bantiKey(addr)));
  for(const addr of ['大分県大分市山津町2-1','大分県大分市山津町2-1-12','大分県大分市山津町2-1-130'])assert.equal(c.bantiSame(base,c.bantiKey(addr)),false);
});

test('single-room search includes wood while preserving age and area criteria',async()=>{
  const {c}=setup();await c.selfByAddr(location,'大分市');
  const base={addr:'大分県大分市山津町2丁目3-10',age:36,men:22.58,total:30000,struct:'RC',md:'1K',lat:33.244,lon:131.669};
  const candidates=[{...base,name:'条件一致マンション'},
    {...base,name:'木造も比較',struct:'木造',addr:'大分県大分市山津町2丁目3-11'},
    {...base,name:'条件外築浅',age:8},
    {...base,name:'条件外大面積',men:35}];
  c.buildCompPaper(candidates,{min:24000,max:24000,men:22.58},'','',null,fixture.addr,
    {name:c.val('paddr'),md:'1K',center:[location.lat,location.lon],radius:1500});
  assert.equal(c.MAPS[0].markers.length,2);
  assert.ok(c.MAPS[0].markers[0].name.includes('条件一致マンション'));
  assert.equal(c.window.CMP_WIDE.length,2);
  assert.equal(c.window.CMP_EXCLUDED.length,2);
  assert.equal(candidates[1]._structAdj,null);
  assert.equal(candidates[1]._adj,null);
});

test('all inline application scripts parse',()=>{
  for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
    if(!/src=|application\/ld\+json/.test(m[1]))assert.doesNotThrow(()=>new vm.Script(m[2]));
  }
});


test('family layouts retain their structure filter; single layouts retain distinct rooms',async()=>{
  for(const md of ['2LDK','1K']){
    const {c}=setup();await c.selfByAddr(location,'大分市');
    const base={addr:'大分県大分市山津町2丁目3-10',age:36,men:22.58,total:30000,struct:'RC',md,lat:33.244,lon:131.669};
    const rows=[{...base,name:'同じ建物'},{...base,name:'同じ建物',total:31000},{...base,name:'別建物木造',struct:'木造',addr:'山津町2-3-11'}];
    c.buildCompPaper(rows,{min:24000,max:24000,men:22.58},'','',null,fixture.addr,{md,center:[location.lat,location.lon],radius:1500});
    assert.equal(c.MAPS[0].markers.length,md==='1K'?3:1);
  }
});

test('all 100 candidates retain their metadata and receive building detail lookup',async()=>{
  const {c}=setup();const calls=[],added=[];
  c.window.ReportComparison=c.window.ReportComparison;
  c.selfFromChintai=()=>false;c.gsiGeocode=async()=>null;
  c.apiJson=async()=>({found:true,items:Array.from({length:105},(_,i)=>({name:'建物'+Math.floor(i/2),addr:'住所'+Math.floor(i/2),md:'1K',age:36,men:22,total:30000+i,href:'/chintai/jnc_'+i}))});
  c.fetch=async(_url,opts)=>{const rows=JSON.parse(opts.body).rows;calls.push(rows);return {json:async()=>({found:true,items:rows.map(r=>({...r,bstruct:'木造',addr2:r.addr+'番地'}))})};};
  c.addCmpRow=(v,meta)=>added.push({v,meta});
  vm.runInContext(fn('suumoSearchCmp'),c);
  const n=await c.suumoSearchCmp('大分市','大分県','1K',null,null,1500);
  assert.equal(n,100);assert.equal(added.length,100);
  assert.equal(calls.flat().length,50);assert.ok(calls.every(a=>a.length<=15));
  assert.ok(added.every(a=>a.meta.md==='1K'&&a.meta.struct==='木造'&&a.v[1].endsWith('番地')));
});

test('geocoding queries each address once and never offsets co-located room coordinates',async()=>{
  const {c}=setup();let calls=0;c.googleGeocode=async()=>{calls++;return {lat:33.24,lon:131.66};};
  vm.runInContext('const _cmpGeo={};',c);vm.runInContext(fn('geocodeCmp'),c);
  const rows=Array.from({length:20},()=>({addr:'山津町2-3-10'}));
  await c.geocodeCmp(rows);assert.equal(calls,1);
  assert.ok(rows.every(r=>r.lat===33.24&&r.lon===131.66));
});

test('structure adjustment is applied to comparable rent and missing estimates stay out of the summary',async()=>{
  const {c}=setup();await c.selfByAddr(location,'大分市');
  const rows=Array.from({length:5},(_,i)=>{
    const base={age:36,men:22.58,md:'1K',lat:location.lat+0.001+i*0.001,lon:location.lon,addr:'山津町'+i};
    return [{...base,name:'RC比較'+i,struct:'RC',total:33000},{...base,name:'木造比較'+i,struct:'木造',total:30000,lon:location.lon+0.0001}];
  }).flat();
  rows.push({name:'SRC未算定',addr:'山津町別',age:36,men:22.58,md:'1K',struct:'SRC',total:40000,lat:location.lat+0.002,lon:location.lon});
  const output=c.buildCompPaper(rows,{min:24000,max:24000,men:22.58},'','',null,fixture.addr,{md:'1K',center:[location.lat,location.lon],radius:1500});
  assert.equal(c.window.CMP_STRUCTURE_MODEL.effects['木造'].amount,3000);
  assert.ok(rows.filter(r=>r.struct==='木造').every(r=>r._adj===33000));
  assert.equal(rows.find(r=>r.struct==='SRC')._adj,null);
  assert.ok(output.includes('+3,000円'));assert.ok(output.includes('月額 33,000円'));
});
