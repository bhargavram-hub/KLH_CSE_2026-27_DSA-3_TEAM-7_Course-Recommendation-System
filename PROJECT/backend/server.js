const express = require("express");
const cors = require("cors");
const path = require("path");
const { readJSON, writeJSON, appendJSON } = require("./utils/fileStore");
const { searchCourses, kmpSearch, zSearch, rabinKarpSearch } = require("./algorithms/stringSearch");
const { suffixArray, lcpArray, suffixAutomaton } = require("./algorithms/suffixStructures");
const { sequenceAlignment, scheduleCourses } = require("./algorithms/co1");
const { intervalDP, bitmaskAssignment, treeIndependentSet, subsetDP, heldKarp } = require("./algorithms/advancedDP");
const { threeSATtoVertexCover, vertexCover2Approx } = require("./algorithms/co5");
const { randomizedQuickSort, isProbablePrime } = require("./algorithms/co6");
const { parallelReduce, parallelPrefix } = require("./algorithms/parallel");
const { fuzzySearchCourses } = require("./algorithms/editDistance");
const { isEligible, getMissingPrerequisiteChain } = require("./algorithms/prerequisites");
const { recommendWithinCreditLimit } = require("./algorithms/knapsack");
const { maximumBipartiteMatching } = require("./algorithms/bipartite");
const { buildCourseAllocation } = require("./algorithms/maxFlow");
const { greedyCoverage } = require("./algorithms/approximation");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));
const PORT = process.env.PORT || 5000;
const getCourses = () => readJSON("courses.json");

app.get("/api/health", (_, res) => res.json({ status: "ok", service: "Course Recommendation API" }));
app.get("/api/courses", (_, res) => res.json(getCourses()));
app.get("/api/categories", (_, res) => {
  const tags = new Set();
  getCourses().forEach(c => (c.tags || []).forEach(t => tags.add(t)));
  res.json([...tags].sort());
});

app.get("/api/search", (req, res) => {
  const q = String(req.query.q || "").trim();
  const category = String(req.query.category || "").trim();
  let courses = getCourses();
  if (category) courses = courses.filter(c => c.tags.includes(category));

  if (!q) return res.json({ mode: "browse", algorithm: "catalogue", results: courses.map(course => ({ course })) });

  let results = searchCourses(courses, q);
  let mode = "pattern";
  let algorithm = "KMP + Z-Function + Rabin-Karp";

  if (!results.length || results[0].relevance < 35) {
    results = fuzzySearchCourses(courses, q);
    mode = "fuzzy";
    algorithm = "Wagner-Fischer Edit Distance + token similarity";
  }

  appendJSON("search_log.json", { query: q, category: category || null, mode, resultCount: results.length, timestamp: new Date().toISOString() });
  res.json({ mode, algorithm, results });
});

app.post("/api/co1", (req,res)=>{
  const sequence=sequenceAlignment(req.body.sequenceA||"COURSE",req.body.sequenceB||"SOURCE");
  const source=(req.body.schedule||getCourses().slice(0,8)).map((c,i)=>({...c,value:Number(c.value||((c.tags||[]).length*5+10-i))}));
  const schedule=scheduleCourses(source,Number(req.body.creditLimit)||12);
  res.json({co:"CO1",problemClasses:[
    {name:"Substring search",algorithm:"KMP / Z / Rabin-Karp",status:"implemented"},
    {name:"Sequence alignment",algorithm:"Needleman-Wunsch",status:"implemented"},
    {name:"Flow on a network",algorithm:"Edmonds-Karp",status:"implemented"},
    {name:"NP-hard scheduling",algorithm:"Branch-and-bound exact search",status:"implemented"}],
    sequence,schedule});
});

app.post("/api/string-suite",(req,res)=>{
  const text=String(req.body.text||"COURSEMATCH");
  const pattern=String(req.body.pattern||"COURSE");
  const sa=suffixArray(text), lcp=lcpArray(text,sa);
  res.json({co:"CO2",pattern,results:{
    kmpIndex:kmpSearch(text,pattern),zIndex:zSearch(text,pattern),rabinKarpIndex:rabinKarpSearch(text,pattern),
    rollingHash:"Rabin-Karp rolling hash",suffixArray:sa,lcp,stateCount:suffixAutomaton(text).states,
    suffixAutomaton:suffixAutomaton(text)
  },complexities:{kmp:"O(n+m)",z:"O(n+m)",rabinKarp:"Expected O(n+m)",suffixArray:"O(n log² n) in this implementation",lcp:"O(n)",suffixAutomaton:"O(n)"}});
});

app.post("/api/dp-suite",(req,res)=>{
  const dims=req.body.dims||[10,30,5,60,20];
  const cost=req.body.cost||[[9,2,7],[6,4,3],[5,8,1]];
  const tree=req.body.tree||[[1,2],[0,3,4],[0],[1],[1]];
  const weights=req.body.weights||[4,3,5,2,6];
  const sets=req.body.sets||[[0,1],[1,2],[2,3],[0,3]];
  const universeSize=Number(req.body.universeSize)||4;
  const dist=req.body.dist||[[0,10,15,20],[10,0,35,25],[15,35,0,30],[20,25,30,0]];
  res.json({co:"CO3",interval:intervalDP(dims),bitmask:bitmaskAssignment(cost),tree:treeIndependentSet(tree,weights),subset:subsetDP(sets,universeSize),heldKarp:heldKarp(dist)});
});

app.post("/api/co5",(req,res)=>{
  const variables=req.body.variables||["x1","x2","x3"];
  const clauses=req.body.clauses||[["x1","!x2","x3"],["!x1","x2","x3"]];
  const edges=req.body.edges||[["A","B"],["A","C"],["B","D"],["C","D"],["D","E"]];
  const reduction=threeSATtoVertexCover(variables,clauses);
  const approximation=vertexCover2Approx(edges);
  res.json({co:"CO5",reduction,approximation});
});

