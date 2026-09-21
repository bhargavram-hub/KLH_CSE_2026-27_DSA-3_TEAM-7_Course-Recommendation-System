// CO6: randomized and parallel algorithm demonstrations.

function randomizedQuickSort(input){
  const a=input.map(Number), trace=[];
  function qs(l,r){
    if(l>=r)return;
    const p=l+Math.floor(Math.random()*(r-l+1)), pv=a[p];
    [a[p],a[r]]=[a[r],a[p]];
    let i=l;
    for(let j=l;j<r;j++)if(a[j]<=pv){[a[i],a[j]]=[a[j],a[i]];i++;}
    [a[i],a[r]]=[a[r],a[i]];
    trace.push({range:[l,r],pivot:pv});
    qs(l,i-1);qs(i+1,r);
  }
  qs(0,a.length-1);
  return {sorted:a,pivots:trace.slice(0,8),correct:true,kind:"Las Vegas",expectedTime:"O(n log n)",worstCase:"O(n²)",space:"O(log n) expected recursion"};
}

function modPow(a,e,n){let r=1n;a%=n;while(e>0n){if(e&1n)r=r*a%n;a=a*a%n;e>>=1n;}return r;}
function isProbablePrime(number, rounds=8){
  let n=BigInt(number);
  if(n<2n)return {prime:false,kind:"Monte Carlo"};
  for(const p of [2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n]){if(n===p)return {prime:true,kind:"Monte Carlo"};if(n%p===0n)return {prime:false,kind:"Monte Carlo"};}
  let d=n-1n,s=0;while((d&1n)===0n){d>>=1n;s++;}
  for(let r=0;r<rounds;r++){
    const a=2n+BigInt(Math.floor(Math.random()*Number(n-4n)));
    let x=modPow(a,d,n);if(x===1n||x===n-1n)continue;
    let composite=true;
    for(let i=1;i<s;i++){x=x*x%n;if(x===n-1n){composite=false;break;}}
    if(composite)return {prime:false,kind:"Monte Carlo",rounds:r+1};
  }
  return {prime:true,kind:"Monte Carlo",rounds,probable:true};
}
module.exports={randomizedQuickSort,isProbablePrime};
