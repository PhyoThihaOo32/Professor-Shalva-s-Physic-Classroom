import {DrawingSchema} from './drawing';
import type {BoardDrawing} from './drawing';
import { ProblemSchema,StepSchema } from './schemas';
import 'server-only';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { db } from './db';
import { Prisma } from './generated/prisma/client';
import { type Identity,owned } from './security';
import { assert,AppError } from './errors';
import { findPersona,publicProblem,criterionScore,severityWeights,type Step,type PublicSession,type Evaluation,type Template,type DiscussionTurn } from './domain';
import { planErrors } from './planner';
import { PROMPT_VERSION,CHAT_PROMPT_VERSION } from './prompts';
import {resolveAi} from './ai-connection';
import { mockProvider,liveProvider,type CallRecorder,type ConversationResult } from './providers';
export const json=(value:unknown)=>JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
export const createSchema=z.object({problemId:z.string().max(100),personaId:z.enum(['spongebob-v1','bart-v1','stewie-v1','milo-v1','nora-v1','theo-v1']),difficulty:z.enum(['guided','standard','challenge']),provider:z.enum(['mock','live']),mode:z.enum(['manual','classroom']).optional(),idempotencyKey:z.string().min(8).max(100)}).strict();
export const mutationSchema=z.object({revision:z.number().int().nonnegative(),idempotencyKey:z.string().min(8).max(100),stepId:z.string().max(40).optional(),text:z.string().max(2000).optional(),action:z.enum(['correct','valid','dispute','resolve-dispute']).optional(),level:z.number().int().min(1).max(3).optional(),reveal:z.boolean().optional(),provider:z.enum(['mock','live']).optional(),drawing:DrawingSchema.optional()}).strict();
export type Mutation=z.infer<typeof mutationSchema>;
const includes={problemVersion:true,personaVersion:true,steps:{orderBy:{position:'asc' as const}},errors:true,corrections:{orderBy:{createdAt:'asc' as const}},hints:true,assessments:true,events:{where:{type:'messages'},orderBy:[{createdAt:'desc' as const},{id:'desc' as const}],take:100}};
export async function loadSession(id:string,who:Identity){const s=await db.session.findUnique({where:{id},include:includes});assert(s&&owned(s,who),'NOT_FOUND','Session not found.',404);return s;}
const discussionQuery=(id:string)=>({where:{sessionId:id,type:{in:['messages','corrections']}},orderBy:[{createdAt:'desc' as const},{id:'desc' as const}],take:200});
export function sessionDTO(s:Awaited<ReturnType<typeof loadSession>>,latestMessage?:string,events=s.events):PublicSession{
 const p=ProblemSchema.parse(s.problemVersion.data);const revealed=['completed','revealed'].includes(s.state);
 const weighted=s.errors.reduce((sum,e)=>sum+severityWeights[e.severity as keyof typeof severityWeights],0);
 const score=weighted?s.errors.reduce((sum,e)=>{const a=s.assessments.find(a=>a.rootStep===e.rootStep);return sum+(e.resolved?(a?.score??0):0)*severityWeights[e.severity as keyof typeof severityWeights];},0)/weighted:100;
 const visibleIds=new Set(s.steps.filter(st=>revealed||st.position<s.visibleCount).map(st=>st.stableId));
 // Older conversation events kept work only in step history. Recover it only
 // when every revision has an exact chronological event match.
 const historicalWork=new Map<string,Step>();
 for(const step of s.steps.filter(st=>visibleIds.has(st.stableId))){
  const revisions=[...events].reverse().filter(e=>{const d=e.data as {stepId?:string;workUpdated?:boolean};return d.stepId===step.stableId&&d.workUpdated===true;});
  const versions=[...(step.history as unknown as Step[]),step.current as unknown as Step];
  if(versions.length===revisions.length+1&&JSON.stringify(versions[0])===JSON.stringify(step.original))revisions.forEach((event,index)=>historicalWork.set(event.id,versions[index+1]));
 }
 const conversation=s.events.filter(e=>e.type==='messages').reverse().flatMap(e=>{const data=e.data as {stepId?:string;teacher?:string;message?:string};return typeof data.teacher==='string'&&typeof data.message==='string'&&typeof data.stepId==='string'&&visibleIds.has(data.stepId)?[{id:e.id,stepId:data.stepId,teacher:data.teacher,student:data.message,createdAt:e.createdAt.toISOString()}]:[];});
 const discussion:DiscussionTurn[]=[...events].reverse().flatMap(e=>{
  const data=e.data as {stepId?:string;teacher?:string;message?:string;action?:string;workUpdated?:boolean;work?:Step;drawing?:BoardDrawing;teacherDrawing?:BoardDrawing};
  const kind=e.type==='messages'?'message':e.type==='corrections'&&data.action==='correct'?'correction':e.type==='corrections'&&data.action==='valid'?'check':null;
  const teacher=data.teacher??(kind==='check'?'This step is valid.':undefined);
  if(!kind||typeof teacher!=='string'||typeof data.message!=='string'||typeof data.stepId!=='string'||!visibleIds.has(data.stepId))return [];
  const work=StepSchema.safeParse(data.work??historicalWork.get(e.id));
  return [{id:e.id,stepId:data.stepId,teacher,student:data.message,createdAt:e.createdAt.toISOString(),kind,...(data.workUpdated===true?{workUpdated:true}:{}),...(work.success&&work.data.id===data.stepId?{work:work.data}:{}),...(data.drawing?{drawing:DrawingSchema.parse(data.drawing)}:{}),...(data.teacherDrawing?{teacherDrawing:DrawingSchema.parse(data.teacherDrawing)}:{})}];
 });
 return {discussion,conversation,id:s.id,revision:s.revision,state:s.state,provider:s.provider,difficulty:s.difficulty,personaId:s.personaVersionId,problem:publicProblem(s.problemVersion.problemId,s.problemVersion.id,s.problemVersion.version,p),visibleCount:s.visibleCount,totalSteps:s.steps.length,steps:s.steps.filter(st=>revealed||st.position<s.visibleCount).map(st=>({id:st.stableId,position:st.position,original:st.original as unknown as Step,current:st.current as unknown as Step,valid:st.valid,history:st.history as unknown as Step[]})),corrections:s.corrections.map(c=>({id:c.id,stepId:c.stepId,text:c.text,verdict:c.verdict,feedback:c.feedback as unknown as Evaluation})),hints:s.hints.map(h=>({stepId:h.stepId,level:h.level})),assessments:s.assessments.map(a=>({rootStep:a.rootStep,score:a.score,provisional:a.provisional,disputed:a.disputed,disputeReason:a.disputeReason})),score:Math.round(score),provisional:!revealed||s.assessments.some(a=>a.provisional||a.disputed),assistance:{hints:s.hints.length,revealed:s.state==='revealed'},verified:revealed?p.reference:null,message:latestMessage??(typeof s.events[0]?.data==='object'&&s.events[0].data&&'message' in s.events[0].data?String(s.events[0].data.message):findPersona(s.personaVersionId)?.voice??'')};
}
export async function getSession(id:string,who:Identity){
 // Interrupted calls become explicit recoverable failures; no silent provider fallback.
 await db.$transaction(async tx=>{await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))::text`;const s=await tx.session.findUnique({where:{id}});if(!s||!owned(s,who))return;const pending=await tx.operation.findFirst({where:{sessionId:id,status:'pending',createdAt:{lt:new Date(Date.now()-35000)}}});if(pending){await tx.operation.update({where:{id:pending.id},data:{status:'failed',result:{error:'Operation interrupted. Start a new session or retry with a new key.'}}});await tx.session.update({where:{id},data:{revision:{increment:1},state:s.state==='generating'?'failed':s.state}});}});
 const saved=await loadSession(id,who);const last=await db.sessionEvent.findFirst({where:{sessionId:id},orderBy:{createdAt:'desc'}});const data=last?.data as {message?:string}|undefined;const manual=await db.sessionEvent.findFirst({where:{sessionId:id,type:'manual'},select:{id:true}});return {...sessionDTO(saved,typeof data?.message==='string'?data.message:undefined,await db.sessionEvent.findMany(discussionQuery(id))),mode:manual?'manual' as const:'classroom' as const};
}
function configInt(name:string,fallback:number){const v=Number(process.env[name]??fallback);assert(Number.isSafeInteger(v)&&v>0,'CONFIG',`Invalid ${name}.`,503);return v;}
async function incrementQuota(tx:Prisma.TransactionClient,key:string,max:number,amount=1){await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))::text`;const q=await tx.quota.upsert({where:{key},create:{key,count:0,expiresAt:new Date(Date.now()+2*86400000)},update:{}});assert(q.count+amount<=max,'QUOTA','The configured usage limit has been reached.',429);await tx.quota.update({where:{key},data:{count:{increment:amount}}});}
function recorder(sessionId:string,model:string,deadline:number):CallRecorder{return async(purpose,run)=>{
 const amount=configInt('MODEL_CALL_RESERVATION_CENTS',50);
 const call=await db.$transaction(async tx=>{
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${sessionId}))::text`;
  const s=await tx.session.findUniqueOrThrow({where:{id:sessionId}});
  assert(s.modelCalls<configInt('MAX_MODEL_CALLS_PER_SESSION',20)&&s.reservedCostCents+amount<=configInt('SESSION_SPEND_LIMIT_CENTS',1000),'QUOTA','Session model-call or spending limit reached.',429);
  await incrementQuota(tx,`spend:${new Date().toISOString().slice(0,10)}`,configInt('DAILY_SPEND_LIMIT_CENTS',2000),amount);
  await tx.session.update({where:{id:sessionId},data:{modelCalls:{increment:1},reservedCostCents:{increment:amount}}});
  return tx.modelCall.create({data:{sessionId,purpose,model,status:'reserved',reservedCostCents:amount}});
 });
 try{assert(Date.now()<deadline,'TIMEOUT','The 30-second request deadline was reached.',503);const output=await run(AbortSignal.timeout(Math.max(1,deadline-Date.now())));await db.modelCall.update({where:{id:call.id},data:{status:'succeeded',usage:json(output.usage)}});return output.data;}catch(e){await db.modelCall.update({where:{id:call.id},data:{status:'failed'}});throw e;}
 };}
export async function createSession(input:z.infer<typeof createSchema>,who:Identity):Promise<PublicSession>{
 const connection=input.provider==='live'?await resolveAi(who):null;
 const id=createHash('sha256').update(`${who.kind}:${who.id}:${input.idempotencyKey}`).digest('hex').slice(0,28);
 const hash=createHash('sha256').update(JSON.stringify(input)).digest('hex');
 const persona=findPersona(input.personaId)!;
 const reservation=await db.$transaction(async tx=>{
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))::text`;
  const existing=await tx.operation.findUnique({where:{sessionId_key:{sessionId:id,key:input.idempotencyKey}}});
  if(existing){assert(existing.requestHash===hash,'IDEMPOTENCY','This key was used for a different request.',409);assert(existing.status!=='pending','IN_PROGRESS','The operation is still running. Reload shortly.',409);return false;}
  const pv=await tx.problemVersion.findFirst({where:{problemId:input.problemId,status:'published'},orderBy:{version:'desc'}});assert(pv,'NOT_FOUND','Published problem not found.',404);
  const p=ProblemSchema.parse(pv.data);const plan=planErrors(p,persona,input.difficulty,Number.parseInt(id.slice(0,5),16));
  await incrementQuota(tx,`start:${who.kind}:${who.id}:${Math.floor(Date.now()/3600000)}`,configInt('SESSION_STARTS_PER_HOUR',10));
  await tx.session.create({data:{id,...(who.kind==='guest'?{guestId:who.id}:{userId:who.id}),problemVersionId:pv.id,personaVersionId:persona.id,rubricVersionId:'instructor-v1',promptVersion:PROMPT_VERSION,provider:input.provider,model:connection?.model??null,difficulty:input.difficulty,state:'generating',revision:1,errors:{create:plan.map(t=>({templateId:t.id,rootStep:t.rootStep,family:t.family,severity:t.severity,dependentSteps:t.dependentSteps,expectedCorrection:t.expectedCorrection,criteria:t.criteria}))},operations:{create:{key:input.idempotencyKey,kind:'create',requestHash:hash,baseRevision:0,status:'pending'}}}});
  if(input.mode==='manual')await tx.sessionEvent.create({data:{sessionId:id,type:'manual',data:{mode:'manual'}}});
  return {p,plan};
 });
 if(!reservation)return getSession(id,who);
 try{
  const provider=connection?liveProvider(connection.model,connection.apiKey):mockProvider;
  const attempt=await provider.generate(reservation.p,reservation.plan,persona,recorder(id,connection?.model??'mock',Date.now()+30000));
  await db.$transaction(async tx=>{await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))::text`;const s=await tx.session.findUniqueOrThrow({where:{id}});assert(s.revision===1,'STALE','The session changed while generating.',409);await tx.attemptStep.createMany({data:attempt.steps.map((st,i)=>({sessionId:id,stableId:st.id,position:i,original:json(st),current:json(st),history:[]}))});await tx.session.update({where:{id},data:{state:'teaching',revision:2}});await tx.sessionEvent.create({data:{sessionId:id,type:'student',data:{message:attempt.greeting}}});await tx.operation.update({where:{sessionId_key:{sessionId:id,key:input.idempotencyKey}},data:{status:'complete'}});});
 }catch(e){await db.$transaction(async tx=>{await tx.session.update({where:{id},data:{state:'failed',revision:{increment:1}}});await tx.sessionEvent.create({data:{sessionId:id,type:'failure',data:{message:'Generation failed its checks or deadline. Start a new session; mock demonstrations are available explicitly.'}}});await tx.operation.update({where:{sessionId_key:{sessionId:id,key:input.idempotencyKey}},data:{status:'failed'}});});if(e instanceof AppError)throw e;}
 return getSession(id,who);
}
export async function mutateSession(id:string,kind:'next'|'corrections'|'hints'|'finish'|'messages'|'provider',body:Mutation,who:Identity):Promise<{session:PublicSession;hint?:string}>{
 const hash=createHash('sha256').update(JSON.stringify({kind,...body})).digest('hex');
 const reservation=await db.$transaction(async tx=>{
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))::text`;
  const s=await tx.session.findUnique({where:{id},include:includes});assert(s&&owned(s,who),'NOT_FOUND','Session not found.',404);
  const op=await tx.operation.findUnique({where:{sessionId_key:{sessionId:id,key:body.idempotencyKey}}});
  if(op){assert(op.requestHash===hash,'IDEMPOTENCY','This key was used for a different request.',409);assert(op.status!=='pending','IN_PROGRESS','An operation is already running.',409);assert(op.status==='complete','RETRY','Previous operation failed. Reload and use a new key.',409);return {cached:op.result};}
  assert(!await tx.operation.findFirst({where:{sessionId:id,status:'pending'}}),'IN_PROGRESS','A session operation is already running.',409);
  assert(s.revision===body.revision,'REVISION','This session changed. Reload and try again.',409);
  const dispute=kind==='corrections'&&['dispute','resolve-dispute'].includes(body.action??'');
  assert(dispute||['teaching','reviewing'].includes(s.state),'STATE','This session is not open for teaching.',409);
  const st=body.stepId?s.steps.find(st=>st.stableId===body.stepId&&st.position<s.visibleCount):null;
  if(['corrections','hints','messages'].includes(kind))assert(st,'STEP','Select a visible step.');
  if(kind==='corrections'&&!dispute&&body.action!=='valid')assert(body.text?.trim(),'CORRECTION','Write your correction before submitting.');
  if(dispute){assert(s.assessments.some(a=>a.rootStep===body.stepId),'ASSESSMENT','This step has no score to dispute.');assert(body.text?.trim(),'DISPUTE','Explain why you are challenging or resolving this score.');}
  if(kind==='messages'){assert(body.text?.trim(),'MESSAGE','Write a message before sending.');assert(await tx.sessionEvent.count({where:{sessionId:id,type:'messages'}})<100,'QUOTA','This conversation has reached its message limit.',429);}
  if(kind==='hints')assert(body.level,'HINT','Choose a hint level.');
  if(kind==='provider')assert(body.provider,'PROVIDER','Choose a response provider.');
  await tx.operation.create({data:{sessionId:id,key:body.idempotencyKey,kind,requestHash:hash,baseRevision:s.revision,status:'pending'}});
  await tx.session.update({where:{id},data:{revision:{increment:1}}});
  return {s,st,revision:s.revision+1};
 });
 if('cached' in reservation)return reservation.cached as unknown as {session:PublicSession;hint?:string};
 const {s,st,revision}=reservation;
 const p=ProblemSchema.parse(s.problemVersion.data);const error=s.errors.find(e=>e.rootStep===body.stepId);const template:Template|undefined=error?p.templates.find(t=>t.id===error.templateId):undefined;
 let evaluation:Evaluation|undefined;let hint:string|undefined;let reply:string|undefined;let response:ConversationResult|undefined;let workUpdated=false;
 try{
  const connection=(s.provider==='live'&&(kind==='messages'||(kind==='corrections'&&!['dispute','resolve-dispute'].includes(body.action??''))))||(kind==='provider'&&body.provider==='live')?await resolveAi(who):null;
  const provider=connection?liveProvider(s.model??connection.model,connection.apiKey):mockProvider;
  const record=recorder(id,s.model??connection?.model??'mock',Date.now()+30000);
  const conversation={text:body.text??'',step:st?.current as unknown as Step,persona:findPersona(s.personaVersionId)!,history:sessionDTO(s).discussion??sessionDTO(s).conversation,problem:publicProblem(s.problemVersion.problemId,s.problemVersion.id,s.problemVersion.version,p),teacherDrawing:body.drawing};
  if(kind==='messages'){response=await provider.converse(conversation,record);reply=response.message;}
  if(kind==='corrections'&&body.action!=='valid'&&!['dispute','resolve-dispute'].includes(body.action??'')){
   evaluation=await provider.evaluate(body.text!,p,st!.current as unknown as Step,template,record);
   if(s.provider==='live'){
    const updated=evaluation.verdict==='accepted'&&error?p.reference.find(step=>step.id===body.stepId)!:conversation.step;
    response=await provider.converse({...conversation,step:updated,correctionOutcome:evaluation.verdict},record);reply=response.message;
   }
  }
  if(kind==='corrections'&&body.action==='valid'&&s.provider==='live')evaluation=await provider.evaluate('Independently check the current student calculation, its assumptions, numerical result, and units against the stated problem. Do not treat this check request as evidence that the work is correct.',p,st!.current as unknown as Step,template,record);
  if(kind==='hints'){const cue=p.reference.find(ref=>ref.id===body.stepId)!;hint=template?(body.level===1?template.nudge:body.level===2?template.cue:template.guidance):body.level===1?'Check the direction, dimensions, and assumptions for this step.':body.level===2?cue.equation||p.diagramCaption:cue.text;}
  const output=await db.$transaction(async tx=>{
   await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))::text`;
   const current=await tx.session.findUniqueOrThrow({where:{id}});assert(current.revision===revision,'STALE','The session changed before the result could be saved.',409);
   let message=reply??'';
   if(kind==='provider'){
    await tx.session.update({where:{id},data:{provider:body.provider,model:body.provider==='live'?connection!.model:null}});
    message=body.provider==='live'?'Live OpenAI is ready. Your saved conversation and guide remain.':'Demo responses selected. No API calls are made.';
   }
   if(kind==='messages'&&response?.work){
    const changed=response.work;
    if(JSON.stringify(changed)!==JSON.stringify(st!.current)){
     workUpdated=true;
     await tx.attemptStep.update({where:{id:st!.id},data:{current:json(changed),history:json([...(st!.history as unknown as Step[]),st!.current]),valid:false}});
     await tx.attemptStep.updateMany({where:{sessionId:id,position:{gt:st!.position}},data:{valid:false}});
     const affected=s.errors.filter(e=>s.steps.find(step=>step.stableId===e.rootStep)!.position>=st!.position||(e.dependentSteps as string[]).includes(body.stepId!));
     if(affected.length){
      await tx.errorInstance.updateMany({where:{id:{in:affected.map(e=>e.id)}},data:{resolved:false}});
      await tx.assessment.updateMany({where:{sessionId:id,rootStep:{in:affected.map(e=>e.rootStep)}},data:{provisional:true}});
     }
    }
   }
   if(kind==='next'){
    assert(s.steps.length>0,'STATE','The attempt has no steps.',409);
    if(s.visibleCount<s.steps.length){await tx.session.update({where:{id},data:{visibleCount:{increment:1}}});message='Let’s look at the next step.';}else{await tx.session.update({where:{id},data:{state:'reviewing'}});message='All steps are visible. Check your teaching, then finish to see the verified reference.';}
   }
   if(kind==='hints'){await tx.hintUsage.create({data:{sessionId:id,stepId:body.stepId!,level:body.level!}});message='Hint opened. Assistance is recorded separately from your score.';}
   if(kind==='corrections'){
    if(body.action==='dispute'||body.action==='resolve-dispute'){
     await tx.assessment.update({where:{sessionId_rootStep:{sessionId:id,rootStep:body.stepId!}},data:{disputed:body.action==='dispute',provisional:body.action==='dispute'||s.corrections.filter(c=>c.stepId===body.stepId).at(-1)?.verdict==='uncertain',disputeReason:body.text}});message=body.action==='dispute'?'Your score is marked disputed and provisional. Add another explanation at any time.':'Dispute resolved with your note. Uncertain evaluations remain provisional.';
    }else if(body.action==='valid'){
     const affected=s.errors.find(e=>!e.resolved&&(e.rootStep===body.stepId||(e.dependentSteps as string[]).includes(body.stepId!)));
     evaluation=evaluation??{verdict:affected?'uncertain':'accepted',criteria:{identify:0,physics:0,correction:0,check:0,clarity:0},nextAction:affected?'dispute':'revise',evidence:affected?'This step needs another look. Explain your interpretation or use a hint.':'This step agrees with the reviewed physics.'};
     await tx.attemptStep.update({where:{id:st!.id},data:{valid:!affected&&evaluation.verdict==='accepted'}});if(!affected&&error?.resolved)await tx.assessment.updateMany({where:{sessionId:id,rootStep:body.stepId!,disputed:false},data:{provisional:false}});message=affected||evaluation.verdict!=='accepted'?'Could we double-check this one together?':'That step checks out. Thanks for checking!';
    }else if(evaluation){
     const score=criterionScore(evaluation.criteria,template?.criteria);
     if(error){const old=s.assessments.find(a=>a.rootStep===body.stepId);await tx.assessment.upsert({where:{sessionId_rootStep:{sessionId:id,rootStep:body.stepId!}},create:{sessionId:id,rootStep:body.stepId!,score,criteria:json(evaluation.criteria),provisional:evaluation.verdict==='uncertain'},update:{score,criteria:json(evaluation.criteria),provisional:evaluation.verdict==='uncertain'||!!old?.disputed}});}
     if(evaluation.verdict==='accepted'&&error){
      const affected=[error.rootStep,...error.dependentSteps as string[]];
      const after=st!.position;
      await tx.attemptStep.updateMany({where:{sessionId:id,position:{gt:after}},data:{valid:false}});
      const laterErrors=s.errors.filter(e=>s.steps.find(step=>step.stableId===e.rootStep)!.position>after);
      if(laterErrors.length)await tx.assessment.updateMany({where:{sessionId:id,rootStep:{in:laterErrors.map(e=>e.rootStep)}},data:{provisional:true}});
      // Rebuild from the reviewed reference while preserving independent unresolved errors.
      for(const sid of affected){const old=s.steps.find(step=>step.stableId===sid)!;const ref=p.reference.find(step=>step.id===sid)!;const liveDraft=sid===error.rootStep?response?.work:null;await tx.attemptStep.update({where:{id:old.id},data:{current:json(liveDraft??ref),history:json([...(old.history as unknown as Step[]),old.current]),valid:sid===error.rootStep&&!liveDraft}});if(liveDraft){workUpdated=true;await tx.assessment.update({where:{sessionId_rootStep:{sessionId:id,rootStep:sid}},data:{provisional:true}});}}
      await tx.errorInstance.update({where:{id:error.id},data:{resolved:true}});
      message=findPersona(s.personaVersionId)?.correctionReply??(s.personaVersionId==='milo-v1'?'Oh, I see it now! I fixed that step and the work that depended on it.':s.personaVersionId==='nora-v1'?'That makes sense. I revised the step and will recheck what follows.':'Agreed. I’ve made that correction explicit and updated the dependent work.');
     }else message=evaluation.verdict==='partial'?'I’m starting to see it. Could you explain the missing part?':evaluation.verdict==='uncertain'?'Let’s keep this provisional. Could you show another step or challenge the check?':'I’m still unsure how that correction follows. Could we try it another way?';
    }
    if(reply)message=reply;
    if(evaluation)await tx.correction.create({data:{sessionId:id,stepId:body.stepId!,text:body.action==='valid'?'Marked valid':body.text!,verdict:evaluation.verdict,feedback:json(evaluation)}});
   }
   if(kind==='finish'){
    assert(body.reveal||s.visibleCount===s.steps.length,'REVEAL','To finish early, explicitly choose solution reveal.',409);
    const unresolved=s.errors.some(e=>!e.resolved);assert(body.reveal||!unresolved,'UNRESOLVED','Planned issues remain unresolved. Continue teaching or explicitly reveal the solution.',409);
    await tx.session.update({where:{id},data:{state:body.reveal?'revealed':'completed',visibleCount:s.steps.length}});message=body.reveal?'You explicitly revealed the reviewed solution. Unresolved root issues score zero.':'Teaching complete. The final solution comes from the reviewed physics reference.';
   }
   await tx.session.update({where:{id},data:{revision:{increment:1}}});
   await tx.sessionEvent.create({data:{sessionId:id,type:kind,data:json({stepId:body.stepId,action:kind==='corrections'?(body.action??'correct'):body.action,message,...(kind==='messages'?{teacher:body.text,promptVersion:CHAT_PROMPT_VERSION,workUpdated,...(response?.work?{work:response.work}:{}),...(response?.work?.drawing?{drawing:response.work.drawing}:{}),...(body.drawing?{teacherDrawing:body.drawing}:{})}:kind==='corrections'&&!['dispute','resolve-dispute'].includes(body.action??'')?{teacher:body.action==='valid'?'This step is valid.':body.text,workUpdated,...(response?.work?{work:response.work}:{}),...(response?.work?.drawing?{drawing:response.work.drawing}:{})}:{})})}});
   const saved=await tx.session.findUniqueOrThrow({where:{id},include:includes});
   const result={session:sessionDTO(saved,message,await tx.sessionEvent.findMany(discussionQuery(id))),...(hint?{hint}:{})};
   await tx.operation.update({where:{sessionId_key:{sessionId:id,key:body.idempotencyKey}},data:{status:'complete',result:json(result)}});
   return result;
  });
  return output;
 }catch(e){await db.operation.updateMany({where:{sessionId:id,key:body.idempotencyKey,status:'pending'},data:{status:'failed'}});if(e instanceof AppError)throw e;throw new AppError('PROVIDER_FAILURE','The provider could not complete this operation. Your saved work remains. Reload and retry, or start an explicitly labeled mock session.',503);}
}
