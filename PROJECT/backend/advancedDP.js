// CO3: advanced dynamic-programming patterns.

function intervalDP(dims){
  const p=dims.map(Number), n=p.length-1;
  if(n<=0) return {cost:0,parentheses:"",table:[]};
  const dp=Array.from({length:n},()=>Array(n).fill(0));
  const split=Array.from({length:n},()=>Array(n).fill(-1));
  for(let len=2;len<=n;len++){
    for(let i=0;i<=n-len;i++){
      const j=i+len-1; dp[i][j]=Infinity;
      for(let k=i;k<j;k++){
        const q=dp[i][k]+dp[k+1][j]+p[i]*p[k+1]*p[j];
        if(q<dp[i][j]){dp[i][j]=q;split[i][j]=k;}
      }
    }
  }
  function build(i,j){if(i===j)return `A${i+1}`;const k=split[i][j];return `(${build(i,k)}×${build(k+1,j)})`;}
  return {cost:dp[0][n-1],parentheses:build(0,n-1),table:dp,complexity:`O(n^3) time, O(n^2) space`};
}

function bitmaskAssignment(cost){
  const a=cost.map(r=>r.map(Number)), n=a.length, N=1<<n;
  const dp=new Array(N).fill(Infinity), parent=new Array(N).fill(null); dp[0]=0;
  for(let mask=0;mask<N;mask++){
    const i=popcount(mask); if(i>=n) continue;
    for(let j=0;j<n;j++) if(!(mask&(1<<j))){
      const nm=mask|(1<<j), val=dp[mask]+a[i][j];
      if(val<dp[nm]){dp[nm]=val;parent[nm]={mask,j};}
    }
  }
  const assignment=[]; let mask=N-1;
  while(mask){const x=parent[mask];assignment.push({worker:x.mask?popcount(x.mask)-1:0,job:x.j});mask=x.mask;}
  assignment.reverse();
  return {minCost:dp[N-1],assignment,states:N,complexity:`O(n·2^n) time, O(2^n) space`};
}
function popcount(x){let c=0;while(x){x&=x-1;c++;}return c;}

function treeIndependentSet(tree, weights=[]){
  const n=tree.length, w=weights.length?weights.map(Number):Array(n).fill(1), seen=Array(n).fill(false);
  function dfs(u,parent){
    let take=w[u],skip=0;
    for(const v of tree[u]||[]) if(v!==parent){const [s,t]=dfs(v,u);skip+=Math.max(s,t);take+=s;}
    return [skip,take];
  }
  const [skip,take]=dfs(0,-1);
  return {maxValue:Math.max(skip,take),rootExcluded:skip,rootIncluded:take,complexity:`O(n) time, O(n) recursion/state`};
}

function subsetDP(sets, universeSize){
  const clean=sets.map(s=>[...new Set(s.map(Number).filter(x=>x>=0&&x<universeSize))]);
  const full=(1<<universeSize)-1, INF=1e9, dp=new Array(1<<universeSize).fill(INF), parent=new Array(1<<universeSize).fill(null);
  dp[0]=0;
  for(let mask=0;mask<=full;mask++) if(dp[mask]<INF){
    for(let i=0;i<clean.length;i++){
      let add=0;for(const bit of clean[i])add|=1<<bit;
      const nm=mask|add;
      if(dp[nm]>dp[mask]+1){dp[nm]=dp[mask]+1;parent[nm]={mask,set:i};}
    }
  }
  const chosen=[];let mask=full;
  if(dp[full]<INF)while(mask){const x=parent[mask];chosen.push(x.set);mask=x.mask;}
  chosen.reverse();
  return {minSets:dp[full]===INF?null:dp[full],chosenSets:chosen,covered:full,universeSize,complexity:`O(2^U · S) time, O(2^U) space`};
}

function heldKarp(dist){
  const d=dist.map(r=>r.map(Number)), n=d.length, N=1<<n;
  if(n===0)return {cost:0,path:[]};
  const dp=Array.from({length:N},()=>Array(n).fill(Infinity));
  const parent=Array.from({length:N},()=>Array(n).fill(null));
  dp[1][0]=0;
  for(let mask=1;mask<N;mask++) for(let u=0;u<n;u++) if(mask&(1<<u) && dp[mask][u]<Infinity){
    for(let v=0;v<n;v++) if(!(mask&(1<<v))){
      const nm=mask|(1<<v), val=dp[mask][u]+d[u][v];
      if(val<dp[nm][v]){dp[nm][v]=val;parent[nm][v]=u;}
    }
  }
  const full=N-1;let end=1,best=Infinity;
  for(let u=1;u<n;u++){const val=dp[full][u]+d[u][0];if(val<best){best=val;end=u;}}
  const path=[end];let mask=full,u=end;
  while(u!==0){const pu=parent[mask][u];mask^=1<<u;u=pu;if(u!==null)path.push(u);}
  path.reverse();path.push(0);
  return {cost:best,path,states:N,complexity:`O(n^2·2^n) time, O(n·2^n) space`};
}
module.exports={intervalDP,bitmaskAssignment,treeIndependentSet,subsetDP,heldKarp};
