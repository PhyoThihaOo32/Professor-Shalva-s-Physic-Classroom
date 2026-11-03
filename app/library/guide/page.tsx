import {requireAccountPage} from '@/lib/page-account';
import {pageDestination} from '@/lib/account-routing';
import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';
import {currentStudentId} from '@/lib/domain';
import {guideForChapter} from '@/lib/problem-solving-guide';
import {courseChapter,problemLibraryHref} from '@/lib/course';

export const metadata:Metadata={title:'Professor Shalva’s problem-solving guide'};

export default async function Page({searchParams}:{searchParams:Promise<{student?:string;chapter?:string}>}){
 const params=await searchParams,student=currentStudentId(params.student),chapter=courseChapter(params.chapter);
 const guide=guideForChapter(chapter.id);
 await requireAccountPage(pageDestination('/library/guide',{chapter:chapter.number===2?undefined:chapter.id,student}));
 return <div className="page problem-guide">
  <picture className="guide-animation"><source media="(prefers-reduced-motion: reduce)" srcSet="/images/problem-guide-space-still.png"/><Image src="/images/problem-guide-space.gif" width={500} height={500} alt="" unoptimized loading="eager"/></picture>
  <Link className="breadcrumb" href={problemLibraryHref(chapter.id,student)}><ArrowLeft size={14}/>Problems</Link>
  <header className="guide-heading"><span className="eyebrow">A REMINDER FOR YOUR WORK</span><h1>Professor Shalva’s guide</h1><p>{guide.subtitle}</p></header>
  <ol className="problem-guide-steps">{guide.steps.map(step=><li key={step.title}><div><h2>{step.title}</h2><p>{step.detail}</p></div></li>)}</ol>
  {chapter.number===10&&<details className="guide-lecture-slides"><summary>View Professor Shalva’s lecture slides</summary><div>{[1,2].map(n=><figure key={n}><Image src={`/images/chapter-10-guide-${n}.png`} width={n===1?1200:1176} height={n===1?900:874} alt={`Solving problems in rotational dynamics, slide ${n} of 2. The eight steps are transcribed and explained above.`} unoptimized/><figcaption>Rotational dynamics · {n} of 2</figcaption></figure>)}</div></details>}
  <p className="guide-source">{guide.source}</p>
 </div>;
}
