import {test} from 'node:test';
import assert from 'node:assert/strict';
import {onRequest} from '../functions/api/chintai.js';
// Minimal forms retaining the official field names and town IDs observed 2026-09-16.
const hidden='<input type="hidden" name="ar" value="090"><input type="hidden" name="bs" value="040"><input type="hidden" name="sc" value="44201"><input type="hidden" name="md" value="01"><input type="hidden" name="md" value="02">';
const city=`<form id="js-machiSelectForm" action="/jj/chintai/common/frBukkenKensakuPanel01/searchMachi/">${hidden}</form>`;
const towns=`<form id="js-lightboxShiborikomiForm" action="/jj/chintai/ichiran/FR301FC001/">${hidden}<input type="checkbox" name="oz" value="44201485"><label for="oz44201485"><a href="/chintai/oita/sc_oita/oz_44201485/">山津町</a></label><label for="oz44201999"><a href="/not-used">無関係な町</a></label></form>`;
const listing='<div class="pagination_set-hit">15<span>件</span></div><div class="cassetteitem"><div class="cassetteitem_content-title">山津町レジデンス</div><div class="cassetteitem_detail-col1">大分県大分市山津町２</div><div class="cassetteitem_detail-col3"><div>築36年</div></div><tr class="js-cassette_link"><span class="cassetteitem_other-emphasis">3.5万円</span><span class="cassetteitem_price--administration">3000円</span><span class="cassetteitem_madori">1K</span><span class="cassetteitem_menseki">19.38m</span><a href="/chintai/jnc_000099578736/">詳細</a></tr>';

test('town-filtered retrieval honors the official selected area, keeps layouts and stops repeated pages',async()=>{
  const original=globalThis.fetch,urls=[];
  globalThis.fetch=async input=>{
    const u=new URL(input);urls.push(u);
    if(u.pathname.includes('searchMachi'))return new Response(towns);
    if(u.pathname.includes('FR301FC001'))return new Response(listing);
    return new Response(city);
  };
  try{
    const response=await onRequest({request:new Request('https://example.com/api/chintai?pref=oita&sc=sc_oita&md=1R,1K&pages=15&detail=0&addr=0&towns='+encodeURIComponent('大分県大分市山津町2丁目'))});
    const result=await response.json();
    assert.equal(result.found,true);assert.equal(result.total,15);assert.equal(result.items.length,1);
    assert.deepEqual(result.selectedTowns,['山津町']);assert.equal(result.items[0].total,38000);
    const search=urls.find(u=>u.pathname.includes('FR301FC001'));
    assert.deepEqual(search.searchParams.getAll('oz'),['44201485']);assert.deepEqual(search.searchParams.getAll('md'),['01','02']);
    assert.equal(urls.length,4); // City, town selector, page 1, repeated page 2. No room-detail lookups for detail=0.
  }finally{globalThis.fetch=original;}
});

test('failed town matching does not silently return unrelated city-wide results',async()=>{
  const original=globalThis.fetch;
  globalThis.fetch=async u=>new Response(u.includes('searchMachi')?towns:city);
  try{
    const r=await onRequest({request:new Request('https://example.com/api/chintai?pref=oita&sc=sc_oita&towns='+encodeURIComponent('存在しない町'))});
    const j=await r.json();assert.equal(j.found,false);assert.equal(j.reason,'town_not_matched');
  }finally{globalThis.fetch=original;}
});
