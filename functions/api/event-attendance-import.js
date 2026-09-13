// Temporary, exact-payload migration authorized by the owner. Remove after verification.
const TOKEN_HASH = '484cb82d0d235a06bfa9082dcf6a4c4771b95dbfed5b8c5a492625631cfe7c78';
const PAYLOAD_HASH = '9ac7341ff7fdfc4322df51291dc09aefa77fc790ddbb69f8c16c769c11c39391';
const EXPIRES = '2026-09-13T02:02:12.486676+00:00';
const PREFIX = 'event-rsvp:v1:2026-10-22-festival:';
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
    if(!Array.isArray(body.records) || body.records.length!==8 || await sha(JSON.stringify(body.records))!==PAYLOAD_HASH)return json({ok:false},400);
    if(body.mode!==undefined && body.mode!=='verify')return json({ok:false},400);
    const kv=env.ZAIKO_KV; if(!kv)return json({ok:false},503);
    const current=await Promise.all(body.records.map(r=>kv.get(PREFIX+r.id,'json')));
    const matching=current.filter((v,i)=>v && JSON.stringify(v)===JSON.stringify(body.records[i])).length;
    const conflict=current.some((v,i)=>v && JSON.stringify(v)!==JSON.stringify(body.records[i]));
    if(conflict)return json({ok:false,error:'existing_answer_conflict'},409);
    if(body.mode==='verify')return json({ok:matching===8,matching,total:8,digest:matching===8?PAYLOAD_HASH:null});
    await Promise.all(body.records.map((r,i)=>current[i]?Promise.resolve():kv.put(PREFIX+r.id,JSON.stringify(r))));
    return json({ok:true,written:8-matching,alreadyPresent:matching,total:8,digest:PAYLOAD_HASH});
  } catch {return json({ok:false},503);}
}
