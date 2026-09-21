// Greedy approximation for maximum coverage under a credit budget.
// It repeatedly chooses the course with the best new-skill coverage per credit.
function greedyCoverage(courses, creditLimit, targetSkills=[]) {
  const target=new Set(targetSkills.map(String));
  const selected=[]; const covered=new Set(); let credits=0;
  const pool=courses.map(c=>({...c,skills:[...(c.tags||[]),...(c.skills||[])]}));
  while(true){
    let best=null, bestRatio=-1;
    for(const c of pool){
      if(selected.some(x=>x.id===c.id) || credits+c.credits>creditLimit) continue;
      const gain=c.skills.filter(s=>target.has(s)&&!covered.has(s)).length;
      const ratio=gain/Math.max(1,c.credits);
      if(gain>0 && ratio>bestRatio){best=c;bestRatio=ratio;}
    }
    if(!best) break;
    selected.push(best); credits+=best.credits;
    best.skills.forEach(s=>{if(target.has(s))covered.add(s)});
    if(covered.size>=target.size) break;
  }
  return {selected,usedCredits:credits,coveredSkills:[...covered],coverage:target.size?Math.round(covered.size/target.size*100):0};
}
module.exports={greedyCoverage};
