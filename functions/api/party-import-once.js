const digest = async s => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function onRequest({request,env}) {
 const json=(x,status=200)=>new Response(JSON.stringify(x),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 if(request.method!=='POST'||Date.now()>Date.parse('2026-10-31T00:00:00Z')) return json({ok:false},410);
 const token=request.headers.get('Authorization')?.replace(/^Bearer /,'')||'';
 if(await digest(token)!=='aaf6549ceb82ac3e24716898d25d3a1de6ab268ae02d9301c6a54186ab277ea1') return json({ok:false},403);
 const raw=await request.text();
 if(await digest(raw)!=='d0b28f21933272c9e1567dc78ac5ed84839c6d7c0b8deeee3a2e00a5ba96de62') return json({ok:false},400);
 const {rows}=JSON.parse(raw), result=[];
 for(const row of rows){
 const key='event-rsvp:v1:2026-11-12-event:'+row.id;
 const previous=await env.ZAIKO_KV.get(key,'json');
 if(new URL(request.url).searchParams.get('mode')==='verify'){result.push(previous);continue;}
 const now=new Date().toISOString();
 const next={...previous,id:row.id,name:previous?.name||row.name,answers:{...previous?.answers,party:'yes'},comment:previous?.comment||'',createdAt:previous?.createdAt||now,updatedAt:now};
 if(previous?.withdrawn) return json({ok:false,error:'withdrawn_needs_review'},409);
 await env.ZAIKO_KV.put(key,JSON.stringify(next)); result.push(next);
 }
 return json({ok:true,rows:result});
}
