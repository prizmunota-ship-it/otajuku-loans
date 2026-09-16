/* Structure differences are local reference estimates, not universal premiums.
   Display room examples freely; estimate from independent buildings only. */
(function(root){
  'use strict';
  const norm=s=>String(s||'').normalize('NFKC').replace(/[\s　]/g,'').toUpperCase();
  const layout=s=>norm(s).replace(/^ワンルーム$/,'1R');
  const single=s=>['1R','1K'].includes(layout(s));
  function structure(s){
    s=norm(s);
    if(/SRC|鉄骨鉄筋/.test(s))return 'SRC';
    if(/RC|鉄筋コンクリート/.test(s))return 'RC';
    if(/木造/.test(s))return '木造';
    if(/軽量鉄骨|軽鉄/.test(s))return '軽量鉄骨';
    if(/重量鉄骨|鉄骨造|鉄骨/.test(s))return '鉄骨';
    return '';
  }
  const buildingKey=c=>norm(c.addr)+'|'+norm(c.name);
  // Different listings of indistinguishable rooms are counted only once.
  const roomKey=c=>[buildingKey(c),layout(c.md),c.men,c.total,c.floor||''].join('|');
  function uniqueRooms(rows){const seen=new Set();return rows.filter(c=>{const k=roomKey(c);if(seen.has(k))return false;seen.add(k);return true;});}
  function median(values){const a=values.slice().sort((a,b)=>a-b),n=a.length;return n?(a[(n-1)>>1]+a[n>>1])/2:null;}
  function independent(rows){
    const groups=new Map();
    rows.forEach(c=>{const k=buildingKey(c);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(c);});
    return [...groups.values()].map(g=>{const m=median(g.map(c=>c._baseAdj));return g.slice().sort((a,b)=>Math.abs(a._baseAdj-m)-Math.abs(b._baseAdj-m))[0];});
  }
  function estimate(rows,target,distance){
    target=structure(target);
    const usable=rows.filter(c=>single(c.md)&&structure(c.struct)&&c.men>0&&c.age!=null&&Number.isFinite(c.age)&&c.lat!=null&&c.lon!=null&&c._baseAdj>0);
    const groups=new Map();
    for(const s of new Set(usable.map(c=>structure(c.struct))))groups.set(s,independent(usable.filter(c=>structure(c.struct)===s)));
    const targets=groups.get(target)||[],effects={};
    if(target)effects[target]={amount:0,pairs:[],reason:'同じ構造'};
    for(const [source,candidates] of groups){
      if(source===target)continue;
      const result={amount:null,pairs:[],targetBuildings:targets.length,sourceBuildings:candidates.length,reason:'比較材料不足（各構造5棟・5組以上必要）'};
      effects[source]=result;
      if(!target||targets.length<5||candidates.length<5)continue;
      const edges=[];
      targets.forEach(a=>candidates.forEach(b=>{
        const d=distance(a.lat,a.lon,b.lat,b.lon),area=Math.abs(a.men-b.men)/Math.min(a.men,b.men),age=Math.abs(a.age-b.age);
        // Do not confuse layout, neighborhood or markedly different vintages with structure.
        if(layout(a.md)!==layout(b.md)||d>500||area>0.15||age>5)return;
        edges.push({a,b,score:d/500+area/0.15+age/5});
      }));
      edges.sort((a,b)=>a.score-b.score);
      const used=new Set();
      for(const e of edges){
        const ak=buildingKey(e.a),bk=buildingKey(e.b);
        if(used.has(ak)||used.has(bk))continue;
        used.add(ak);used.add(bk);
        result.pairs.push({target:e.a.name,source:e.b.name,targetUrl:e.a.href||'',sourceUrl:e.b.href||'',difference:e.a._baseAdj-e.b._baseAdj});
      }
      if(result.pairs.length<5)continue;
      const diffs=result.pairs.map(p=>p.difference).sort((a,b)=>a-b);
      const low=diffs[Math.floor((diffs.length-1)*0.25)],high=diffs[Math.ceil((diffs.length-1)*0.75)];
      if(low<0&&high>0){result.reason='比較結果の方向が揃わない';continue;}
      result.amount=Math.round(median(diffs)/100)*100;
      result.reason='近隣の独立した'+result.pairs.length+'組の募集差の中央値';
    }
    return {target,effects,buildings:usable.length?independent(usable).length:0};
  }
  function correction(c,model){
    const key=structure(c.struct),effect=model.effects[key];
    return effect||{amount:null,pairs:[],reason:key?'比較材料不足':'構造未取得'};
  }
  root.ReportComparison={structure,single,layout,buildingKey,roomKey,uniqueRooms,independent,estimate,correction};
})(typeof window==='undefined'?globalThis:window);
