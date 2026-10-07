'use client';
import {useEffect,useState,useRef} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,Check,Lightbulb,ShieldCheck,RotateCcw,Eye,MessageCircle,BookOpen} from 'lucide-react';
import {api,key} from '@/lib/client';
import {chooseStudent} from '@/lib/student-choice';
import {findPersona,currentStudentId,type PublicSession,type Step,type DiscussionTurn} from '@/lib/domain';
import {Avatar,Diagram,Equation,MathText} from './visuals';
export function ConfirmDialog({title,children,confirmLabel,onConfirm,onClose}:{title:string;children:React.ReactNode;confirmLabel:string;onConfirm:()=>void;onClose:()=>void}){const dialog=useRef<HTMLDialogElement>(null);useEffect(()=>{dialog.current?.showModal();},[]);return <dialog ref={dialog} className="confirm-dialog" aria-labelledby="dialog-title" onCancel={onClose}><h2 id="dialog-title">{title}</h2>{children}<div className="action-row"><button className="button secondary" onClick={()=>{dialog.current?.close();onClose();}}>Cancel</button><button className="button" onClick={()=>{dialog.current?.close();onConfirm();}}>{confirmLabel}</button></div></dialog>;}
function StepView({step}:{step:Step}){return <><h3>{step.title}</h3><p><MathText text={step.text}/></p><Equation math={step.equation} block/></>;}
function ConversationThread({session,name,personaId}:{session:PublicSession;name:string;personaId:string}){
 return (session.discussion??session.conversation).map(turn=><div className="conversation-turn" key={turn.id}><div className="teacher-message"><span className="speaker">You</span><p><MathText text={turn.teacher}/></p></div><div className="student-message"><Avatar id={personaId} size={30}/><div><span className="speaker">{name}</span><p><MathText text={turn.student}/></p>{(turn as DiscussionTurn).workUpdated&&<span className="work-updated">Board updated</span>}</div></div></div>);
}
export function Workspace({id,conversationFirst=false,manual=false}:{id:string;conversationFirst?:boolean;manual?:boolean}) {
 const [session,setSession]=useState<PublicSession|null>(null);
 const isManual=manual||session?.mode==='manual';
 const [selected,setSelected]=useState('s1');
 const [showWork,setShowWork]=useState(false);
 const [text,setText]=useState('');
 const [intent,setIntent]=useState<'guide'|'correct'>(manual?'correct':'guide');
 const [tab,setTab]=useState<'current'|'original'>('current');
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const [hint,setHint]=useState('');
 const [reveal,setReveal]=useState(false);
 const [dispute,setDispute]=useState(false);
 const [disputeText,setDisputeText]=useState('');
 const router=useRouter();
 const composer=useRef<HTMLTextAreaElement>(null);
 const heading=useRef<HTMLHeadingElement>(null);
 const log=useRef<HTMLDivElement>(null);
 const focusStep=useRef(false);

 useEffect(()=>{
  let cancelled=false;
  api<PublicSession>(`sessions/${id}`).then(async initial=>{
   let s=initial;
   if(!manual&&s.mode!=='manual'&&(conversationFirst||s.problem.chapterId==='chapter-2')&&s.provider==='mock'&&['teaching','reviewing'].includes(s.state)){
    const config=await api<{liveEnabled:boolean}>('config');
    if(cancelled)return;
    if(config.liveEnabled)s=(await api<{session:PublicSession}>(`sessions/${id}/provider`,{method:'POST',body:{revision:s.revision,idempotencyKey:`classroom-live-${id}-${s.revision}`,provider:'live'}})).session;
   }
   if(cancelled)return;
   let saved:{step?:string}={};
   try{saved=JSON.parse(localStorage.getItem(`chalklight-desk-${id}`)||'{}');}catch{}
   setSelected(s.steps.some(step=>step.id===saved.step)?saved.step!:s.steps.at(-1)?.id??'s1');
   setSession(s);
   if(s.mode==='manual')setIntent('correct');
   const currentStudent=currentStudentId(s.personaId);if(currentStudent)chooseStudent(currentStudent);
   if(!manual&&s.mode!=='manual'&&['teaching','reviewing'].includes(s.state))try{localStorage.setItem(`chalklight-classroom-${s.personaId}`,s.id);}catch{}
  }).catch(e=>{if(!cancelled)setError(e.message);});
  return ()=>{cancelled=true;};
 },[id,manual,conversationFirst]);
 useEffect(()=>{
  if(session)try{localStorage.setItem(`chalklight-desk-${id}`,JSON.stringify({step:selected}));}catch{}
  if(focusStep.current){if(!isManual&&(conversationFirst||session?.problem.chapterId==='chapter-2'||session?.provider==='live')&&!showWork)composer.current?.focus({preventScroll:true});else heading.current?.focus({preventScroll:true});focusStep.current=false;}
 },[session,id,selected,conversationFirst,showWork,isManual]);
 useEffect(()=>{if(log.current)log.current.scrollTop=log.current.scrollHeight;},[session?.revision,selected]);
 function chooseStep(stepId:string){
  focusStep.current=true;setSelected(stepId);setTab('current');setHint('');setText('');setIntent(isManual?'correct':'guide');
 }
 async function mutate(kind:string,extra:Record<string,unknown>={}) {
  if(!session||busy)return;
  setBusy(true);setError('');
  try{
   const result=await api<{session:PublicSession;hint?:string}>(`sessions/${id}/${kind}`,{method:'POST',body:{revision:session.revision,idempotencyKey:key(),...extra}});
   setSession({...result.session,mode:session.mode});
   if(result.hint)setHint(result.hint);
   if(kind==='messages'||(kind==='corrections'&&extra.action==='correct')){setText('');setTab('current');}
   if(kind==='next')chooseStep(result.session.steps.at(-1)?.id??selected);
   if(kind==='finish')router.push(`/sessions/${id}/review`);
  }catch(e){
   setError((e as Error).message);
   const fresh=await api<PublicSession>(`sessions/${id}`).catch(()=>null);
   if(fresh)setSession(fresh);
  }finally{setBusy(false);}
 }
 function send(){if(text.trim())void mutate(intent==='guide'?'messages':'corrections',{stepId:active.id,text,...(intent==='correct'?{action:'correct'}:{})});}
 if(!session)return <div className="page" role={error?'alert':'status'}>{error||'Opening your classroom board…'}</div>;
 if(session.state==='failed')return <div className="page centered"><h1>A fresh start?</h1><p>{session.message}</p><Link className="button" href={`/problems/${session.problem.id}?student=${session.personaId}`}>Set up a new session <ArrowRight size={17}/></Link></div>;
 if(session.state==='generating')return <div className="page centered"><h1>Your student is preparing.</h1><p>Generation is still in progress. Reload shortly; interrupted operations become recoverable failures after 35 seconds.</p><button className="button" onClick={()=>window.location.reload()}>Reload saved session</button></div>;
 const finished=['completed','revealed'].includes(session.state);
 const chatFirst=!isManual&&(conversationFirst||session.problem.chapterId==='chapter-2'||session.provider==='live');
 const draftIds=new Set((session.discussion??[]).filter(turn=>turn.workUpdated).map(turn=>turn.stepId));
 const boardSteps=chatFirst?session.steps.filter(step=>draftIds.has(step.id)||JSON.stringify(step.current)!==JSON.stringify(step.original)):session.steps;
 const active=boardSteps.find(s=>s.id===selected)??boardSteps.at(-1)??session.steps[0];
 const persona=findPersona(session.personaId)!;
 const name=persona.name.split(' ')[0];
 const feedback=session.corrections.filter(c=>c.stepId===active.id&&c.text!=='Marked valid').at(-1);
 const assessment=session.assessments.find(a=>a.rootStep===active.id);
 const turns=(session.discussion??session.conversation.map(t=>({...t,kind:'message' as const}))).filter(t=>t.stepId===active.id);
 return <div className={`page workspace ${chatFirst?'conversation-classroom':''}`}>
  {chatFirst?<>
   <header className="classroom-header">
    <Link href="/students" aria-label="Change student" title="Change student"><Avatar id={persona.id} size={36}/></Link>
    <div className="classroom-title"><h1>{name}’s classroom</h1><h2>{session.problem.chapterId==='chapter-2'?`Ch. 2 · ${session.problem.problemNumber} · `:''}{session.problem.title}</h2></div>
    <div className="classroom-header-actions"><Link href="/settings" className="connection-status" title="AI settings">{session.provider==='live'?'Live':'Demo'}</Link><button className="text-button" disabled={!boardSteps.length} aria-expanded={showWork} onClick={()=>setShowWork(!showWork)}><BookOpen size={16}/>{showWork?'Hide work board':'Show work board'}</button><Link className="text-button" href={`/library?student=${session.personaId}`} aria-label="Change problem" title="Change problem"><ArrowLeft size={15}/>Library</Link></div>
   </header>
   <details className="classroom-question"><summary>Read the question</summary><p>{session.problem.statement}</p></details>
  </>:<>
   <div className="workspace-header"><Link className="breadcrumb" href={`/library?student=${session.personaId}${isManual?'&section=manual':''}`}><ArrowLeft size={14}/>{isManual?'Manual library':'Change problem'}</Link><div className="workspace-badges"><span className="pill">{isManual?'MANUAL PRACTICE':session.provider==='mock'?'MOCK DEMONSTRATION':'LIVE OPENAI'}</span><span className="saved"><ShieldCheck size={14}/>Saved · revision {session.revision}</span></div></div>
   <div className="room-heading"><Avatar id={persona.id} size={52}/><div><h1>{isManual?session.problem.title:`${name}’s board`}</h1><p>{isManual?'Manual · authored steps':session.problem.title}</p></div></div>
  </>}
  <div className="classroom-desk">
   <section className="shared-board" aria-label="Student work board" hidden={chatFirst&&(!showWork||!boardSteps.length)}>
    <div className="board-toolbar"><span className="label">{chatFirst?'STUDENT WORK':'MANUAL · STEP BY STEP'}</span>{!chatFirst&&<span className="tiny">{session.steps.filter(s=>s.valid).length} checked · {session.visibleCount}/{session.totalSteps} visible</span>}</div>
    <nav className="step-tabs" hidden={chatFirst&&boardSteps.length<2} aria-label={chatFirst?'Student drafts':'Visible solution steps'}>{boardSteps.map((s,index)=><button key={s.id} disabled={busy} aria-current={active.id===s.id?'step':undefined} className={active.id===s.id?'selected':s.valid?'valid':''} onClick={()=>chooseStep(s.id)} aria-label={`${chatFirst?'Work draft':'Step'} ${chatFirst?index+1:s.position+1}${s.valid?', checked':''}`}>{s.valid?<Check size={15}/>:chatFirst?index+1:s.position+1}</button>)}</nav>
    {!chatFirst&&<details className="board-question"><summary>Problem, givens & diagram</summary><p>{session.problem.statement}</p><div className="question-context"><div className="givens"><h3>What we know</h3><dl>{session.problem.givens.map(g=><div key={g.symbol}><dt>{g.symbol}</dt><dd>{g.value} {g.unit}</dd></div>)}</dl><h3>Find</h3><p>{session.problem.requested}</p></div><Diagram kind={session.problem.diagram} caption={session.problem.diagramCaption}/></div><ul>{session.problem.assumptions.map(a=><li key={a}>{a}</li>)}</ul><p className="tiny">{session.problem.kind==='original-demo'?'Original demo':'Course content'} · content v{session.problem.version}</p></details>}
    <article className="board-step" aria-labelledby="board-step-title">
     {!chatFirst&&<div className="attempt-top"><span className="label">STEP {active.position+1} · {active.id}</span><div className="small-tabs" role="group" aria-label="Step version"><button className={tab==='current'?'selected':''} aria-pressed={tab==='current'} onClick={()=>setTab('current')}>Current</button><button className={tab==='original'?'selected':''} aria-pressed={tab==='original'} onClick={()=>setTab('original')}>{isManual?'Starting guide':'Original'}</button></div></div>}
     <h2 id="board-step-title" ref={heading} tabIndex={-1} className="stage-focus">{(tab==='original'?active.original:active.current).title}</h2>
     <p><MathText text={(tab==='original'?active.original:active.current).text}/></p>
     <Equation math={(tab==='original'?active.original:active.current).equation} block/>
     {(tab==='original'?active.original:active.current).diagram&&<Diagram kind={session.problem.diagram} caption={session.problem.diagramCaption}/>}
     {(chatFirst?active.history.filter(step=>JSON.stringify(step)!==JSON.stringify(active.original)):active.history).length>0&&<details><summary><RotateCcw size={13}/>Revision history ({(chatFirst?active.history.filter(step=>JSON.stringify(step)!==JSON.stringify(active.original)):active.history).length})</summary>{(chatFirst?active.history.filter(step=>JSON.stringify(step)!==JSON.stringify(active.original)):active.history).map((s,i)=><div className="old-step" key={i}><StepView step={s}/></div>)}</details>}
    </article>
    {!chatFirst&&session.difficulty==='guided'&&!finished&&<p className="board-nudge"><Lightbulb size={15}/>Check the direction, reasoning, and units. Then talk it through.</p>}
    {!chatFirst&&<div className="board-actions">{finished?<Link className="button" href={`/sessions/${id}/review`}>Open session review <ArrowRight size={17}/></Link>:<><button disabled={busy} className="button secondary" onClick={()=>void mutate('corrections',{stepId:active.id,action:'valid'})}><Check size={16}/>This step is valid</button><button className="button" disabled={busy} onClick={()=>void mutate(session.state==='reviewing'?'finish':'next',session.state==='reviewing'?{reveal:false}:{})}>{session.state==='reviewing'?'Finish & verify':session.visibleCount===session.totalSteps?'Review teaching':'Next step'}<ArrowRight size={17}/></button></>}</div>}
    {!chatFirst&&!finished&&<details className="board-help"><summary>Hints & session options</summary><p className="tiny">Hints are recorded separately. Unresolved issues stay open when you continue.</p><div className="hint-buttons">{[1,2,3].map(level=><button key={level} disabled={busy} onClick={()=>void mutate('hints',{stepId:active.id,level})}>{['Conceptual nudge','Equation / diagram cue','Partial guidance'][level-1]}</button>)}</div>{hint&&<div className="hint-content" role="status">{hint.includes('\\')?<Equation math={hint} block/>:hint}</div>}<button className="text-button" onClick={()=>setReveal(true)} disabled={busy}><Eye size={15}/>Reveal solution early</button></details>}
   </section>
   <section className="board-conversation" aria-labelledby="conversation-title">
    {chatFirst?<h2 id="conversation-title" className="sr-only">Conversation with {name}</h2>:<div className="conversation-heading"><div><h2 id="conversation-title">Conversation with {name}</h2><p className="tiny">Step {active.position+1} · {session.provider==='mock'?'Mock responses':'Live OpenAI'}</p></div><MessageCircle size={19}/></div>}
    <div ref={log} className="conversation-log" role="log" aria-label="Teacher and student conversation" aria-live="polite">
     {!chatFirst&&<div className="student-message student-greeting"><Avatar id={persona.id} size={30}/><div><span className="speaker">{name}</span><p>{persona.voice}</p></div></div>}
     {!chatFirst&&turns.map(turn=><div className="conversation-turn" key={turn.id}><div className="teacher-message"><span className="speaker">You{turn.kind!=='message'&&<small> · {turn.kind==='check'?'step check':'correction'}</small>}</span><p>{turn.teacher}</p></div><div className="student-message"><Avatar id={persona.id} size={30}/><div><span className="speaker">{name}</span><p>{turn.student}</p></div></div></div>)}
     {chatFirst&&<ConversationThread session={session} name={name} personaId={persona.id}/>}
    </div>
    {!chatFirst&&feedback&&<details open className={`physics-check feedback ${feedback.verdict}`}><summary>Physics check · {feedback.verdict}{assessment?.disputed?' · disputed':''}</summary><strong>{feedback.verdict==='accepted'?'That explanation connects.':feedback.verdict==='partial'?'You’re part of the way there.':feedback.verdict==='uncertain'?'Let’s keep this open.':'Take another look.'}</strong><p>{feedback.feedback.evidence}</p>{assessment&&<div className="feedback-score"><span>{assessment.score}/100 · {assessment.provisional||assessment.disputed?'provisional':'formative'}</span><button className="text-button" disabled={busy} onClick={()=>{setDisputeText('');setDispute(true);}}>{assessment.disputed?'Resolve dispute':'Challenge this score'}</button></div>}</details>}
    {!finished?<form className="conversation-composer" onSubmit={e=>{e.preventDefault();send();}}>
     {!chatFirst&&!isManual&&<div className="composer-modes" role="group" aria-label="Message purpose"><button type="button" disabled={busy} aria-pressed={intent==='guide'} className={intent==='guide'?'selected':''} onClick={()=>{setIntent('guide');composer.current?.focus();}}>Guide / ask</button><button type="button" disabled={busy} aria-pressed={intent==='correct'} className={intent==='correct'?'selected':''} onClick={()=>{setIntent('correct');composer.current?.focus();}}>Explain a correction</button></div>}
     <label className="sr-only" htmlFor="student-message">Message your student</label><textarea ref={composer} id="student-message" value={text} disabled={busy} maxLength={2000} rows={chatFirst?2:4} placeholder={intent==='guide'?`Message ${name}…`:'Explain what should change and why. Include the physics and a check.'} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing&&e.nativeEvent.keyCode!==229){e.preventDefault();if(!e.repeat&&!busy)send();}}}/>
     <div className="composer-footer"><button className="button" type="submit" aria-label={intent==='guide'?'Send message':'Share correction'} disabled={busy||!text.trim()}>{busy?'Working…':intent==='guide'?'Send':'Share correction'}<ArrowRight size={16}/></button></div>
    </form>:<p className="closed-conversation">This session is complete. Your board and conversation are saved.</p>}
    {error&&<p role="alert" className="error">{error}</p>}
   </section>
  </div>
  {reveal&&<ConfirmDialog title="Reveal the reviewed solution?" confirmLabel="Reveal & end session" onClose={()=>setReveal(false)} onConfirm={()=>{setReveal(false);void mutate('finish',{reveal:true});}}><p>This ends teaching and opens the reviewed reference. Unresolved root issues score zero. The reveal is reported separately as assistance.</p></ConfirmDialog>}
  {dispute&&<ConfirmDialog title={assessment?.disputed?'Resolve your dispute':'Challenge this score'} confirmLabel="Save note" onClose={()=>setDispute(false)} onConfirm={()=>{if(disputeText.trim()){setDispute(false);void mutate('corrections',{stepId:active.id,action:assessment?.disputed?'resolve-dispute':'dispute',text:disputeText});}}}><label htmlFor="dispute-reason">Explain your interpretation or alternate method. Disputed scores stay provisional.</label><textarea id="dispute-reason" value={disputeText} onChange={e=>setDisputeText(e.target.value)} maxLength={2000} rows={4}/></ConfirmDialog>}
 </div>;
}
export function Review({id}:{id:string}){const [session,setSession]=useState<PublicSession|null>(null),[tab,setTab]=useState<'original'|'current'|'verified'>('verified'),[error,setError]=useState('');useEffect(()=>{api<PublicSession>(`sessions/${id}`).then(setSession).catch(e=>setError(e.message));},[id]);if(!session)return <div className="page" role={error?'alert':'status'}>{error||'Opening your session review…'}</div>;if(!session.verified)return <div className="page centered"><h1>There’s more to teach.</h1><p>The reviewed reference opens when you finish or explicitly reveal the solution.</p><Link href={`/sessions/${id}`} className="button">Return to teaching <ArrowRight size={17}/></Link></div>;const persona=findPersona(session.personaId)!;return <div className="page review"><Link className="breadcrumb" href="/progress"><ArrowLeft size={14}/>Your progress</Link><div className="eyebrow">SESSION REVIEW</div><h1>Session review</h1><div className="review-summary"><Avatar id={persona.id} size={80}/><div><h2>{session.problem.title}</h2><p>{persona.name} · {session.difficulty} · {session.provider==='mock'?'Mock demonstration':'Live OpenAI'}</p><span className="pill">{session.state==='revealed'?'EARLY SOLUTION REVEAL':'VERIFIED REFERENCE'}</span></div><div className="grade"><strong>{session.score}<small>/100</small></strong><span>{session.provisional?'Provisional formative score':'Formative score'}</span></div></div><div className="review-metrics"><div><strong>{session.corrections.filter(c=>c.text!=='Marked valid').length}</strong><span>Teaching explanations</span></div><div><strong>{session.assistance.hints}</strong><span>Hints used · no deductions</span></div><div><strong>{session.assessments.filter(a=>a.disputed).length}</strong><span>Open score disputes</span></div></div><p className="score-note">Scores average independent root issues by severity (minor 1, major 2, critical 3). Unresolved issues score zero; downstream consequences are not counted twice. Repeat corrections replace the previous result. These scores are for learning, not official grades.</p><div className="section-heading"><div><h2>Compare solutions</h2><p>Compare the first attempt, your student’s revisions, and the reviewed reference.</p></div></div><div className="segmented review-tabs" role="group" aria-label="Solution comparison">{(['original','current','verified'] as const).map(t=><button key={t} className={tab===t?'selected':''} aria-pressed={tab===t} onClick={()=>setTab(t)}>{t==='current'?'Revised':t==='verified'?'Verified reference':'Original attempt'}</button>)}</div><div className="comparison-paper paper">{session.steps.map((s,i)=>{const step=tab==='verified'?session.verified![i]:tab==='original'?s.original:s.current;return <article key={s.id} className="review-step"><span className="step-number">{i+1}</span><div><StepView step={step}/>{step.diagram&&<Diagram kind={session.problem.diagram} caption={session.problem.diagramCaption}/>}</div></article>;})}</div><h2>Teaching history</h2>{session.corrections.length===0?<p>No corrections were submitted before reveal.</p>:session.corrections.map(c=><details className="teaching-trail" key={c.id}><summary>{c.stepId} · {c.verdict} · {c.text==='Marked valid'?'Step check':'Your explanation'}</summary><p>{c.text}</p><p>{c.feedback.evidence}</p><p className="tiny">Criteria: {Object.entries(c.feedback.criteria).map(([k,v])=>`${k}: ${v}`).join(' · ')}</p></details>)}<div className="action-row"><Link className="button" href="/classroom">Try another question <ArrowRight size={17}/></Link><Link className="button secondary" href={`/sessions/${id}`}>View notebook & challenge a score</Link></div></div>;}