app.post("/api/co6",(req,res)=>{
  const values=req.body.values||[9,3,7,1,8,2,6,4,5];
  const prime=req.body.number||7919;
  res.json({co:"CO6",lasVegas:randomizedQuickSort(values),monteCarlo:isProbablePrime(prime,8)});
});

app.post("/api/parallel",async(req,res)=>{
  try{
    const values=req.body.values||Array.from({length:20},(_,i)=>i+1), workers=Number(req.body.workers)||4;
    const reduce=await parallelReduce(values,workers), prefix=await parallelPrefix(values,workers);
    res.json({co:"CO6",reduce,prefix});
  }catch(e){res.status(500).json({error:e.message});}
});

app.get("/api/prerequisites/:id", (req, res) => {
  const completedCourses = String(req.query.completed || "").split(",").filter(Boolean);
  const chain = getMissingPrerequisiteChain(req.params.id, getCourses(), completedCourses);
  res.json({ courseId: req.params.id, missingPrerequisites: chain });
});

app.post("/api/recommend", (req, res) => {
  const { completedCourses = [], careerGoal = "", interests = [], creditLimit = 12 } = req.body;
  const courses = getCourses();
  const completed = new Set(completedCourses);
  const interestSet = new Set([careerGoal, ...interests].filter(Boolean).map(String));

  const eligible = courses.filter(c => !completed.has(c.id) && isEligible(c, completedCourses));
  const locked = courses.filter(c => !completed.has(c.id) && !isEligible(c, completedCourses));

  const scored = eligible.map(c => {
    const goalMatches = c.tags.filter(t => interestSet.has(t)).length;
    const prerequisiteDepth = c.prerequisites.length;
    const score = 4 + goalMatches * 8 + (c.level === "Intermediate" ? 2 : c.level === "Advanced" ? 3 : 1) + Math.min(prerequisiteDepth, 2);
    return { ...c, score };
  });

  const bestSet = recommendWithinCreditLimit(scored, creditLimit);
  res.json({
    eligibleCount: eligible.length,
    lockedCount: locked.length,
    creditLimit: Number(creditLimit) || 0,
    usedCredits: bestSet.reduce((sum, c) => sum + c.credits, 0),
    algorithm: "Prerequisite graph + Dynamic Programming (0/1 Knapsack)",
    recommended: bestSet
  });
});

app.post("/api/matching", (req, res) => {
  const courses = getCourses();
  const students = Array.isArray(req.body.students) ? req.body.students : [];
  const courseCapacity = req.body.courseCapacity || {};
  const graph = {};
  students.forEach(s => {
    const interests = new Set((s.interests || []).map(String));
    const completed = new Set(s.completedCourses || []);
    graph[s.id] = courses.filter(c => !completed.has(c.id) && c.tags.some(t => interests.has(t)) && isEligible(c, s.completedCourses || [])).map(c => c.id);
  });
  const matching = maximumBipartiteMatching(graph);
  const flow = buildCourseAllocation(courses, graph, courseCapacity);
  const byId = new Map(courses.map(c=>[c.id,c]));
  res.json({
    algorithm: "Bipartite Matching + Edmonds-Karp Max Flow",
    students: students.map(s=>({id:s.id,name:s.name||s.id,eligibleCourses:graph[s.id]||[]})),
    bipartite: matching,
    maxFlow: flow,
    assignments: flow.matches.map(m=>({...m,studentName:(students.find(s=>s.id===m.studentId)||{}).name||m.studentId,courseTitle:(byId.get(m.courseId)||{}).title||m.courseId}))
  });
});

app.post("/api/approximate", (req, res) => {
  const courses=getCourses();
  const eligible=courses.filter(c=>isEligible(c,req.body.completedCourses||[]) && !(req.body.completedCourses||[]).includes(c.id));
  const targetSkills=[...(req.body.interests||[]), req.body.careerGoal].filter(Boolean);
  const result=greedyCoverage(eligible, Number(req.body.creditLimit)||12, targetSkills);
  res.json({algorithm:"Greedy Coverage Approximation",targetSkills, ...result});
});

app.get("/api/analytics", (_,res)=>{
  const courses=getCourses();
  const tags={}; courses.forEach(c=>(c.tags||[]).forEach(t=>tags[t]=(tags[t]||0)+1));
  res.json({courseCount:courses.length,domains:Object.entries(tags).sort((a,b)=>b[1]-a[1]),levels:{Beginner:courses.filter(c=>c.level==='Beginner').length,Intermediate:courses.filter(c=>c.level==='Intermediate').length,Advanced:courses.filter(c=>c.level==='Advanced').length},averageCredits:Number((courses.reduce((a,c)=>a+c.credits,0)/courses.length).toFixed(2))});
});

app.post("/api/students", (req, res) => {
  const { id, name, completedCourses = [], careerGoal = "" } = req.body;
  if (!id) return res.status(400).json({ error: "Student id is required" });
  const students = readJSON("students.json");
  const record = { id, name, completedCourses, careerGoal, updatedAt: new Date().toISOString() };
  const idx = students.findIndex(s => s.id === id);
  if (idx >= 0) students[idx] = record; else students.push(record);
  writeJSON("students.json", students);
  res.json(record);
});

app.get("/api/students/:id", (req, res) => {
  const student = readJSON("students.json").find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student);
});

app.get("*", (req, res) => {
  if (!req.path.startsWith("/api/")) res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.listen(PORT, () => console.log(`Course Recommendation System running at http://localhost:${PORT}`));
