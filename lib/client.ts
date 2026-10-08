'use client';
export async function api<T>(path:string,options?:{method?:string;body?:unknown}):Promise<T>{
 let res:Response;
 try{res=await fetch(`/api/${path}`,{method:options?.method??'GET',cache:'no-store',headers:options?.body?{'Content-Type':'application/json'}:{},body:options?.body?JSON.stringify(options.body):undefined});}
 catch{throw new Error('Couldn’t reach the classroom. Check your connection and try again.');}
 let result;
 try{result=await res.json();}catch{throw new Error('The server is unavailable right now. Please try again.');}
 if(!res.ok){if(res.status===401)window.dispatchEvent(new Event('classroom-auth-expired'));throw new Error(`${result.error?.message??'Request failed. Please try again.'}${result.requestId?` (request ${result.requestId})`:''}`);}
 return result.data as T;
}
export function key(){return crypto.randomUUID();}
export type Progress={sessions:{mode?:'manual'|'classroom'|'open-classroom';id:string;title:string;chapterId?:string;state:string;provider:string;difficulty:string;personaId:string;updatedAt:string;corrections:number;hints:number}[];stats:{sessions:number;finished:number;corrections:number;hints:number};families:{family:string;resolved:boolean;score:number;provisional:boolean}[]};
