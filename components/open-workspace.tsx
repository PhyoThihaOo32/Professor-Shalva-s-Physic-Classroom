'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,Send,Pencil,X,Lightbulb} from 'lucide-react';
import {api,key} from '@/lib/client';
import {findPersona} from '@/lib/domain';
import type {BoardDrawing} from '@/lib/drawing';
import type {OpenClassroom,OpenTurn} from '@/lib/open-classroom-types';
import {instinctNote} from '@/lib/teacher-instinct';
import {Avatar,MathText,WorkedSolution} from './visuals';
import {DrawingBoard,DrawingView} from './drawing-board';
function TeacherCue({turn}:{turn:OpenTurn}){
 if(turn.instinctStatus==='not-needed'||turn.instinct?.signal==='clear')return null;
 const focus=turn.instinct?.focus;
 const label=turn.instinctStatus==='unavailable'?'Not checked':turn.instinct?.signal==='uncertain'?'Take a closer look':focus&&focus!=='none'?`Check ${focus}`:'Take a closer look';
 return <details className={`teacher-instinct ${turn.instinctStatus==='unavailable'?'unavailable':''}`}><summary title="A possible issue to investigate, not a verdict."><Lightbulb size={14}/><span>Teacher instinct · {label}</span></summary><p>{turn.instinct?instinctNote(turn.instinct):'The check was unavailable. You can still inspect and discuss this attempt.'} This is a cue to investigate, not a verdict.</p></details>;
}
export function OpenWorkspace({initial}:{initial:OpenClassroom}){
 const [session,setSession]=useState(initial),[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[connected,setConnected]=useState(false);
 const [drawingOpen,setDrawingOpen]=useState(false),[annotations,setAnnotations]=useState<BoardDrawing|null>(null);
 const composer=useRef<HTMLTextAreaElement>(null),log=useRef<HTMLDivElement>(null),sending=useRef(false);
 const persona=findPersona(session.personaId)!,name=persona.name.split(' ')[0];
 useEffect(()=>{void api<{configured:boolean}>('ai-connection').then(status=>setConnected(status.configured)).catch(()=>{});composer.current?.focus({preventScroll:true});},[]);
 useEffect(()=>{if(log.current)log.current.scrollTop=log.current.scrollHeight;},[session.revision,drawingOpen]);
 async function send(){
  if(!text.trim()||sending.current)return;sending.current=true;setBusy(true);setError('');
  try{const result=await api<{session:OpenClassroom}>(`classrooms/${session.id}/messages`,{method:'POST',body:{revision:session.revision,idempotencyKey:key(),text,...(annotations?{drawing:annotations}:{})}});setSession(result.session);setConnected(true);setText('');setAnnotations(null);setDrawingOpen(false);if(composer.current)composer.current.style.height='';}
  catch(e){setError((e as Error).message);const fresh=await api<OpenClassroom>(`classrooms/${session.id}`).catch(()=>null);if(fresh)setSession(fresh);}
  finally{sending.current=false;setBusy(false);requestAnimationFrame(()=>composer.current?.focus({preventScroll:true}));}
 }
 return <div className="page workspace conversation-classroom open-classroom">
  <header className="classroom-header"><Link href="/students" aria-label="Change student" title="Change student"><Avatar id={persona.id} size={36}/></Link><div className="classroom-title"><h1>{name}’s classroom</h1></div><div className="classroom-header-actions"><Link href="/settings" className="connection-status" title="AI settings">{connected?'Live':'Connect AI'}</Link><Link className="text-button" href={`/library?student=${persona.id}`} aria-label="Problem references" title="Problem references"><ArrowLeft size={15}/>Problems</Link></div></header>
  <div className="classroom-desk"><section className="board-conversation" aria-labelledby="open-conversation-title"><h2 id="open-conversation-title" className="sr-only">Conversation with {name}</h2>
   <div ref={log} className="conversation-log" role="log" aria-label="Teacher and student conversation" aria-live="polite">
    {!session.discussion.length&&<p className="classroom-empty">Ask {name} a question to begin.</p>}
    {session.discussion.map(turn=><div className="conversation-turn" key={turn.id}><div className="teacher-message"><span className="speaker">You</span><p><MathText text={turn.teacher}/></p>{turn.teacherDrawing&&<DrawingView drawing={turn.teacherDrawing} preservePositions/>}</div><div className="student-message"><Avatar id={persona.id} size={30}/><div><span className="speaker">{name}</span><p><MathText text={turn.student}/></p>{turn.work&&<div className="student-work" aria-label="Student calculation"><h3>{turn.work.title}</h3><WorkedSolution work={turn.work} hideText={turn.work.text===turn.student}/></div>}{turn.work?.drawing&&<DrawingView drawing={turn.work.drawing}/>}<TeacherCue turn={turn}/></div></div></div>)}
   </div>
   {drawingOpen&&<div className="chat-drawing-editor" role="region" aria-label="Drawing annotations"><div className="annotation-heading"><span className="speaker">Shared paper</span><button type="button" className="text-button" aria-label="Close drawing" onClick={()=>{setDrawingOpen(false);composer.current?.focus();}}><X size={16}/></button></div><DrawingBoard annotations={annotations} onChange={setAnnotations} disabled={busy}/></div>}
   <form className="conversation-composer" onSubmit={e=>{e.preventDefault();void send();}}><label className="sr-only" htmlFor="open-student-message">Message your student</label><textarea id="open-student-message" ref={composer} value={text} disabled={busy} maxLength={2000} rows={1} placeholder={`Ask ${name}…`} onChange={e=>{setText(e.target.value);e.target.style.height='auto';e.target.style.height=`${Math.min(110,e.target.scrollHeight)}px`;}} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing&&e.nativeEvent.keyCode!==229){e.preventDefault();if(!e.repeat)void send();}}}/><button className="draw-message" type="button" aria-label="Draw or annotate" title="Draw or annotate" aria-expanded={drawingOpen} disabled={busy} onClick={()=>setDrawingOpen(!drawingOpen)}><Pencil size={17}/></button><button className="send-message" type="submit" aria-label="Send message" title="Send message" disabled={busy||!text.trim()}>{busy?<span className="sending-dot"/>:<Send size={18}/>}</button></form>
   {error&&<p role="alert" className="error">{error}</p>}
  </section></div>
 </div>;
}
