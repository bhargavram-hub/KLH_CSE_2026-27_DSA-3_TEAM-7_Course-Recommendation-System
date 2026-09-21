// CO2 suffix-based structures: suffix array, LCP array (Kasai), suffix automaton.

function suffixArray(text){
  const s=String(text||""); const n=s.length; let sa=[...Array(n).keys()], rank=[...s].map(ch=>ch.charCodeAt(0)), tmp=new Array(n);
  for(let k=1;k<n;k*=2){
    sa.sort((a,b)=>rank[a]-rank[b] || (a+k<n?rank[a+k]:-1)-(b+k<n?rank[b+k]:-1));
    tmp[sa[0]]=0;
    for(let i=1;i<n;i++){
      const a=sa[i-1],b=sa[i];
      tmp[b]=tmp[a]+(rank[a]!==rank[b] || (a+k<n?rank[a+k]:-1)!==(b+k<n?rank[b+k]:-1)?1:0);
    }
    [rank,tmp]=[tmp,rank]; if(rank[sa[n-1]]===n-1)break;
  }
  return sa;
}
function lcpArray(text,sa){
  const s=String(text||""), n=s.length, rank=new Array(n);
  sa.forEach((x,i)=>rank[x]=i);
  const lcp=new Array(n).fill(0);let h=0;
  for(let i=0;i<n;i++){
    const r=rank[i]; if(r===0)continue; const j=sa[r-1];
    while(i+h<n&&j+h<n&&s[i+h]===s[j+h])h++;
    lcp[r]=h;if(h)h--;
  }
  return lcp;
}
function suffixAutomaton(text){
  const s=String(text||"");const st=[{next:{},link:-1,len:0}];let last=0;
  for(const ch of s){
    let cur=st.length;st.push({next:{},link:0,len:st[last].len+1});let p=last;
    while(p!==-1&&!st[p].next[ch]){st[p].next[ch]=cur;p=st[p].link;}
    if(p===-1)st[cur].link=0;
    else{
      const q=st[p].next[ch];
      if(st[p].len+1===st[q].len)st[cur].link=q;
      else{
        const clone=st.length;st.push({next:{...st[q].next},link:st[q].link,len:st[p].len+1});
        while(p!==-1&&st[p].next[ch]===q){st[p].next[ch]=clone;p=st[p].link;}
        st[q].link=st[cur].link=clone;
      }
    }
    last=cur;
  }
  return {states:st.length,transitions:st.reduce((a,x)=>a+Object.keys(x.next).length,0),complexity:"O(n) states/transitions",stateSample:st.slice(0,12)};
}
module.exports={suffixArray,lcpArray,suffixAutomaton};
