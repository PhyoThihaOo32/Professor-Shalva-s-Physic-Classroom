'use client';
import {useSyncExternalStore} from 'react';
import {personas,currentStudentId} from './domain';
const storageKey='chalklight-student';
const changedEvent='chalklight-student-changed';
let memoryChoice:string|undefined;
function subscribe(callback:()=>void){
 window.addEventListener('storage',callback);
 window.addEventListener(changedEvent,callback);
 return ()=>{window.removeEventListener('storage',callback);window.removeEventListener(changedEvent,callback);};
}
function snapshot(){
 let value=memoryChoice;
 try{value=window.localStorage.getItem(storageKey)??value;}catch{}
 return currentStudentId(value)??personas[0].id;
}
export function chooseStudent(id:string){
 if(!personas.some(p=>p.id===id))return;
 memoryChoice=id;
 try{window.localStorage.setItem(storageKey,id);}catch{}
 window.dispatchEvent(new Event(changedEvent));
}
export function useStudentChoice(){return useSyncExternalStore(subscribe,snapshot,()=> personas[0].id);}
