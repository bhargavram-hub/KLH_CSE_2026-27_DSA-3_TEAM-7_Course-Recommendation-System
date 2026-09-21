// CO1: problem-class signatures.
// 1) Needleman-Wunsch global sequence alignment: O(n*m).
// 2) Branch-and-bound course scheduling: exponential worst-case (NP-hard model),
//    with pruning by credit capacity and upper-bound score.

function sequenceAlignment(a, b, match=2, mismatch=-1, gap=-2) {
  a=String(a||""); b=String(b||"");
  const n=a.length, m=b.length;
  const dp=Array.from({length:n+1},()=>Array(m+1).fill(0));
  for(let i=1;i<=n;i++) dp[i][0]=dp[i-1][0]+gap;
  for(let j=1;j<=m;j++) dp[0][j]=dp[0][j-1]+gap;
  for(let i=1;i<=n;i++){
    for(let j=1;j<=m;j++){
      dp[i][j]=Math.max(
        dp[i-1][j-1]+(a[i-1]===b[j-1]?match:mismatch),
        dp[i-1][j]+gap,
        dp[i][j-1]+gap
      );
    }
  }
  let i=n,j=m,alA="",alB="";
  while(i>0||j>0){
    if(i>0&&j>0&&dp[i][j]===dp[i-1][j-1]+(a[i-1]===b[j-1]?match:mismatch)){
      alA=a[i-1]+alA; alB=b[j-1]+alB; i--;j--;
    } else if(i>0&&dp[i][j]===dp[i-1][j]+gap){
      alA=a[i-1]+alA; alB="-"+alB; i--;
    } else {
      alA="-"+alA; alB=b[j-1]+alB; j--;
    }
  }
  return {score:dp[n][m],alignedA:alA,alignedB:alB,complexity:`O(${n}×${m})`};
}

function scheduleCourses(courses, creditLimit) {
  const items=courses.map(c=>({...c, credits:Number(c.credits)||1, value:Number(c.value??c.score??1)||1}));
  const n=items.length, cap=Math.max(0,Math.floor(Number(creditLimit)||0));
  let best={value:0,credits:0,selected:[]}, nodes=0;
  const suffix=Array(n+1).fill(0);
  for(let i=n-1;i>=0;i--) suffix[i]=suffix[i+1]+items[i].value;
  function dfs(i,credits,value,selected){
    nodes++;
    if(i===n){if(value>best.value) best={value,credits,selected:[...selected]};return;}
    if(value+suffix[i]<=best.value) return;
    const c=items[i];
    if(credits+c.credits<=cap){
      selected.push(c); dfs(i+1,credits+c.credits,value+c.value,selected); selected.pop();
    }
    dfs(i+1,credits,value,selected);
  }
  dfs(0,0,0,[]);
  return {bestValue:best.value,usedCredits:best.credits,selected:best.selected,nodesVisited:nodes,
    worstCase:`O(2^n)`,strategy:"Branch-and-bound exact search with capacity pruning"};
}

module.exports={sequenceAlignment,scheduleCourses};
