import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(process.env.REPORT_HTML||new URL('../report.html',import.meta.url),'utf8');
function source(name){const start=html.indexOf('function '+name+'(');assert.ok(start>=0);return html.slice(start,html.indexOf('\n}',start)+2);}
test('missing rent and comparables expose an editor instead of removed valuation fields',()=>{
 const start=html.indexOf('/* 未入力でもページは出す');const end=html.indexOf('/* --- 最寄り駅',start);const branch=html.slice(start,end);
 assert.ok(branch.includes('${emptyCmpEditorSlot()}'));
 assert.ok(branch.includes('想定月額賃料（1戸・円）'));
 assert.ok(branch.includes('情報を更新（変更を反映）'));
 assert.ok(!html.includes('「収益・積算評価を追加」の'));
 assert.ok(!branch.includes('満室想定年収入'));
});
test('fallback opens editor; redraw preserves input and regular reports retain collapse behavior',()=>{
 const editor={open:false,parentNode:null,value:'63500'};
 const home={appendChild(d){d.parentNode=this;}};
 const slot={dataset:{open:'true'},appendChild(d){d.parentNode=this;}};
 let target=slot;
 const context={document:{getElementById(id){return {cmpdetails:editor,cmpeditHome:home,cmpeditSlot:target}[id];}}};
 vm.createContext(context);
 for(const n of ['emptyCmpEditorSlot','parkCmpEdit','placeCmpEdit'])vm.runInContext(source(n),context);
 assert.match(context.emptyCmpEditorSlot(),/class="scronly"/);
 assert.match(context.emptyCmpEditorSlot(),/data-open="true"/);
 context.placeCmpEdit();assert.equal(editor.parentNode,slot);assert.equal(editor.open,true);
 context.parkCmpEdit();assert.equal(editor.parentNode,home);
 target={dataset:{},appendChild(d){d.parentNode=this;}};
 context.placeCmpEdit();assert.equal(editor.parentNode,target);assert.equal(editor.open,false);assert.equal(editor.value,'63500');
});
