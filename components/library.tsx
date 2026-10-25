'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {ArrowRight,NotebookPen} from 'lucide-react';
import {api} from '@/lib/client';
import type {PublicProblem} from '@/lib/domain';
import {courseChapter,courseChapters,problemLibraryHref,type PendingProblem} from '@/lib/course';
export function Library({studentId,chapterId}:{studentId?:string;chapterId?:string}){
 const [problems,setProblems]=useState<PublicProblem[]|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;api<PublicProblem[]>('problems').then(p=>{if(active)setProblems(p);}).catch(e=>{if(active)setError(e.message);});return ()=>{active=false;};},[retry]);
 const chapter=courseChapter(chapterId);
 const list=problems?.filter(p=>p.chapterId===chapter.id&&p.kind!=='original-demo').sort((a,b)=>(a.problemNumber??0)-(b.problemNumber??0));
 const rows:{number:number;problem?:PublicProblem;pending?:PendingProblem}[]=list?[...list.map(problem=>({number:problem.problemNumber??0,problem})),...chapter.pending.filter(p=>!list.some(problem=>problem.problemNumber===p.number)).map(pending=>({number:pending.number,pending}))].sort((a,b)=>a.number-b.number):[];
 return <div className="page library reference-library">
  <div className="problems-intro"><picture className="problems-jamming"><source media="(prefers-reduced-motion: reduce)" srcSet="/images/problems-jamming-still.png"/><Image src="/images/problems-jamming.gif" width={480} height={270} alt="" unoptimized loading="eager"/></picture>
   <header className="problems-page-heading"><h1>Problems</h1><Link className="problem-guide-link" href={problemLibraryHref(chapter.id,studentId).replace('/library','/library/guide')} aria-label="Professor Shalva’s problem-solving guide" title="Professor Shalva’s problem-solving guide"><NotebookPen size={18}/></Link></header>
   <section className="library-chapter-heading"><div><span className="label">CHAPTER {chapter.number}</span><h2>{chapter.title}</h2></div></section>
  </div>
  <nav className="problem-chapters" aria-label="Problem chapters">{courseChapters.map(c=><Link key={c.id} href={problemLibraryHref(c.id,studentId)} aria-current={c.id===chapter.id?'page':undefined}><span>{String(c.number).padStart(2,'0')}</span>{c.shortTitle}</Link>)}</nav>
  {error&&<div><p className="error" role="alert">{error}</p><button className="text-button" onClick={()=>{setError('');setRetry(n=>n+1);}}>Try again</button></div>}{!problems&&!error&&<p role="status">Loading problems…</p>}
  {problems&&<div className="problem-list">{rows.length?rows.map(({number,problem:p,pending})=>p?<Link className="problem-row" key={p.id} href={`/problems/${p.id}${studentId?`?student=${studentId}`:''}`}><span className="problem-index">{number}</span><div><h3>{p.title}</h3><p>{p.subtitle}</p></div><ArrowRight size={18}/></Link>:<article key={`pending-${number}`} className="problem-row pending-problem"><span className="problem-index">{number}</span><div><h3>{pending!.title}</h3><p className="pending-note">{pending!.reason}</p></div><span className="tiny">{pending!.status}</span></article>):<p className="chapter-empty">This chapter is ready for its first problems.</p>}</div>}
 </div>;
}
