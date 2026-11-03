/* Bounded requests, including body download. Hidden tabs are never treated as cancellation. */
(function(root){
  async function boundedFetch(url,options={},timeoutMs=20000){
    const controller=new AbortController();
    const deadline=Date.now()+timeoutMs;
    const upstream=options.signal;
    let timer;
    const abort=()=>controller.abort();
    const check=()=>{if(Date.now()>=deadline)abort();};
    if(upstream){if(upstream.aborted)abort();else upstream.addEventListener('abort',abort,{once:true});}
    root.document?.addEventListener('visibilitychange',check);
    root.addEventListener?.('pageshow',check);
    timer=setTimeout(abort,timeoutMs);
    try{
      const response=await root.fetch(url,{...options,signal:controller.signal});
      const body=await response.arrayBuffer();
      return new Response(body,{status:response.status,statusText:response.statusText,headers:response.headers});
    }finally{
      clearTimeout(timer);
      upstream?.removeEventListener('abort',abort);
      root.document?.removeEventListener('visibilitychange',check);
      root.removeEventListener?.('pageshow',check);
    }
  }
  root.ReportNetwork={fetch:boundedFetch};
})(globalThis);
