// Run by loading loan-finder.js followed by this file in a JavaScript runtime.
(function(){
var p={pref:'福岡県',city:'福岡市',entity:'法人',structure:'木造',age:30,term:25,price:5001};
function bank(overrides){var d={名称:'テスト',法人:'○',物件エリア:'全国',木造:'○ 50年-築',新築MAX:'35年',契約エリア:'支店のある地域'};Object.keys(overrides||{}).forEach(function(k){d[k]=overrides[k];});return d;}
function assert(x,msg){if(!x)throw Error(msg);}
var r=LoanFinder.assess(bank(),p);assert(r.group===1,'period shortfall requires check');assert(LoanFinder.assess(bank(),Object.assign({},p,{term:15})).group===0,'nationwide candidate');assert(r.check.join().indexOf('20年')>=0,'age subtraction');assert(r.check.join().indexOf('期間不足')>=0,'requested term shortfall');
assert(LoanFinder.assess(bank({法人:'×'}),p).group===2,'entity exclusion');
assert(LoanFinder.assess(bank({木造:'×'}),p).group===2,'structure exclusion');
assert(LoanFinder.assess(bank({物件エリア:'関東エリア実績あり'}),p).group===1,'historical example not approval');
assert(LoanFinder.assess(bank({物件エリア:'全国（提携金融機関のあるエリア）'}),p).group===1,'qualified nationwide requires check');
assert(LoanFinder.assess(bank({物件エリア:'福岡・大分・熊本'}),Object.assign({},p,{pref:'東京都'})).group===2,'explicit regional mismatch');
assert(LoanFinder.assess(bank({物件エリア:'支店のある地域'}),p).group===1,'unknown branch coverage');
assert(!LoanFinder.assess(bank({木造:'○ 22年'}),p).check.some(function(x){return x.indexOf('単純計算')>=0;}),'plain years not subtraction');
assert(!LoanFinder.assess(bank({木造:'50〜60年-築'}),p).check.some(function(x){return x.indexOf('単純計算')>=0;}),'range not subtraction');
assert(LoanFinder.assess(bank({名称:'AGビジネスサポート'}),p).check[0].indexOf('5,000万円超')>=0,'AG over threshold');
assert(!LoanFinder.assess(bank({名称:'AGビジネスサポート'}),Object.assign({},p,{price:5000})).check.some(function(x){return x.indexOf('5,000万円超')>=0;}),'AG threshold exclusive');
assert(!LoanFinder.assess(bank({名称:'AGビジネスサポート'}),Object.assign({},p,{price:null})).check.some(function(x){return x.indexOf('5,000万円超')>=0;}),'blank price');
assert(LoanFinder.assess(bank(),Object.assign({},p,{age:0})).check.join().indexOf('35年')>=0,'new build cap');
})();
'13 loan finder checks passed';

(function(){
function assert(x,m){if(!x)throw Error(m);}
var p={pref:'福岡県',city:'',entity:'法人',structure:'木造',age:0,term:null,price:null};
function d(n,t,r){return {名称:n,種類:t,金利:r,法人:'○',木造:'○',物件エリア:'全国'};}
var data=[d('信組信用組合','銀行','3%'),d('高金利銀行','銀行','3.5%'),d('会社','ノンバンク','2%'),d('信金信用金庫','信用金庫','3%'),d('通常銀行','銀行','2%'),d('auじぶん銀行','ノンバンク','2.15%'),d('未記録銀行','銀行','—'),d('段階銀行','銀行','変動 2.50／2.80／3.20／4.20%'),d('範囲銀行','銀行','3〜4.5%')];
var rows=LoanFinder.search(data,p),names=rows.map(function(r){return r.bank.名称;});
assert(names.indexOf('会社')<0,'new excludes nonbank even low rate');
assert(names.indexOf('高金利銀行')<0,'new excludes 3.5 percent');
assert(names.indexOf('auじぶん銀行')>=0,'bank name corrects old category');
assert(names.indexOf('未記録銀行')>=0&&names.indexOf('段階銀行')>=0&&names.indexOf('範囲銀行')>=0,'unknown and mixed rates preserved');
assert(names.indexOf('信金信用金庫')>names.indexOf('範囲銀行')&&names.indexOf('信組信用組合')>names.indexOf('信金信用金庫'),'bank then shinkin then shinkumi');
assert(LoanFinder.search(data,Object.assign({},p,{age:1})).length===data.length,'used properties unchanged');
})();
'Loan finder assessment and new-build policy checks passed';
