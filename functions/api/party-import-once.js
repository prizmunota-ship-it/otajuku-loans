const digest = async s => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function onRequest({request,env}) {
 const json=(x,status=200)=>new Response(JSON.stringify(x),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 if(request.method!=='POST'||Date.now()>Date.parse('2026-11-05T00:46:55.540659+00:00')) return json({ok:false},410);
 const token=request.headers.get('Authorization')?.replace(/^Bearer /,'')||'';
 if(await digest(token)!=='c8c9b4e597c4833f0a85da4621e1bb90342fa1065bfdf50d4c31c4011dfd7122') return json({ok:false},403);
 const raw=await request.text();
 if(await digest(raw)!=='4cd52532f81a876f7913ec866bf6f11658781e468002be16ba9db447e45fc46f') return json({ok:false},400);
 const {rows}=JSON.parse(raw), result=[];
 for(const row of rows){
 const key='event-rsvp:v1:2026-11-12-event:'+row.id;
 const previous=await env.ZAIKO_KV.get(key,'json');
 if(new URL(request.url).searchParams.get('mode')==='verify'){result.push(previous);continue;}
 const now=new Date().toISOString();
 const next={...previous,id:row.id,name:previous?.name||row.name,answers:{...previous?.answers,party:'yes',seminar:'no',recording:'no'},seminarEligibility:'members-only',comment:previous?.comment||'',createdAt:previous?.createdAt||now,updatedAt:now};
 if(previous?.withdrawn) return json({ok:false,error:'withdrawn_needs_review'},409);
 await env.ZAIKO_KV.put(key,JSON.stringify(next)); result.push(next);
 }
 return json({ok:true,rows:result});
}
