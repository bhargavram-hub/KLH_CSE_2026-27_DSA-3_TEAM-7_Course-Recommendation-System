const {Worker}=require("worker_threads");
const path=require("path");
function runWorker(mode,data){
  return new Promise((resolve,reject)=>{
    const w=new Worker(path.join(__dirname,"parallelWorker.js"),{workerData:{mode,data}});
    w.once("message",resolve);w.once("error",reject);
  });
}
async function parallelReduce(values,workers=4){
  const a=values.map(Number), p=Math.max(1,Math.min(Number(workers)||4,a.length||1));
  const chunks=Array.from({length:p},(_,i)=>a.slice(Math.floor(i*a.length/p),Math.floor((i+1)*a.length/p)));
  const partial=await Promise.all(chunks.map(c=>runWorker("reduce",c)));
  const sums=partial.map(x=>x.sum); let level=sums,levels=0;
  while(level.length>1){const next=[];for(let i=0;i<level.length;i+=2)next.push(level[i]+(level[i+1]??0));level=next;levels++;}
  return {sum:level[0]||0,workers:p,partialSums:sums,levels,work:`O(n)`,span:`O(n/p + log p)`};
}
async function parallelPrefix(values,workers=4){
  const a=values.map(Number), p=Math.max(1,Math.min(Number(workers)||4,a.length||1));
  const chunks=Array.from({length:p},(_,i)=>a.slice(Math.floor(i*a.length/p),Math.floor((i+1)*a.length/p)));
  const parts=await Promise.all(chunks.map(c=>runWorker("prefix",c)));
  const offsets=[];let acc=0;for(const x of parts){offsets.push(acc);acc+=x.total;}
  const prefix=[];for(let i=0;i<parts.length;i++)for(const x of parts[i].prefix)prefix.push(x+offsets[i]);
  return {prefix,total:acc,workers:p,work:`O(n)`,span:`O(n/p + log p) idealized`,primitive:"parallel prefix scan"};
}
module.exports={parallelReduce,parallelPrefix};
