const API="/api";
let courses=[], completed=JSON.parse(localStorage.getItem("completedCourses")||"[]");
let goal=localStorage.getItem("careerGoal")||"", cat="", timer;
const $=id=>document.getElementById(id);
const esc=s=>{const d=document.createElement("div");d.textContent=String(s??"");return d.innerHTML};
const getJSON=async(url,opt)=>{const r=await fetch(url,opt);if(!r.ok)throw new Error(await r.text());return r.json()};

async function init(){
  try{
    courses=await getJSON(API+"/courses");
    $("heroCourseCount").textContent=courses.length;
    const cats=await getJSON(API+"/categories");
    cats.forEach(x=>{
      const b=document.createElement("button");b.className="chip";b.textContent=x;
      b.onclick=()=>{cat=x;document.querySelectorAll("#categoryChips .chip").forEach(z=>z.classList.remove("active"));b.classList.add("active");search($("searchInput").value)};
      $("categoryChips").appendChild(b);
    });
    renderGoals();renderCompleted();await search("");await analytics();
  }catch(e){$("heroStatus").textContent="OFFLINE";$("searchStatus").textContent="Backend unavailable — run npm install and npm start."}
}

function renderGoals(){
  const gs=[...new Set(courses.flatMap(c=>c.tags||[]))];
  $("goals").innerHTML=gs.map(g=>`<button class="chip ${goal===g?"active":""}" data-g="${esc(g)}">${esc(g)}</button>`).join("");
  $("goals").querySelectorAll("button").forEach(b=>b.onclick=()=>{goal=b.dataset.g;localStorage.setItem("careerGoal",goal);renderGoals()});
}
function renderCompleted(){
  $("completedTags").innerHTML=completed.map(id=>{
    const c=courses.find(x=>x.id===id);
    return `<span class="tag">${esc(c?.title||id)} <button onclick="removeDone('${esc(id)}')">×</button></span>`;
  }).join("");
}
window.removeDone=id=>{completed=completed.filter(x=>x!==id);localStorage.setItem("completedCourses",JSON.stringify(completed));renderCompleted()};

async function search(q){
  $("searchStatus").textContent="Searching…";
  try{
    const u=new URLSearchParams({q:q||""});if(cat)u.set("category",cat);
    const d=await getJSON(API+"/search?"+u);
    $("algorithmBadge").textContent=d.algorithm||"Catalogue";
    $("searchStatus").innerHTML=d.mode==="fuzzy"?`Approximate match for <b>“${esc(q)}”</b>`:q?`${d.results.length} result${d.results.length===1?"":"s"} for “${esc(q)}”`:`Showing all ${d.results.length} courses`;
    $("resultCount").textContent=d.results.length+" results";
    $("searchResults").innerHTML="";
    (d.results||[]).forEach(r=>$("searchResults").appendChild(card(r.course,r.fuzzyScore!=null?r.fuzzyScore*100:r.relevance,q,d.mode)));
  }catch(e){$("searchStatus").textContent="Search service unavailable."}
}
function card(c,score,q,mode){
  const done=completed.includes(c.id),eligible=(c.prerequisites||[]).every(x=>completed.includes(x));
  const div=document.createElement("article");div.className="course";
  div.innerHTML=`<div class="top"><div><small>${esc(c.id)} · ${esc(c.level)}</small><h3>${esc(c.title)}</h3></div><span class="status ${done?"done":eligible?"ok":"lock"}">${done?"COMPLETED":eligible?"ELIGIBLE":"LOCKED"}</span></div>
  <p>${esc(c.description)}</p><div class="tags">${(c.tags||[]).map(t=>`<span>${esc(t)}</span>`).join("")}</div>
  <div class="bottom"><span>${c.credits} credits ${score!=null&&score>0?`· <b>${Math.round(score)}% match</b>`:""}</span><button class="outline">${done?"Completed":eligible?"+ Mark completed":"View path"}</button></div>`;
  div.querySelector("button").onclick=()=>eligible&&!done?
    (completed.push(c.id),localStorage.setItem("completedCourses",JSON.stringify(completed)),renderCompleted(),search($("searchInput").value)):
    openPrereq(c);
  return div;
}
async function openPrereq(c){
  $("modal").hidden=false;$("modalTitle").textContent="Path to unlock: "+c.title;$("modalBody").innerHTML="<p>Tracing prerequisite graph…</p>";
  try{
    const d=await getJSON(`${API}/prerequisites/${c.id}?completed=${encodeURIComponent(completed.join(","))}`);
    $("modalBody").innerHTML=d.missingPrerequisites.length?`<p>Complete these first:</p><ol>${d.missingPrerequisites.map(x=>`<li>${esc(courses.find(z=>z.id===x)?.title||x)}</li>`).join("")}</ol>`:"<p>All prerequisites are satisfied.</p>";
  }catch(e){$("modalBody").innerHTML="<p>Could not load prerequisite path.</p>"}
}

