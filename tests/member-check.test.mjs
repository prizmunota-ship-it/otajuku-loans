import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const src = fs.readFileSync(new URL('../functions/api/member-check.js', import.meta.url), 'utf8');
const {createHandler} = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
const request = () => new Request('https://example.test/api/member-check', {method:'POST', body:JSON.stringify({email:'Member@example.test'})});
for (const result of ['ok','ng']) test('preserves membership decision '+result, async()=>{
  const handler=createHandler(async(url)=>{
    assert.equal(new URL(url).searchParams.get('email'),'member@example.test');
    return new Response('_memberCheck("'+result+'")');
  });
  const response=await handler({request:request()});
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{result});
});
for (const value of ['<html>Google login</html>','_memberCheck("ok");malicious()']) test('rejects unexpected upstream '+value,async()=>{
  const response=await createHandler(async()=>new Response(value))({request:request()});
  assert.equal(response.status,503);
});
test('network failure never grants access',async()=>{
  const response=await createHandler(async()=>{throw new Error('timeout')})({request:request()});
  assert.equal(response.status,503);
});
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function page(fetcher){
  const elements={}; const stored=new Map();
  const ctx={fetch:fetcher,AbortController,Date,setTimeout,clearTimeout,console,
    localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v),removeItem:k=>stored.delete(k)},
    document:{getElementById:id=>elements[id]??=( {style:{},value:'member@example.test',addEventListener(){}} )}};
  vm.createContext(ctx);vm.runInContext(script,ctx);return {ctx,elements,stored};
}
test('failed browser request unlocks retry and does not authenticate',async()=>{
  const {ctx,elements,stored}=page(async()=>{throw new Error('network')});
  await ctx.doLogin();assert.equal(elements.loginBtn.disabled,false);
  assert.match(elements.loginMsg.textContent,/もう一度/);assert.equal(stored.get('otajuku_auth'),undefined);
});
test('successful same-origin request stores shared session',async()=>{
  const {ctx,stored}=page(async(url)=>{assert.equal(url,'/api/member-check');return new Response('{"result":"ok"}')});
  await ctx.doLogin();assert.equal(stored.get('otajuku_auth'),'ok');
});
