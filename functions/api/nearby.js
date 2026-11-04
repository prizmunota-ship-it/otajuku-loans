// Recovery path: fixed OSM queries, small batches, bounded retries, no arbitrary proxy URL.
const providers=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter'];
const groups={
  shops:['nwr[shop=convenience]','nwr[shop=supermarket]','nwr[shop=mall]','nwr[shop=department_store]','nwr[amenity=pharmacy]','nwr[shop=chemist]'],
  services:['nwr[amenity=post_office]','nwr[amenity=bank]','nwr[amenity=police]','nwr[amenity=hospital]','nwr[amenity=clinic]','nwr[amenity=dentist]'],
  education:['nwr[amenity=kindergarten]','nwr[amenity=childcare]','nwr[amenity=school]','nwr[leisure=park]','nwr[amenity=social_facility]','nwr[amenity=nursing_home]'],
  transport:['node[railway=station]','node[highway=bus_stop]','node[public_transport=platform][bus=yes]']
};
async function collect(selectors,lat,lon,r,offset){
  const failures=[];
  for(let attempt=0;attempt<providers.length;attempt++){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),12000);
    try{
      const query='[out:json][timeout:10];('+selectors.map(s=>s+'(around:'+r+','+lat+','+lon+');').join('')+');out center tags;';
      const response=await fetch(providers[(offset+attempt)%providers.length],{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'data='+encodeURIComponent(query),signal:controller.signal});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const result=await response.json();
      if(!Array.isArray(result.elements)||result.remark)throw new Error('Incomplete response');
      return {elements:result.elements,complete:true};
    }catch(e){failures.push(e.name==='AbortError'?'timeout':e.message);}
    finally{clearTimeout(timer);}
  }
  return {elements:[],complete:false,failures};
}
export async function onRequest({request}){
  const url=new URL(request.url);
  const lat=Number(url.searchParams.get('lat')),lon=Number(url.searchParams.get('lon')),r=Number(url.searchParams.get('r'));
  const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':body.complete?'public, max-age=3600':'no-store'}});
  if(!url.searchParams.has('lat')||!url.searchParams.has('lon')||!Number.isFinite(lat)||!Number.isFinite(lon)||lat<20||lat>46||lon<122||lon>154||!Number.isFinite(r)||r<100||r>5000)return json({error:'invalid_location_or_radius'},400);
  const entries=Object.entries(groups),results=[];
  // Two groups at a time, at most four upstream requests per provider.
  for(let i=0;i<entries.length;i+=2){
    results.push(...await Promise.all(entries.slice(i,i+2).map(async([name,selectors],j)=>({name,...await collect(selectors,lat,lon,r,j)}))));
  }
  const elements=new Map();
  for(const result of results)for(const el of result.elements)elements.set(el.type+':'+el.id,el);
  const missing=results.filter(x=>!x.complete).map(x=>x.name);
  if(missing.length)console.warn('Nearby recovery incomplete',results.filter(x=>!x.complete).map(({name,failures})=>({name,failures})));
  return json({elements:[...elements.values()],complete:missing.length===0,missing,source:'OpenStreetMap'});
}
