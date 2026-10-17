'use client';
import {useEffect,useState,useSyncExternalStore} from 'react';
import {api,key} from '@/lib/client';
import {useStudentChoice,chooseStudent} from '@/lib/student-choice';
import {currentStudentId,currentProfessorId,isProfessor} from '@/lib/domain';
import {chooseClassroomMode,chooseProfessor,useProfessorChoice,type ClassroomMode} from '@/lib/learning-choice';
import type {OpenClassroom} from '@/lib/open-classroom-types';
import {OpenWorkspace} from './open-workspace';
import {useAccount} from './account-provider';
const subscribeHydration=()=>()=>{};
const openings=new Map<string,Promise<OpenClassroom>>();
export function Classroom({studentId,professorId,roomId,newKey,mode='teacher'}:{studentId?:string;professorId?:string;roomId?:string;newKey?:string;mode?:ClassroomMode}){
 const {account,loading}=useAccount();
 const hydrated=useSyncExternalStore(subscribeHydration,()=>true,()=>false);
 const choice=useStudentChoice(),professorChoice=useProfessorChoice(),personaId=mode==='student'?(currentProfessorId(professorId)??professorChoice):(currentStudentId(studentId)??choice);
 const scope=`${account?.identity.kind}:${account?.identity.id}:${personaId}:${roomId??''}:${newKey??''}`;
 const [opened,setOpened]=useState<{scope:string;room:OpenClassroom}|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{chooseClassroomMode(mode);if(mode==='student')chooseProfessor(personaId);else if(studentId)chooseStudent(personaId);},[studentId,personaId,mode]);
 useEffect(()=>{
  if(!hydrated||loading)return;
  let cancelled=false,opening=openings.get(scope);
  if(!opening){opening=roomId?api<OpenClassroom>(`classrooms/${encodeURIComponent(roomId)}`):api<OpenClassroom>('classrooms',{method:'POST',body:{personaId,idempotencyKey:newKey??key(),...(newKey?{fresh:true}:{})}});openings.set(scope,opening);const clear=()=>{if(openings.get(scope)===opening)openings.delete(scope);};void opening.then(clear,clear);}
  opening.then(s=>{if(!cancelled){if(isProfessor(s.personaId)!==(mode==='student'))throw new Error('This conversation belongs to the other classroom mode. Open it from My space.');if(isProfessor(s.personaId))chooseProfessor(s.personaId);else chooseStudent(s.personaId);setOpened({scope,room:s});setError('');}}).catch(e=>{if(!cancelled)setError(e.message);});return ()=>{cancelled=true;};
 },[personaId,retry,hydrated,loading,scope,roomId,newKey,mode]);
 if(opened?.scope===scope)return <OpenWorkspace key={opened.room.id} initial={opened.room}/>;
 return <div className="page classroom-opening"><p role={error?'alert':'status'}>{error||'Opening your classroom…'}</p>{error&&<button className="button" onClick={()=>{setError('');setRetry(n=>n+1);}}>Try again</button>}</div>;
}
