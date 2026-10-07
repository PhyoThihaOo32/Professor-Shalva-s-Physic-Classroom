import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';
import {currentStudentId} from '@/lib/domain';
import {problemSolvingGuide} from '@/lib/problem-solving-guide';

export const metadata:Metadata={title:'Professor Shalva’s problem-solving guide'};

export default async function Page({searchParams}:{searchParams:Promise<{student?:string}>}){
 const student=currentStudentId((await searchParams).student);
 return <div className="page problem-guide">
  <picture className="guide-animation"><source media="(prefers-reduced-motion: reduce)" srcSet="/images/problem-guide-space-still.png"/><Image src="/images/problem-guide-space.gif" width={500} height={500} alt="" unoptimized loading="eager"/></picture>
  <Link className="breadcrumb" href={`/library${student?`?student=${student}`:''}`}><ArrowLeft size={14}/>Problems</Link>
  <header className="guide-heading"><span className="eyebrow">A REMINDER FOR YOUR WORK</span><h1>Professor Shalva’s guide</h1><p>Take a moment to plan, solve, and check.</p></header>
  <ol className="problem-guide-steps">{problemSolvingGuide.map(step=><li key={step.title}><div><h2>{step.title}</h2><p>{step.detail}</p></div></li>)}</ol>
  <p className="guide-source">From the Chapter 2 problem-solving guide.</p>
 </div>;
}
