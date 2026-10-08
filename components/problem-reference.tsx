'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,RotateCcw} from 'lucide-react';
import {api} from '@/lib/client';
import {referenceExplanation} from '@/lib/reference-explanations';
import type {PublicReference} from '@/lib/domain';
import {Diagram,Equation,MathText} from './visuals';
export function ProblemReference({id,studentId}:{id:string;studentId?:string}){
 const heading=useRef<HTMLHeadingElement>(null);
 const [selected,setSelected]=useState(0);
 const [reference,setReference]=useState<PublicReference|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;api<PublicReference>(`problems/${id}/reference`).then(r=>{if(active)setReference(r);}).catch(e=>{if(active)setError(e.message);});return ()=>{active=false;};},[id,retry]);
 const back=<Link className="breadcrumb" href={`/library${studentId?`?student=${studentId}`:''}`}><ArrowLeft size={14}/>Problems</Link>;
 if(!reference)return <div className="page problem-reference">{back}<p role={error?'alert':'status'}>{error||'Loading the reference…'}</p>{error&&<button className="text-button" onClick={()=>{setError('');setRetry(n=>n+1);}}>Try again</button>}</div>;
 const {problem,steps}=reference;
 const step=steps[selected],explanation=referenceExplanation(problem.id,selected);
 function moveTo(index:number){setSelected(Math.max(0,Math.min(steps.length-1,index)));heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView({block:'nearest'});}

 return <div className="page problem-reference">{back}
  <div className="eyebrow">{problem.chapterId==='chapter-2'?'CHAPTER 2':'REFERENCE'}{problem.problemNumber?` · PROBLEM ${problem.problemNumber}`:''}</div>
  <h1>{problem.title}</h1>
  <section className="reference-question" aria-labelledby="reference-question-title"><div><h2 id="reference-question-title">The question</h2><p className="statement"><MathText text={problem.statement}/></p>{problem.givens.length>0&&<dl className="reference-givens">{problem.givens.map(g=><div key={g.symbol}><dt>{g.symbol}</dt><dd>{g.value} {g.unit}</dd></div>)}</dl>}</div><Diagram kind={problem.diagram} caption={problem.diagramCaption} large/></section>
  <section className="reference-solution" aria-labelledby="reference-solution-title">
   <div className="solution-heading"><h2 id="reference-solution-title">Worked solution</h2><span className="solution-position" role="status">Step {selected+1} of {steps.length}</span></div>
   <div className="solution-progress" aria-hidden="true"><span style={{width:`${(selected+1)/steps.length*100}%`}}/></div>
   <article className="solution-slide" aria-labelledby="solution-step-title"><h3 id="solution-step-title" ref={heading} tabIndex={-1}>{step.title}</h3><p className="solution-explanation"><MathText text={step.text}/></p>{step.equation&&<Equation math={step.equation} block/>}{explanation&&<p className="solution-detail">{explanation}</p>}</article>
   <nav className="solution-controls" aria-label="Solution steps"><button className="button secondary" disabled={selected===0} onClick={()=>moveTo(selected-1)}><ArrowLeft size={16}/>Previous</button>{selected===steps.length-1?<button className="button" onClick={()=>moveTo(0)}><RotateCcw size={16}/>Start again</button>:<button className="button" onClick={()=>moveTo(selected+1)}>Next<ArrowRight size={16}/></button>}</nav>
  </section>
  {problem.assumptions.length>0&&<details className="reference-notes"><summary>Assumptions</summary><ul>{problem.assumptions.map(a=><li key={a}>{a}</li>)}</ul></details>}
 </div>;
}
