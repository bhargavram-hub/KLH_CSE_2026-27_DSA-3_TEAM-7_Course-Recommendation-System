function buildCourseMap(courses) {
  const map = new Map();
  courses.forEach((c) => map.set(c.id, c));
  return map;
}

// A student is eligible for a course only if every prerequisite is completed.
function isEligible(course, completedCourses) {
  const completedSet = new Set(completedCourses);
  return course.prerequisites.every((p) => completedSet.has(p));
}

// DFS over the prerequisite graph to compute every course still needed,
// in the order they must be taken, to eventually unlock the target course.
function getMissingPrerequisiteChain(courseId, courses, completedCourses) {
  const map = buildCourseMap(courses);
  const completedSet = new Set(completedCourses);
  const visited = new Set();
  const chain = [];

  function dfs(id) {
    if (visited.has(id) || completedSet.has(id)) return;
    visited.add(id);
    const course = map.get(id);
    if (!course) return;
    course.prerequisites.forEach(dfs);
    chain.push(id);
  }

  const target = map.get(courseId);
  if (target) target.prerequisites.forEach(dfs);
  return chain;
}

module.exports = { isEligible, getMissingPrerequisiteChain, buildCourseMap };