'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {api} from '@/lib/client';
import type {PublicProblem} from '@/lib/domain';
import {chapterTwoId,chapterTwoTitle,pendingGraphProblem} from '@/lib/course';
export function Library({studentId}:{studentId?:string}){
 const [problems,setProblems]=useState<PublicProblem[]|null>(null),[error,setError]=useState('');
 useEffect(()=>{let active=true;api<PublicProblem[]>('problems').then(p=>{if(active)setProblems(p);}).catch(e=>{if(active)setError(e.message);});return ()=>{active=false;};},[]);
 const list=problems?.filter(p=>p.chapterId===chapterTwoId&&p.kind!=='original-demo').sort((a,b)=>(a.problemNumber??0)-(b.problemNumber??0));
 return <div className="page library reference-library">
  <h1>Problems</h1>
  <section className="library-chapter-heading"><div><span className="label">CHAPTER 2</span><h2>{chapterTwoTitle}</h2></div></section>
  {error&&<p className="error" role="alert">{error}</p>}{!problems&&!error&&<p role="status">Loading problems…</p>}
  <div className="problem-list">{list?.map(p=><Link className="problem-row" key={p.id} href={`/problems/${p.id}${studentId?`?student=${studentId}`:''}`}><span className="problem-index">{p.problemNumber}</span><div><h3>{p.title}</h3><p>{p.subtitle}</p></div><ArrowRight size={18}/></Link>)}<article className="problem-row pending-problem"><span className="problem-index">17</span><div><h3>{pendingGraphProblem.title}</h3><p className="pending-note">{pendingGraphProblem.reason}</p></div><span className="tiny">Needs figure</span></article></div>
 </div>;
}
