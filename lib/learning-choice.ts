'use client';
import {useSyncExternalStore} from 'react';
import {currentProfessorId,professors} from './domain';

export type ClassroomMode='teacher'|'student';
const eventName='chalklight-learning-choice';
let mode:ClassroomMode='teacher',professor=professors[0].id;
function read(key:string){try{return localStorage.getItem(key);}catch{return null;}}
function write(key:string,value:string){try{localStorage.setItem(key,value);}catch{}window.dispatchEvent(new Event(eventName));}
function subscribe(callback:()=>void){window.addEventListener('storage',callback);window.addEventListener(eventName,callback);return()=>{window.removeEventListener('storage',callback);window.removeEventListener(eventName,callback);};}
export function chooseClassroomMode(value:ClassroomMode){mode=value;write('chalklight-mode',value);}
export function chooseProfessor(id:string){if(!currentProfessorId(id))return;professor=id;write('chalklight-professor',id);}
export function useClassroomMode(){return useSyncExternalStore(subscribe,()=>{const saved=read('chalklight-mode');return saved==='student'||saved==='teacher'?saved:mode;},()=>'teacher' as ClassroomMode);}
export function useProfessorChoice(){return useSyncExternalStore(subscribe,()=>currentProfessorId(read('chalklight-professor')??undefined)??professor,()=>professors[0].id);}
