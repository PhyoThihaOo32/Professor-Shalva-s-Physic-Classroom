'use client';
import Link from 'next/link';
import {useSyncExternalStore} from 'react';
import {ArrowLeft,ArrowRight,Check,GraduationCap,BookOpen} from 'lucide-react';
import {personas,professors,shortPersonaName} from '@/lib/domain';
import {chooseStudent,useStudentChoice} from '@/lib/student-choice';
import {chooseClassroomMode,chooseProfessor,useProfessorChoice} from '@/lib/learning-choice';
import {Avatar} from './visuals';

const subscribeReady=()=>()=>{};
const clientReady=()=>true;
const serverReady=()=>false;
// Keep interactive choices disabled until their client event handlers are ready.
function useReady(){return useSyncExternalStore(subscribeReady,clientReady,serverReady);}

export function ChooseRole(){
 return <div className="page onboarding-page role-page"><Link className="breadcrumb" href="/"><ArrowLeft size={14}/>Welcome</Link><div className="eyebrow">YOUR ROLE</div><h1>How will you learn?</h1><p className="subtitle">Choose your place in the classroom.</p><div className="role-options"><Link className="role-choice" href="/students" onClick={()=>chooseClassroomMode('teacher')}><span className="role-icon"><GraduationCap size={27}/></span><h2>Be the teacher</h2><p>Meet a simulated student. Check their work, ask questions, and explain the physics.</p><span className="role-next">Choose a student <ArrowRight size={18}/></span></Link><Link className="role-choice student-role" href="/professors" onClick={()=>chooseClassroomMode('student')}><span className="role-icon"><BookOpen size={25}/></span><h2>Be the student</h2><p>Find your professor. Ask questions, share your thinking, and work through physics together.</p><span className="role-next">Choose a professor <ArrowRight size={18}/></span></Link></div></div>;
}

export function ChooseProfessor(){
 const ready=useReady(),selected=useProfessorChoice();
 const professor=professors.find(p=>p.id===selected)!;
 return <div className="page onboarding-page student-page professor-page"><Link className="breadcrumb" href="/roles"><ArrowLeft size={14}/>Choose your role</Link><div className="eyebrow">YOUR PROFESSOR</div><h1>A different kind of class.</h1><p className="subtitle">Three minds. Three ways to make it click.</p><div className="student-options professor-options" role="group" aria-label="Choose a professor">{professors.map(p=><button key={p.id} disabled={!ready} className={`student-choice professor-choice ${selected===p.id?'selected':''}`} aria-pressed={selected===p.id} onClick={()=>chooseProfessor(p.id)}><span className="student-choice-top"><Avatar id={p.id} size={96}/><span className="choice-circle" aria-hidden="true">{selected===p.id&&<Check size={14}/>}</span></span><h2>{p.name}</h2><span className="student-tag">{p.tag}</span><p>{p.description}</p></button>)}</div><div className="onboarding-bottom"><span className="tiny">Learn with {shortPersonaName(professor)}.</span><Link className="button" href={`/learn?professor=${selected}`} onClick={()=>{chooseProfessor(selected);chooseClassroomMode('student');}}>Enter classroom <ArrowRight size={18}/></Link></div></div>;
}

export function ChooseStudent(){
 const ready=useReady();
 const selected=useStudentChoice();
 const student=personas.find(p=>p.id===selected)!;
 return <div className="page onboarding-page student-page"><Link className="breadcrumb" href="/roles"><ArrowLeft size={14}/>Choose your role</Link><div className="eyebrow">YOUR STUDENT</div><h1>Who’s joining you?</h1><p className="subtitle">Three personalities. Plenty to learn together.</p><div className="student-options" role="group" aria-label="Choose a student">{personas.map(p=><button key={p.id} disabled={!ready} className={`student-choice ${selected===p.id?'selected':''}`} aria-pressed={selected===p.id} onClick={()=>chooseStudent(p.id)}><span className="student-choice-top"><Avatar id={p.id} size={96}/><span className="choice-circle" aria-hidden="true">{selected===p.id&&<Check size={14}/>}</span></span><h2>{p.name}</h2><span className="student-tag">{p.tag}</span><p>{p.description}</p></button>)}</div><div className="onboarding-bottom"><span className="tiny">You’ll teach {student.name.split(' ')[0]}.</span><Link className="button" href={`/classroom?student=${selected}`} onClick={()=>chooseStudent(selected)}>Enter classroom <ArrowRight size={18}/></Link></div></div>;
}
