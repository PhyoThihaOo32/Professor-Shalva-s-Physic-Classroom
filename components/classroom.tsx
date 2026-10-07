'use client';
import {useEffect,useState,useSyncExternalStore} from 'react';
import Link from 'next/link';
import {api,key,type Progress} from '@/lib/client';
import {personas,type PublicSession} from '@/lib/domain';
import {useStudentChoice,chooseStudent} from '@/lib/student-choice';
import {chapterTwoId,defaultChapterTwoProblem} from '@/lib/course';
import {Workspace} from './workspace';
import {Avatar} from './visuals';
const openings=new Map<string,Promise<PublicSession>>();
const subscribeHydration=()=>()=>{};
const openState=(s:PublicSession)=>['teaching','reviewing','generating'].includes(s.state);
async function openClassroom(personaId:string){
 let saved:string|null=null;
 try{saved=localStorage.getItem(`chalklight-classroom-${personaId}`);}catch{}
 if(saved){const s=await api<PublicSession>(`sessions/${saved}`).catch(()=>null);if(s&&s.mode!=='manual'&&s.personaId===personaId&&openState(s))return s;}
 const progress=await api<Progress>('progress');
 const previous=progress.sessions.find(s=>s.mode!=='manual'&&s.personaId===personaId&&s.chapterId===chapterTwoId&&['teaching','reviewing'].includes(s.state));
 if(previous)return api<PublicSession>(`sessions/${previous.id}`);
 let startKey=key();try{startKey=localStorage.getItem(`chalklight-room-start-${personaId}`)??startKey;localStorage.setItem(`chalklight-room-start-${personaId}`,startKey);}catch{}
 const session=await api<PublicSession>('sessions',{method:'POST',body:{problemId:defaultChapterTwoProblem,personaId,difficulty:'guided',provider:'mock',idempotencyKey:startKey}});
 try{localStorage.removeItem(`chalklight-room-start-${personaId}`);}catch{}
 return session;
}
export function Classroom({studentId}:{studentId?:string}){
 const choice=useStudentChoice(),personaId=studentId??choice;
 useEffect(()=>{if(studentId)chooseStudent(studentId);},[studentId]);
 const hydrated=useSyncExternalStore(subscribeHydration,()=>true,()=>false);
 const [opened,setOpened]=useState<{personaId:string;id:string}|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{
  if(!hydrated)return;
  let cancelled=false;
  let opening=openings.get(personaId);
  if(!opening){opening=openClassroom(personaId);openings.set(personaId,opening);const clear=()=>{if(openings.get(personaId)===opening)openings.delete(personaId);};void opening.then(clear,clear);}
  opening.then(s=>{if(!cancelled){setError('');setOpened({personaId,id:s.id});}}).catch(e=>{if(!cancelled)setError(e.message);});
  return ()=>{cancelled=true;};
 },[personaId,retry,hydrated]);
 if(opened?.personaId===personaId)return <Workspace key={opened.id} id={opened.id} conversationFirst/>;
 const persona=personas.find(p=>p.id===personaId)!;
 return <div className="page classroom-opening"><Avatar id={personaId} size={64}/><h1>{persona.name.split(' ')[0]}’s classroom</h1><p role={error?'alert':'status'}>{error||'Getting your conversation ready…'}</p>{error&&<button className="button" onClick={()=>{try{localStorage.removeItem(`chalklight-room-start-${personaId}`);}catch{}setError('');setRetry(n=>n+1);}}>Try again</button>}<Link className="text-button" href={`/library?student=${personaId}`}>Open Library</Link></div>;
}
