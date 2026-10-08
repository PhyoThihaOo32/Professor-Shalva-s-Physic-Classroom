'use client';
import {useEffect,useState,useSyncExternalStore} from 'react';
import {api,key} from '@/lib/client';
import {useStudentChoice,chooseStudent} from '@/lib/student-choice';
import {currentStudentId} from '@/lib/domain';
import type {OpenClassroom} from '@/lib/open-classroom-types';
import {OpenWorkspace} from './open-workspace';
import {useAccount} from './account-provider';
const subscribeHydration=()=>()=>{};
const openings=new Map<string,Promise<OpenClassroom>>();
export function Classroom({studentId,roomId,newKey}:{studentId?:string;roomId?:string;newKey?:string}){
 const {account,loading}=useAccount();
 const hydrated=useSyncExternalStore(subscribeHydration,()=>true,()=>false);
 const choice=useStudentChoice(),personaId=currentStudentId(studentId)??choice;
 const scope=`${account?.identity.kind}:${account?.identity.id}:${personaId}:${roomId??''}:${newKey??''}`;
 const [opened,setOpened]=useState<{scope:string;room:OpenClassroom}|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{if(studentId)chooseStudent(personaId);},[studentId,personaId]);
 useEffect(()=>{
  if(!hydrated||loading)return;
  let cancelled=false,opening=openings.get(scope);
  if(!opening){opening=roomId?api<OpenClassroom>(`classrooms/${encodeURIComponent(roomId)}`):api<OpenClassroom>('classrooms',{method:'POST',body:{personaId,idempotencyKey:newKey??key(),...(newKey?{fresh:true}:{})}});openings.set(scope,opening);const clear=()=>{if(openings.get(scope)===opening)openings.delete(scope);};void opening.then(clear,clear);}
  opening.then(s=>{if(!cancelled){setOpened({scope,room:s});setError('');}}).catch(e=>{if(!cancelled)setError(e.message);});return ()=>{cancelled=true;};
 },[personaId,retry,hydrated,loading,scope,roomId,newKey]);
 if(opened?.scope===scope)return <OpenWorkspace key={opened.room.id} initial={opened.room}/>;
 return <div className="page classroom-opening"><p role={error?'alert':'status'}>{error||'Opening your classroom…'}</p>{error&&<button className="button" onClick={()=>{setError('');setRetry(n=>n+1);}}>Try again</button>}</div>;
}
