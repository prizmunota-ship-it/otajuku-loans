export const bankIds=w=>w.banks.map((_,i)=>'bank-'+i);
const n=v=>Number(String(v??'').normalize('NFKC').replaceAll(',',''))||0;
export function initialWorksheet(w){return {version:1,bankOrder:bankIds(w),entries:[3,4,5].flatMap((row)=>w.numbers[row].values.map((v,i)=>({id:`excel-${w.year}-${row}-${i+1}`,month:`${w.year}-${String(i+1).padStart(2,'0')}`,name:w.numbers[row].label+'（元Excel）',kind:['borrowing','income','expense'][row-3],amount:n(v)*10000,include:true,status:'planned',source:'excel'})).filter(e=>e.amount!==0)),cfMode:'calculated'};}
export function validateWorksheet(v,ids){const ym=s=>typeof s==='string'&&/^20\d{2}-(0[1-9]|1[0-2])$/.test(s);return !!v&&v.version===1&&['registered','calculated'].includes(v.cfMode)&&Array.isArray(v.bankOrder)&&v.bankOrder.length===ids.length&&new Set(v.bankOrder).size===ids.length&&v.bankOrder.every(x=>ids.includes(x))&&Array.isArray(v.entries)&&v.entries.length<=500&&new Set(v.entries.map(e=>e.id)).size===v.entries.length&&v.entries.every(e=>typeof e.id==='string'&&e.id.length<=200&&typeof e.name==='string'&&e.name.length>0&&e.name.length<=300&&ym(e.month)&&['borrowing','income','expense'].includes(e.kind)&&typeof e.amount==='number'&&Number.isFinite(e.amount)&&e.amount>=0&&e.amount<=1e12&&typeof e.include==='boolean'&&['idea','planned','done'].includes(e.status)&&['excel','manual','plan'].includes(e.source));}
export function liveMetrics(ledger,cfMode){const a=ledger.assets||{},props=ledger.props??a.props??[],rental=props.filter(p=>['個人','法人'].includes(p.grp));const sum=(arr,key)=>arr.reduce((s,p)=>s+(Number(p[key])||0),0);const j=ledger.jihanki??a.jihanki;return {units:sum(props,'units'),rent:sum(rental,'rentY')+(Number(j?.rentY)||0),cf:cfMode==='calculated'?sum(rental,'rentY')-sum(rental,'payY')-sum(rental,'mgmt')-sum(rental,'kotoze')+(Number(j?.rentY)||0):sum(rental,'incomeY'),cfMissing:cfMode==='registered'&&rental.some(p=>p.incomeY==null||p.incomeY===''),available:props.length>0};}
export function numericRows(w,ledger,settings,year,today){const ym=today.slice(0,7),live=liveMetrics(ledger,settings.cfMode);const rows=w.numbers.map(r=>({...r,values:year===w.year?[...r.values]:Array(12).fill('—'),sources:Array(12).fill(year===w.year?'元Excel':'未設定')}));
 for(let i=0;i<12;i++){const month=`${year}-${String(i+1).padStart(2,'0')}`;
  if(month>=ym&&live.available){[live.units,live.rent/10000,live.cfMissing?null:live.cf/10000].forEach((v,r)=>{rows[r].values[i]=v==null?'未登録':v;rows[r].sources[i]=month===ym?'総合収支・最新登録値':'総合収支・最新値据置';});}
  ['borrowing','income','expense'].forEach((kind,k)=>{rows[k+3].values[i]=settings.entries.filter(e=>e.month===month&&e.kind===kind&&e.include).reduce((s,e)=>s+e.amount/10000,0);rows[k+3].sources[i]='資金調達案・予定支出（計画）';});
 }
 return rows;
}
export function importExpenses(settings,plan,ledger,year,today){const items=[];const add=(id,month,name,amount)=>{if(month.startsWith(String(year))&&month>=today.slice(0,7))items.push({id,month,name,amount:Number(amount)||0,kind:'expense',include:true,status:'planned',source:'plan'});};
 (plan.purchases||[]).filter(p=>p.enabled).forEach(p=>add('purchase-'+p.id,p.month,p.name+'（自己資金）',p.cash));
 (plan.events||[]).filter(e=>!e.paid).forEach(e=>add('event-'+e.id,e.month,e.name,e.amount));
 (ledger.spots||[]).forEach(e=>(e.months||[]).forEach(m=>{const month=`${year}-${String(m).padStart(2,'0')}`;if(!items.some(x=>x.month===month&&x.amount===Number(e.amount)&&/梅満|売主/.test(x.name)&&/梅満|売主/.test(e.name||'')))add('spot-'+(e.id||e.name)+'-'+month,month,e.name,e.amount);}));
 const months=new Set(items.map(x=>x.month)),ids=new Set(items.map(x=>x.id));
 return {items,settings:{...settings,entries:[...settings.entries.filter(e=>!ids.has(e.id)&&!(e.source==='excel'&&e.kind==='expense'&&months.has(e.month))),...items]}};
}
