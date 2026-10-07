'use client';
import Link from 'next/link';
import {useState} from 'react';
import {ArrowLeft,ArrowRight,Check,GraduationCap,BookOpen} from 'lucide-react';
import {personas} from '@/lib/domain';
import {chooseStudent,useStudentChoice} from '@/lib/student-choice';
import {Avatar} from './visuals';

export function ChooseRole(){
 const [future,setFuture]=useState(false);
 if(future)return <div className="page onboarding-page centered"><div className="eyebrow">STUDENT MODE</div><h1>Student mode is coming later</h1><p>Practice with a physics tutor in a future version. For now, you can teach SpongeBob, Bart, or Stewie.</p><Link className="button" href="/students">Explore Teacher mode <ArrowRight size={17}/></Link><button className="text-button" onClick={()=>setFuture(false)}><ArrowLeft size={15}/>Back to role selection</button></div>;
 return <div className="page onboarding-page role-page"><Link className="breadcrumb" href="/"><ArrowLeft size={14}/>Welcome</Link><div className="eyebrow">02 / YOUR ROLE</div><h1>How will you learn?</h1><p className="subtitle">Choose your place in the classroom.</p><div className="role-options"><Link className="role-choice" href="/students"><span className="role-icon"><GraduationCap size={27}/></span><h2>Be the teacher</h2><p>Meet a simulated student. Check their work, ask questions, and explain the physics.</p><span className="role-next">Choose a student <ArrowRight size={18}/></span></Link><button className="role-choice future" onClick={()=>setFuture(true)}><span className="role-icon"><BookOpen size={25}/></span><h2>Be the student</h2><p>Work through physics with a tutor beside you.</p><span className="role-next">Coming later <ArrowRight size={18}/></span></button></div></div>;
}

export function ChooseStudent(){
 const selected=useStudentChoice();
 const student=personas.find(p=>p.id===selected)!;
 return <div className="page onboarding-page student-page"><Link className="breadcrumb" href="/roles"><ArrowLeft size={14}/>Choose your role</Link><div className="eyebrow">03 / YOUR STUDENT</div><h1>Who’s joining you?</h1><p className="subtitle">Three personalities. Plenty to learn together.</p><div className="student-options" role="group" aria-label="Choose a student">{personas.map(p=><button key={p.id} className={`student-choice ${selected===p.id?'selected':''}`} aria-pressed={selected===p.id} onClick={()=>chooseStudent(p.id)}><span className="student-choice-top"><Avatar id={p.id} size={96}/><span className="choice-circle" aria-hidden="true">{selected===p.id&&<Check size={14}/>}</span></span><h2>{p.name}</h2><span className="student-tag">{p.tag}</span><p>{p.description}</p></button>)}</div><div className="onboarding-bottom"><span className="tiny">You’ll teach {student.name.split(' ')[0]}. You can change students later.</span><Link className="button" href={`/classroom?student=${selected}`} onClick={()=>chooseStudent(selected)}>Enter classroom <ArrowRight size={18}/></Link></div></div>;
}
