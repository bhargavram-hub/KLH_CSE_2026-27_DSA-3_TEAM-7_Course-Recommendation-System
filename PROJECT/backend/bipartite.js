// Kuhn's algorithm for maximum bipartite matching.
// Left side: students. Right side: courses.
function maximumBipartiteMatching(graph) {
  const matchCourse = new Map();
  const matchStudent = new Map();
  let count=0;
  for(const student of Object.keys(graph)){
    const seen=new Set();
    function dfs(s){
      for(const course of graph[s]||[]){
        if(seen.has(course)) continue; seen.add(course);
        const previous=matchCourse.get(course);
        if(previous===undefined || dfs(previous)){
          matchCourse.set(course,s); matchStudent.set(s,course); return true;
        }
      }
      return false;
    }
    if(dfs(student)) count++;
  }
  return {size:count, matches:[...matchStudent].map(([studentId,courseId])=>({studentId,courseId}))};
}
module.exports={maximumBipartiteMatching};