async function recommend(){
  if(!goal){$("pathStatus").textContent="Choose a career goal first.";return}
  $("pathStatus").textContent="Optimizing…";
  try{
    const d=await getJSON(API+"/recommend",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({completedCourses:completed,careerGoal:goal,creditLimit:+$("creditSlider").value})});
    $("pathStatus").innerHTML=`<div class="summary">${d.eligibleCount} eligible · ${d.usedCredits}/${d.creditLimit} credits · <b>${esc(d.algorithm)}</b></div>`;
    $("pathResults").innerHTML="";d.recommended.forEach(c=>$("pathResults").appendChild(card(c,c.score,"","")));
  }catch(e){$("pathStatus").textContent="Recommendation service unavailable."}
}

async function runCO1(){
  $("co1Output").textContent="Running Needleman-Wunsch + branch-and-bound…";
  try{
    const d=await getJSON(API+"/co1",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sequenceA:$("seqA").value,sequenceB:$("seqB").value,creditLimit:12})});
    $("co1Output").innerHTML=`<b>Sequence alignment</b>
Score: ${d.sequence.score}
${esc(d.sequence.alignedA)}
${esc(d.sequence.alignedB)}
Complexity: ${esc(d.sequence.complexity)}

<b>NP-hard scheduling signature</b>
Selected: ${d.schedule.selected.map(c=>esc(c.title)).join(", ")||"none"}
Credits: ${d.schedule.usedCredits} · Value: ${d.schedule.bestValue}
Nodes visited: ${d.schedule.nodesVisited}
Strategy: ${esc(d.schedule.strategy)}
Worst case: ${esc(d.schedule.worstCase)}`;
  }catch(e){$("co1Output").textContent="CO1 demo failed: "+e.message}
}
async function runCO2(){
  $("co2Output").textContent="Running six string-structure modules…";
  try{
    const d=await getJSON(API+"/string-suite",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:$("stringText").value,pattern:$("stringPattern").value})});
    const r=d.results;
    $("co2Output").innerHTML=`<b>Pattern matching</b>
KMP index: ${r.kmpIndex} · Z index: ${r.zIndex} · Rabin-Karp index: ${r.rabinKarpIndex}
Rabin-Karp: ${esc(r.rollingHash)}

<b>Suffix structures</b>
Suffix Array: [${r.suffixArray.join(", ")}]
LCP Array: [${r.lcp.join(", ")}]
Suffix Automaton states: ${r.stateCount}

<b>Complexity</b>
KMP ${d.complexities.kmp} · Z ${d.complexities.z} · Rabin-Karp ${d.complexities.rabinKarp}
Suffix Array ${d.complexities.suffixArray} · LCP ${d.complexities.lcp} · Automaton ${d.complexities.suffixAutomaton}`;
  }catch(e){$("co2Output").textContent="CO2 demo failed: "+e.message}
}
async function runCO3(){
  $("co3Output").textContent="Running interval, bitmask, tree and subset DP…";
  try{
    const d=await getJSON(API+"/dp-suite",{method:"POST",headers:{"Content-Type":"application/json"}});
    $("co3Output").innerHTML=`<b>1. Interval DP — Matrix Chain</b>
Minimum multiplications: ${d.interval.cost}
Optimal order: ${esc(d.interval.parentheses)}
${esc(d.interval.complexity)}

<b>2. Bitmask DP — Assignment</b>
Minimum cost: ${d.bitmask.minCost}
Assignment: ${d.bitmask.assignment.map(x=>`worker ${x.worker+1}→job ${x.job+1}`).join(", ")}
${esc(d.bitmask.complexity)}

<b>3. DP on Trees — Maximum Independent Set</b>
Maximum value: ${d.tree.maxValue}
Root included: ${d.tree.rootIncluded} · Root excluded: ${d.tree.rootExcluded}
${esc(d.tree.complexity)}

<b>4. DP on Subsets — Set Cover</b>
Minimum sets: ${d.subset.minSets}
Chosen set IDs: ${d.subset.chosenSets.map(x=>x+1).join(", ")}
${esc(d.subset.complexity)}

<b>Extra classic subset DP — Held-Karp TSP</b>
Tour cost: ${d.heldKarp.cost} · Path: ${d.heldKarp.path.join(" → ")}
${esc(d.heldKarp.complexity)}`;
  }catch(e){$("co3Output").textContent="CO3 demo failed: "+e.message}
}
async function runCO4(){
  $("co4Output").textContent="Building eligibility graph + max-flow network…";
  try{
    const name=$("studentName").value||"Student A",g=$("studentGoal").value;
    const body={students:[{id:"S1",name,interests:[g],completedCourses:completed}],courseCapacity:{}};
    const d=await getJSON(API+"/matching",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const a=d.assignments[0];
    $("co4Output").innerHTML=`<b>Bipartite matching</b>
Student: ${esc(name)} · Interest: ${esc(g)}
Eligible course nodes: ${d.students[0]?.eligibleCourses.length||0}
Maximum matching: ${d.bipartite.size}
Assignment: ${a?esc(a.courseTitle):"No assignment"}

<b>Network flow</b>
Maximum flow: ${d.maxFlow.maxAssignments}
Source → Student → Course → Capacity → Sink
Algorithm: Edmonds-Karp (Ford-Fulkerson family)`;
  }catch(e){$("co4Output").textContent="CO4 demo failed: "+e.message}
}
async function runCO5(){
  $("co5Output").textContent="Generating reduction + approximation certificate…";
  try{
    const d=await getJSON(API+"/co5",{method:"POST",headers:{"Content-Type":"application/json"}});
    $("co5Output").innerHTML=`<b>3-SAT → Vertex Cover</b>
Variables: ${d.reduction.variableCount} · Clauses: ${d.reduction.clauseCount}
Graph nodes: ${d.reduction.nodeCount} · edges: ${d.reduction.edgeCount}
Target cover k = ${d.reduction.coverSize}
Reduction rule: n + 2m

<b>2-Approximation for Vertex Cover</b>
Maximal matching edges: ${d.approximation.matching.map(e=>`(${esc(e[0])},${esc(e[1])})`).join(" ")}
Approximate cover: ${d.approximation.cover.map(esc).join(", ")}
Cover size: ${d.approximation.coverSize}
Guarantee: ${esc(d.approximation.guarantee)}`;
  }catch(e){$("co5Output").textContent="CO5 demo failed: "+e.message}
}
async function runCO6(){
  $("co6Output").textContent="Running randomized and parallel modules…";
  try{
    const d=await getJSON(API+"/co6",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({number:+$("primeInput").value,values:[9,3,7,1,8,2,6,4,5]})});
    const p=await getJSON(API+"/parallel",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({workers:+$("workerCount").value,values:[1,2,3,4,5,6,7,8,9,10,11,12]})});
    $("co6Output").innerHTML=`<b>Las Vegas — Randomized Quicksort</b>
Sorted: [${d.lasVegas.sorted.join(", ")}]
Correctness guaranteed: ${d.lasVegas.correct} · Expected ${d.lasVegas.expectedTime}

<b>Monte Carlo — Miller-Rabin</b>
${esc($("primeInput").value)} is ${d.monteCarlo.prime?"probably prime":"composite"} · rounds: ${d.monteCarlo.rounds||"-"}

<b>Parallel Reduce</b>
Sum: ${p.reduce.sum} · workers: ${p.reduce.workers}
Partial sums: [${p.reduce.partialSums.join(", ")}] · span: ${esc(p.reduce.span)}

<b>Parallel Prefix Scan</b>
Prefix: [${p.prefix.prefix.join(", ")}]
Work: ${esc(p.prefix.work)} · Span: ${esc(p.prefix.span)}`;
  }catch(e){$("co6Output").textContent="CO6 demo failed: "+e.message}
}
async function analytics(){
  const d=await getJSON(API+"/analytics");
  // Project metrics are intentionally simple and explainable in viva.
}

