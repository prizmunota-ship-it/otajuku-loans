export const bankIds=w=>w.banks.map((_,i)=>'bank-'+i);
const n=v=>Number(String(v??'').normalize('NFKC').replaceAll(',',''))||0;
export function initialWorksheet(w){return {version:1,bankOrder:bankIds(w),entries:[3,4,5].flatMap((row)=>w.numbers[row].values.map((v,i)=>({id:`excel-${w.year}-${row}-${i+1}`,month:`${w.year}-${String(i+1).padStart(2,'0')}`,name:w.numbers[row].label+'（元Excel）',kind:['borrowing','income','expense'][row-3],amount:n(v)*10000,include:true,status:'planned',source:'excel'})).filter(e=>e.amount!==0)),cfMode:'calculated'};}
export function validateWorksheet(v,baseIds){
 const custom=v?.customBanks??[];
 if(!Array.isArray(custom)||custom.length>30||!custom.every(b=>b&&typeof b.name==='string'&&b.name.trim().length>0&&b.name.length<=100))return false;
 const ids=[...baseIds,...custom.map((_,i)=>'bank-'+(baseIds.length+i))];
 const hidden=v?.hiddenBanks??[];if(!Array.isArray(hidden)||new Set(hidden).size!==hidden.length||!hidden.every(id=>ids.includes(id)))return false;
 const cells=v?.bankMonths;
 if(cells!==undefined&&(!cells||typeof cells!=='object'||Array.isArray(cells)||!Object.entries(cells).every(([id,months])=>ids.includes(id)&&months&&typeof months==='object'&&!Array.isArray(months)&&Object.entries(months).every(([month,value])=>/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)&&typeof value==='string'&&value.length<=1000))))return false;
 const ym=s=>typeof s==='string'&&/^20\d{2}-(0[1-9]|1[0-2])$/.test(s);return !!v&&v.version===1&&validateBankNotes(v.bankNotes,ids)&&['registered','calculated'].includes(v.cfMode)&&Array.isArray(v.bankOrder)&&v.bankOrder.length===ids.length&&new Set(v.bankOrder).size===ids.length&&v.bankOrder.every(x=>ids.includes(x))&&Array.isArray(v.entries)&&v.entries.length<=500&&new Set(v.entries.map(e=>e.id)).size===v.entries.length&&v.entries.every(e=>typeof e.id==='string'&&e.id.length<=200&&typeof e.name==='string'&&e.name.length>0&&e.name.length<=300&&ym(e.month)&&['borrowing','income','expense','action'].includes(e.kind)&&(e.bankId===undefined||e.bankId===''||ids.includes(e.bankId))&&typeof e.amount==='number'&&Number.isFinite(e.amount)&&e.amount>=0&&e.amount<=1e12&&typeof e.include==='boolean'&&['idea','planned','done'].includes(e.status)&&['excel','manual','plan'].includes(e.source));}
export function liveMetrics(ledger,cfMode){const a=ledger.assets||{},props=ledger.props??a.props??[],rental=props.filter(p=>['個人','法人'].includes(p.grp));const sum=(arr,key)=>arr.reduce((s,p)=>s+(Number(p[key])||0),0);const j=ledger.jihanki??a.jihanki;return {units:sum(props,'units'),rent:sum(rental,'rentY')+(Number(j?.rentY)||0),cf:cfMode==='calculated'?sum(rental,'rentY')-sum(rental,'payY')-sum(rental,'mgmt')-sum(rental,'kotoze')+(Number(j?.rentY)||0):sum(rental,'incomeY'),cfMissing:cfMode==='registered'&&rental.some(p=>p.incomeY==null||p.incomeY===''),available:props.length>0};}
export function depositTotals(ledger){const sum=items=>(items||[]).reduce((s,a)=>s+(Number(a.bal)||0),0);const accounts=sum(ledger.accounts),savings=sum(ledger.tsumi);return {accounts,savings,total:accounts+savings,available:Array.isArray(ledger.accounts)||Array.isArray(ledger.tsumi)};}
// Only explicitly labelled self-funding in edited month cells is automatically linked.
export function selfFundingExpenses(settings){const result=[];for(const [bankId,months] of Object.entries(settings.bankMonths||{}))for(const [month,text] of Object.entries(months)){
 const normalized=text.normalize('NFKC');const matches=[...normalized.matchAll(/自己資金\s*[:：=]?\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*(億円?|万円?|円)/g)];
 let amount=0;for(const match of matches){const value=Number(match[1].replaceAll(',',''));amount+=Math.round(value*(match[2].startsWith('億')?1e8:match[2].startsWith('万')?1e4:1));}
 if(!matches.length||!Number.isFinite(amount)||amount<0||amount>1e12)continue;
 const [y,m]=month.split('-').map(Number),next=m===12?`${y+1}-01`:`${y}-${String(m+1).padStart(2,'0')}`;
 result.push({id:`self-${bankId}-${month}`,bankId,month:next,amount,name:'自己資金（'+month+'相談分）'});
 }return result;}
