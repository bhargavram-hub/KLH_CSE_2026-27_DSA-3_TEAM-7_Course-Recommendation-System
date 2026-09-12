const API_BASE = "/api";
let allCourses = [];
let completedCourses = JSON.parse(localStorage.getItem("completedCourses") || "[]");
let careerGoal = localStorage.getItem("careerGoal") || "";
let activeCategory = "";
let searchAbortController = null;
let searchDebounceTimer = null;
const $ = id => document.getElementById(id);

function persistState(){localStorage.setItem("completedCourses",JSON.stringify(completedCourses));localStorage.setItem("careerGoal",careerGoal)}
function escapeHtml(str){const d=document.createElement("div");d.textContent=String(str??"");return d.innerHTML}
function escapeRegExp(str){return str.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}
function highlight(text,query){const safe=escapeHtml(text);if(!query)return safe;const q=escapeRegExp(escapeHtml(query));try{return safe.replace(new RegExp(`(${q})`,"ig"),"<mark>$1</mark>")}catch{return safe}}

async function init(){
  try{
    const [courseRes,catRes]=await Promise.all([fetch(`${API_BASE}/courses`),fetch(`${API_BASE}/categories`)]);
    if(!courseRes.ok)throw new Error("Course API unavailable");
    allCourses=await courseRes.json();
    const categories=await catRes.json();
    renderCategories(categories);renderCareerGoalChips();renderCompletedTags();
    await runSearch("");
  }catch(e){$("searchStatus").textContent="Unable to connect to the recommendation engine. Start the backend on port 5000."}
}

function renderCategories(categories){
  const box=$("categoryChips");
  categories.forEach(cat=>{const b=document.createElement("button");b.className="chip";b.textContent=cat;b.dataset.category=cat;b.onclick=()=>{activeCategory=cat;document.querySelectorAll("#categoryChips .chip").forEach(x=>x.classList.remove("active"));b.classList.add("active");runSearch($("searchInput").value.trim())};box.appendChild(b)});
  box.querySelector('[data-category=""]').onclick=()=>{activeCategory="";box.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));box.querySelector('[data-category=""]').classList.add("active");runSearch($("searchInput").value.trim())};
}

function renderCareerGoalChips(){
  const box=$("careerGoalChips");const goals=[...new Set(allCourses.flatMap(c=>c.tags))].sort();
  goals.forEach(goal=>{const b=document.createElement("button");b.className=`chip ${careerGoal===goal?"active":""}`;b.textContent=goal;b.onclick=()=>{careerGoal=goal;persistState();box.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));b.classList.add("active")};box.appendChild(b)})
}

async function runSearch(query){
  if(searchAbortController)searchAbortController.abort();searchAbortController=new AbortController();
  $("searchStatus").textContent="Searching…";$("algorithmBadge").textContent="Running matching algorithms";
  try{
    const p=new URLSearchParams({q:query});if(activeCategory)p.set("category",activeCategory);
    const res=await fetch(`${API_BASE}/search?${p}`,{signal:searchAbortController.signal});const data=await res.json();
    const results=data.results||[];
    if(data.mode==="fuzzy"){$("searchStatus").innerHTML=`No strong pattern match for <b>“${escapeHtml(query)}”</b> — closest results are ranked by fuzzy similarity.`;$("algorithmBadge").textContent="Wagner-Fischer + token similarity"}
    else{$("searchStatus").textContent=query?`${results.length} result${results.length===1?"":"s"} found for “${query}”`:`Showing all ${results.length} courses`;$("algorithmBadge").textContent=data.algorithm||"KMP + Z-Function + Rabin-Karp"}
    $("resultCount").textContent=`${results.length} courses`;$("resultsTitle").textContent=query?"Search results":"Course catalogue";renderResults(results,$("searchResults"),query)
  }catch(e){if(e.name!=="AbortError")$("searchStatus").textContent="Search service unavailable."}
}

function renderResults(matches,container,query){container.innerHTML="";if(!matches.length){container.innerHTML='<div class="empty-state"><div class="big">⌁</div><p>No courses matched. Try a broader keyword or check the spelling.</p></div>';return}matches.forEach(m=>container.appendChild(buildCourseCard(m.course,query,m)))}

function buildCourseCard(course,query,meta={}){
  const eligible=isEligible(course),done=completedCourses.includes(course.id);const card=document.createElement("article");card.className="course-card";
  const badge=done?'<span class="badge completed">Completed</span>':eligible?'<span class="badge eligible">Eligible</span>':`<span class="badge locked" data-course-id="${escapeHtml(course.id)}">Prerequisites</span>`;
  const score=meta.fuzzyScore!=null?`<span class="result-score">${Math.round(meta.fuzzyScore*100)}% match</span>`:"";
  card.innerHTML=`<div class="course-card-top"><div><div class="course-id">${escapeHtml(course.id)} · ${escapeHtml(course.level)}</div><div class="course-title">${highlight(course.title,query)}</div></div>${badge}</div><p class="course-desc">${highlight(course.description,query)}</p><div class="tag-row">${course.tags.map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</div><div class="course-footer"><span class="credits-pill">${course.credits} credits ${score}</span><button class="add-btn" ${done?"disabled":""}>${done?"Completed":"+ Mark completed"}</button></div>`;
  card.querySelector(".add-btn").onclick=()=>{if(!completedCourses.includes(course.id)){completedCourses.push(course.id);persistState();refreshAllViews()}};
  const locked=card.querySelector(".locked");if(locked)locked.onclick=()=>openPrereqModal(course.id,course.title);return card;
}
function isEligible(course){return (course.prerequisites||[]).every(p=>completedCourses.includes(p))}

