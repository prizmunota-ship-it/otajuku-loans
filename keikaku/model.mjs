export const sum = (xs, f) => xs.reduce((s,x)=>s+Number(f(x)||0),0);
export const monthsFrom = start => Array.from({length:12},(_,i)=>{const [y,m]=start.split('-').map(Number);return `${y+Math.floor((m-1+i)/12)}-${String((m-1+i)%12+1).padStart(2,'0')}`;});
export function accountPay(a){return Array.isArray(a.payments)?sum(a.payments,p=>p.amount):Number(a.pay||0);}
export function opening(ledger, excluded=[]){return sum((ledger.accounts||[]).filter(a=>!excluded.includes(a.id)),a=>a.bal);}
export function scheduleDelta(ledger, month){
 const base=ledger.zanAsOf;
 if(!base||month===base)return 0;
 return sum([...(ledger.props||[]),...(ledger.oloans||[])],a=>{
  const s=a.repaymentSchedule?.schedule||[];
  const b=s.find(x=>String(x.date).slice(0,7)===base),t=s.find(x=>String(x.date).slice(0,7)===month);
  return b&&t?Number(t.payment)-Number(b.payment):0;
 });
}
export function forecast(ledger,plan,{purchases=true}={}){
 let balance=opening(ledger,plan.excludedAccounts),units=sum((ledger.props||[]).filter(p=>p.grp!=='自宅'),p=>p.units);
 const fixed=sum(ledger.accounts||[],accountPay),saving=sum(ledger.tsumi||[],t=>t.mo);
 return monthsFrom(plan.start).map(month=>{
  const m=Number(month.slice(5)); const manual=plan.months?.[month]||{};
  const active=(plan.purchases||[]).filter(p=>p.enabled&&p.month&&purchases);
  const buying=active.filter(p=>p.month===month);
  const running=active.filter(p=>p.operationMonth&&p.operationMonth<=month&&p.month<=month);
  const rent=Number(manual.rent??plan.rent),otherIncome=Number(manual.otherIncome??plan.otherIncome);
  const loans=fixed+scheduleDelta(ledger,month);
  const card=Number(manual.card??plan.card);
  const operating=Number(manual.operating??plan.operating);
  const newIncome=sum(running,p=>p.rent),newExpense=sum(running,p=>p.payment)+sum(running,p=>p.expense);
  const ownCash=sum(buying,p=>p.cash);
  const funding=sum((plan.funding||[]).filter(f=>f.month===month&&f.status==='approved'&&!f.inBalance),f=>f.net);
  const newFundingPay=sum((plan.funding||[]).filter(f=>f.status==='approved'&&f.repayMonth&&f.repayMonth<=month),f=>f.payment);
  const spot=sum(ledger.spots||[],s=>(s.months||[]).map(Number).includes(m)?s.amount:0);
  const events=sum((plan.events||[]).filter(e=>e.month===month&&!e.paid),e=>e.amount);
  const begin=balance;
  balance+=rent+otherIncome+newIncome+funding-loans-saving-card-operating-newExpense-ownCash-newFundingPay-spot-events;
  units+=sum(buying,p=>p.units);
  return {month,begin,rent,otherIncome,newIncome,funding,loans,saving,card,operating,newExpense,ownCash,newFundingPay,spot,events,end:balance,units};
 });
}
export function validatePlan(p){
 const ym=v=>typeof v==='string'&&/^20\d{2}-(0[1-9]|1[0-2])$/.test(v);
 const date=v=>!v||(/^20\d{2}-(0[1-9]|1[0-2])-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v);
 const money=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1e12;
 const str=v=>typeof v==='string'&&v.length<=2000;
 if(!p||p.version!==1||!ym(p.start)||!ym(p.goalMonth)||!money(p.goalUnits)||!money(p.reserve)||!str(p.goal))return false;
 if(!['rent','otherIncome','card','operating'].every(k=>money(p[k])))return false;
 if(!Array.isArray(p.excludedAccounts)||p.excludedAccounts.length>200||!p.excludedAccounts.every(str))return false;
 for(const key of ['purchases','funding','events','actions'])if(!Array.isArray(p[key])||p[key].length>200)return false;
 if(!p.purchases.every(v=>str(v.id)&&str(v.name)&&ym(v.month)&&typeof v.enabled==='boolean'&&['cash','units','rent','payment','expense'].every(k=>money(v[k]))&&(!v.operationMonth||ym(v.operationMonth))))return false;
 if(!p.funding.every(v=>str(v.id)&&str(v.name)&&str(v.next)&&ym(v.month)&&['idea','applied','approved','received','cancelled'].includes(v.status)&&money(v.net)&&money(v.payment)&&typeof v.inBalance==='boolean'&&(!v.repayMonth||ym(v.repayMonth))))return false;
 if(!p.events.every(v=>str(v.id)&&str(v.name)&&ym(v.month)&&money(v.amount)&&typeof v.paid==='boolean'))return false;
 if(!p.actions.every(v=>str(v.id)&&str(v.name)&&str(v.owner)&&str(v.note)&&date(v.due)&&['todo','doing','waiting','done'].includes(v.status)))return false;
 if(!p.months||typeof p.months!=='object'||Array.isArray(p.months)||Object.keys(p.months).length>120)return false;
 return Object.entries(p.months).every(([m,v])=>ym(m)&&v&&Object.keys(v).every(k=>['rent','otherIncome','card','operating'].includes(k)&&money(v[k])));
}
