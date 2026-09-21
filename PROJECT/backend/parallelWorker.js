const {parentPort,workerData}=require("worker_threads");
const {mode,data}=workerData;
if(mode==="reduce") parentPort.postMessage({sum:data.reduce((a,b)=>a+Number(b),0)});
else if(mode==="prefix"){
  let run=0; const out=data.map(x=>(run+=Number(x),run)); parentPort.postMessage({prefix:out,total:run});
}