$("searchInput").addEventListener("input",()=>{const q=$("searchInput").value.trim();$("clearSearch").hidden=!q;clearTimeout(searchDebounceTimer);searchDebounceTimer=setTimeout(()=>runSearch(q),220)});
$("clearSearch").onclick=()=>{$("searchInput").value="";$("clearSearch").hidden=true;runSearch("")};
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("searchInput").focus()}});
document.querySelectorAll(".tab-btn").forEach(btn=>btn.onclick=()=>{document.querySelectorAll(".tab-btn").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".tab-panel").forEach(x=>x.classList.remove("active"));btn.classList.add("active");$("tab-"+btn.dataset.tab).classList.add("active")});

$("completedSearch").addEventListener("input",()=>{const q=$("completedSearch").value.trim().toLowerCase();const box=$("completedSuggestions");box.innerHTML="";if(!q)return;allCourses.filter(c=>!completedCourses.includes(c.id)).filter(c=>`${c.id} ${c.title}`.toLowerCase().includes(q)).slice(0,7).forEach(c=>{const x=document.createElement("div");x.className="suggestion-item";x.textContent=`${c.id} — ${c.title}`;x.onclick=()=>{completedCourses.push(c.id);persistState();$("completedSearch").value="";box.innerHTML="";renderCompletedTags()};box.appendChild(x)})});
function renderCompletedTags(){const box=$("completedTags");box.innerHTML="";completedCourses.forEach(id=>{const c=allCourses.find(x=>x.id===id);const p=document.createElement("span");p.className="tag-pill";p.innerHTML=`${escapeHtml(c?c.id:id)} <button aria-label="Remove">×</button>`;p.querySelector("button").onclick=()=>{completedCourses=completedCourses.filter(x=>x!==id);persistState();refreshAllViews()};box.appendChild(p)})}

const slider=$("creditLimitSlider");slider.oninput=()=>$("creditLimitValue").textContent=slider.value;
$("recommendBtn").onclick=async()=>{const status=$("recommendStatus"),results=$("recommendResults");if(!careerGoal){status.textContent="Choose a career goal to personalize your learning path.";return}status.textContent="Optimizing your course set…";results.innerHTML="";try{const res=await fetch(`${API_BASE}/recommend`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({completedCourses,careerGoal,creditLimit:Number(slider.value)})});const data=await res.json();status.innerHTML=`<div class="summary-bar"><span>Eligible now: <b>${data.eligibleCount}</b></span><span>Credits: <b>${data.usedCredits}/${data.creditLimit}</b></span><span>Recommended: <b>${data.recommended.length}</b></span><span>${escapeHtml(data.algorithm||"DP")}</span></div>`;if(!data.recommended.length){results.innerHTML='<div class="empty-state"><div class="big">⌁</div><p>No eligible set fits this credit limit. Complete prerequisites or increase the limit.</p></div>';return}data.recommended.forEach(c=>results.appendChild(buildCourseCard(c,"")))}catch(e){status.textContent="Recommendation service unavailable."}};

async function openPrereqModal(courseId,title){const modal=$("prereqModal");$("modalTitle").textContent=`Path to unlock: ${title}`;$("modalBody").innerHTML="<p>Tracing prerequisite graph…</p>";modal.hidden=false;try{const p=new URLSearchParams({completed:completedCourses.join(",")});const data=await(await fetch(`${API_BASE}/prerequisites/${encodeURIComponent(courseId)}?${p}`)).json();if(!data.missingPrerequisites.length){$("modalBody").innerHTML="<p>You already meet every prerequisite for this course.</p>";return}$("modalBody").innerHTML=`<p>Complete these courses first, in order:</p><ol>${data.missingPrerequisites.map(id=>{const c=allCourses.find(x=>x.id===id);return `<li>${escapeHtml(c?`${c.id} — ${c.title}`:id)}</li>`}).join("")}</ol>`}catch{$("modalBody").innerHTML="<p>Could not load the prerequisite path.</p>"}}
$("closeModal").onclick=()=>$("prereqModal").hidden=true;$("prereqModal").onclick=e=>{if(e.target.id==="prereqModal")e.currentTarget.hidden=true};
function refreshAllViews(){renderCompletedTags();runSearch($("searchInput").value.trim())}
init();
