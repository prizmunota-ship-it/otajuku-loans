/* Stored lender conditions only. No network calls or AI; unknowns stay unknown. */
(function(root){
'use strict';
function assess(d,p){
  var yes=[],check=[],outside=[],periodConcern=false;
  var entity=d[p.entity]||'';
  if(/^[◎○]/.test(entity)) yes.push(p.entity+'の申込に対応');
  else if(/^[×✕]/.test(entity)) outside.push(p.entity+'の申込は登録条件で対象外');
  else check.push(p.entity+'の申込：'+(entity||'記録なし')+'。契約者条件を確認');
  var area=d.物件エリア||'',pref=p.pref.replace(/[都府県]$/,''), city=p.city.trim();
  // Only unqualified, explicit geographic coverage is treated as a match.
  var areas={'全国':null,'全国対応':null,'福岡・大分・熊本全域':['福岡','大分','熊本'],'福岡・大分・熊本':['福岡','大分','熊本'],'九州地域':['福岡','佐賀','長崎','熊本','大分','宮崎','鹿児島']};
  if(Object.prototype.hasOwnProperty.call(areas,area)){
    if(areas[area]===null||areas[area].indexOf(pref)>=0) yes.push('物件エリア：'+area);
    else outside.push('物件エリアの登録条件（'+area+'）と一致しません');
  }else if(area==='福岡市内' && pref==='福岡' && /^福岡市/.test(city)) yes.push('物件エリア：福岡市内');
  else check.push('物件エリア：'+(area&&area!=='—'?area:'記録なし')+'。対象になるか確認');
  if(city){
    var loc=(p.pref+city).replace(/\s/g,'');
    var tokens=(d.物件ネガ||'').split(/[、・\n（）()]/).filter(function(x){return x.length>=3;});
    if(tokens.some(function(x){return loc.indexOf(x)>=0;})) check.unshift('慎重な評価のエリアに該当する可能性：'+d.物件ネガ);
    if((d.物件ポジ||'').indexOf(city)>=0) yes.push('積極的なエリアの記載あり：'+city+'（地区などの条件は詳細を確認）');
  }
  var structure=d[p.structure]||'';
  if(/^[×✕]/.test(structure)) outside.push(p.structure+'は登録条件で対象外');
  else if(/^[◎○]/.test(structure)) yes.push('構造：'+p.structure+'の対応記載あり');
  else check.push('構造：'+p.structure+'／'+(structure||'記録なし')+'。対応可否を確認');
  var formula=structure.match(/^(?:[◎○]\s*)?(\d+)年[-−－]築(?:年数)?(?=（|\(|\s|$)/);
  if(formula){
    var term=Math.max(0,Number(formula[1])-p.age);
    var cap=structure.match(/最大(\d+)年/) || (d.新築MAX||'').match(/^(\d+)年$/);
    if(cap) term=Math.min(term,Number(cap[1]));
    check.push('期間の単純計算：'+term+'年（'+formula[1]+'年−築'+p.age+'年'+(cap?'、上限'+cap[1]+'年':'')+'）。例外・上限・審査結果は詳細確認');
    if(term===0 || (p.term!==null && term<p.term)){periodConcern=true;check.push('希望期間を満たせるか要確認：登録式の単純計算では期間不足');}
  }else check.push('築'+p.age+'年の融資期間は個別確認（登録値：'+(structure||'記録なし')+'）');
  check.push('契約者の居住地・法人所在地：'+(d.契約エリア||'記録なし'));
  if(d.名称==='AGビジネスサポート' && p.price!==null && p.price>5000) check.unshift('購入価格5,000万円超：審査ハードルが上がる。契約書・通帳・購入後の事業計画をしっかり準備');
  return {bank:d,yes:yes,check:check,outside:outside,group:outside.length?2:(yes.length>=3&&!periodConcern?0:1)};
}
root.LoanFinder={assess:assess};
if(typeof document==='undefined') return;
var host=document.getElementById('loanFinder');
if(!host) return;
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
var prefs='北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県'.split(' ');
host.innerHTML='<details><summary>🏠 物件の条件から融資先を探す<span>所在地・構造・築年数を入力</span></summary><div class="finder-body"><p>登録済みの融資条件から、相談先の候補を探せます。AIは使用しません。</p><form id="finderForm"><div class="finder-grid"><label>物件の都道府県<select name="pref" required><option value="">選択してください</option>'+prefs.map(function(x){return '<option>'+x+'</option>';}).join('')+'</select></label><label>市区町村（任意）<input name="city" placeholder="例：福岡市博多区" maxlength="60"></label><label>構造<select name="structure" required><option value="">選択してください</option><option value="木造">木造</option><option value="軽鉄">軽量鉄骨</option><option value="重鉄">重量鉄骨</option><option value="RC">RC</option></select></label><label>築年数（新築は0）<input name="age" type="number" min="0" max="150" step="1" required inputmode="numeric" placeholder="例：25"></label><label>購入名義<select name="entity" required><option value="">選択してください</option><option>法人</option><option>個人</option></select></label><label>購入価格（万円・任意）<input name="price" type="number" min="1" step="any" inputmode="decimal" placeholder="例：5000"></label><label>希望融資期間（年・任意）<input name="term" type="number" min="1" max="60" step="1" inputmode="numeric" placeholder="例：20"></label></div><div class="finder-actions"><button type="submit">相談先の候補を表示</button><button type="reset">入力をクリア</button></div></form><p class="finder-note">融資の可否や承認確率を判定するものではありません。入力内容は送信・保存されません。</p><div id="finderResults" aria-live="polite"></div></div></details>';
var form=document.getElementById('finderForm'),result=document.getElementById('finderResults');
form.addEventListener('input',function(){if(result.textContent) result.innerHTML='<p>条件が変更されました。「相談先の候補を表示」を押してください。</p>';});
form.addEventListener('reset',function(){result.innerHTML='';});
form.addEventListener('submit',function(e){
 e.preventDefault(); if(!form.reportValidity()) return;
 var f=new FormData(form),p={pref:f.get('pref'),city:f.get('city'),structure:f.get('structure'),age:Number(f.get('age')),entity:f.get('entity'),price:f.get('price')===''?null:Number(f.get('price')),term:f.get('term')===''?null:Number(f.get('term'))};
 var rows=DATA.map(function(d){return assess(d,p);}).sort(function(a,b){return a.group-b.group||b.yes.length-a.yes.length;});
 var html='<p class="finder-note">登録条件の一致項目数順です。金利順や融資の通りやすさ順ではありません。物件価格の評価・年収・自己資金などは各機関の詳細で確認してください。</p>';
 ['条件の一致が多い相談候補','個別確認が必要な金融機関','登録条件に合わない金融機関'].forEach(function(label,g){
  var list=rows.filter(function(r){return r.group===g;});
  html+='<details class="finder-group"'+(g===0?' open':'')+'><summary>'+label+'（'+list.length+'件）</summary>';
  if(!list.length) html+='<p>該当なし。他の区分も確認してください。</p>';
  list.forEach(function(r){html+='<article class="finder-result"><h3>'+esc(r.bank.名称)+'</h3><small>情報更新：'+esc(r.bank.更新日)+'</small>';
   if(r.check.some(function(x){return x.indexOf('期間不足')>=0;})) html+='<p class="finder-warning">希望期間を満たせるか要確認</p>';
   if(r.yes.length) html+='<p class="finder-match">'+r.yes.map(esc).join('<br>')+'</p>';
   if(r.outside.length) html+='<p class="finder-warning">'+r.outside.map(esc).join('<br>')+'</p>';
   html+='<details class="finder-check"><summary><strong>確認したい点（'+r.check.length+'項目）</strong><span class="finder-check-open">タップして確認</span><span class="finder-check-close">タップして閉じる</span></summary><ul>'+r.check.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></details><button type="button" data-bank="'+DATA.indexOf(r.bank)+'">融資条件・購入報告を見る</button></article>';
  }); html+='</details>';
 }); result.innerHTML=html;
});
result.addEventListener('click',function(e){var b=e.target.closest('[data-bank]');if(!b)return; var i=Number(b.dataset.bank);curMode='banks';curType='all';curQ='';document.getElementById('searchInput').value='';document.querySelectorAll('.mtab').forEach(function(x){x.classList.toggle('active',x.dataset.mode==='banks');});document.querySelectorAll('.chip').forEach(function(x){x.classList.toggle('active',x.dataset.type==='all');});render();var card=document.getElementById('c'+i);card.classList.add('open');card.scrollIntoView({behavior:'smooth',block:'start'});});
})(typeof window==='undefined'?this:window);
