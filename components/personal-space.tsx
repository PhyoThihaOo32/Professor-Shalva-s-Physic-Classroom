'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {ArrowRight,Plus,MessageCircle} from 'lucide-react';
import {api,key} from '@/lib/client';
import type {SpaceConversation} from '@/lib/account-types';
import {findPersona} from '@/lib/domain';
import {useStudentChoice} from '@/lib/student-choice';
import {useAccount} from './account-provider';
import {Avatar} from './visuals';

export function PersonalSpace(){
 const {account,loading}=useAccount(),router=useRouter(),studentId=useStudentChoice();
 const [sessions,setSessions]=useState<SpaceConversation[]|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{if(loading)return;let active=true;void api<SpaceConversation[]>('account/conversations').then(data=>{if(active){setSessions(data);setError('');}}).catch(()=>{if(active)setError('Couldn’t load your conversations. Please try again.');});return()=>{active=false;};},[loading,account?.identity.id,retry]);
 return <div className="page personal-space"><picture className="space-window"><source media="(prefers-reduced-motion: reduce)" srcSet="/images/personal-space-window-still.png"/><Image src="/images/personal-space-window.gif" width={480} height={480} alt="" unoptimized loading="eager"/></picture><div className="personal-space-content"><div className="space-heading"><div><div className="eyebrow">YOUR CLASSROOM</div><h1>My space</h1><p className="subtitle">{account?.user?.name?`Welcome back, ${account.user.name}.`:'Pick up where you left off.'}</p></div><button className="button" onClick={()=>router.push(`/classroom?student=${studentId}&new=${key()}`)}><Plus size={16}/>New conversation</button></div>
 <section className="space-conversations" aria-labelledby="space-conversations-title"><h2 id="space-conversations-title">Your conversations</h2>{error?<p role="alert" className="error">{error} <button className="text-button" onClick={()=>setRetry(n=>n+1)}>Try again</button></p>:sessions===null||loading?<p role="status" className="tiny">Opening your space…</p>:sessions.length?<ul>{sessions.map(s=>{const student=findPersona(s.personaId);return <li key={s.id}><Link href={s.kind==='open-classroom'?`/classroom?student=${s.personaId}&room=${s.id}`:`/sessions/${s.id}`}><Avatar id={s.personaId} size={42}/><div className="space-conversation-copy"><span>{student?.name.split(' ')[0]??'Classroom'}</span><h3>{s.title}</h3><time dateTime={s.updatedAt}>{new Date(s.updatedAt).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</time></div><ArrowRight size={18}/></Link></li>;})}</ul>:<div className="space-empty"><MessageCircle size={28}/><h3>A little room for your ideas.</h3><p>Start a conversation with your student. It will appear here.</p><Link className="text-button" href="/students">Choose a student <ArrowRight size={15}/></Link></div>}</section></div></div>;
}
