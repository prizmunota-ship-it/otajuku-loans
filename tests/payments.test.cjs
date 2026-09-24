const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../zaikin/index.html'),'utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
const helper=html.slice(html.indexOf('  function syncPayments'),html.indexOf('  function cardTotal'));
const ctx={esc:s=>String(s).replaceAll('<','&lt;'),yen:n=>Number(n||0).toLocaleString('en-US'),iv:n=>String(n||0)};vm.createContext(ctx);vm.runInContext(helper,ctx);
const old={pay:123456};ctx.syncPayments(old);assert.equal(old.pay,123456);
const a={id:'x',bal:300000,pay:0,payments:[{day:27,name:'保険',amount:70000},{day:10,name:'支払いA',amount:100000},{day:25,name:'ローン',amount:150000}]};ctx.syncPayments(a);assert.equal(a.pay,320000);assert.equal(a.bal-a.pay,-20000);const view=ctx.paymentDetails(a,false);assert(view.indexOf('10日')<view.indexOf('25日'));assert(view.includes('150,000'));assert(view.includes('payment-summary'));assert(!view.includes('payment-total'));a.payments.pop();ctx.syncPayments(a);assert.equal(a.pay,170000);a.payments=[];ctx.syncPayments(a);assert.equal(a.pay,0);
const b={id:'b',payments:[{day:'',name:'<img>',amount:10}]};ctx.syncPayments(b);assert(ctx.paymentDetails(b,false).includes('&lt;img>'));assert(ctx.paymentDetails(b,false).includes('日付未設定'));
console.log('PASS: script syntax, legacy totals, monthly sum/shortage, sorting, delete, empty list, escaping, unknown date');
