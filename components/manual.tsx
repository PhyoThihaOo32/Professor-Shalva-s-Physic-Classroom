'use client';
import {useEffect,useState,useSyncExternalStore} from 'react';
import Link from 'next/link';
import {api,key} from '@/lib/client';
import {type PublicSession} from '@/lib/domain';
import {useStudentChoice} from '@/lib/student-choice';
import {Workspace} from './workspace';

const subscribeHydration=()=>()=>{};
const openings=new Map<string,Promise<PublicSession>>();
async function openManual(problemId:string,personaId:string){
 const storageKey=`chalklight-manual-${problemId}-${personaId}`;
 let saved:string|null=null;
 try{saved=localStorage.getItem(storageKey);}catch{}
 if(saved){const session=await api<PublicSession>(`sessions/${saved}`).catch(()=>null);if(session&&session.problem.id===problemId&&session.personaId===personaId)return session;}
 let creationKey=key();
 try{creationKey=localStorage.getItem(`${storageKey}-opening`)??creationKey;localStorage.setItem(`${storageKey}-opening`,creationKey);}catch{}
 const session=await api<PublicSession>('sessions',{method:'POST',body:{problemId,personaId,difficulty:'guided',provider:'mock',mode:'manual',idempotencyKey:creationKey}});
 try{localStorage.setItem(storageKey,session.id);localStorage.removeItem(`${storageKey}-opening`);}catch{}
 return session;
}
export function Manual({problemId,studentId}:{problemId:string;studentId?:string}){
 const choice=useStudentChoice(),personaId=studentId??choice;
 const [opened,setOpened]=useState<{key:string;id:string}|null>(null),[error,setError]=useState('');
 const openingKey=`${problemId}:${personaId}`;
 const hydrated=useSyncExternalStore(subscribeHydration,()=>true,()=>false);
 useEffect(()=>{
  if(!hydrated)return;
  let cancelled=false;
  let opening=openings.get(openingKey);
  if(!opening){opening=openManual(problemId,personaId);openings.set(openingKey,opening);const clear=()=>{if(openings.get(openingKey)===opening)openings.delete(openingKey);};void opening.then(clear,clear);}
  opening.then(session=>{if(!cancelled)setOpened({key:openingKey,id:session.id});}).catch(e=>{if(!cancelled)setError(e.message);});
  return ()=>{cancelled=true;};
 },[openingKey,problemId,personaId,hydrated]);
 if(opened?.key===openingKey)return <Workspace key={opened.id} id={opened.id} manual/>;
 return <div className="page"><h1>Manual practice</h1><p role={error?'alert':'status'}>{error||'Opening the authored steps…'}</p><Link className="text-button" href={`/library?section=manual&student=${personaId}`}>Back to Manual</Link></div>;
}
