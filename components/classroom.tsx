'use client';
import {useEffect,useState,useSyncExternalStore} from 'react';
import {api,key} from '@/lib/client';
import {useStudentChoice,chooseStudent} from '@/lib/student-choice';
import {currentStudentId} from '@/lib/domain';
import type {OpenClassroom} from '@/lib/open-classroom-types';
import {OpenWorkspace} from './open-workspace';
const subscribeHydration=()=>()=>{};
const openings=new Map<string,Promise<OpenClassroom>>();
export function Classroom({studentId}:{studentId?:string}){
 const hydrated=useSyncExternalStore(subscribeHydration,()=>true,()=>false);
 const choice=useStudentChoice(),personaId=currentStudentId(studentId)??choice;
 const [opened,setOpened]=useState<OpenClassroom|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{if(studentId)chooseStudent(personaId);},[studentId,personaId]);
 useEffect(()=>{
  if(!hydrated)return;
  let cancelled=false,opening=openings.get(personaId);
  if(!opening){opening=api<OpenClassroom>('classrooms',{method:'POST',body:{personaId,idempotencyKey:key()}});openings.set(personaId,opening);const clear=()=>{if(openings.get(personaId)===opening)openings.delete(personaId);};void opening.then(clear,clear);}
  opening.then(s=>{if(!cancelled){setOpened(s);setError('');}}).catch(e=>{if(!cancelled)setError(e.message);});return ()=>{cancelled=true;};
 },[personaId,retry,hydrated]);
 if(opened?.personaId===personaId)return <OpenWorkspace key={opened.id} initial={opened}/>;
 return <div className="page classroom-opening"><p role={error?'alert':'status'}>{error||'Opening your classroom…'}</p>{error&&<button className="button" onClick={()=>{setError('');setRetry(n=>n+1);}}>Try again</button>}</div>;
}
