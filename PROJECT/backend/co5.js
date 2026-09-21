// CO5: NP-completeness reduction demo + 2-approximation for Vertex Cover.

function threeSATtoVertexCover(variables, clauses){
  const nodes=[], edges=[];
  variables.forEach(v=>{nodes.push(`${v}=T`,`${v}=F`);edges.push([`${v}=T`,`${v}=F`]);});
  clauses.forEach((clause,ci)=>{
    const cn=clause.map((lit,j)=>`C${ci+1}.${j+1}:${lit}`);
    cn.forEach(x=>nodes.push(x));
    edges.push([cn[0],cn[1]],[cn[1],cn[2]],[cn[0],cn[2]]);
    cn.forEach((x,j)=>{
      const lit=clause[j], v=String(lit).replace(/^!/,"");
      const variableNode=String(lit).startsWith("!")?`${v}=T`:`${v}=F`;
      edges.push([x,variableNode]);
    });
  });
  return {variableCount:variables.length,clauseCount:clauses.length,nodeCount:nodes.length,edgeCount:edges.length,nodes,edges,coverSize:variables.length+2*clauses.length,
    rule:"3-SAT with n variables and m clauses maps to Vertex Cover target k=n+2m."};
}

function vertexCover2Approx(edges){
  const used=new Set(), cover=new Set(), matching=[];
  for(const [u,v] of edges){
    if(!used.has(u)&&!used.has(v)){used.add(u);used.add(v);cover.add(u);cover.add(v);matching.push([u,v]);}
  }
  return {cover:[...cover],matching,coverSize:cover.size,matchingSize:matching.length,
    guarantee:"|C| ≤ 2·OPT because every selected matching edge needs a distinct endpoint in any vertex cover.",
    ratioBound:2};
}
module.exports={threeSATtoVertexCover,vertexCover2Approx};
