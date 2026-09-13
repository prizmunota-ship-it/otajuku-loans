// Temporary, exact-payload migration of the 9/17 study-session replies from the owner's 調整さん. Remove after verification.
const TOKEN_HASH = 'aeded64b6f3229b4b4fe19436adc4968d73b9f9d7bc210a4101f73fdb64bbe77';
const PAYLOAD_HASH = '6d8649e2cc7b4dfee8afc397770b894cbcfd1ed75fdc3d56ab100219a4a327b2';
const EXPIRES = '2026-09-14T01:56:30.455603+00:00';
const PREFIX = 'event-rsvp:v1:2026-09-17-event:';
const COUNT = 7;
const sha = async value => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))).map(n=>n.toString(16).padStart(2,'0')).join('');
const json = (data,status=200) => new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function onRequest({request,env}) {
  if(request.method!=='POST')return json({ok:false},405);
  if(Date.now()>Date.parse(EXPIRES))return json({ok:false},410);
  const origin=request.headers.get('Origin');
  if(origin && origin!==new URL(request.url).origin)return json({ok:false},403);
  if(!(request.headers.get('Content-Type')||'').startsWith('application/json'))return json({ok:false},415);
  try {
    const raw=await request.text(); if(new TextEncoder().encode(raw).length>16000)return json({ok:false},413);
    const body=JSON.parse(raw);
    if(typeof body.token!=='string' || await sha(body.token)!==TOKEN_HASH)return json({ok:false},403);
    if(!Array.isArray(body.records) || body.records.length!==COUNT || await sha(JSON.stringify(body.records))!==PAYLOAD_HASH)return json({ok:false},400);
    if(body.mode!==undefined && body.mode!=='verify')return json({ok:false},400);
    const kv=env.ZAIKO_KV; if(!kv)return json({ok:false},503);
    const current=await Promise.all(body.records.map(r=>kv.get(PREFIX+r.id,'json')));
    const matching=current.filter((v,i)=>v && JSON.stringify(v)===JSON.stringify(body.records[i])).length;
    const conflict=current.some((v,i)=>v && JSON.stringify(v)!==JSON.stringify(body.records[i]));
    if(conflict)return json({ok:false,error:'existing_answer_conflict',existing:current.filter(Boolean).map(v=>v.name)},409);
    if(body.mode==='verify')return json({ok:matching===COUNT,matching,total:COUNT});
    await Promise.all(body.records.map((r,i)=>current[i]?Promise.resolve():kv.put(PREFIX+r.id,JSON.stringify(r))));
    return json({ok:true,written:COUNT-matching,alreadyPresent:matching,total:COUNT});
  } catch {return json({ok:false},503);}
}
