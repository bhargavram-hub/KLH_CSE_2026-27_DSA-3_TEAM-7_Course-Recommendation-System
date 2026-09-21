// 0/1 Knapsack using dynamic programming.
// Weight = credits; value = multi-factor recommendation score.
function recommendWithinCreditLimit(scoredCourses, creditLimit) {
  const cap = Math.max(0, Math.floor(Number(creditLimit) || 0));
  const n = scoredCourses.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(cap + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const c = scoredCourses[i - 1];
    for (let w = 0; w <= cap; w++) {
      dp[i][w] = dp[i - 1][w];
      if (c.credits <= w) dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - c.credits] + c.score);
    }
  }

  const chosen = [];
  let w = cap;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      chosen.push(scoredCourses[i - 1]);
      w -= scoredCourses[i - 1].credits;
    }
  }
  return chosen.reverse();
}
module.exports = { recommendWithinCreditLimit };