$("searchInput").oninput=()=>{const q=$("searchInput").value;$("clear").hidden=!q;clearTimeout(timer);timer=setTimeout(()=>search(q),220)};
$("clear").onclick=()=>{$("searchInput").value="";$("clear").hidden=true;search("")};
document.onkeydown=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("searchInput").focus()}};
$("closeModal").onclick=()=>$("modal").hidden=true;$("modal").onclick=e=>{if(e.target.id==="modal")$("modal").hidden=true};
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("tab-"+b.dataset.tab).classList.add("active")});
$("creditSlider").oninput=()=>{$("creditValue").textContent=$("creditSlider").value};
$("completedSearch").oninput=()=>{const q=$("completedSearch").value.toLowerCase();$("suggestions").innerHTML=q?courses.filter(c=>!completed.includes(c.id)&&(`${c.id} ${c.title}`).toLowerCase().includes(q)).slice(0,6).map(c=>`<button onclick="addDone('${esc(c.id)}')">${esc(c.id)} — ${esc(c.title)}</button>`).join(""):""};
window.addDone=id=>{if(!completed.includes(id))completed.push(id);localStorage.setItem("completedCourses",JSON.stringify(completed));$("completedSearch").value="";$("suggestions").innerHTML="";renderCompleted()};
$("recommendBtn").onclick=recommend;
$("runCO1").onclick=runCO1;$("runCO2").onclick=runCO2;$("runCO3").onclick=runCO3;$("runMatch").onclick=runCO4;$("runCO5").onclick=runCO5;$("runCO6").onclick=runCO6;
init();
