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
