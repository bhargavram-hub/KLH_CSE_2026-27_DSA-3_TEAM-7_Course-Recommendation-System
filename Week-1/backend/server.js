const express = require("express");
const cors = require("cors");
const path = require("path");
const { readJSON, writeJSON, appendJSON } = require("./utils/fileStore");
const { searchCourses } = require("./algorithms/stringSearch");
const { fuzzySearchCourses } = require("./algorithms/editDistance");
const { isEligible, getMissingPrerequisiteChain } = require("./algorithms/prerequisites");
const { recommendWithinCreditLimit } = require("./algorithms/knapsack");

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