export function numericRows(w,ledger,settings,year,today){const ym=today.slice(0,7),live=liveMetrics(ledger,settings.cfMode),deposits=depositTotals(ledger),selfExpenses=selfFundingExpenses(settings);const rows=w.numbers.map(r=>({...r,values:year===w.year?[...r.values]:Array(12).fill('—'),sources:Array(12).fill(year===w.year?'元Excel':'未設定')}));
 rows[6]={...rows[6],label:'預金残高（当月実額・翌月以降見込）',values:Array(12).fill('—'),sources:Array(12).fill('過去残高未登録')};
 for(let i=0;i<12;i++){const month=`${year}-${String(i+1).padStart(2,'0')}`;
  if(month>=ym&&live.available){[live.units,live.rent/10000,live.cfMissing?null:live.cf/10000].forEach((v,r)=>{rows[r].values[i]=v==null?'未登録':v;rows[r].sources[i]=month===ym?'総合収支・最新登録値':'総合収支・最新値据置';});}
  if(month===ym&&deposits.available){rows[6].values[i]=deposits.total/10000;rows[6].sources[i]='総合収支・現在預金（口座＋積立）';}
  if(month>ym&&deposits.available){
   const planned=settings.entries.filter(e=>e.include&&e.month>=ym&&e.month<month);
   const net=planned.reduce((sum,e)=>sum+(['borrowing','income'].includes(e.kind)?e.amount:e.kind==='expense'?-e.amount:0),0);
   const own=selfExpenses.filter(e=>e.month>=ym&&e.month<month).reduce((sum,e)=>sum+e.amount,0);
   rows[6].values[i]=(deposits.total+net-own)/10000;
   rows[6].sources[i]='見込：当月実残高＋当月から前月までの借入＋賃収その他−支出（自己資金含む）';
  }
  ['borrowing','income','expense'].forEach((kind,k)=>{rows[k+3].values[i]=settings.entries.filter(e=>e.month===month&&e.kind===kind&&e.include).reduce((s,e)=>s+e.amount/10000,0);if(kind==='expense')rows[k+3].values[i]+=selfExpenses.filter(x=>x.month===month).reduce((sum,x)=>sum+x.amount/10000,0);rows[k+3].sources[i]='資金調達案・予定支出（計画）';});
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

export function validateBankNotes(notes,ids){return notes===undefined||(notes&&typeof notes==='object'&&!Array.isArray(notes)&&Object.entries(notes).every(([id,v])=>ids.includes(id)&&v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>['focus','note'].includes(k)&&typeof v[k]==='string'&&v[k].length<=2000)));}
// Ambiguous labels reconciled with the saved repayment-account mapping (2026-08-31).
const verifiedLenders={a4y0oklx4nzi:'福岡信用金庫',avms3eva4nzi:'福岡ひびき信用金庫'};
export function bankReserveTargets(ledger,w){
 const canonical=s=>{const text=String(s||'').normalize('NFKC').replaceAll(' ','');const aliases=[['福岡ひびき信用金庫',/福岡ひびき|ひびき/],['福岡信用金庫',/福岡信用金庫/],['福岡県信用組合',/福岡県信用組合|けんしん/],['横浜幸銀信用組合',/横浜幸銀|横浜興銀|幸銀/],['朝銀西信用組合',/朝銀西|朝銀/],['筑邦銀行',/筑邦|ちくぎん/],['唐津信用金庫',/唐津/],['大分銀行',/大分銀行/],['豊和銀行',/豊和/],['福岡中央銀行',/福岡中央/]];return aliases.find(([,re])=>re.test(text))?.[0]||text;};
 const result=Object.fromEntries(w.banks.map((b,i)=>['bank-'+i,{name:b.name.split('\n')[0],balance:0,records:[],missing:0,target:0}]));
 const byName=Object.fromEntries(Object.entries(result).map(([id,v])=>[canonical(v.name),id]));const seen=new Set();
 for(const [group,items] of [['property',ledger.props??ledger.assets?.props??[]],['other',ledger.oloans??ledger.assets?.loans??[]]])for(const loan of items){
  const name=loan.fin||loan.bank||verifiedLenders[loan.id]||(group==='other'?loan.name:'');const id=byName[canonical(name)];if(!id)continue;
  const key=group+':'+(loan.id||JSON.stringify(loan));if(seen.has(key))continue;seen.add(key);
  if(loan.zan==null||loan.zan===''||!Number.isFinite(Number(loan.zan))){result[id].missing++;continue;}
  const balance=Math.max(0,Number(loan.zan));if(!balance)continue;result[id].balance+=balance;result[id].records.push({name:loan.name||'借入',balance});
 }
 for(const r of Object.values(result))r.target=Math.ceil(r.balance*.05/10000)*10000;
 return result;
}
