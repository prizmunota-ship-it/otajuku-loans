// 自動生成（vacancy-dashboard / gen_mobile_kita.py）。手で編集しない。
const DATA = {"kpi": {"asof": "2026-08-20"}, "rooms": [{"no": "", "prop": "プライマリー鷹の巣", "paddr": "八幡西区鷹の巣１−１５−１１", "go": "403", "model": "-", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "４０３メーターBOX（４６４９）", "rent": 29000, "kyoeki": 3000, "ad": 2, "days": 101, "toi": 0, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "完", "set3": "完", "gas": "未", "memo": "", "markstate": "", "kado_key": "プライマリー鷹の巣", "comp": "エイブル黒崎店"}, {"no": "", "prop": "プライマリー鷹の巣", "paddr": "八幡西区鷹の巣１−１５−１１", "go": "305", "model": "-", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "２０３横PS内KEYBOX（５９６０）", "rent": 29000, "kyoeki": 3000, "ad": 2, "days": 101, "toi": 0, "nai": 1, "nyukyo": "8/31", "broker": "エイブル黒崎店", "tanto": "", "set6": "完", "set3": "完", "gas": "未", "memo": "", "markstate": "apply_new", "kado_key": "プライマリー鷹の巣", "comp": "エイブル黒崎店"}, {"no": "", "prop": "プライマリー鷹の巣", "paddr": "八幡西区鷹の巣１−１５−１１", "go": "402", "model": "-", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "４０３メーターBOX（４６４９）", "rent": 29000, "kyoeki": 3000, "ad": 2, "days": 101, "toi": 0, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "完", "gas": "未", "memo": "", "markstate": "", "kado_key": "プライマリー鷹の巣", "comp": "エイブル黒崎店"}, {"no": "", "prop": "プライマリー鷹の巣", "paddr": "八幡西区鷹の巣１−１５−１１", "go": "103", "model": "モデルルーム", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "１０６横PS内KEYBOX（５９６０）", "rent": 29000, "kyoeki": 3000, "ad": 2, "days": 101, "toi": 0, "nai": 1, "nyukyo": "8/31", "broker": "エイブル黒崎店", "tanto": "", "set6": "完", "set3": "完", "gas": "未", "memo": "", "markstate": "apply_new", "kado_key": "プライマリー鷹の巣", "comp": "エイブル黒崎店"}, {"no": null, "prop": "プライマリー鷹の巣", "paddr": "八幡西区鷹の巣１−１５−１１", "go": "P中央", "model": "-", "naiso": "未内装", "taikyo": "7/31", "reform": "確認中", "nairan": "確認中", "rent": 6600, "kyoeki": 0, "ad": 0, "days": 20, "toi": null, "nai": null, "nyukyo": "8/31", "broker": "エイブル黒崎店", "tanto": "", "set6": "-", "set3": "-", "gas": "-", "memo": "103号室申込者が同時契約（8/13申込）", "markstate": "apply_new", "kado_key": "プライマリー鷹の巣", "comp": "エイブル黒崎店", "golabel": "駐車場（真ん中区画）"}, {"no": "", "prop": "プライマリー鷹の巣", "paddr": "八幡西区鷹の巣１−１５−１１", "go": "405", "model": "-", "naiso": "空予定", "taikyo": "8/27", "reform": "退去予定", "nairan": "退去予定", "rent": 29000, "kyoeki": 3000, "ad": 2, "days": -7, "toi": 0, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "", "gas": "未", "memo": "", "markstate": "", "kado_key": "プライマリー鷹の巣", "comp": "エイブル黒崎店"}], "kado": [{"name": "プライマリー鷹の巣", "total_ju": 24}], "contacts": {"エイブル黒崎店": {"tel": [{"name": "株式会社プライズムン（太田）", "num": "080-3977-0118"}], "line": "https://line.me/ti/p/8GcbgI0sTQ", "email": ["prizmun.ota@gmail.com"]}}};
const HTML = `<!doctype html>
<html lang="ja"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=2">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>プライマリー空室一覧</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--ink:#0f172a;--mut:#64748b;--line:#e5e8ee;--ac:#2563eb}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif;font-size:20px;line-height:1.5;padding-bottom:40px}
header{position:sticky;top:0;z-index:5;background:#fff;border-bottom:1px solid var(--line);padding:12px 14px}
header h1{margin:0;font-size:23.5px;display:flex;align-items:center;gap:6px}
header .upd{font-size:15px;color:var(--mut);margin-top:3px}
.chips{display:flex;gap:9px;flex-wrap:wrap;margin-top:11px}
.chip{background:#f1f5f9;border-radius:999px;padding:6px 15px;font-size:17px;font-weight:600;color:#334155}
.chip b{color:var(--ac);font-size:19.5px}
.chip.bad b{color:#dc2626}
.chip.tap{cursor:pointer;border:1px solid #cbd5e1}
.chip.on{background:#2563eb;color:#fff;border-color:#2563eb}
.chip.on b{color:#fff}
.fbar{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:9px;padding:10px 14px;margin-bottom:4px;font-size:18px;font-weight:700;color:#1d4ed8}
.fbar button{background:#fff;border:1px solid #bfdbfe;color:#1d4ed8;border-radius:7px;padding:7px 14px;font-size:16.5px;font-weight:700}
.wrap{padding:10px 12px}
.exall{font-size:16.5px;color:var(--ac);font-weight:600;background:none;border:0;padding:7px 2px;margin-bottom:2px}
/* ===== 物件アコーディオン ===== */
.pcard{background:var(--card);border:1px solid var(--line);border-radius:13px;margin-top:9px;box-shadow:0 1px 3px rgba(15,23,42,.05)}
.phead{cursor:pointer;display:flex;align-items:center;gap:10px;padding:11px 13px;background:linear-gradient(to right,#f4f7fb,#fff);position:sticky;top:var(--hh,140px);z-index:4;border-radius:12px}
.pcard.open .phead{border-radius:12px 12px 0 0;box-shadow:0 3px 6px -2px rgba(15,23,42,.12)}
.phead .pmain{flex:1;min-width:0}
.pnrow{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.pn{font-weight:700;font-size:22px}
.ptag{display:inline-block;font-size:14.5px;font-weight:700;color:#1d4ed8;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:3px 10px;margin-left:9px;vertical-align:2px;white-space:nowrap;cursor:pointer}
.ptag:after{content:"  ☎";font-size:13px}
.kr{font-size:16.5px;font-weight:700;color:#334155;white-space:nowrap}
.kr.lo{color:#dc2626}
.pa{font-size:15px;color:var(--mut);margin-top:2px}
.pcount{font-size:16px;color:#475569;margin-top:4px;font-weight:600}
.pcount .ap{color:#166534}
.pcount .react{color:var(--mut);font-weight:500}
.chev{flex:none;width:24px;height:24px;color:#94a3b8;transition:transform .3s}
.pcard.open .chev{transform:rotate(180deg)}
.pbody{max-height:0;overflow:hidden;transition:max-height .35s ease}
.pcard.open .pbody{max-height:8000px}
.pbody-in{padding:2px 11px 11px}
/* ===== 部屋カード ===== */
.room{background:#fff;border:1px solid var(--line);border-radius:10px;padding:9px 11px;margin-top:7px}
.room.mk-an{background:#eefbe0;border-color:#cbe89a}
.room.mk{background:#fffbe9;border-color:#f3e4a3}
.room.mk-cn{background:#fff0f0;border-color:#f3b6b6}
.r1{display:flex;align-items:center;gap:9px}
.go{font-size:26px;font-weight:800;min-width:58px}
.go.park{font-size:20px;font-weight:700;color:#475569}
.badges{display:flex;gap:6px;flex-wrap:wrap;flex:1}
.b{font-size:15.5px;font-weight:700;border-radius:6px;padding:3px 10px;white-space:nowrap}
.b.done{background:#e2e8f0;color:#475569}
.b.work{background:#dbeafe;color:#1d4ed8}
.b.none{background:#fde68a;color:#92400e}
.b.soon{background:#fecaca;color:#b91c1c}
.b.apply{background:#bbf7d0;color:#166534}
.b.days{background:#f1f5f9;color:#475569}
.b.days.lt{background:#fee2e2;color:#b91c1c}
.b.set{background:#ede9fe;color:#6d28d9}
.b.col{background:#fce7f3;color:#be185d}
.r2{font-size:18px;color:#334155;margin-top:6px;display:flex;flex-wrap:wrap;gap:3px 12px}
.r2 .yen{font-weight:700}
.r2 .ad{color:#0369a1;font-weight:600}
.rkey{font-size:16.5px;color:#1d4ed8;font-weight:600;margin-top:6px}
.memo{font-size:16.5px;color:#475569;margin-top:6px;padding-top:6px;border-top:1px dashed var(--line)}
.memo b{color:#b45309}
.empty{color:var(--mut);text-align:center;padding:30px;font-size:18px}
footer{text-align:center;color:var(--mut);font-size:14px;margin-top:24px}
/* ===== 連絡先シート ===== */
.sheet-bg{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:50;display:none}
.sheet-bg.on{display:block}
.sheet{position:fixed;left:0;right:0;bottom:0;max-width:560px;margin:0 auto;background:#fff;border-radius:20px 20px 0 0;z-index:51;padding:18px 16px calc(18px + env(safe-area-inset-bottom));transform:translateY(110%);transition:transform .25s ease;box-shadow:0 -6px 30px rgba(0,0,0,.18)}
.sheet.on{transform:translateY(0)}
.sheet h3{margin:2px 0 14px;font-size:20px}
.sheet a{display:flex;align-items:center;gap:13px;padding:15px 15px;border:1px solid var(--line);border-radius:13px;margin-bottom:11px;font-size:19px;font-weight:700;color:var(--ink);text-decoration:none}
.sheet a .ic{font-size:23px}
.sheet a .sub{font-size:14px;color:var(--mut);font-weight:500;margin-left:auto;text-align:right}
.sheet a.tel{background:#ecfdf5;border-color:#a7f3d0}
.sheet a.line{background:#e7fbe9;border-color:#a3e0a8}
.sheet .close{width:100%;padding:14px;border:0;background:#f1f5f9;border-radius:13px;font-size:17px;font-weight:700;color:#334155;margin-top:2px}
</style></head>
<body>
<header>
 <h1>🏠 プライマリー空室一覧</h1>
 <div class="upd" id="upd"></div>
 
 <div class="chips" id="chips"></div>
</header>
<div class="wrap">
 <button class="exall" id="exall" onclick="toggleAll()">＋ すべて展開</button>
 <div id="list"></div>
</div>
<footer>閲覧専用 ／ プライズムン空室管理</footer>
<div class="sheet-bg" id="sheetbg" onclick="closeSheet()"></div>
<div class="sheet" id="sheet"></div>
<script>
const D="__DATA__";
const R=D.rooms||[], M=D.kado||[];
// 物件ごとの稼働率（総戸数−ライブ空室、申込中は除外）
const VJ={};R.forEach(r=>{if(r.broker||String(r.go).startsWith('P'))return;const k=r.kado_key||r.prop;VJ[k]=(VJ[k]||0)+1});
const KR={};M.forEach(m=>{const tj=m.total_ju||0,v=VJ[m.name]||0;KR[m.name]=tj?Math.round((tj-v)/tj*100):100});
const OPEN={};   // 物件名→展開状態
let ALLOPEN=false;
let FILTER=null; // null / 'needset' / 'gas' / 'collect'（チップでフィルタ）
const isP=r=>String(r.go).startsWith('P');
const FILT={
 needset:{label:'要ｾｯﾄ設置',fn:r=>!isP(r)&&r.naiso==='完了'&&(r.set6!=='完'||r.set3!=='完')&&!r.broker},
 gas:{label:'ガスコンロ未',fn:r=>!isP(r)&&r.gas==='未'},
 collect:{label:'セット回収',fn:r=>!isP(r)&&r.broker&&r.set6==='完'},
};
function setFilter(k){FILTER=(FILTER===k?null:k);summary();render();window.scrollTo(0,0)}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function openContact(ev){
 ev.stopPropagation();
 const comp=ev.currentTarget.dataset.c;
 const c=(D.contacts||{})[comp];
 let h='<h3>'+esc(comp)+'　連絡先</h3>';
 if(c){
  (c.tel||[]).forEach(function(t){
   h+='<a class="tel" href="tel:'+t.num.replace(/[^0-9]/g,'')+'"><span class="ic">📞</span>電話する<span class="sub">'+(t.name?esc(t.name)+'<br>':'')+esc(t.num)+'</span></a>';
  });
  if(c.line)h+='<a class="line" href="'+esc(c.line)+'"><span class="ic">💬</span>LINEで連絡</a>';
  (c.email||[]).forEach(function(e){
   h+='<a href="mailto:'+esc(e)+'"><span class="ic">✉️</span>メール<span class="sub">'+esc(e)+'</span></a>';
  });
 }
 h+='<button class="close" onclick="closeSheet()">閉じる</button>';
 document.getElementById('sheet').innerHTML=h;
 document.getElementById('sheetbg').classList.add('on');
 document.getElementById('sheet').classList.add('on');
}
function closeSheet(){document.getElementById('sheetbg').classList.remove('on');document.getElementById('sheet').classList.remove('on')}
function summary(){
 const U=R.filter(r=>!String(r.go).startsWith('P'));
 const vac=U.filter(r=>!r.broker).length;
 const needset=U.filter(r=>r.naiso==='完了'&&(r.set6!=='完'||r.set3!=='完')&&!r.broker).length;
 const gasmi=U.filter(r=>r.gas==='未').length;
 const setcol=U.filter(r=>r.broker&&r.set6==='完').length;
 let tj=0,tv=0;M.forEach(m=>{tj+=m.total_ju||0;tv+=VJ[m.name]||0});
 const occ=tj?((tj-tv)/tj*100):0;
 const on=k=>FILTER===k?' on':'';
 document.getElementById('chips').innerHTML=
  '<span class="chip">空室 <b>'+vac+'</b> 戸</span>';
 setHH();
}
/* 物件ヘッダーをグローバルヘッダー直下に固定するため、ヘッダー高さを--hhに反映 */
function setHH(){const h=document.querySelector('header');if(h)document.documentElement.style.setProperty('--hh',h.offsetHeight+'px');}
addEventListener('resize',setHH);addEventListener('load',setHH);
function naisoBadge(s){
 const map={'完了':['done','完了'],'内装中':['work','内装中'],'未内装':['none','未内装'],'空予定':['soon','空予定']};
 const m=map[s];return m?'<span class="b '+m[0]+'">'+m[1]+'</span>':(s?'<span class="b done">'+s+'</span>':'');
}
function isKey(v){v=String(v||'').trim();return v&&v!=='退去予定'&&v!=='確認中'?v:''}
function roomCard(r){
 const park=String(r.go).startsWith('P');
 const mk={apply_new:'mk-an',apply:'mk',cancel_new:'mk-cn'}[r.markstate]||'';
 let badges='';
 if(park){badges=(r.broker?'<span class="b apply">申込</span>':'<span class="b none">空車</span>');}
 else{
  badges+=naisoBadge(r.naiso);
  if(r.broker)badges+='<span class="b apply">申込中'+(r.nyukyo?'・'+r.nyukyo+'入居':'')+'</span>';
  else if(r.markstate==='cancel_new'||(typeof r.days==='number'&&r.days<0))badges+='<span class="b soon">退去予定'+(r.taikyo&&r.taikyo!=='-'?'・'+r.taikyo:'')+'</span>';
 }
 let r2='';
 if(park){ if(r.rent)r2='<div class="r2"><span class="yen">¥'+Number(r.rent).toLocaleString()+'</span></div>'; }
 else if(!park){
  const yen=r.rent?'¥'+Number(r.rent).toLocaleString()+(r.kyoeki?'＋'+Number(r.kyoeki).toLocaleString():''):'';
  const adnum=r.ad!==''&&r.ad!=null?(typeof r.ad==='number'?r.ad:parseFloat(r.ad)):NaN;
  const ad=!isNaN(adnum)?Math.round(adnum*100)+'％':'';
  const adhot=(!isNaN(adnum)&&adnum*100>=400)?' style="color:#dc2626;font-weight:700"':'';
  r2='<div class="r2">'+(yen?'<span class="yen">'+yen+'</span>':'')+(r.model&&r.model!=='-'?'<span>'+esc(r.model)+'</span>':'')+(ad?'<span class="ad"'+adhot+'>広告料 '+ad+'</span>':'')+'</div>';
 }
 const k=isKey(r.nairan);
 const rkey=(!park&&k)?'<div class="rkey">🔑 '+esc(k)+'</div>':'';
 const memo=(!park&&r.memo&&r.memo.trim())?'<div class="memo"><b>メモ</b>　'+esc(r.memo)+'</div>':'';
 const tanto=(r.broker&&r.tanto&&r.tanto.trim())?'<div class="memo">担当：'+esc(r.tanto)+'</div>':'';
 return '<div class="room '+mk+'"><div class="r1"><div class="go'+(park?' park':'')+'">'+esc((park&&r.golabel)?r.golabel:r.go)+'</div><div class="badges">'+badges+'</div></div>'+r2+rkey+memo+tanto+'</div>';
}
function render(){
 const flt=FILTER?FILT[FILTER]:null;
 document.getElementById('exall').style.display=flt?'none':'';
 const order=[],g={};
 R.forEach(r=>{if(flt&&!flt.fn(r))return;if(!g[r.prop]){g[r.prop]=[];order.push(r.prop)}g[r.prop].push(r)});
 const list=document.getElementById('list');
 let html='';
 if(flt){
  let n=0;order.forEach(p=>n+=g[p].length);
  html+='<div class="fbar"><span>'+flt.label+'　該当 '+n+'室</span><button onclick="setFilter(\\''+FILTER+'\\')">✕ 解除</button></div>';
 }
 if(!order.length){list.innerHTML=html+'<div class="empty">該当する部屋はありません</div>';return}
 order.forEach(prop=>{
  const rooms=g[prop],any=rooms[0];
  const open=flt?true:!!OPEN[prop];
  const kr=KR[any.kado_key||prop];
  const nm=String(prop).replace(/^プライマリー/,'');
  const ju=rooms.filter(x=>!String(x.go).startsWith('P'));
  const park=rooms.filter(x=>String(x.go).startsWith('P'));
  const vac=ju.filter(x=>!x.broker).length, apl=ju.filter(x=>x.broker).length;
  const pvac=park.filter(x=>!x.broker).length;
  const toi=ju.length?ju[0].toi:'',nai=ju.length?ju[0].nai:'';
  let cnt=[];
  if(flt){cnt.push('該当 '+rooms.length+'室');}
  else{if(vac)cnt.push('空室 '+vac);if(apl)cnt.push('<span class="ap">申込 '+apl+'</span>');if(pvac)cnt.push('駐車 '+pvac+'空');}
  const react='';
  const krHtml='';
  const comp=any.comp||'';
  const ctag=comp?'<span class="ptag" data-c="'+esc(comp)+'" onclick="openContact(event)">'+esc(comp)+'</span>':'';
  html+='<div class="pcard'+(open?' open':'')+'" id="pc-'+esc(prop)+'">'
   +'<div class="phead" onclick="tog(this)">'
    +'<div class="pmain">'
     +'<div class="pnrow"><span><span class="pn">'+esc(nm)+'</span>'+ctag+'</span>'+krHtml+'</div>'
     +(any.paddr?'<div class="pa">'+esc(any.paddr)+'</div>':'')
     +'<div class="pcount">'+cnt.join(' ・ ')+react+'</div>'
    +'</div>'
    +'<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"></path></svg>'
   +'</div>'
   +'<div class="pbody"><div class="pbody-in">'+rooms.map(roomCard).join('')+'</div></div>'
   +'</div>';
 });
 list.innerHTML=html;
}
function tog(head){
 const card=head.parentNode;const prop=card.id.replace(/^pc-/,'');
 OPEN[prop]=!card.classList.contains('open');
 card.classList.toggle('open');
}
function toggleAll(){
 ALLOPEN=!ALLOPEN;
 R.forEach(r=>OPEN[r.prop]=ALLOPEN);
 document.getElementById('exall').textContent=ALLOPEN?'－ すべて閉じる':'＋ すべて展開';
 render();
}
document.getElementById('upd').textContent='更新日　'+(D.kpi&&D.kpi.asof||'');
summary();render();

/* ===== 内装状況をリアルタイム連動: 開いた時に内装アプリ(GAS)を直接読んで上書き→再描画 =====
   ＝本村さんが内装表を変えたら、再生成を待たずに空室一覧へ自動反映される。 */
const NAISO_GAS='https://script.google.com/macros/s/AKfycbzLIY3vZuxl3YqHK4xYpkuStrdD8bMVC9-kkt62G3xZ78hOWH8ypeWhHg-DQo2DyOk5/exec';
function _normP(s){s=String(s||'').trim();for(const p of ['プライマリー','Ｐ','P']){if(s.startsWith(p))return s.slice(p.length);}return s;}
async function liveNaiso(){
 try{
  const res=await fetch(NAISO_GAS+'?action=getAll');
  const rows=await res.json();
  if(!Array.isArray(rows))return;
  const m={};
  rows.forEach(x=>{m[_normP(x.name)+''+String(x.room||'').trim()]=x;});
  let changed=false;
  R.forEach(r=>{
   const x=m[_normP(r.prop)+''+String(r.go).trim()];
   if(!x)return;
   if(x.status&&x.status!==r.naiso){r.naiso=x.status;changed=true;}
   if(x.kanryoYotei)r.reform=x.kanryoYotei;
   const kagi=String(x.kagi||'').trim();
   if(kagi&&!['空予定','退去予定','確認中','未定','なし'].includes(kagi)){r.nairan=kagi;}
  });
  if(changed){summary();render();}
 }catch(e){}
}
/* liveNaiso disabled for external (北九州) app */
</script>
</body></html>
`;
export async function onRequest() {
  const body = HTML.replace('"__DATA__"', JSON.stringify(DATA));
  return new Response(body, { headers: {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
    'x-robots-tag': 'noindex, nofollow, noarchive',
  } });
}
