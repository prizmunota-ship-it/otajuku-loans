// Private source notes returned only through the owner-authenticated planner API.
const bankWorksheet={year:2026,goalUnits:310,source:'20260701.xlsx（7月1日時点の当初計画）＋その後の相談記録',amountMeaning:'price',banks:[
{id:'howa',name:'豊和銀行',target:'境川RC（シャトレ境川Ⅱ）／北九州',current:'境川RC（シャトレ境川Ⅱ）を相談中。融資承認は未確認。',cash:700,cashBasis:'本人申告・手付金と諸費用込みの概算',next:'融資額・自己資金・決済日を確認',milestones:[{month:12,label:'決済予定',kind:'updated',note:'境川RC。12月の決済を想定。相談開始月は未確定。'}]},
{id:'fukuoka-central',name:'福岡中央銀行',target:'糸島・久留米／築20年台のRC',current:'ハザードマップを確認。具体的な物件名は未記載。',cash:800,scale:8000,cashBasis:'原表の必要自己資金（本人確認済み）',next:'持込物件を選定し、融資相談',milestones:[{month:11,label:'融資相談',kind:'original',note:'原表：8,000万／800万。実施済みかは未確認。'}]},
{id:'oita',name:'大分銀行',target:'具体的な物件名・構造は未記載',current:'当初の7月相談計画。実施状況は未確認。',cash:1000,scale:13000,cashBasis:'原表の必要自己資金（本人確認済み）',next:'当初の相談案件と進捗を確認',milestones:[{month:7,label:'物件相談',kind:'original',note:'原表：13,000万／1,000万。'}]},
{id:'kenshin',name:'福岡県信用組合',target:'築30年程度・高利回りのRC',current:'当初の3月相談計画。具体的な物件名は未記載。',cash:1000,scale:8800,cashBasis:'原表の必要自己資金（本人確認済み）',next:'候補物件と必要自己資金を確認',milestones:[{month:3,label:'物件相談',kind:'original',note:'原表：8,800万／1,000万。'}]},
{id:'chogin',name:'朝銀西信用組合',target:'新築木造／上津・合川A棟横の土地',current:'当初の4月相談計画。現在の進捗は未確認。',cash:500,scale:5300,cashBasis:'原表の必要自己資金（本人確認済み）',next:'新築計画の進捗と融資条件を確認',milestones:[{month:4,label:'物件相談',kind:'original',note:'原表：5,300万／500万。'}]},
{id:'yokohama',name:'横浜幸銀信用組合',target:'檜原新築の竣工後、次の案件を検討',current:'原表は「檜原新築竣工まで身動き取れず」。現況は要確認。',cash:null,next:'竣工状況と次の持込時期を確認',milestones:[{month:10,label:'新築竣工',kind:'original',note:'原表の予定。竣工済みとの確認はしていない。'}]},
{id:'fukuoka-shinkin',name:'福岡信用金庫',target:'法人の資金調達／オリックス保証',current:'物件購入融資とは別の資金調達枠。',cash:null,next:'借入可能額・条件・申込時期を確認',milestones:[]},
{id:'chikuho',name:'筑邦銀行',target:'資金調達の融資情報を確認',current:'具体的な物件・調達額・相談月は未記載。',cash:null,next:'利用できる融資と申込条件を確認',milestones:[]},
{id:'karatsu',name:'唐津信用金庫',target:'築浅物件を想定（具体的な物件は未記載）',current:'原表の優先度メモは「忘れる」。再検討するか確認。',cash:400,scale:4900,cashBasis:'原表の必要自己資金（本人確認済み）',next:'当初の6月相談を継続するか確認',milestones:[{month:6,label:'物件相談',kind:'original',note:'原表：4,900万／400万。実施状況は未確認。'}]},
{id:'hibiki',name:'福岡ひびき信用金庫',target:'候補物件は未記載',current:'原表の優先度メモは「忘れる」。再検討するか確認。',cash:null,next:'相談を再開するか確認',milestones:[]},
{id:'ag',name:'AG（長崎RC相談先）',target:'長崎RC／セントラルパークマンション',current:'後から追加した案件。6,000万円・25年の審査相談。承認は未確認。',cash:700,cashBasis:'本人申告・手付金と諸費用込みの概算',next:'審査結果・必要自己資金・決済日を確認',milestones:[{month:12,label:'決済予定',kind:'updated',note:'12月決済の想定。融資未確定。'}]}
]};

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
   return json({bankWorksheet,plan:saved?.plan||initial,revision:saved?.revision||null,ledger:records[0].data,ledgerUpdated:records[0].updated_at,email:user.email,initial:!saved});
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
