import {validatePlan,monthsFrom} from '../../keikaku/model.mjs';
const URL='https://xhbgmnousqkoiqaruprr.supabase.co';
const KEY='sb_publishable_ZhUJDpEF1nCnMYunq27dzg_vcdmjPlc';
const OWNER='e320ddc4-6302-4632-8941-928b7395988d';
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
export function initialPlan(today){
 return {version:1,start:today.slice(0,7),goal:'購入後も運転資金を確保しながら保有戸数を増やす',goalMonth:'2026-12',goalUnits:310,reserve:5000000,
 rent:8043830,otherIncome:500000,card:2500000,operating:408544,excludedAccounts:['k21','k22'],months:{'2026-11':{card:2787229}},
 purchases:[{id:'sak',name:'シャトレ境川Ⅱ',month:'2026-12',cash:7000000,units:20,enabled:true,operationMonth:'',rent:688400,payment:382089,expense:0},{id:'nag',name:'長崎RC（セントラルパークマンション）',month:'2026-12',cash:7000000,units:8,enabled:true,operationMonth:'',rent:613000,payment:368452,expense:0}],
 funding:[],events:[{id:'ume',name:'梅満売主 半年払い（総合収支の特定支出に登録されたら重複を除く）',month:'2026-12',amount:500000,paid:false},{id:'tax',name:'法人税予算（未確定・90万円を取り置き）',month:'2026-12',amount:900000,paid:false}],
 actions:[
  ...monthsFrom(today.slice(0,7)).map(month=>({id:'review-'+month,name:month+' 資金・融資案件・目標の進捗を確認',due:month+'-25',owner:'太田',status:'todo',note:'月次確認日の初期案。預金と返済を更新し、翌月の支出・資金調達・購入予定を見直す。'})),
  {id:'card',name:'11/10のカード引落資金を福銀個人へ準備',due:'2026-11-09',owner:'太田',status:'todo',note:'登録残高基準では不足2,290,549円。振替元と最新残高を確認。期限はアプリ初期案。'},
  {id:'sak-fin',name:'境川RCの融資条件・自己資金・決済日を確定',due:'2026-11-20',owner:'太田',status:'todo',note:'豊和6,100万円・17年・3%は未承認試算。期限は初期案。'},
  {id:'nag-fin',name:'長崎RCの融資審査資料を揃え条件を確認',due:'2026-11-20',owner:'太田',status:'todo',note:'AG6,000万円・25年・5.5%は未承認試算。期限は初期案。'},
  {id:'ev',name:'長崎RCの売主EV更新範囲・完了日を書面確認',due:'2026-11-25',owner:'太田',status:'todo',note:'期限は初期案。'},
  {id:'tax-review',name:'税理士打合せで納税額と未払経費を確認',due:'2026-11-26',owner:'太田・税理士',status:'todo',note:'次回打合せ予定日。'},
  {id:'cash',name:'2棟決済前に資金残高・修繕予算を再確認',due:'',owner:'太田',status:'waiting',note:'決済日確定後、期限設定。入出金日を確認するまで月内不足は未判定。'}]};
}
export function createHandler(fetcher=fetch){return async({request,env})=>{
 if(!['GET','PUT'].includes(request.method))return json({error:'method'},405);
 const origin=request.headers.get('Origin');if(origin&&origin!==new globalThis.URL(request.url).origin)return json({error:'origin'},403);
 const token=request.headers.get('Authorization');if(!token?.startsWith('Bearer '))return json({error:'ログインが必要です'},401);
 try{
  const r=await fetcher(URL+'/auth/v1/user',{headers:{apikey:KEY,Authorization:token}});
  if(!r.ok)return json({error:'ログインの有効期限が切れました'},401);
  const user=await r.json();
  // 初版は主宰限定。メンバーへの提供時はサーバー側の会員照合を追加する。
  if(user.id!==OWNER)return json({error:'現在は太田さん専用の試用版です'},403);
  if(!env.ZAIKO_KV)return json({error:'保存先に接続できません'},503);
  const key='action-plan:v1:'+user.id;
  if(request.method==='GET'){
   const saved=await env.ZAIKO_KV.get(key,'json');
   const lr=await fetcher(URL+'/rest/v1/ledgers?user_id=eq.'+encodeURIComponent(user.id)+'&select=data,updated_at',{headers:{apikey:KEY,Authorization:token}});
   if(!lr.ok)return json({error:'総合収支の読込に失敗しました'},502);
   const records=await lr.json();if(!records[0])return json({error:'総合収支アプリにデータがありません'},404);
   const today=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Tokyo'});
   const initial=initialPlan(today);
   if((records[0].data.spots||[]).some(s=>/梅満|売主/.test(s.name||'')&&Number(s.amount)===500000&&(s.months||[]).map(Number).includes(12)))initial.events=initial.events.filter(e=>e.id!=='ume');
   return json({plan:saved?.plan||initial,revision:saved?.revision||null,ledger:records[0].data,ledgerUpdated:records[0].updated_at,email:user.email,initial:!saved});
  }
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'形式が不正です'},415);
  const raw=await request.text();if(raw.length>150000)return json({error:'データが大きすぎます'},413);
  let body;try{body=JSON.parse(raw);}catch{return json({error:'形式が不正です'},400);}
  if(!validatePlan(body.plan))return json({error:'日付・金額・必須項目を確認してください'},400);
  const previous=await env.ZAIKO_KV.get(key,'json');
  if((previous?.revision||null)!==(body.revision||null))return json({error:'別の画面で更新されています。再読込前に入力を控えてください。'},409);
  const revision=crypto.randomUUID();
  if(previous)await env.ZAIKO_KV.put(key+':backup:'+previous.revision,JSON.stringify(previous),{expirationTtl:2592000});
  await env.ZAIKO_KV.put(key,JSON.stringify({plan:body.plan,revision,updatedAt:new Date().toISOString()}));
  return json({revision});
 }catch{return json({error:'通信に失敗しました。入力を保持しています。'},503);}
};}
export const onRequest=createHandler();
