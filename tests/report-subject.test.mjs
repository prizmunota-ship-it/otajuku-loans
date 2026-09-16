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

test('shortage does not add buildings with different structure, age or floor area',async()=>{
  const {c}=setup();await c.selfByAddr(location,'大分市');
  const base={addr:'大分県大分市山津町2丁目3-10',age:36,men:22.58,total:30000,struct:'RC',md:'1K',lat:33.244,lon:131.669};
  const candidates=[{...base,name:'条件一致マンション'},
    {...base,name:'条件外木造',struct:'木造'},
    {...base,name:'条件外築浅',age:8},
    {...base,name:'条件外大面積',men:35}];
  c.buildCompPaper(candidates,{min:24000,max:24000,men:22.58},'','',null,fixture.addr,
    {name:c.val('paddr'),md:'1K',center:[location.lat,location.lon],radius:1500});
  assert.equal(c.MAPS[0].markers.length,1);
  assert.ok(c.MAPS[0].markers[0].name.includes('条件一致マンション'));
  assert.equal(c.window.CMP_WIDE.length,1);
  assert.equal(c.window.CMP_EXCLUDED.length,3);
});

test('all inline application scripts parse',()=>{
  for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
    if(!/src=|application\/ld\+json/.test(m[1]))assert.doesNotThrow(()=>new vm.Script(m[2]));
  }
});
