'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,NotebookPen} from 'lucide-react';
import {api} from '@/lib/client';
import type {PublicProblem} from '@/lib/domain';
import {chapterTwoId,chapterTwoTitle,pendingGraphProblem} from '@/lib/course';
export function Library({studentId}:{studentId?:string}){
 const [problems,setProblems]=useState<PublicProblem[]|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;api<PublicProblem[]>('problems').then(p=>{if(active)setProblems(p);}).catch(e=>{if(active)setError(e.message);});return ()=>{active=false;};},[retry]);
 const list=problems?.filter(p=>p.chapterId===chapterTwoId&&p.kind!=='original-demo').sort((a,b)=>(a.problemNumber??0)-(b.problemNumber??0));
 const rows=list?[...list.map(problem=>({number:problem.problemNumber??0,problem})),{number:17,problem:null}].sort((a,b)=>a.number-b.number):[];
 return <div className="page library reference-library">
  <header className="problems-page-heading"><h1>Problems</h1><Link className="problem-guide-link" href={`/library/guide${studentId?`?student=${studentId}`:''}`} aria-label="Professor Shalva’s problem-solving guide" title="Professor Shalva’s problem-solving guide"><NotebookPen size={18}/></Link></header>
  <section className="library-chapter-heading"><div><span className="label">CHAPTER 2</span><h2>{chapterTwoTitle}</h2></div></section>
  {error&&<div><p className="error" role="alert">{error}</p><button className="text-button" onClick={()=>{setError('');setRetry(n=>n+1);}}>Try again</button></div>}{!problems&&!error&&<p role="status">Loading problems…</p>}
  <div className="problem-list">{rows.map(({number,problem:p})=>p?<Link className="problem-row" key={p.id} href={`/problems/${p.id}${studentId?`?student=${studentId}`:''}`}><span className="problem-index">{number}</span><div><h3>{p.title}</h3><p>{p.subtitle}</p></div><ArrowRight size={18}/></Link>:<article key="pending-17" className="problem-row pending-problem"><span className="problem-index">17</span><div><h3>{pendingGraphProblem.title}</h3><p className="pending-note">{pendingGraphProblem.reason}</p></div><span className="tiny">Needs figure</span></article>)}</div>
 </div>;
}
