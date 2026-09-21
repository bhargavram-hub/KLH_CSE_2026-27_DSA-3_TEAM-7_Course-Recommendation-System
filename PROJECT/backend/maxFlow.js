// Edmonds-Karp maximum flow implementation.
// Used to model course-capacity allocation: Source -> Student -> Course -> Capacity -> Sink.
function maxFlow(capacity, source, sink) {
  const n = capacity.length;
  const flow = Array.from({length:n},()=>Array(n).fill(0));
  let total = 0;
  while (true) {
    const parent = Array(n).fill(-1); parent[source] = source;
    const q=[source];
    for(let h=0;h<q.length && parent[sink]===-1;h++){
      const u=q[h];
      for(let v=0;v<n;v++) if(parent[v]===-1 && capacity[u][v]-flow[u][v]>0){ parent[v]=u; q.push(v); if(v===sink) break; }
    }
    if(parent[sink]===-1) break;
    let aug=Infinity;
    for(let v=sink;v!==source;v=parent[v]) aug=Math.min(aug,capacity[parent[v]][v]-flow[parent[v]][v]);
    for(let v=sink;v!==source;v=parent[v]){const u=parent[v];flow[u][v]+=aug;flow[v][u]-=aug;}
    total+=aug;
  }
  return {value:total, flow};
}

function buildCourseAllocation(courses, studentPreferences, capacities={}) {
  const prefs = studentPreferences || {};
  const studentIds = Object.keys(prefs);
  const eligible = studentIds.map(id => ({id, courses:(prefs[id]||[]).filter(x=>courses.some(c=>c.id===x))}));
  const courseIds=[...new Set(eligible.flatMap(s=>s.courses))];
  const S=0, studentStart=1, courseStart=1+studentIds.length, T=courseStart+courseIds.length, N=T+1;
  const cap=Array.from({length:N},()=>Array(N).fill(0));
  const sIndex=new Map(studentIds.map((id,i)=>[id,studentStart+i]));
  const cIndex=new Map(courseIds.map((id,i)=>[id,courseStart+i]));
  studentIds.forEach(id=>cap[S][sIndex.get(id)]=1);
  courseIds.forEach(id=>cap[cIndex.get(id)][T]=Math.max(1,Number(capacities[id]||1)));
  eligible.forEach(s=>s.courses.forEach(cid=>cap[sIndex.get(s.id)][cIndex.get(cid)]=1));
  const result=maxFlow(cap,S,T);
  const matches=[];
  eligible.forEach(s=>s.courses.forEach(cid=>{const u=sIndex.get(s.id),v=cIndex.get(cid);if(result.flow[u][v]>0)matches.push({studentId:s.id,courseId:cid});}));
  return {maxAssignments:result.value,matches,courseIds,studentCount:studentIds.length};
}
module.exports={maxFlow,buildCourseAllocation};
