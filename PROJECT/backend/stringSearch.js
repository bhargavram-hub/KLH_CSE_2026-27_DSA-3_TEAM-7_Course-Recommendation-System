// String matching algorithms used by the Course Recommendation System.
// KMP: O(n + m) deterministic substring search.
// Z-Function: O(n + m) pattern search using a Z-array.
// Rabin-Karp: expected O(n + m) rolling-hash search.

function normalize(text) {
  return String(text ?? "").toLowerCase().trim();
}

function buildFailureFunction(pattern) {
  const lps = new Array(pattern.length).fill(0);
  let len = 0;
  for (let i = 1; i < pattern.length;) {
    if (pattern[i] === pattern[len]) lps[i++] = ++len;
    else if (len) len = lps[len - 1];
    else lps[i++] = 0;
  }
  return lps;
}

function kmpSearch(text, pattern) {
  const t = normalize(text), p = normalize(pattern);
  if (!p) return -1;
  const lps = buildFailureFunction(p);
  let i = 0, j = 0;
  while (i < t.length) {
    if (t[i] === p[j]) {
      i++; j++;
      if (j === p.length) return i - j;
    } else if (j) j = lps[j - 1];
    else i++;
  }
  return -1;
}

function zArray(s) {
  const z = new Array(s.length).fill(0);
  let l = 0, r = 0;
  for (let i = 1; i < s.length; i++) {
    if (i <= r) z[i] = Math.min(r - i + 1, z[i - l]);
    while (i + z[i] < s.length && s[z[i]] === s[i + z[i]]) z[i]++;
    if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
  }
  return z;
}

function zSearch(text, pattern) {
  const t = normalize(text), p = normalize(pattern);
  if (!p) return -1;
  const z = zArray(`${p}\u0000${t}`);
  for (let i = p.length + 1; i < z.length; i++) {
    if (z[i] >= p.length) return i - p.length - 1;
  }
  return -1;
}

function rabinKarpSearch(text, pattern) {
  const t = normalize(text), p = normalize(pattern);
  const n = t.length, m = p.length;
  if (!m || m > n) return -1;
  const BASE = 257, MOD = 1000000007;
  let ph = 0, wh = 0, high = 1;
  for (let i = 0; i < m - 1; i++) high = (high * BASE) % MOD;
  for (let i = 0; i < m; i++) {
    ph = (ph * BASE + p.charCodeAt(i)) % MOD;
    wh = (wh * BASE + t.charCodeAt(i)) % MOD;
  }
  for (let i = 0; i <= n - m; i++) {
    if (ph === wh && t.slice(i, i + m) === p) return i;
    if (i < n - m) {
      wh = (BASE * (wh - t.charCodeAt(i) * high) + t.charCodeAt(i + m)) % MOD;
      if (wh < 0) wh += MOD;
    }
  }
  return -1;
}

function tokenize(text) {
  return normalize(text).split(/[^a-z0-9+#.]+/).filter(Boolean);
}

function searchCourses(courses, query) {
  const q = normalize(query);
  const queryTokens = tokenize(q);
  if (!q) return courses.map(course => ({ course, relevance: 0, matchType: "browse" }));

  return courses.map(course => {
    const title = normalize(course.title);
    const desc = normalize(course.description);
    const tags = course.tags.map(normalize);
    const id = normalize(course.id);
    const titleIdx = kmpSearch(title, q);
    const zTitleIdx = zSearch(title, q);
    const descIdx = rabinKarpSearch(desc, q);
    const tagHit = tags.some(t => kmpSearch(t, q) !== -1);
    const idHit = kmpSearch(id, q) !== -1;
    const tokenHits = queryTokens.filter(token =>
      kmpSearch(title, token) !== -1 || tags.some(t => kmpSearch(t, token) !== -1) || kmpSearch(desc, token) !== -1
    ).length;

    let relevance = 0;
    if (titleIdx !== -1) relevance += 100;
    else if (zTitleIdx !== -1) relevance += 95;
    if (idHit) relevance += 80;
    if (tagHit) relevance += 55;
    if (descIdx !== -1) relevance += 35;
    relevance += tokenHits * 18;

    return {
      course,
      titleMatch: titleIdx,
      descMatch: descIdx,
      tagMatch: tagHit,
      tokenHits,
      relevance,
      matchType: titleIdx !== -1 ? "KMP" : descIdx !== -1 ? "Rabin-Karp" : tagHit ? "KMP" : "token"
    };
  }).filter(r => r.relevance > 0).sort((a, b) => b.relevance - a.relevance);
}

module.exports = { kmpSearch, zSearch, rabinKarpSearch, searchCourses, tokenize };
