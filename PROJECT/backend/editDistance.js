// Wagner-Fischer dynamic programming edit distance: O(n*m) time and O(n*m) space.
// The fuzzy matcher works at token and title level so multi-word typos are handled.

function normalize(s) { return String(s ?? "").toLowerCase().trim(); }

function editDistance(a, b) {
  a = normalize(a); b = normalize(b);
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  if (a.length > b.length) [a, b] = [b, a];

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[b.length];
}

function similarity(a, b) {
  const max = Math.max(normalize(a).length, normalize(b).length);
  return max === 0 ? 1 : 1 - editDistance(a, b) / max;
}

function tokens(text) {
  return normalize(text).split(/[^a-z0-9+#.]+/).filter(Boolean);
}

function bestTokenSimilarity(queryTokens, fieldTokens) {
  if (!queryTokens.length || !fieldTokens.length) return 0;
  return queryTokens.reduce((sum, q) => {
    let best = 0;
    for (const f of fieldTokens) best = Math.max(best, similarity(q, f));
    return sum + best;
  }, 0) / queryTokens.length;
}

function fuzzySearchCourses(courses, query, threshold = 0.56) {
  const q = normalize(query);
  const qTokens = tokens(q);
  if (!q) return [];

  return courses.map(course => {
    const titleScore = similarity(q, course.title);
    const titleTokenScore = bestTokenSimilarity(qTokens, tokens(course.title));
    const tagScore = bestTokenSimilarity(qTokens, course.tags.flatMap(tokens));
    const descScore = bestTokenSimilarity(qTokens, tokens(course.description));
    const score = titleScore * 0.55 + titleTokenScore * 0.25 + tagScore * 0.12 + descScore * 0.08;
    return { course, fuzzyScore: Number(score.toFixed(4)), distance: editDistance(q, course.title) };
  })
    .filter(r => r.fuzzyScore >= threshold)
    .sort((a, b) => b.fuzzyScore - a.fuzzyScore)
    .slice(0, 12);
}

module.exports = { editDistance, fuzzySearchCourses, similarity };
