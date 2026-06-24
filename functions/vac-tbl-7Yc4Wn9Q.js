// 自動生成（vacancy-dashboard / gen_mobile.py）。手で編集しない。
const HTML = `<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>プライマリーシリーズ　空室一覧表</title>
<style>
:root{--bg:#f1f5f9;--card:#ffffff;--ink:#0f172a;--mut:#64748b;--ac:#0284c7;--ok:#16a34a;--warn:#d97706;--bad:#dc2626;--line:#e2e8f0;--mgmt:#e0f2fe;--ota:#fef3c7;--naiso:#dcfce7}
*{box-sizing:border-box}body{margin:0;font-family:-apple-system,"Hiragino Kaku Gothic ProN",Meiryo,sans-serif;background:var(--bg);color:var(--ink)}
header{padding:12px 16px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
h1{font-size:24px;margin:0}.sub{color:var(--mut);font-size:12px}
#asof{font-size:13px}
.hnote{color:#dc2626;font-size:13px;margin-top:3px;font-weight:600}
.wrap{padding:14px 16px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(124px,1fr));gap:10px;margin-bottom:12px}
.card{background:var(--card);border:1px solid var(--line);border-radius:11px;padding:11px 13px}
.card .v{font-size:23px;font-weight:700;line-height:1.1}.card .l{color:var(--mut);font-size:11px;margin-top:3px}
.card{box-shadow:0 1px 3px rgba(15,23,42,.06)}
.card.warn .v{color:var(--warn)}.card.bad .v{color:var(--bad)}.card.ac .v{color:var(--ac)}.card.ok .v{color:var(--ok)}.card.pur .v{color:#9333ea}
.card.money .v{font-size:17px;white-space:nowrap}
.ed.need{background:#fee2e2;color:#b91c1c;font-weight:700}.ed.need::after{content:" ⚠"}
.ed.collect{color:#dc2626!important;font-weight:700}   /* 申込済で6点セット完＝回収必要を赤字で強調 */
.mklgd{display:flex;gap:16px;align-items:center;flex-wrap:wrap;font-size:12.5px;color:var(--ink);margin:-4px 0 12px 2px}
.mklgd b{font-weight:700;color:var(--mut)}
.mklgd .sw{display:inline-block;width:18px;height:13px;border-radius:3px;border:1px solid #cbd5e1;margin-right:6px;vertical-align:middle}
.mklgd .note{color:#94a3b8;font-size:11.5px}
.sw.an{background:#d8f5a2}.sw.yl{background:#fff3bf}.sw.cn{background:#ffa8a8}
.grid td.mk{background:#fff3bf!important}          /* 申込中 黄色 */
.grid td.mk-an{background:#d8f5a2!important}       /* 新規申込 黄緑（1週間） */
.grid td.mk-cn{background:#ffa8a8!important}       /* 新規解約 赤（1週間） */
.ed.bikored{color:#dc2626;font-weight:600}
.ed.statno{color:#dc2626;font-weight:700}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}@media(max-width:760px){.row2{grid-template-columns:1fr}}
.panel{background:var(--card);border:1px solid var(--line);border-radius:11px;padding:11px 13px}
.panel h3{margin:0 0 8px;font-size:12px;color:var(--mut);font-weight:600}
.bar{display:flex;align-items:center;gap:8px;margin:5px 0;font-size:12px}
.bar .nm{width:116px;flex:none}.bar .tr{flex:1;background:#e8eef4;border-radius:6px;overflow:hidden;height:15px}
.bar .fl{height:100%;border-radius:6px}.bar .ct{width:24px;text-align:right;flex:none;color:var(--mut)}
.tools{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:8px;align-items:center}
select,input,button{background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:6px 9px;font-size:12.5px}
button{cursor:pointer}button.pr{background:var(--ac);color:#fff;border:none;font-weight:700}
button.gn{background:var(--ok);color:#fff;border:none;font-weight:700}
.scroll{overflow:auto;max-height:68vh;border:1px solid var(--line);border-radius:10px}
.scroll.fit{max-height:none;overflow:visible}
.grid.fit{width:100%;table-layout:fixed;font-size:8px}
.grid.fit th,.grid.fit td{padding:1px 2px;word-break:break-all;white-space:normal;height:auto}
table.grid{border-collapse:collapse;font-size:11px;white-space:nowrap}
.grid th,.grid td{border:1px solid var(--line);padding:2px 4px;text-align:center;height:24px;vertical-align:middle}
.grid tbody tr{height:38px}   /* 画面: 全部屋の行高を統一(駐車場行も住居と同じ高さに) */
.grid td.mc{background:#f8fafc;font-weight:600;text-align:center;color:#0f172a}
.grid td.mc-mid{vertical-align:middle}
.grid td.mc .paddr{font-size:.82em;color:var(--mut);font-weight:400;margin-top:2px;line-height:1.2}
.grid td.mc .krate{font-size:.82em;font-weight:700;margin-top:2px;line-height:1.2}
.grid th.stick,.grid td.stick{position:sticky}
.grid td.stick{z-index:3;background:#f8fafc}
.grid td.mc.stick{background:#f8fafc;z-index:3}
.grid td.mcj{vertical-align:middle;text-align:center;font-weight:600}.grid td.mcj.jlisted{color:#0369a1}
.grid thead th.stick{z-index:6;background:#eef2f7}
.grid td.stick,.grid th.stick{box-shadow:1px 0 0 var(--line)}
.grid thead th{position:sticky;background:#eef2f7;color:#475569;z-index:2}
.grid thead tr.band th{top:0;height:21px;text-align:center}.grid thead tr.lbl th{top:21px}
.band .b-mgmt{background:var(--mgmt);color:#0369a1}.band .b-ota{background:var(--ota);color:#92600a}.band .b-base{background:#eef2f7}.band .b-naiso{background:var(--naiso);color:#15803d}
th.help{cursor:help}.help .i{color:var(--ac);font-weight:700}
.col-mgmt{background:rgba(2,132,199,.05)}.col-ota{background:rgba(217,119,6,.06)}.col-naiso{background:transparent}
.ed{cursor:text;min-width:34px}.ed:hover{background:rgba(2,132,199,.10);outline:1px solid #93c5e8}
.ed:focus{background:#fff;outline:2px solid var(--ac)}
.ro{color:var(--ink)}.lk{color:#16a34a;font-size:9px}
.tag{display:inline-block;padding:0 6px;border-radius:99px;font-size:10.5px;font-weight:700}
.t-done{background:#dcfce7;color:#15803d}.t-mid{background:#fef3c7;color:#b45309}.t-no{background:#fee2e2;color:#b91c1c}.t-soon{background:#e0f2fe;color:#0369a1}.t-apply{background:#f3e8ff;color:#7e22ce}.t-list{background:#e0f2fe;color:#0369a1}
tr.lt td.kday{color:#dc2626;font-weight:700}.grp td{border-top:2px solid #94a3b8}
.del{color:#dc2626;cursor:pointer;font-weight:700}
.tabs button{font-size:14px;padding:7px 16px}
.kbar{margin-bottom:10px;font-size:14px;font-weight:700;color:var(--ink)}
.kscroll{overflow:auto;border:1px solid var(--bd);border-radius:8px}
table.ktbl{border-collapse:collapse;width:100%;font-size:13px;background:#fff}
.ktbl th,.ktbl td{border:1px solid #cbd5e1;padding:5px 8px;text-align:center;white-space:nowrap}
.ktbl thead th{background:#eef2f7;color:#334155;position:sticky;top:0;font-weight:700}
.ktbl td.l{text-align:left}
.ktbl td.mid{vertical-align:middle;background:#fff;font-weight:600}
.ktbl .ksub{font-weight:400;font-size:11px;color:var(--mut);margin-top:2px}
.ktbl td.nm{text-align:left;font-weight:700}
.ktbl tr.sub td{text-align:left;color:var(--mut);font-size:11px}
.ktbl tbody tr:nth-child(even){background:#f8fafc}
.ktbl tr.tot td{background:#fff7ed;font-weight:700;border-top:2px solid #94a3b8}
.ktbl .occ{font-weight:700}
.ktbl .full{color:#16a34a}.ktbl .warn{color:#b45309}.ktbl .bad{color:#dc2626}
.ktbl .vac{color:#dc2626;font-weight:700}
.klink{margin-left:8px;border:none;background:none;color:var(--ac);cursor:pointer;font-size:12px}
.print-only{display:none}
@media print{
 *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
 body{background:#fff;color:#000}
 .row2,.tools,.print-only,.tabs{display:none!important}
 /* 全体表示のPDFはKPIカード＋内装状況も掲載。仲介業者向け表示中は非表示 */
 body.brokerprint .cards,body.brokerprint .panel{display:none!important}
 body.brokerprint .grid td.mc .krate{display:none!important}   /* 仲介用PDFは物件稼働率を出さない */
 body.companypdf .cards,body.companypdf .panel{display:none!important}  /* 会社別PDFは全体KPIを出さない */
 .cards{display:grid!important;grid-template-columns:repeat(7,1fr)!important;gap:5px!important;margin:0 0 5px!important}
 .card{padding:4px 7px!important;border:.5px solid #999!important;border-radius:5px!important;box-shadow:none!important}
 .card .v{font-size:14px!important}.card .l{font-size:8px!important;margin-top:0!important}
 .card.money .v{font-size:12px!important}
 .panel{padding:3px 7px!important;margin:0 0 5px!important;border:.5px solid #999!important;font-size:10px!important}
 header{border:none;padding:0 0 1px}header>div:nth-child(2){display:none!important}
 header h1{font-size:22px}#asof{font-size:13px}.hnote{font-size:13px;margin-top:1px}
 .screen-only>.sub{display:none!important}
 .wrap{padding:0;margin:0;}
 .scroll{max-height:none!important;overflow:visible!important;border:none}
 .grid td.stick,.grid th.stick{position:static!important;left:auto!important;min-width:0!important;width:auto!important;box-shadow:none!important}
 .grid thead th{position:static!important}
 table.grid{font-size:9px;width:100%;border-collapse:collapse;line-height:1.15}
 .grid th,.grid td{height:auto!important;padding:2px 3px;border:.5px solid #999;white-space:nowrap;text-align:center;vertical-align:middle}
 /* 仲介業者向け（列数が少ない）は読みやすく拡大 */
 body.brokerprint table.grid{font-size:11px}
 body.brokerprint .grid th,body.brokerprint .grid td{padding:2px 4px}
 .grid td br{display:none}               /* 印刷は全セルを1行に＝全行を同じ高さに統一 */
 .grid tbody tr{height:auto!important}
 .grid thead tr.band th{height:auto!important}.grid thead tr.lbl th{height:auto!important}
 .grid thead tr.band th.b-base{border:none!important;background:#fff!important}
 .grid thead{display:table-row-group}
 .grid .ed.bikored{font-weight:400}
 /* 稼働率表をA4縦で印刷（稼働率表タブ表示中のみ） */
 body.kadoprint .hnote{display:none!important}
 .kscroll{overflow:visible!important;border:none!important}
 #kadoview .sub,.klink{display:none!important}
 table.ktbl{font-size:8.5px;width:100%}
 .ktbl th,.ktbl td{padding:2px 3px;border:.5px solid #999}
 .ktbl thead th{position:static!important}
 .ktbl .ksub{font-size:7.5px}
 .kbar{font-size:11px;margin-bottom:6px}
}

</style><style id="pagestyle">@page{size:A3 landscape;margin:5mm}</style></head><body>
<header><div><h1>🏠 プライマリーシリーズ　空室一覧表</h1><div class="sub" id="asof"></div>
<div class="hnote">※ペット飼育時、１匹につき共益費＋２千円　／　※家電３点（冷蔵庫・洗濯機・レンジ）共益費＋３千円</div></div>
<div style="display:flex;gap:7px;align-items:center"><span class="sub" id="bk" style="font-size:12px"></span>
<button onclick="window.open('https://docs.google.com/spreadsheets/d/1ZkoVuREYPZ_EtZwdYsduACalAUcbuf3qMye6XXlR5lM/edit','_blank')">🗂 内装一覧</button>
<button class="pr" onclick="window.print()">🖨 印刷／PDF</button></div></header>
<div class="wrap">
 <div class="screen-only tabs" style="display:flex;gap:8px;margin-bottom:12px">
  <button id="tab-list" class="pr" onclick="showView('list')">📋 空室一覧</button>
  <button id="tab-kado" onclick="showView('kado')">📊 稼働率表</button></div>
 <div class="cards" id="cards"></div>
 <div class="panel" style="margin-bottom:12px;display:flex;gap:16px;align-items:center;flex-wrap:wrap">
  <span style="font-size:12px;color:var(--mut)">内装状況</span><span id="naisonums" style="font-size:13px"></span>
  <span class="sub" id="naisolink" style="margin-left:auto"></span></div>
 <div class="mklgd"><b>マーカー：</b><span><i class="sw an"></i>新規申込</span><span><i class="sw yl"></i>申込中</span><span><i class="sw cn"></i>新規解約</span><span class="note">※緑・赤は1週間だけ</span></div>
 <div class="screen-only" id="listview">
  <div class="tools">
   <select id="fcomp"><option value="">全管理会社</option></select>
   <select id="fnaiso"><option value="">全内装状況</option></select>
   <label class="sub"><input type="checkbox" id="fapply"> 申込中</label>
   <label class="sub"><input type="checkbox" id="flt"> 長期60日+</label>
   <label class="sub"><input type="checkbox" id="fneed"> 要ｾｯﾄ設置</label>
   <label class="sub"><input type="checkbox" id="fcollect"> セット回収</label>
   <label class="sub"><input type="checkbox" id="fnolist"> 60日+未掲載</label>
   <label class="sub"><input type="checkbox" id="fpark" checked> 駐車場</label>
   <input id="q" placeholder="物件・号数で検索" style="flex:1;min-width:120px">
   <button id="bvbtn" onclick="toggleBroker()">👔 仲介業者向け表示</button>
   <button class="gn" onclick="addRoom()">＋ 部屋追加</button></div>
  <div class="scroll"><table class="grid" id="tbl"></table></div>
  <div class="sub" style="margin-top:6px">セル直接編集→自動保存（この端末）。<span style="color:#4ade80">緑帯＝内装アプリ連動（内装状況・完了予定は読取専用🔗）</span>／<span style="color:#7dd3fc">青帯＝管理会社入力</span>／<span style="color:#fbbf24">黄帯＝太田入力</span>。6点・3点は見出しⓘ参照。</div>
 </div>
 <div class="print-only">
  <div class="phead">
   <div><div class="pttl">プライマリーシリーズ　空室一覧表</div><div class="pupd" id="pupd"></div></div>
   <div><div class="pnote">※ペット飼育時、１匹につき共益費＋２千円　／　※家電３点（冷蔵庫・洗濯機・レンジ）共益費＋３千円</div>
    <div class="plegend"><span class="lg b">申込中</span><span class="lg g">新規申込（一週間以内）</span><span class="lg o">新規解約（一週間以内）</span></div></div>
   <div class="pR">総合窓口（オーナー）<br>（株）プライズムン　太田圭一<br>TEL：０８０−３９７７−０１１８<br><span class="red">TELでもLINEでもお気軽に連絡ください！</span><div class="pqr">LINE QR</div></div>
  </div>
  <table class="pr" id="ptbl"></table>
 </div>
 <div id="kadoview" style="display:none">
  <div class="kbar"><span id="ksum"></span></div>
  <div class="kscroll"><table class="ktbl" id="ktbl"></table></div>
  <div class="sub" style="margin-top:6px">総戸数・台数・名義・住所などは固定マスター（売買時のみ変更）。空室数・空車数・稼働率は空室一覧から毎週自動計算。<button class="klink" onclick="alert('総戸数や住所などの固定情報を直す時は、build.py が読む稼働率表マスターの更新が必要です。太田さんは「○○の総戸数を○室に」と言ってください。')">ⓘ 固定情報の直し方</button></div>
 </div>
</div>
<script>
const SEED={"kpi": {"asof": "2026-06-24", "asof_disp": "2026/6/24", "total_units_vac": 35, "parking": 6, "applied": 7, "taikyo_yotei": 4, "longterm": 2, "loss_sum": 2902936, "wk_toi": 37, "wk_nai": 15, "jimoti_listed": 6, "set6_done": 12, "set3_done": 25, "naiso": {"完了": 18, "未内装": 9, "内装中": 8, "空予定": 4}, "by_comp": {"イムズパートナー": 7, "お部屋倶楽部": 10, "ウィズザライフ": 8, "駅前管理システム": 4, "エイブル黒崎店": 6}, "total_units": 258, "naiso_linked": 18}, "rooms": [{"no": "", "comp": "イムズパートナー", "comp_full": "イムズパートナー\\n\\n山邊（やまべ）様\\n090-8225-5419", "prop": "プライマリー合川A棟", "propaddr": "プライマリー合川A棟 合川町８−２１", "paddr": "合川町８−２１", "chiku": 28, "kouzou": "W", "net": "無料", "pet": "可", "go": "201", "model": "角部屋（出窓有）", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "現地KEYBOX０１３１", "rent": 29000, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 5, "biko": "６月末までの契約に限り\\n広告料５００％", "days": 144, "loss": 148645, "toi": 2, "nai": 0, "nyukyo": "7/15", "broker": "ホームアシスト", "tanto": "田中社長", "set6": "-", "set3": "完", "gas": "完", "jimoti": "掲載中", "memo": "", "naiso_linked": false, "kado_key": "プライマリー合川A棟", "markstate": "apply_new"}, {"no": "", "comp": "イムズパートナー", "comp_full": "イムズパートナー\\n\\n山邊（やまべ）様\\n090-8225-5419", "prop": "プライマリー合川A棟", "propaddr": "プライマリー合川A棟 合川町８−２１", "paddr": "合川町８−２１", "chiku": 28, "kouzou": "W", "net": "無料", "pet": "可", "go": "202", "model": "モデルルーム", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "ダイヤル錠０１３１", "rent": 29000, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 5, "biko": "６月末までの契約に限り\\n広告料５００％", "days": 116, "loss": 119742, "toi": 2, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "完", "set3": "完", "gas": "完", "jimoti": "掲載中", "memo": "未通電", "naiso_linked": false, "kado_key": "プライマリー合川A棟", "markstate": ""}, {"no": "", "comp": "イムズパートナー", "comp_full": "イムズパートナー\\n\\n山邊（やまべ）様\\n090-8225-5419", "prop": "プライマリー合川A棟", "propaddr": "プライマリー合川A棟 合川町８−２１", "paddr": "合川町８−２１", "chiku": 28, "kouzou": "W", "net": "無料", "pet": "可", "go": "105", "model": "-", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "ダイヤル錠１３１", "rent": 29000, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 5, "biko": "６月末までの契約に限り\\n広告料５００％", "days": 406, "loss": 419097, "toi": 2, "nai": 0, "nyukyo": "7月末頃", "broker": "ホームアシスト", "tanto": "田中社長", "set6": "完", "set3": "完", "gas": "完", "jimoti": "掲載中", "memo": "入居日確認中（7月末頃）", "naiso_linked": false, "kado_key": "プライマリー合川A棟", "markstate": "apply_new"}, {"no": "", "comp": "イムズパートナー", "comp_full": "イムズパートナー\\n\\n山邊（やまべ）様\\n090-8225-5419", "prop": "プライマリー合川A棟", "propaddr": "プライマリー合川A棟 合川町８−２１", "paddr": "合川町８−２１", "chiku": 28, "kouzou": "W", "net": "無料", "pet": "可", "go": "203", "model": "家電４点有", "naiso": "未内装", "taikyo": "4/19", "reform": "確認中", "nairan": "KEYBOX0131", "rent": 29000, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 5, "biko": "６月末までの契約に限り\\n広告料５００％", "days": 66, "loss": 68129, "toi": 2, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "完", "gas": "完", "jimoti": "掲載中", "memo": "", "key_from_naiso": true, "naiso_linked": true, "kado_key": "プライマリー合川A棟", "markstate": ""}, {"no": "", "comp": "イムズパートナー", "comp_full": "イムズパートナー\\n\\n山邊（やまべ）様\\n090-8225-5419", "prop": "プライマリー合川A棟", "propaddr": "プライマリー合川A棟 合川町８−２１", "paddr": "合川町８−２１", "chiku": 28, "kouzou": "W", "net": "無料", "pet": "可", "go": "102", "model": "-", "naiso": "内装中", "taikyo": "3/25", "reform": "2026-06-25", "nairan": "KEYBOX0131", "rent": 29000, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 5, "biko": "６月末までの契約に限り\\n広告料５００％", "days": 91, "loss": 93935, "toi": 2, "nai": 0, "nyukyo": "6/27", "broker": "ホームアシスト", "tanto": "田中社長", "set6": "", "set3": "", "gas": "未", "jimoti": "掲載中", "memo": "未内装→リプラル本村へ工事依頼要", "key_from_naiso": true, "naiso_linked": true, "kado_key": "プライマリー合川A棟", "markstate": "apply"}, {"no": null, "comp": "イムズパートナー", "comp_full": "イムズパートナー\\n\\n山邊（やまべ）様\\n090-8225-5419", "prop": "プライマリー合川A棟", "propaddr": "プライマリー合川A棟 合川町８−２１", "paddr": "合川町８−２１", "chiku": 28, "kouzou": "W", "net": "無料", "pet": "可", "go": "P2", "model": "-", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "-", "rent": 4400, "kyoeki": 0, "water": 0, "shikirei": 0, "ad": 0, "biko": "", "days": 149, "loss": 21148, "toi": 2, "nai": 0, "nyukyo": "7月末頃", "broker": "ホームアシスト", "tanto": "田中社長", "set6": "-", "set3": "-", "gas": "完", "jimoti": "-", "memo": "", "naiso_linked": false, "kado_key": "プライマリー合川A棟", "markstate": "apply_new"}, {"no": null, "comp": "イムズパートナー", "comp_full": "イムズパートナー\\n\\n山邊（やまべ）様\\n090-8225-5419", "prop": "プライマリー合川A棟", "propaddr": "プライマリー合川A棟 合川町８−２１", "paddr": "合川町８−２１", "chiku": 28, "kouzou": "W", "net": "無料", "pet": "可", "go": "P4", "model": "-", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "-", "rent": 4400, "kyoeki": 0, "water": 0, "shikirei": 0, "ad": 0, "biko": "", "days": 144, "loss": 20439, "toi": 2, "nai": 0, "nyukyo": "6/27", "broker": "ホームアシスト", "tanto": "田中社長", "set6": "-", "set3": "-", "gas": "完", "jimoti": "-", "memo": "", "naiso_linked": false, "kado_key": "プライマリー合川A棟", "markstate": "apply_new"}, {"no": "", "comp": "イムズパートナー", "comp_full": "イムズパートナー\\n\\n山邊（やまべ）様\\n090-8225-5419", "prop": "プライマリー合川B棟", "propaddr": "プライマリー合川B棟 合川町８−２４", "paddr": "合川町８−２４", "chiku": 30, "kouzou": "W", "net": "無料", "pet": "可", "go": "205", "model": "-", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "玄関ドアダイヤル錠０１３１", "rent": 24900, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 5, "biko": "７月末までの契約に限り\\n広告料５００％\\n敷地内駐車場込／駐車場不要は家賃−3,300円", "days": 366, "loss": 329400, "toi": 2, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "完", "set3": "完", "gas": "完", "jimoti": "-", "memo": "", "naiso_linked": false, "kado_key": "プライマリー合川B棟", "markstate": ""}, {"no": "", "comp": "イムズパートナー", "comp_full": "イムズパートナー\\n\\n山邊（やまべ）様\\n090-8225-5419", "prop": "プライマリー合川B棟", "propaddr": "プライマリー合川B棟 合川町８−２４", "paddr": "合川町８−２４", "chiku": 30, "kouzou": "W", "net": "無料", "pet": "可", "go": "206", "model": "角部屋", "naiso": "未内装", "taikyo": "4/25", "reform": "確認中", "nairan": "KEYBOX0131", "rent": 24900, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 5, "biko": "７月末までの契約に限り\\n広告料５００％\\n敷地内駐車場込／駐車場不要は家賃−3,300円", "days": 60, "loss": 54000, "toi": 2, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "", "gas": "未", "jimoti": "-", "memo": "", "key_from_naiso": true, "naiso_linked": true, "kado_key": "プライマリー合川B棟", "markstate": ""}, {"no": null, "comp": "イムズパートナー", "comp_full": "イムズパートナー\\n\\n山邊（やまべ）様\\n090-8225-5419", "prop": "プライマリー合川B棟", "propaddr": "プライマリー合川B棟 合川町８−２４", "paddr": "合川町８−２４", "chiku": 30, "kouzou": "W", "net": "無料", "pet": "可", "go": "P1", "model": "-", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "-", "rent": 3300, "kyoeki": 0, "water": 0, "shikirei": 0, "ad": 0, "biko": "", "days": 366, "loss": 38961, "toi": 2, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "-", "set3": "-", "gas": "完", "jimoti": "-", "memo": "", "naiso_linked": false, "kado_key": "プライマリー合川B棟", "markstate": ""}, {"no": null, "comp": "イムズパートナー", "comp_full": "イムズパートナー\\n\\n山邊（やまべ）様\\n090-8225-5419", "prop": "プライマリー合川B棟", "propaddr": "プライマリー合川B棟 合川町８−２４", "paddr": "合川町８−２４", "chiku": 30, "kouzou": "W", "net": "無料", "pet": "可", "go": "P4", "model": "-", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "-", "rent": 3300, "kyoeki": 0, "water": 0, "shikirei": 0, "ad": 0, "biko": "", "days": 116, "loss": 12348, "toi": 2, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "-", "set3": "-", "gas": "完", "jimoti": "-", "memo": "", "naiso_linked": false, "kado_key": "プライマリー合川B棟", "markstate": ""}, {"no": "", "comp": "お部屋倶楽部", "comp_full": "お部屋倶楽部\\n\\n村田様\\n080-4830-7755\\n中川様\\n080-4314-1854", "prop": "プライマリー久留米大南", "propaddr": "プライマリー久留米大南 野中町２６０−１０", "paddr": "野中町２６０−１０", "chiku": 36, "kouzou": "W", "net": "無料", "pet": "可", "go": "211", "model": "モデルルーム", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "現地KEYBOX７７５５", "rent": 25000, "kyoeki": 3000, "water": 2500, "shikirei": 0, "ad": 3, "biko": "※生活保護者は\\n31,000円（共益費込み）", "days": 114, "loss": 102968, "toi": 2, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "完", "set3": "完", "gas": "完", "jimoti": "掲載中", "memo": "", "naiso_linked": false, "kado_key": "プライマリー久留米大南", "markstate": ""}, {"no": "", "comp": "お部屋倶楽部", "comp_full": "お部屋倶楽部\\n\\n村田様\\n080-4830-7755\\n中川様\\n080-4314-1854", "prop": "プライマリー久留米大南", "propaddr": "プライマリー久留米大南 野中町２６０−１０", "paddr": "野中町２６０−１０", "chiku": 36, "kouzou": "W", "net": "無料", "pet": "可", "go": "203", "model": "冷蔵庫・レンジ\\nTVボード・ローテーブル有", "naiso": "内装中", "taikyo": "2/28", "reform": "2026-06-26", "nairan": "KEYBOX7755", "rent": 25000, "kyoeki": 3000, "water": 2500, "shikirei": "礼1", "ad": 5, "biko": "７月末までの契約に限り\\n広告料５００％\\n※生活保護者は\\n31,000円（共益費込み）", "days": 116, "loss": 104774, "toi": 2, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "完", "set3": "完", "gas": "完", "jimoti": "掲載中", "memo": "", "key_from_naiso": true, "naiso_linked": true, "kado_key": "プライマリー久留米大南", "markstate": ""}, {"no": "", "comp": "お部屋倶楽部", "comp_full": "お部屋倶楽部\\n\\n村田様\\n080-4830-7755\\n中川様\\n080-4314-1854", "prop": "プライマリー久留米大南", "propaddr": "プライマリー久留米大南 野中町２６０−１０", "paddr": "野中町２６０−１０", "chiku": 36, "kouzou": "W", "net": "無料", "pet": "可", "go": "112", "model": "角部屋", "naiso": "内装中", "taikyo": "3/25", "reform": "2026-06-26", "nairan": "KEYBOX7755", "rent": 25000, "kyoeki": 3000, "water": 2500, "shikirei": "礼1", "ad": 5, "biko": "７月末までの契約に限り\\n広告料５００％\\n※生活保護者は\\n31,000円（共益費込み）", "days": 91, "loss": 82194, "toi": 2, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "完", "gas": "完", "jimoti": "掲載中", "memo": "", "key_from_naiso": true, "naiso_linked": true, "kado_key": "プライマリー久留米大南", "markstate": ""}, {"no": "", "comp": "お部屋倶楽部", "comp_full": "お部屋倶楽部\\n\\n村田様\\n080-4830-7755\\n中川様\\n080-4314-1854", "prop": "プライマリー久留米大南", "propaddr": "プライマリー久留米大南 野中町２６０−１０", "paddr": "野中町２６０−１０", "chiku": 36, "kouzou": "W", "net": "無料", "pet": "可", "go": "205", "model": "-", "naiso": "内装中", "taikyo": "3/25", "reform": "2026-05-29", "nairan": "KEYBOX7755", "rent": 25000, "kyoeki": 3000, "water": 2500, "shikirei": 0, "ad": 3, "biko": "※生活保護者は\\n31,000円（共益費込み）", "days": 91, "loss": 82194, "toi": 2, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "完", "gas": "完", "jimoti": "掲載中", "memo": "", "key_from_naiso": true, "naiso_linked": true, "kado_key": "プライマリー久留米大南", "markstate": ""}, {"no": "", "comp": "お部屋倶楽部", "comp_full": "お部屋倶楽部\\n\\n村田様\\n080-4830-7755\\n中川様\\n080-4314-1854", "prop": "プライマリー久留米大南", "propaddr": "プライマリー久留米大南 野中町２６０−１０", "paddr": "野中町２６０−１０", "chiku": 36, "kouzou": "W", "net": "無料", "pet": "可", "go": "212", "model": "角部屋", "naiso": "未内装", "taikyo": "6/10", "reform": "確認中", "nairan": "確認中", "rent": 28000, "kyoeki": 3000, "water": 2500, "shikirei": 0, "ad": 3, "biko": "", "days": 14, "loss": 14000, "toi": 2, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "完", "gas": "完", "jimoti": "掲載中", "memo": "", "naiso_linked": true, "kado_key": "プライマリー久留米大南", "markstate": ""}, {"no": "", "comp": "お部屋倶楽部", "comp_full": "お部屋倶楽部\\n\\n村田様\\n080-4830-7755\\n中川様\\n080-4314-1854", "prop": "プライマリー久留米大西", "propaddr": "プライマリー久留米大西 野中町５０４−２１", "paddr": "野中町５０４−２１", "chiku": 36, "kouzou": "W", "net": "無料", "pet": "可", "go": "206", "model": "１DK（約２５㎡）＋ロフト", "naiso": "未内装", "taikyo": "3/28", "reform": "確認中", "nairan": "KEYBOX7755", "rent": 32000, "kyoeki": 3000, "water": 500, "shikirei": 0, "ad": 3, "biko": "", "days": 88, "loss": 99355, "toi": 1, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "", "gas": "未", "jimoti": "掲載中", "memo": "単身者は家賃3万円未満希望、大南・野中町を優先紹介中。条件見直しを業者へ再依頼(お部屋6/15)", "key_from_naiso": true, "naiso_linked": true, "kado_key": "プライマリー久留米大西", "markstate": ""}, {"no": "", "comp": "お部屋倶楽部", "comp_full": "お部屋倶楽部\\n\\n村田様\\n080-4830-7755\\n中川様\\n080-4314-1854", "prop": "プライマリー久留米大東", "propaddr": "プライマリー久留米大東 御井町３７６", "paddr": "御井町３７６", "chiku": 35, "kouzou": "S", "net": "無料", "pet": "可", "go": "306", "model": "-", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "退去予定", "rent": 28000, "kyoeki": 3000, "water": "-", "shikirei": 0, "ad": 3, "biko": "", "days": 30, "loss": 30000, "toi": 2, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "完", "gas": "完", "jimoti": "掲載中", "memo": "", "naiso_linked": false, "kado_key": "プライマリー久留米大東", "markstate": ""}, {"no": "", "comp": "お部屋倶楽部", "comp_full": "お部屋倶楽部\\n\\n村田様\\n080-4830-7755\\n中川様\\n080-4314-1854", "prop": "プライマリー久留米大東", "propaddr": "プライマリー久留米大東 御井町３７６", "paddr": "御井町３７６", "chiku": 35, "kouzou": "S", "net": "無料", "pet": "可", "go": "307", "model": "最上階角部屋\\n独立洗面台、室内洗濯機他", "naiso": "完了", "taikyo": "-", "reform": "6/5", "nairan": "現地KEYBOX７７５５", "rent": 29900, "kyoeki": 4900, "water": "-", "shikirei": 0, "ad": 3, "biko": "", "days": 54, "loss": 60619, "toi": 2, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "完", "gas": "完", "jimoti": "掲載中", "memo": "", "naiso_linked": false, "kado_key": "プライマリー久留米大東", "markstate": ""}, {"no": "", "comp": "お部屋倶楽部", "comp_full": "お部屋倶楽部\\n\\n村田様\\n080-4830-7755\\n中川様\\n080-4314-1854", "prop": "プライマリー野中町", "propaddr": "プライマリー野中町 野中町６４４", "paddr": "野中町６４４", "chiku": 36, "kouzou": "W", "net": "無料", "pet": "可", "go": "104", "model": "-", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "縦樋KEYBOX７７５５", "rent": 28000, "kyoeki": 3000, "water": "-", "shikirei": 0, "ad": 3, "biko": "", "days": 144, "loss": 144000, "toi": 1, "nai": 1, "nyukyo": "7/17", "broker": "ホームアシスト", "tanto": "田中社長", "set6": "完", "set3": "完", "gas": "完", "jimoti": "-", "memo": "", "naiso_linked": false, "kado_key": "プライマリー野中町", "markstate": "apply_new"}, {"no": "", "comp": "お部屋倶楽部", "comp_full": "お部屋倶楽部\\n\\n村田様\\n080-4830-7755\\n中川様\\n080-4314-1854", "prop": "プライマリー野中町", "propaddr": "プライマリー野中町 野中町６４４", "paddr": "野中町６４４", "chiku": 36, "kouzou": "W", "net": "無料", "pet": "可", "go": "106", "model": "-", "naiso": "内装中", "taikyo": "5/2", "reform": "2026-07-06", "nairan": "縦樋KEYBOX７７５５", "rent": 28000, "kyoeki": 3000, "water": "-", "shikirei": 0, "ad": 3, "biko": "", "days": 53, "loss": 53000, "toi": 1, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "", "gas": "完", "jimoti": "-", "memo": "", "naiso_linked": true, "kado_key": "プライマリー野中町", "markstate": ""}, {"no": "", "comp": "ウィズザライフ", "comp_full": "ウィズザライフ\\n\\n0942-27-6510", "prop": "プライマリー久留米大前", "propaddr": "プライマリー久留米大前 御井町１９９８−６", "paddr": "御井町１９９８−６", "chiku": 38, "kouzou": "W", "net": "無料", "pet": "可", "go": "203", "model": "家電３点有", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "階段下KEYBOX０７１４", "rent": 19900, "kyoeki": 4900, "water": 0, "shikirei": 0, "ad": 3, "biko": "", "days": 108, "loss": 86400, "toi": 0, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "完", "set3": "完", "gas": "完", "jimoti": "掲載中", "memo": "未通電、芳香剤無", "naiso_linked": false, "kado_key": "プライマリー久留米大前", "markstate": ""}, {"no": "", "comp": "ウィズザライフ", "comp_full": "ウィズザライフ\\n\\n0942-27-6510", "prop": "プライマリー久留米大前", "propaddr": "プライマリー久留米大前 御井町１９９８−６", "paddr": "御井町１９９８−６", "chiku": 38, "kouzou": "W", "net": "無料", "pet": "可", "go": "201", "model": "角部屋", "naiso": "未内装", "taikyo": "2/28", "reform": "確認中", "nairan": "KEYBOX0714", "rent": 19900, "kyoeki": 4900, "water": 0, "shikirei": 0, "ad": 3, "biko": "", "days": 116, "loss": 92800, "toi": 0, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "完", "gas": "完", "jimoti": "掲載中", "memo": "", "key_from_naiso": true, "naiso_linked": true, "kado_key": "プライマリー久留米大前", "markstate": ""}, {"no": "", "comp": "ウィズザライフ", "comp_full": "ウィズザライフ\\n\\n0942-27-6510", "prop": "プライマリー久留米大前", "propaddr": "プライマリー久留米大前 御井町１９９８−６", "paddr": "御井町１９９８−６", "chiku": 38, "kouzou": "W", "net": "無料", "pet": "可", "go": "105", "model": "角部屋", "naiso": "未内装", "taikyo": "4/30", "reform": "確認中", "nairan": "KEYBOX0714", "rent": 19900, "kyoeki": 4900, "water": 0, "shikirei": 0, "ad": 3, "biko": "", "days": 55, "loss": 44000, "toi": 0, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "", "gas": "完", "jimoti": "掲載中", "memo": "", "key_from_naiso": true, "naiso_linked": true, "kado_key": "プライマリー久留米大前", "markstate": ""}, {"no": "", "comp": "ウィズザライフ", "comp_full": "ウィズザライフ\\n\\n0942-27-6510", "prop": "プライマリー合川C棟", "propaddr": "プライマリー合川C棟 合川町１２−２", "paddr": "合川町１２−２", "chiku": 34, "kouzou": "W", "net": "無料", "pet": "可", "go": "202", "model": "-", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "階段下KEYBOX０７１４", "rent": 19900, "kyoeki": 4900, "water": 0, "shikirei": 0, "ad": 3, "biko": "", "days": 79, "loss": 63200, "toi": 0, "nai": 0, "nyukyo": "7/1", "broker": "ウィズザライフ西鉄", "tanto": "", "set6": "-", "set3": "完", "gas": "完", "jimoti": "掲載中", "memo": "保証会社審査中(3社落ち)／入居予定:審査承認後最短", "naiso_linked": false, "kado_key": "プライマリー合川C棟", "markstate": "apply"}, {"no": "", "comp": "ウィズザライフ", "comp_full": "ウィズザライフ\\n\\n0942-27-6510", "prop": "プライマリー合川C棟", "propaddr": "プライマリー合川C棟 合川町１２−２", "paddr": "合川町１２−２", "chiku": 34, "kouzou": "W", "net": "無料", "pet": "可", "go": "203", "model": "-", "naiso": "未内装", "taikyo": "6/14", "reform": "確認中", "nairan": "階段下KEYBOX０７１４", "rent": 19900, "kyoeki": 4900, "water": 0, "shikirei": 0, "ad": 3, "biko": "", "days": 10, "loss": 8000, "toi": 0, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "", "gas": "未", "jimoti": "掲載中", "memo": "", "key_from_naiso": true, "naiso_linked": true, "kado_key": "プライマリー合川C棟", "markstate": ""}, {"no": "", "comp": "ウィズザライフ", "comp_full": "ウィズザライフ\\n\\n0942-27-6510", "prop": "プライマリー日吉町", "propaddr": "プライマリー日吉町 日吉町１１−１０", "paddr": "日吉町１１−１０", "chiku": 28, "kouzou": "S（重）", "net": "無料", "pet": "可", "go": "201", "model": "角部屋", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "階段下KEYBOX０７１４", "rent": 36000, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 3, "biko": "", "days": 56, "loss": 70452, "toi": 0, "nai": 0, "nyukyo": "7/1", "broker": "ウィズザライフ", "tanto": "末次様", "set6": "", "set3": "", "gas": "完", "jimoti": "-", "memo": "", "naiso_linked": false, "kado_key": "プライマリー日吉町", "markstate": "apply"}, {"no": "", "comp": "ウィズザライフ", "comp_full": "ウィズザライフ\\n\\n0942-27-6510", "prop": "プライマリー西鉄久留米駅前", "propaddr": "プライマリー西鉄久留米駅前 西町１４７２−５", "paddr": "西町１４７２−５", "chiku": 36, "kouzou": "RC", "net": "無料", "pet": "不可", "go": "402", "model": "-", "naiso": "未内装", "taikyo": "6/23", "reform": "確認中", "nairan": "確認中", "rent": 29900, "kyoeki": 4900, "water": 0, "shikirei": 0, "ad": 3, "biko": "", "days": 1, "loss": 1123, "toi": 0, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "", "gas": "完", "jimoti": "-", "memo": "ウィズ営業紹介も離婚転居でお急ぎ→候補外、継続紹介(6/22)", "naiso_linked": true, "kado_key": "プライマリー西鉄久留米駅前", "markstate": ""}, {"no": "", "comp": "ウィズザライフ", "comp_full": "ウィズザライフ\\n\\n0942-27-6510", "prop": "プライマリー西鉄久留米駅前", "propaddr": "プライマリー西鉄久留米駅前 西町１４７２−５", "paddr": "西町１４７２−５", "chiku": 36, "kouzou": "RC", "net": "無料", "pet": "不可", "go": "302", "model": "-", "naiso": "空予定", "taikyo": "6/30", "reform": "退去予定", "nairan": "退去予定", "rent": 29900, "kyoeki": 4900, "water": 0, "shikirei": 0, "ad": 3, "biko": "", "days": -6, "loss": 0, "toi": 0, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "", "gas": "完", "jimoti": "-", "memo": "", "naiso_linked": true, "kado_key": "プライマリー西鉄久留米駅前", "markstate": ""}, {"no": "", "comp": "駅前管理システム", "comp_full": "駅前管理システム", "prop": "プライマリー久留米インターA棟", "propaddr": "プライマリー久留米インターA棟 朝妻町２−１", "paddr": "朝妻町２−１", "chiku": 21, "kouzou": "W", "net": "無料", "pet": "不可", "go": "101", "model": "角部屋", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "ガスメーターKEYBOX６００６", "rent": 33000, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 3, "biko": "２室限定賃料大幅減額", "days": 33, "loss": 38323, "toi": 0, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "完", "set3": "完", "gas": "完", "jimoti": "-", "memo": "紹介3・案内1。競合35㎡同家賃で決定。年金受給(25,000円希望)/学生(親承諾下りず)。駅前がエリア拡大し訪問強化中(6/22)", "naiso_linked": false, "kado_key": "プライマリー久留米インターA棟", "markstate": ""}, {"no": "", "comp": "駅前管理システム", "comp_full": "駅前管理システム", "prop": "プライマリー久留米インターA棟", "propaddr": "プライマリー久留米インターA棟 朝妻町２−１", "paddr": "朝妻町２−１", "chiku": 21, "kouzou": "W", "net": "無料", "pet": "不可", "go": "201", "model": "角部屋", "naiso": "内装中", "taikyo": "-", "reform": "-", "nairan": "ガスメーターKEYBOX６００６", "rent": 37000, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 5, "biko": "７月末までの契約に限り\\n広告料５００％", "days": 33, "loss": 42581, "toi": 0, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "完", "gas": "完", "jimoti": "-", "memo": "", "key_from_naiso": true, "naiso_linked": true, "kado_key": "プライマリー久留米インターA棟", "markstate": ""}, {"no": null, "comp": "駅前管理システム", "comp_full": "駅前管理システム", "prop": "プライマリー久留米インターA棟", "propaddr": "プライマリー久留米インターA棟 朝妻町２−１", "paddr": "朝妻町２−１", "chiku": 21, "kouzou": "W", "net": "無料", "pet": "不可", "go": "P1", "model": "-", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "-", "rent": 4400, "kyoeki": 0, "water": 0, "shikirei": 0, "ad": 0, "biko": "", "days": 33, "loss": 4684, "toi": 0, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "-", "gas": "完", "jimoti": "-", "memo": "", "naiso_linked": false, "kado_key": "プライマリー久留米インターA棟", "markstate": ""}, {"no": "", "comp": "駅前管理システム", "comp_full": "駅前管理システム", "prop": "プライマリー久留米インターB棟", "propaddr": "プライマリー久留米インターB棟 朝妻町２−２", "paddr": "朝妻町２−２", "chiku": 21, "kouzou": "W", "net": "無料", "pet": "不可", "go": "201", "model": "角部屋", "naiso": "内装中", "taikyo": "-", "reform": "-", "nairan": "フェンスKB７５０９", "rent": 37000, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 5, "biko": "７月末までの契約に限り\\n広告料５００％", "days": 33, "loss": 42581, "toi": 0, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "完", "gas": "完", "jimoti": "-", "memo": "", "naiso_linked": false, "kado_key": "プライマリー久留米インターB棟", "markstate": ""}, {"no": "", "comp": "駅前管理システム", "comp_full": "駅前管理システム", "prop": "プライマリー久留米インターB棟", "propaddr": "プライマリー久留米インターB棟 朝妻町２−２", "paddr": "朝妻町２−２", "chiku": 21, "kouzou": "W", "net": "無料", "pet": "不可", "go": "202", "model": "角部屋", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "フェンスKB７５０９", "rent": 33000, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 3, "biko": "２室限定賃料大幅減額", "days": 33, "loss": 38323, "toi": 0, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "完", "set3": "完", "gas": "完", "jimoti": "-", "memo": "", "naiso_linked": false, "kado_key": "プライマリー久留米インターB棟", "markstate": ""}, {"no": null, "comp": "駅前管理システム", "comp_full": "駅前管理システム", "prop": "プライマリー久留米インターB棟", "propaddr": "プライマリー久留米インターB棟 朝妻町２−２", "paddr": "朝妻町２−２", "chiku": 21, "kouzou": "W", "net": "無料", "pet": "不可", "go": "P1", "model": "-", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "-", "rent": 4400, "kyoeki": 0, "water": 0, "shikirei": 0, "ad": 0, "biko": "", "days": 33, "loss": 4684, "toi": 0, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "-", "gas": "完", "jimoti": "-", "memo": "", "naiso_linked": false, "kado_key": "プライマリー久留米インターB棟", "markstate": ""}, {"no": "", "comp": "エイブル黒崎店", "comp_full": "エイブル黒崎店\\n\\n黒崎店：\\n093-631-6650", "prop": "プライマリー鷹の巣", "propaddr": "プライマリー鷹の巣 八幡西区鷹の巣１−１５−１１", "paddr": "八幡西区鷹の巣１−１５−１１", "chiku": 37, "kouzou": "RC", "net": "無料", "pet": "？", "go": "307", "model": "角部屋", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "２０３横PS内KEYBOX（５９６０）", "rent": 29000, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 2, "biko": "ADフリーレント振分OK", "days": 44, "loss": 45419, "toi": 1, "nai": 1, "nyukyo": "6/26", "broker": "エイブル黒崎店", "tanto": "", "set6": "-", "set3": "完", "gas": "未", "jimoti": "-", "memo": "", "naiso_linked": false, "kado_key": "プライマリー鷹の巣", "markstate": "apply"}, {"no": "", "comp": "エイブル黒崎店", "comp_full": "エイブル黒崎店\\n\\n黒崎店：\\n093-631-6650", "prop": "プライマリー鷹の巣", "propaddr": "プライマリー鷹の巣 八幡西区鷹の巣１−１５−１１", "paddr": "八幡西区鷹の巣１−１５−１１", "chiku": 37, "kouzou": "RC", "net": "無料", "pet": "？", "go": "203", "model": "モデルルーム", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "２０３横PS内KEYBOX（５９６０）", "rent": 29000, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 2, "biko": "ADフリーレント振分OK", "days": 44, "loss": 45419, "toi": 1, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "完", "set3": "完", "gas": "未", "jimoti": "-", "memo": "案内1件も駐車場必須(敷地内希望)で見送り、室内は綺麗と高評価(エイブル6/22)", "naiso_linked": false, "kado_key": "プライマリー鷹の巣", "markstate": ""}, {"no": "", "comp": "エイブル黒崎店", "comp_full": "エイブル黒崎店\\n\\n黒崎店：\\n093-631-6650", "prop": "プライマリー鷹の巣", "propaddr": "プライマリー鷹の巣 八幡西区鷹の巣１−１５−１１", "paddr": "八幡西区鷹の巣１−１５−１１", "chiku": 37, "kouzou": "RC", "net": "無料", "pet": "？", "go": "403", "model": "-", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "４０３メーターBOX（４６４９）", "rent": 29000, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 2, "biko": "ADフリーレント振分OK", "days": 44, "loss": 45419, "toi": 1, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "完", "set3": "完", "gas": "未", "jimoti": "-", "memo": "", "naiso_linked": false, "kado_key": "プライマリー鷹の巣", "markstate": ""}, {"no": "", "comp": "エイブル黒崎店", "comp_full": "エイブル黒崎店\\n\\n黒崎店：\\n093-631-6650", "prop": "プライマリー鷹の巣", "propaddr": "プライマリー鷹の巣 八幡西区鷹の巣１−１５−１１", "paddr": "八幡西区鷹の巣１−１５−１１", "chiku": 37, "kouzou": "RC", "net": "無料", "pet": "？", "go": "305", "model": "-", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "２０３横PS内KEYBOX（５９６０）", "rent": 29000, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 2, "biko": "ADフリーレント振分OK", "days": 44, "loss": 45419, "toi": 1, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "完", "set3": "完", "gas": "未", "jimoti": "-", "memo": "", "naiso_linked": false, "kado_key": "プライマリー鷹の巣", "markstate": ""}, {"no": "", "comp": "エイブル黒崎店", "comp_full": "エイブル黒崎店\\n\\n黒崎店：\\n093-631-6650", "prop": "プライマリー鷹の巣", "propaddr": "プライマリー鷹の巣 八幡西区鷹の巣１−１５−１１", "paddr": "八幡西区鷹の巣１−１５−１１", "chiku": 37, "kouzou": "RC", "net": "無料", "pet": "？", "go": "402", "model": "-", "naiso": "完了", "taikyo": "-", "reform": "-", "nairan": "４０３メーターBOX（４６４９）", "rent": 29000, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 2, "biko": "ADフリーレント振分OK", "days": 44, "loss": 45419, "toi": 1, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "完", "gas": "未", "jimoti": "-", "memo": "", "naiso_linked": false, "kado_key": "プライマリー鷹の巣", "markstate": ""}, {"no": "", "comp": "エイブル黒崎店", "comp_full": "エイブル黒崎店\\n\\n黒崎店：\\n093-631-6650", "prop": "プライマリー鷹の巣", "propaddr": "プライマリー鷹の巣 八幡西区鷹の巣１−１５−１１", "paddr": "八幡西区鷹の巣１−１５−１１", "chiku": 37, "kouzou": "RC", "net": "無料", "pet": "？", "go": "103", "model": "-", "naiso": "内装中", "taikyo": "確認中", "reform": "7月頃予定", "nairan": "１０６横PS内KEYBOX（５９６０）", "rent": 25000, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 2, "biko": "ADフリーレント振分OK\\n告知義務部屋", "days": 44, "loss": 39742, "toi": 1, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "", "gas": "未", "jimoti": "-", "memo": "", "naiso_linked": false, "kado_key": "プライマリー鷹の巣", "markstate": ""}, {"no": "", "comp": "ウィズザライフ", "comp_full": "ウィズザライフ\\n\\n0942-27-6510", "prop": "プライマリー日吉町", "propaddr": "プライマリー日吉町 日吉町１１−１０", "paddr": "日吉町１１−１０", "chiku": 28, "kouzou": "S（重）", "net": "無料", "pet": "可", "go": "301", "model": "角部屋", "naiso": "未内装", "taikyo": "6/20", "reform": "確認中", "nairan": "階段下KEYBOX０７１４", "rent": 36000, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 3, "biko": "", "days": 4, "loss": 5032, "toi": 0, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "", "gas": "完", "jimoti": "-", "memo": "", "_added": true, "key_from_naiso": true, "naiso_linked": true, "kado_key": "プライマリー日吉町", "markstate": ""}, {"no": "", "comp": "イムズパートナー", "comp_full": "イムズパートナー\\n\\n山邊（やまべ）様\\n090-8225-5419", "prop": "プライマリー合川B棟", "propaddr": "プライマリー合川B棟 合川町８−２４", "paddr": "合川町８−２４", "chiku": 30, "kouzou": "W", "net": "無料", "pet": "可", "go": "106", "model": "-", "naiso": "空予定", "taikyo": "7/4", "reform": "退去予定", "nairan": "退去予定", "rent": 24900, "kyoeki": 3000, "water": 0, "shikirei": 0, "ad": 5, "biko": "敷地内駐車場込／駐車場不要は家賃−3,300円", "days": -10, "loss": 0, "toi": 2, "nai": 0, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "", "gas": "未", "jimoti": "-", "memo": "", "_added": true, "naiso_linked": true, "kado_key": "プライマリー合川B棟", "markstate": ""}, {"no": "", "comp": "お部屋倶楽部", "comp_full": "お部屋倶楽部\\n\\n村田様\\n080-4830-7755\\n中川様\\n080-4314-1854", "prop": "プライマリー久留米大南", "propaddr": "プライマリー久留米大南 野中町２６０−１０", "paddr": "野中町２６０−１０", "chiku": 36, "kouzou": "W", "net": "無料", "pet": "可", "go": "202", "model": "1K", "naiso": "空予定", "taikyo": "7/15", "reform": "退去予定", "nairan": "退去予定", "rent": 25000, "kyoeki": 3000, "water": 2500, "shikirei": 0, "ad": 3, "biko": "敷礼0／違約金 1年未満3ヶ月・2年未満2ヶ月", "days": -21, "loss": 0, "toi": 2, "nai": 1, "nyukyo": "", "broker": "", "tanto": "", "set6": "", "set3": "", "gas": "未", "jimoti": "掲載中", "memo": "", "_added": true, "naiso_linked": false, "kado_key": "プライマリー久留米大南", "markstate": "cancel_new"}, {"prop": "プライマリー花畑駅西", "go": "103", "comp": "イムズパートナー", "comp_full": "イムズパートナー", "paddr": "梅満町９２６−２", "chiku": 35, "kouzou": "W", "net": "無料", "pet": "可", "model": "-", "naiso": "空予定", "taikyo": "7/22", "reform": "退去予定", "nairan": "退去予定", "rent": 34900, "kyoeki": 4000, "water": 0, "shikirei": 0, "ad": 3, "gas": "未", "set6": "", "set3": "", "jimoti": "-", "broker": "", "nyukyo": "", "tanto": "", "biko": "", "memo": "", "_added": true, "days": -28, "loss": 0, "naiso_linked": true, "kado_key": "プライマリー花畑駅西", "markstate": "cancel_new"}], "sets": {"set6": "○スリッパ、玄関マット／○芳香剤／○ウェルカムバスケット／○シーリング／○レースカーテン／○POP", "set3": "○カーテンレール／○トイレホルダー／○コンセントプレート"}, "kado": [{"gyosha": "リプラル", "kanri": "イムズパートナー", "name": "プライマリー上津バイパス", "meigi": "法", "area": "久留米市", "addr": "上津２−５−１０", "kanriryo": "4%", "total_ju": 14, "total_p": 14}, {"gyosha": "リプラル", "kanri": "イムズパートナー", "name": "プライマリー合川A棟", "meigi": "法", "area": "久留米市", "addr": "合川町８−２１", "kanriryo": "4%", "total_ju": 10, "total_p": 5}, {"gyosha": "リプラル", "kanri": "イムズパートナー", "name": "プライマリー合川B棟", "meigi": "法", "area": "久留米市", "addr": "合川町８−２４", "kanriryo": "4%", "total_ju": 10, "total_p": 4}, {"gyosha": "リプラル", "kanri": "イムズパートナー", "name": "プライマリー野中町東", "meigi": "法", "area": "久留米市", "addr": "御井町１９６０−１０", "kanriryo": "4%", "total_ju": 10, "total_p": null}, {"gyosha": "リプラル", "kanri": "イムズパートナー", "name": "プライマリー花畑駅西", "meigi": "個", "area": "久留米市", "addr": "梅満町９２６−２", "kanriryo": "4%", "total_ju": 30, "total_p": 6}, {"gyosha": "池田さん", "kanri": "イムズパートナー", "name": "プライマリー糸島中央", "meigi": "法", "area": "糸島", "addr": "有田中央２丁目１４−６４", "kanriryo": "4%", "total_ju": 8, "total_p": 10, "vac_p_fixed": 2}, {"gyosha": "リプラル", "kanri": "お部屋倶楽部", "name": "プライマリー久留米大南", "meigi": "個", "area": "久留米市", "addr": "野中町２６０−１０", "kanriryo": "4%", "total_ju": 20, "total_p": 1}, {"gyosha": "リプラル", "kanri": "お部屋倶楽部", "name": "プライマリー久留米大西", "meigi": "法", "area": "久留米市", "addr": "野中町５０４−２１", "kanriryo": "4%", "total_ju": 14, "total_p": 2}, {"gyosha": "リプラル", "kanri": "お部屋倶楽部", "name": "プライマリー久留米大東", "meigi": "法", "area": "久留米市", "addr": "御井町３７６", "kanriryo": "4%", "total_ju": 18, "total_p": 3}, {"gyosha": "リプラル", "kanri": "お部屋倶楽部", "name": "プライマリー野中町", "meigi": "法", "area": "久留米市", "addr": "野中町６４４−１", "kanriryo": "4%", "total_ju": 12, "total_p": null}, {"gyosha": "リプラル", "kanri": "ウィズザライフ", "name": "プライマリー西鉄久留米駅前", "meigi": "法", "area": "久留米市", "addr": "西町１４７２−５", "kanriryo": "5%", "total_ju": 12, "total_p": null}, {"gyosha": "リプラル", "kanri": "ウィズザライフ", "name": "プライマリー久留米大前", "meigi": "法", "area": "久留米市", "addr": "御井町１９９８−１", "kanriryo": "5%", "total_ju": 10, "total_p": null}, {"gyosha": "リプラル", "kanri": "ウィズザライフ", "name": "プライマリー合川C棟", "meigi": "法", "area": "久留米市", "addr": "合川町１２−２", "kanriryo": "5%", "total_ju": 10, "total_p": null}, {"gyosha": "リプラル", "kanri": "ウィズザライフ", "name": "プライマリー日吉町", "meigi": "法", "area": "久留米市", "addr": "日吉町１１−１０", "kanriryo": "5%", "total_ju": 14, "total_p": 1}, {"gyosha": "池田さん", "kanri": "エイブル", "name": "プライマリー鷹の巣", "meigi": "法", "area": "北九州", "addr": "八幡西区鷹の巣", "kanriryo": "5%", "total_ju": 24, "total_p": 3}, {"gyosha": "リプラル", "kanri": "駅前管理システム", "name": "プライマリー久留米インターA棟", "meigi": "法", "area": "久留米市", "addr": "朝妻町２−１", "kanriryo": "3%", "total_ju": 6, "total_p": 1}, {"gyosha": "リプラル", "kanri": "駅前管理システム", "name": "プライマリー久留米インターB棟", "meigi": "法", "area": "久留米市", "addr": "朝妻町２−２", "kanriryo": "3%", "total_ju": 6, "total_p": 1}, {"gyosha": "池田さん", "kanri": "（株）アップメイト", "name": "プライマリー花畑", "meigi": "個", "area": "福岡市南区", "addr": "檜原３−", "kanriryo": "3%", "total_ju": 9, "total_p": 3}, {"gyosha": "池田さん", "kanri": "（株）TT不動産", "name": "ピュア若宮", "meigi": "個", "area": "福岡市東区", "addr": "若宮１−１６−２９", "kanriryo": "3%", "total_ju": 8, "total_p": null}, {"gyosha": "池田さん", "kanri": "クリフ/アパマン", "name": "プライマリー太宰府", "meigi": "個", "area": "太宰府", "addr": "通古賀６−６−１１", "kanriryo": "4%", "total_ju": 6, "total_p": null}, {"gyosha": "リプラル", "kanri": "アパマンショップ", "name": "プライマリー久留米津福駅前", "meigi": "個", "area": "久留米市", "addr": "津福本町１６３２−４", "kanriryo": "サブ", "total_ju": 6, "total_p": 1}, {"gyosha": "", "kanri": "", "name": "自宅", "meigi": "個", "area": "", "addr": "前原北３−１−３４", "kanriryo": "ー", "total_ju": 1, "total_p": 3}]};const K0=SEED.kpi,S=SEED.sets;let R=[];
let brokerView=false;
const BROKERCOLS=new Set(['comp','prop','chiku','kouzou','net','pet','go','model','naiso','taikyo','reform','nairan','rent','kyoeki','water','shikirei','ad','biko']);
function activeCols(){return brokerView?COLS.filter(c=>BROKERCOLS.has(c[0])):COLS}
// ===== ビュー切替（空室一覧 / 稼働率表）=====
function showView(v){const list=v!=='kado';
 document.getElementById('cards').style.display=list?'':'none';
 const pn=document.querySelector('.panel');if(pn)pn.style.display=list?'':'none';
 document.getElementById('listview').style.display=list?'':'none';
 document.getElementById('kadoview').style.display=list?'none':'';
 document.getElementById('tab-list').classList.toggle('pr',list);
 document.getElementById('tab-kado').classList.toggle('pr',!list);
 document.body.classList.toggle('kadoprint',!list);   // 印刷: 稼働率表はA4縦
 document.getElementById('pagestyle').textContent=list?'@page{size:A3 landscape;margin:5mm}':'@page{size:A4 portrait;margin:8mm}';
 if(!list)renderKado()}
// ===== 稼働率表（固定マスター＋ライブ空室数）=====
function renderKado(){const M=SEED.kado||[];if(!M.length){document.getElementById('ktbl').innerHTML='<tbody><tr><td>稼働率表マスター未取得（build.py再実行）</td></tr></tbody>';return}
 // 物件キー別にライブ空室数を集計（申込中＝契約扱いで空室から除外）
 const vj={},vp={};R.forEach(r=>{const k=r.kado_key||r.prop;if(r.broker)return;
  if(String(r.go).startsWith('P'))vp[k]=(vp[k]||0)+1;else vj[k]=(vj[k]||0)+1});
 // 管理会社ごとの管理棟数・室数（住居戸数合計）
 const kanT={},kanS={};M.forEach(m=>{if(!m.kanri)return;kanT[m.kanri]=(kanT[m.kanri]||0)+1;kanS[m.kanri]=(kanS[m.kanri]||0)+(m.total_ju||0)});
 const occCls=p=>p>=97?'full':(p>=90?'warn':'bad');
 // 連続同値を縦結合(rowspan)＝管理会社・業者・エリアを1セルにまとめ文字を減らす
 const runs=f=>{const o=[];for(let i=0;i<M.length;i++){if(i>0&&M[i][f]===M[i-1][f])o.push(0);else{let n=1;while(i+n<M.length&&M[i+n][f]===M[i][f])n++;o.push(n)}}return o};
 // 親(管理会社)が同じ範囲内でのみ縦結合＝結合が管理会社の枠を跨がない
 const runs2=(f,p)=>{const o=[];for(let i=0;i<M.length;i++){if(i>0&&M[i][f]===M[i-1][f]&&M[i][p]===M[i-1][p])o.push(0);else{let n=1;while(i+n<M.length&&M[i+n][f]===M[i][f]&&M[i+n][p]===M[i][p])n++;o.push(n)}}return o};
 const rK=runs('kanri'),rG=runs2('gyosha','kanri'),rA=runs2('area','kanri');
 let tJ=0,tVJ=0,tP=0,tVP=0;
 const body=M.map((m,i)=>{const tj=m.total_ju||0,vjc=vj[m.name]||0;tJ+=tj;tVJ+=vjc;
  const hasP=typeof m.total_p==='number'&&m.total_p>0;const tp=hasP?m.total_p:0;
  const vpc=hasP?(m.vac_p_fixed!=null?m.vac_p_fixed:(vp[m.name]||0)):0;if(hasP){tP+=tp;tVP+=vpc}
  const oj=tj?((tj-vjc)/tj*100):100;const op=hasP?((tp-vpc)/tp*100):null;
  const nm=String(m.name).replace(/^プライマリー/,'');
  const gc=rG[i]?\`<td class="l mid" rowspan="\${rG[i]}">\${m.gyosha||''}</td>\`:'';
  const ksub=m.kanri?\`<div class="ksub">\${kanT[m.kanri]}棟 \${kanS[m.kanri]}室</div>\`:'';
  const kc=rK[i]?\`<td class="l mid" rowspan="\${rK[i]}">\${m.kanri||''}\${ksub}</td>\`:'';
  const ac=rA[i]?\`<td class="mid" rowspan="\${rA[i]}">\${m.area||''}</td>\`:'';
  return \`<tr>
   \${kc}\${gc}<td class="nm">\${nm}</td>
   <td>\${m.meigi||''}</td>\${ac}<td class="l">\${m.addr||''}</td><td>\${m.kanriryo||''}</td>
   <td>\${tj}</td><td class="\${vjc?'vac':''}">\${vjc}</td><td class="occ \${occCls(oj)}">\${oj.toFixed(0)}％</td>
   <td>\${hasP?tp:'-'}</td><td class="\${vpc?'vac':''}">\${hasP?vpc:'-'}</td><td class="occ \${op==null?'':occCls(op)}">\${op==null?'-':op.toFixed(0)+'％'}</td>
  </tr>\`}).join('');
 const oJ=tJ?((tJ-tVJ)/tJ*100):0,oP=tP?((tP-tVP)/tP*100):0;
 const tot=\`<tr class="tot"><td class="l" colspan="7">合計（住居 \${M.length}物件）</td>
   <td>\${tJ}</td><td class="vac">\${tVJ}</td><td class="occ \${occCls(oJ)}">\${oJ.toFixed(1)}％</td>
   <td>\${tP}</td><td class="vac">\${tVP}</td><td class="occ \${occCls(oP)}">\${oP.toFixed(1)}％</td></tr>\`;
 const head=\`<thead><tr><th>管理会社</th><th>業者</th><th>物件名</th><th>名義</th><th>エリア</th><th>住所</th><th>管理料</th>
   <th>全数<br>(住)</th><th>空室<br>(住)</th><th>入居率<br>(住)</th><th>全数<br>(P)</th><th>空車<br>(P)</th><th>入居率<br>(P)</th></tr></thead>\`;
 document.getElementById('ktbl').innerHTML=head+'<tbody>'+body+tot+'</tbody>';
 const need=Math.max(0,tVJ-Math.floor(tJ*0.03));
 document.getElementById('ksum').textContent=\`住居 稼働率 \${oJ.toFixed(1)}％（\${tJ-tVJ}/\${tJ}戸）　空室 \${tVJ}戸　97%まで残 \${need}室　／　駐車場 稼働率 \${oP.toFixed(1)}％（空車 \${tVP}台）\`}
function toggleBroker(){brokerView=!brokerView;document.getElementById('bvbtn').classList.toggle('pr',brokerView);document.body.classList.toggle('brokerprint',brokerView);render()}
const LSK='vac_overrides_v1';
const yen=n=>'¥'+(n||0).toLocaleString(),nf=n=>(n||0).toLocaleString();
const rkey=r=>r.prop+'|'+r.go;
function loadLS(){try{return JSON.parse(localStorage.getItem(LSK)||'{}')}catch(e){return {}}}
function applyLS(){const o=loadLS();R.forEach(r=>{const v=o[rkey(r)];if(v)Object.assign(r,v)})}
function saveField(r,f,val){const o=loadLS();const k=rkey(r);o[k]=o[k]||{};o[k][f]=val;localStorage.setItem(LSK,JSON.stringify(o));stamp();scheduleBackup()}
// ===== Driveへ自動バックアップ（裏方サーバー経由・localhost起動時のみ有効）=====
let SRV=(location.protocol==='http:'||location.protocol==='https:'),bkTimer=null;
function bkBadge(t,c){const e=document.getElementById('bk');if(!e)return;e.textContent=t;e.style.color=c||'#16a34a'}
function backupNow(){if(!SRV)return;
 const payload=JSON.stringify({overrides:loadLS(),added:loadAdded(),asof:(typeof K0!=='undefined'?K0.asof:''),savedAt:new Date().toISOString()});
 fetch('/save',{method:'POST',headers:{'Content-Type':'application/json'},body:payload})
  .then(r=>r.ok?bkBadge('☁ バックアップ済','#16a34a'):bkBadge('☁ 保存失敗','#dc2626'))
  .catch(()=>bkBadge('☁ 未接続','#9ca3af'))}
function scheduleBackup(){if(!SRV)return;if(bkTimer)clearTimeout(bkTimer);bkTimer=setTimeout(backupNow,1200)}
async function restoreFromDrive(){if(!SRV)return;
 const empty=(localStorage.getItem(LSK)==null||localStorage.getItem(LSK)==='{}')&&(localStorage.getItem('vac_added')==null||localStorage.getItem('vac_added')==='[]');
 if(!empty)return;
 try{const j=await fetch('/load').then(r=>r.json());let did=false;
  if(j&&j.overrides&&Object.keys(j.overrides).length){localStorage.setItem(LSK,JSON.stringify(j.overrides));did=true}
  if(j&&j.added&&j.added.length){localStorage.setItem('vac_added',JSON.stringify(j.added));did=true}
  if(did){rebuild();bkBadge('☁ Driveから復元しました','#0369a1')}
 }catch(e){}}
function initBackup(){const e=document.getElementById('bk');if(!e)return;
 if(SRV){bkBadge('☁ 自動バックアップON','#16a34a')}else{e.textContent='';}}
function stamp(){const e=document.getElementById('saved');if(!e)return;const d=new Date();e.textContent='保存済 '+d.toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'})}
function exportJSON(){const blob=new Blob([JSON.stringify({overrides:loadLS(),added:loadAdded()},null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='空室管理_backup_'+K0.asof+'.json';a.click()}
function importJSON(inp){const f=inp.files[0];if(!f)return;const rd=new FileReader();rd.onload=e=>{try{const j=JSON.parse(e.target.result);
 if(j.overrides)localStorage.setItem(LSK,JSON.stringify(j.overrides));if(j.added)localStorage.setItem('vac_added',JSON.stringify(j.added));location.reload()}catch(err){alert('読込失敗')}};rd.readAsText(f)}
function loadAdded(){try{return JSON.parse(localStorage.getItem('vac_added')||'[]')}catch(e){return []}}
function blankRoom(){return{no:'',comp:'',comp_full:'',prop:'',propaddr:'',chiku:'',kouzou:'',net:'',pet:'',go:'',model:'-',naiso:'未内装',taikyo:'',reform:'',nairan:'',rent:0,kyoeki:0,water:0,shikirei:0,ad:'',biko:'',days:null,loss:0,toi:'',nai:'',nyukyo:'',broker:'',tanto:'',set6:'',set3:'',gas:'',jimoti:'',memo:'',naiso_linked:false,_added:true}}
function addRoom(){const a=loadAdded();const n=blankRoom();n.prop=prompt('物件名（例：プライマリー○○）')||'新規物件';n.propaddr=n.prop;n.go=prompt('号数')||'';a.push(n);localStorage.setItem('vac_added',JSON.stringify(a));rebuild();scheduleBackup()}
function delRoom(r){if(!confirm(r.prop+' '+r.go+' を削除?'))return;const a=loadAdded().filter(x=>!(x.prop===r.prop&&x.go===r.go));localStorage.setItem('vac_added',JSON.stringify(a));const o=loadLS();delete o[rkey(r)];localStorage.setItem(LSK,JSON.stringify(o));rebuild();scheduleBackup()}
function sortRooms(){const SR={'完了':0,'内装中':1,'未内装':2,'空予定':3};const num=v=>typeof v==='number'?v:(parseFloat(v)||0);
 const mr=r=>/モデル|角/.test(String(r.model||''))?0:1;   // モデルルーム・角部屋を優先
 // 管理会社=合計機会損失が多い順
 const closs={};R.forEach(r=>{closs[r.comp]=(closs[r.comp]||0)+num(r.loss)});
 const cRank={};Object.keys(closs).sort((a,b)=>closs[b]-closs[a]).forEach((c,i)=>cRank[c]=i);
 const pinLast=r=>/エイブル/.test(String(r.comp||''))?1:0;   // エイブル(黒崎店/北九州)は最下段固定
 // 物件は元の出現順を保持
 const po={};R.forEach((r,i)=>{const pk=r.comp+'|'+r.prop;if(po[pk]==null)po[pk]=i});
 R=R.map((r,i)=>({r,i})).sort((a,b)=>{
   const pa0=pinLast(a.r),pb0=pinLast(b.r);if(pa0!==pb0)return pa0-pb0;            // エイブルを一番下に
   if(cRank[a.r.comp]!==cRank[b.r.comp])return cRank[a.r.comp]-cRank[b.r.comp];   // 管理会社(機会損失順)
   const ka=a.r.comp+'|'+a.r.prop,kb=b.r.comp+'|'+b.r.prop;if(po[ka]!==po[kb])return po[ka]-po[kb];          // 物件
   const pa=String(a.r.go).startsWith('P')?1:0,pb=String(b.r.go).startsWith('P')?1:0;if(pa!==pb)return pa-pb; // 駐車場は物件の最下部
   const sa=SR[a.r.naiso]??9,sb=SR[b.r.naiso]??9;if(sa!==sb)return sa-sb;                                     // 内装(完了→内装中→未内装→空予定)
   const ma=mr(a.r),mb=mr(b.r);if(ma!==mb)return ma-mb;                                                       // モデル/角部屋を上に
   return a.i-b.i}).map(o=>o.r)}
function rebuild(){R=SEED.rooms.map(r=>({...r})).concat(loadAdded());applyLS();sortRooms();recalc();render();buildPrint()}
function recalc(){const num=v=>typeof v==='number'?v:(parseFloat(v)||0);
 const U=R.filter(r=>!String(r.go).startsWith('P'));        // 住居ユニット
 const vacU=U.filter(r=>!r.broker);                          // 空室=申込除く
 const stake=R.filter(r=>!r.broker);                         // 機会損失対象(駐車含む・申込除く)
 const K={asof:K0.asof,asof_disp:K0.asof_disp,
  total_units_vac:vacU.length,
  parking:R.filter(r=>String(r.go).startsWith('P')&&!r.broker).length,
  applied:U.filter(r=>r.broker).length,
  taikyo_yotei:vacU.filter(r=>r.naiso==='空予定').length,
  longterm:vacU.filter(r=>r.days!=null&&r.days>=60).length,
  need_set:U.filter(r=>r.naiso==='完了'&&(r.set6!=='完'||r.set3!=='完')&&!String(r.go).startsWith('P')&&!r.broker).length,
  set_collect:U.filter(r=>r.broker&&r.set6==='完').length,
  gas_mi:U.filter(r=>r.gas==='未').length,
  wk_toi:vacU.reduce((s,r)=>s+num(r.toi),0),wk_nai:vacU.reduce((s,r)=>s+num(r.nai),0),
  loss_cum:stake.reduce((s,r)=>s+num(r.loss),0),
  loss_month:stake.reduce((s,r)=>s+num(r.rent)+num(r.kyoeki),0),
  loss_day:Math.round(stake.reduce((s,r)=>s+num(r.rent)+num(r.kyoeki),0)/30),
  naiso:{}};
 U.forEach(r=>{K.naiso[r.naiso]=(K.naiso[r.naiso]||0)+1});
 const tot=K0.total_units||0;K.total_units=tot;
 K.occ=tot?((tot-K.total_units_vac)/tot*100):0;
 K.need97=tot?Math.max(0,K.total_units_vac-Math.floor(tot*0.03)):0;
 window.K=K;drawKPI()}
function drawKPI(){const K=window.K;document.getElementById('asof').textContent='更新日　'+K.asof;
 pupd.textContent='更新日　'+K.asof_disp;naisolink.textContent='🔗内装アプリ連動 '+(K0.naiso_linked||0)+'室';
 document.getElementById('naisonums').innerHTML=['未内装','内装中','空予定','完了'].map(s=>\`\${s} <b>\${K.naiso[s]||0}</b>\`).join('　・　');
 cards.innerHTML='';[['空室',K.total_units_vac,'ac','戸',\`稼働 \${K.occ.toFixed(1)}％ ／ 97%まで残 \${K.need97}室\`],
 ['長期空室',K.longterm,'bad','60日+'],
 ['要ｾｯﾄ設置',K.need_set,'pur','戸(完了・未設置)'],['ガスコンロ未',K.gas_mi,'pur','戸'],['セット回収',K.set_collect,'pur','戸(申込・6点完)'],
 ['機会損失／日',yen(K.loss_day),'bad money','1日あたり'],['機会損失／月',yen(K.loss_month),'bad money','30日換算']
 ].forEach(c=>cards.innerHTML+=\`<div class="card \${c[2]}"><div class="v">\${c[1]}</div><div class="l">\${c[0]} <span style="opacity:.6">\${c[3]}</span>\${c[4]?\`<br><b style="color:var(--ac);font-size:11px">\${c[4]}</b>\`:''}</div></div>\`)}
function bars(el,o,col){const mx=Math.max(...Object.values(o),1);el.innerHTML=Object.entries(o).map(([k,v])=>\`<div class="bar"><div class="nm">\${k}</div><div class="tr"><div class="fl" style="width:\${v/mx*100}%;background:\${col}"></div></div><div class="ct">\${v}</div></div>\`).join('')}
const nTag=n=>{const m={'完了':'t-done','内装中':'t-mid','未内装':'t-no','空予定':'t-soon'}[n]||'';return n?\`<span class="tag \${m}">\${n}</span>\`:''};
const COLS=[['comp','管理会社','base','ed'],['prop','物件／住所','base','ed'],
 ['chiku','築','base','ed'],['kouzou','構造','base','ed'],['net','ﾈｯﾄ','base','ed'],['pet','ﾍﾟｯﾄ','base','ed'],
 ['go','号数','base','ed'],['model','モデル部屋','base','ed'],
 ['naiso','内装状況','naiso','naiso'],['reform','ﾘﾌｫｰﾑ完了予定','naiso','ro'],
 ['taikyo','退去日','base','ed'],['nairan','内覧方法','base','ed'],
 ['rent','家賃','base','ed'],['kyoeki','共益費','base','ed'],['water','水道町費','base','ed'],
 ['shikirei','敷礼','base','ed'],['ad','広告%','base','pct'],['biko','備考','base','ed'],
 ['days','空室期間','base','ro'],['loss','機会損失','base','yen'],
 ['toi','問合','mgmt','ed'],['nai','内見','mgmt','ed'],['nyukyo','入居予定','mgmt','ed'],
 ['broker','申込仲介','mgmt','ed'],['tanto','担当','mgmt','ed'],
 ['set6','6点ｾｯﾄ','ota','ed'],['set3','3点ｾｯﾄ','ota','ed'],['gas','ｶﾞｽｺﾝﾛ','ota','stat'],
 ['jimoti','ジモティ','ota','ed'],['memo','メモ','ota','ed']];
const COLW={comp:13,prop:18,chiku:3.5,kouzou:3.5,net:4,pet:3.5,go:4.5,model:15,naiso:5.5,reform:7,taikyo:4.5,nairan:15,rent:5.5,kyoeki:5,water:5.5,shikirei:4.5,ad:5,biko:15,days:4.5,loss:7.5,toi:3.5,nai:3.5,nyukyo:5.5,broker:8,tanto:5.5,set6:4.5,set3:4.5,gas:5,jimoti:5.5,memo:8};
function colgroupHTML(cols){const tot=cols.reduce((s,c)=>s+(COLW[c[0]]||5),0);return '<colgroup>'+cols.map(c=>\`<col style="width:\${((COLW[c[0]]||5)/tot*100).toFixed(3)}%">\`).join('')+'</colgroup>'}
const FROZEN={comp:[0,80],prop:[80,78],chiku:[158,28],kouzou:[186,30],net:[216,36],pet:[252,30],go:[282,46]};
const MARKSET=new Set(['go','model','naiso','taikyo','reform','nairan','rent','kyoeki','water','shikirei','ad','biko']);
const stickCls=f=>FROZEN[f]?' stick':'';
const stickSty=f=>{const z=FROZEN[f];return z?\`left:\${z[0]}px;min-width:\${z[1]}px;width:\${z[1]}px;\`:''};
const zoneCls=z=>z==='mgmt'?'col-mgmt':z==='ota'?'col-ota':z==='naiso'?'col-naiso':'';
function head(){const C=activeCols();const LB={base:'',naiso:'',mgmt:'管理会社入力',ota:'太田入力'},CL={base:'b-base',naiso:'b-base',mgmt:'b-mgmt',ota:'b-ota'};
 let band='<tr class="band">',j=0;while(j<C.length){const z=C[j][2];let n=1;while(j+n<C.length&&C[j+n][2]===z)n++;band+=\`<th class="\${CL[z]}\${j===0?' stick':''}" colspan="\${n}" style="\${j===0?'left:0;':''}">\${LB[z]}</th>\`;j+=n}band+='</tr>';
 let lbl='<tr class="lbl">'+C.map(c=>{let tip='';if(c[0]==='set6')tip=\`title="6点セット：\${S.set6}"\`;if(c[0]==='set3')tip=\`title="3点セット：\${S.set3}"\`;
   return \`<th class="\${zoneCls(c[2])}\${tip?' help':''}\${stickCls(c[0])}" \${tip} style="\${stickSty(c[0])}">\${c[1]}\${tip?' <span class="i">ⓘ</span>':''}</th>\`}).join('')+'</tr>';
 return '<thead>'+band+lbl+'</thead>'}
function cellHTML(r,c,idx){const f=c[0],z=c[2],t=c[3],v=r[f],cz=zoneCls(z);const mk=MARKSET.has(f)?({apply_new:' mk-an',apply:' mk',cancel_new:' mk-cn'}[r.markstate]||''):'';
 if(t==='del')return \`<td class="\${cz}"><span class="del" data-del="\${idx}">✕</span></td>\`;
 if(t==='naiso')return \`<td class="\${cz} ro\${mk}">\${nTag(v)}</td>\`;
 if(t==='ro'){if(f==='days'){const red=(typeof v==='number'&&v>=60);return \`<td class="\${cz} ro\${mk}" style="color:\${red?'#dc2626':'#0f172a'};font-weight:\${red?'700':'400'}">\${v==null?'':v}</td>\`}return \`<td class="\${cz} ro\${mk}">\${v==null?'':v}</td>\`}
 if(t==='yen')return \`<td class="\${cz} ro\${mk}">\${v?nf(v):'<span style=opacity:.4>-</span>'}</td>\`;
 if(t==='stat'){const sv=String(v==null?'':v);const cl=sv==='未'?'statno':'';return \`<td class="\${cz} ed \${cl}\${mk}" contenteditable="true" data-i="\${idx}" data-f="\${f}">\${sv||'-'}</td>\`}
 if(t==='pct'){const nv=(typeof v==='number'?v:parseFloat(v));const pv=(v===''||v==null||isNaN(nv))?'':Math.round(nv*100)+'％';const hot=(f==='ad'&&!isNaN(nv)&&nv*100>=500)?'color:#dc2626;font-weight:700;':'';return \`<td class="\${cz} ed\${mk}\${stickCls(f)}" contenteditable="true" data-i="\${idx}" data-f="\${f}" style="\${stickSty(f)}\${hot}">\${pv}</td>\`}
 let disp=(v==null?'':String(v));
 if(['rent','kyoeki','water'].includes(f)&&v!==''&&v!=null&&v!=='-'&&!isNaN(v))disp=nf(Number(v));
 const need=((f==='set6'||f==='set3')&&r.naiso==='完了'&&v!=='完'&&!String(r.go).startsWith('P')&&!r.broker)?' need':'';
 const collect=(f==='set6'&&r.broker&&v==='完')?' collect':'';   /* 申込済で6点完＝回収必要→赤字 */
 const bk=(f==='biko')?' bikored':'';
 return \`<td class="\${cz} ed\${need}\${collect}\${bk}\${stickCls(f)}\${mk}" contenteditable="true" data-i="\${idx}" data-f="\${f}" style="\${stickSty(f)}">\${disp.replace(/</g,'&lt;').replace(/\\n/g,'<br>')}</td>\`}
const MERGE_PROP=['prop','chiku','kouzou','net','pet'];
// 問合・内見は物件ごとに1セル合体（同間取り前提）。間取り違いで分けたい物件名はここに入れると部屋別になる。
const SPLIT_TOINAI=new Set([]);
const MERGE_TOINAI=['toi','nai'];
function mergeEdTd(r,c,span,idx){const f=c[0],cz=zoneCls(c[2]);const v=r[f];
 return \`<td class="\${cz} ed mc-mid" rowspan="\${span}" contenteditable="true" data-i="\${idx}" data-f="\${f}">\${v==null||v===''?'':v}</td>\`}
function runs(view,kf){const sp=new Array(view.length).fill(0);let j=0;while(j<view.length){let n=1;while(j+n<view.length&&view[j+n].r[kf]===view[j].r[kf])n++;sp[j]=n;j+=n}return sp}
function mergeTd(r,c,span){const f=c[0],cz=zoneCls(c[2]);let v=r[f];let extra='';
 if(f==='prop'){v=String(v||'').replace(/^プライマリー/,'');if(r.paddr)extra=\`<div class="paddr">\${r.paddr}</div>\`;
  const rt=KADO_RATE[r.kado_key||r.prop];
  if(rt!=null){const col=rt<90?'#dc2626':'#334155';extra+=\`<div class="krate" style="color:\${col}">稼働 \${rt.toFixed(0)}％</div>\`}}
 return \`<td class="\${cz} mc\${stickCls(f)}" rowspan="\${span}" style="\${stickSty(f)}">\${v==null?'':v}\${extra}</td>\`}
function jimoTd(r,span,idx){const lit=/掲載/.test(String(r.jimoti||''));return \`<td class="col-ota ed mcj\${lit?' jlisted':''}" rowspan="\${span}" contenteditable="true" data-i="\${idx}" data-f="jimoti">\${lit?'掲載中':'-'}</td>\`}
// 物件ごとの住居稼働率（稼働率表マスターの総戸数 − ライブ空室数）。申込中は契約扱いで空室から除外。
let KADO_RATE={};
function calcKadoRate(){const M=SEED.kado||[];const vj={};
 R.forEach(r=>{if(r.broker||String(r.go).startsWith('P'))return;const k=r.kado_key||r.prop;vj[k]=(vj[k]||0)+1});
 const map={};M.forEach(m=>{const tj=m.total_ju||0,vjc=vj[m.name]||0;map[m.name]=tj?((tj-vjc)/tj*100):100});return map}
function render(){KADO_RATE=calcKadoRate();let rows=R.map((r,i)=>({r,i}));
 if(!fpark.checked)rows=rows.filter(o=>!String(o.r.go).startsWith('P'));
 if(fcomp.value)rows=rows.filter(o=>o.r.comp===fcomp.value);if(fnaiso.value)rows=rows.filter(o=>o.r.naiso===fnaiso.value);
 if(fapply.checked)rows=rows.filter(o=>o.r.broker);if(flt.checked)rows=rows.filter(o=>o.r.days>=60);
 if(fneed.checked)rows=rows.filter(o=>o.r.naiso==='完了'&&(o.r.set6!=='完'||o.r.set3!=='完')&&!String(o.r.go).startsWith('P')&&!o.r.broker);
 if(fcollect.checked)rows=rows.filter(o=>o.r.broker&&o.r.set6==='完'&&!String(o.r.go).startsWith('P'));
 if(fnolist.checked)rows=rows.filter(o=>!String(o.r.go).startsWith('P')&&o.r.days>=60&&!/掲載/.test(String(o.r.jimoti||'')));
 const q=document.getElementById('q').value.trim();if(q)rows=rows.filter(o=>(o.r.prop+o.r.go).includes(q));
 const compSp=runs(rows,'comp'),propSp=runs(rows,'prop');
 const AC=activeCols();
 const body=rows.map(({r,i},j)=>{const newg=compSp[j]>0;
   const cells=AC.map(c=>{const f=c[0];
     if(f==='comp')return compSp[j]>0?mergeTd(r,c,compSp[j]):'';
     if(MERGE_PROP.includes(f))return propSp[j]>0?mergeTd(r,c,propSp[j]):'';
     if(f==='jimoti')return propSp[j]>0?jimoTd(r,propSp[j],i):'';
     if(MERGE_TOINAI.includes(f)&&!SPLIT_TOINAI.has(r.prop))return propSp[j]>0?mergeEdTd(r,c,propSp[j],i):'';
     return cellHTML(r,c,i)}).join('');
   return \`<tr class="\${r.days>=60?'lt ':''}\${newg?'grp':''}">\`+cells+'</tr>'}).join('');
 document.getElementById('tbl').innerHTML=head()+'<tbody>'+body+'</tbody>';
 if(!fcomp.dataset.f){[...new Set(SEED.rooms.map(r=>r.comp))].forEach(c=>fcomp.innerHTML+=\`<option>\${c}</option>\`);
   ['完了','内装中','未内装','空予定'].forEach(c=>fnaiso.innerHTML+=\`<option>\${c}</option>\`);fcomp.dataset.f=1}}
document.addEventListener('blur',e=>{const td=e.target;if(!td.classList||!td.classList.contains('ed')||!td.dataset.f)return;
 const i=+td.dataset.i,f=td.dataset.f;let val=td.innerText.replace(/ /g,' ').trim();
 const numF=['chiku','rent','kyoeki','water','shikirei','toi','nai'];
 const cval=val.replace(/,/g,'');
 let store=val;if(numF.includes(f)&&cval!==''&&!isNaN(cval))store=Number(cval);
 if(f==='ad'){const n=parseFloat(String(val).replace(/[^0-9.]/g,''));store=isNaN(n)?'':(n>20?n/100:n)}
 R[i][f]=store;saveField(R[i],f,store);
 if(f==='ad'){recalc();buildPrint();render();return}
 if(f==='jimoti'){const jv=/掲載/.test(String(store))?'掲載中':'-';R.forEach(x=>{if(x.prop===R[i].prop&&!String(x.go).startsWith('P')){x.jimoti=jv;saveField(x,'jimoti',jv)}});recalc();buildPrint();render();return}
 if(['rent','kyoeki','taikyo','toi','nai','go','comp','prop'].includes(f)){recalc();buildPrint()}
 if(['broker','set6','set3','gas','monitor'].includes(f)){recalc();buildPrint();render()}
},true);
['fcomp','fnaiso','fapply','flt','fneed','fcollect','fnolist','fpark'].forEach(id=>document.getElementById(id).onchange=render);
document.getElementById('q').oninput=render;
document.addEventListener('click',e=>{const d=e.target.dataset;if(d&&d.del!=null)delRoom(R[+d.del])});
const PC=[['no','空室','2.2','c'],['comp_full','管理会社\\n問合先','9','comp'],['propaddr','物件・住所','10','left'],
 ['chiku','築年数','2.6','c'],['kouzou','構造','2.4','c'],['net','ﾈｯﾄ','3','c'],['pet','ﾍﾟｯﾄ','2.6','c'],
 ['go','号数','2.8','c'],['model','モデル部屋','9','left'],['naiso','内装\\n状況','3.6','c'],
 ['taikyo','退去日','3.4','c'],['reform','ﾘﾌｫｰﾑ\\n完了予定','4.4','c'],['nairan','内覧方法','9','left'],
 ['rent','家賃\\n(円)','3.8','r'],['kyoeki','共益費\\n(円)','3.6','r'],['water','水道･町費\\nその他','4','c'],
 ['shikirei','敷金礼金\\n(ヶ月)','3.2','c'],['ad','広告料\\n(%)','3.2','c'],['biko','備考','15.8','biko']];
function pcellv(r,k){if(k==='ad')return(r.ad===''||r.ad==null)?'':((typeof r.ad==='number'?r.ad:parseFloat(r.ad)||0)*100)+'%';
 if(k==='rent'||k==='kyoeki')return nf(r[k]);let v=r[k];return(v===''||v==null)?'':String(v).replace(/\\n/g,'<br>')}
const PMERGE_PROP=['propaddr','chiku','kouzou','net','pet'];
function runsA(arr,kf){const sp=new Array(arr.length).fill(0);let j=0;while(j<arr.length){let n=1;while(j+n<arr.length&&arr[j+n][kf]===arr[j][kf])n++;sp[j]=n;j+=n}return sp}
function buildPrint(){let cg='<colgroup>'+PC.map(c=>\`<col style="width:\${c[2]}%">\`).join('')+'</colgroup>';
 let th='<thead><tr>'+PC.map(c=>\`<th>\${c[1].replace(/\\n/g,'<br>')}</th>\`).join('')+'</tr></thead>';
 const rows=R.filter(r=>r.go);const cSp=runsA(rows,'comp_full'),pSp=runsA(rows,'propaddr');
 const body=rows.map((r,j)=>{const cls=r.broker?'apply':(r.naiso==='空予定'?'cancel':'');
   const cells=PC.map(c=>{const f=c[0],al=c[3]==='c'?'c':c[3]==='r'?'r':c[3]==='biko'?'biko':c[3]==='comp'?'comp':'';
     if(f==='comp_full')return cSp[j]>0?\`<td class="comp pm" rowspan="\${cSp[j]}">\${pcellv(r,f)}</td>\`:'';
     if(PMERGE_PROP.includes(f))return pSp[j]>0?\`<td class="\${al} pm" rowspan="\${pSp[j]}">\${pcellv(r,f)}</td>\`:'';
     const adhot=(f==='ad'&&!isNaN(parseFloat(r.ad))&&parseFloat(r.ad)*100>=500)?' style="color:#dc2626;font-weight:700"':'';
     return \`<td class="\${al}"\${adhot}>\${pcellv(r,f)}</td>\`}).join('');
   return \`<tr class="\${cls}">\`+cells+'</tr>'}).join('');
 document.getElementById('ptbl').innerHTML=cg+th+'<tbody>'+body+'</tbody>'}
// 不要になった古い上書きを掃除（SEED側を正とする）。次回起動時に自動で消える。
(function(){const PURGE=[['プライマリー日吉町','301','memo'],['プライマリー合川C棟','202','nyukyo'],['プライマリー西鉄久留米駅前','402','tanto']];const o=loadLS();let ch=false;
 PURGE.forEach(([p,g,f])=>{const k=p+'|'+g;if(o[k]&&(f in o[k])){delete o[k][f];if(!Object.keys(o[k]).length)delete o[k];ch=true}});
 if(ch){localStorage.setItem(LSK,JSON.stringify(o));}})();
R=SEED.rooms.map(r=>({...r})).concat(loadAdded());applyLS();sortRooms();recalc();render();buildPrint();stamp();initBackup();restoreFromDrive();
{const sp=new URLSearchParams(location.search);
 if(sp.get('view')==='kado')showView('kado');
 const cp=sp.get('comp');                                   // 会社別PDF: その管理会社だけに絞る
 if(cp){const s=document.getElementById('fcomp');s.value=cp;document.body.classList.add('companypdf');render();}
 if(sp.get('broker')==='1')toggleBroker();}                 // 仲介用PDF: 仲介業者向け表示
</script></body></html>
`;
export async function onRequest() {
  return new Response(HTML, { headers: {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
    'x-robots-tag': 'noindex, nofollow, noarchive',
  } });
}
