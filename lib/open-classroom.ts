import 'server-only';
import {createHash} from 'node:crypto';
import {z} from 'zod';
import {db} from './db';
import {owned,type Identity} from './security';
import {assert,AppError} from './errors';
import {json,recorder,incrementQuota,configInt} from './sessions';
import {StepSchema} from './schemas';
import {DrawingSchema} from './drawing';
import {findPersona} from './domain';
import {CHAT_PROMPT_VERSION} from './prompts';
import {resolveAi} from './ai-connection';
import {liveProvider} from './providers';
import {InstinctSchema,needsInstinctCheck,type TeacherInstinct} from './teacher-instinct';
import {emptyStudentWork,type OpenClassroom,type OpenTurn} from './open-classroom-types';
export const openSchema=z.object({personaId:z.enum(['bart-v1','spongebob-v1','stewie-v1']),idempotencyKey:z.string().min(8).max(100),fresh:z.boolean().optional()}).strict();
export const openMessageSchema=z.object({revision:z.number().int().nonnegative(),idempotencyKey:z.string().min(8).max(100),text:z.string().trim().min(1).max(2000),drawing:DrawingSchema.optional()}).strict();
const include={events:{where:{type:'open-message'},orderBy:[{createdAt:'asc' as const},{id:'asc' as const}],take:100}};
async function loadRoom(id:string,who:Identity){const s=await db.session.findUnique({where:{id},include});assert(s&&owned(s,who)&&s.kind==='open-classroom','NOT_FOUND','Classroom not found.',404);return s;}
function roomDTO(s:Awaited<ReturnType<typeof loadRoom>>):OpenClassroom{
 const discussion:OpenTurn[]=s.events.flatMap(event=>{
  const d=event.data as Record<string,unknown>;if(typeof d.teacher!=='string'||typeof d.message!=='string')return [];
  const work=StepSchema.safeParse(d.work),drawing=DrawingSchema.safeParse(d.teacherDrawing),instinct=InstinctSchema.safeParse(d.instinct);
  return [{id:event.id,kind:'message' as const,stepId:'live',teacher:d.teacher,student:d.message,createdAt:event.createdAt.toISOString(),...(work.success?{work:work.data}:{}),...(drawing.success?{teacherDrawing:drawing.data}:{}),instinct:instinct.success?instinct.data:null,instinctStatus:d.instinctStatus==='checked'?'checked' as const:d.instinctStatus==='unavailable'?'unavailable' as const:'not-needed' as const}];
 });
 return {id:s.id,kind:'open-classroom',personaId:s.personaVersionId,revision:s.revision,state:s.state,discussion};
}
export async function getOpenRoom(id:string,who:Identity){
 await loadRoom(id,who);
 await db.$transaction(async tx=>{await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))::text`;const pending=await tx.operation.findFirst({where:{sessionId:id,status:'pending',createdAt:{lt:new Date(Date.now()-70000)}}});if(pending){await tx.operation.update({where:{id:pending.id},data:{status:'failed'}});await tx.session.update({where:{id},data:{revision:{increment:1}}});}});
 return roomDTO(await loadRoom(id,who));
}
export async function openRoom(input:z.infer<typeof openSchema>,who:Identity){
 const identity=who.kind==='guest'?{guestId:who.id}:{userId:who.id};
 const id=await db.$transaction(async tx=>{
  const lock=`open-room:${who.kind}:${who.id}:${input.personaId}`;await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${lock}))::text`;
  if(!input.fresh){const previous=await tx.session.findFirst({where:{...identity,kind:'open-classroom',personaVersionId:input.personaId,state:'teaching'},orderBy:{updatedAt:'desc'}});if(previous)return previous.id;}
  const id=createHash('sha256').update(`${lock}:${input.idempotencyKey}`).digest('hex').slice(0,28);
  if(await tx.session.findUnique({where:{id},select:{id:true}}))return id;
  await incrementQuota(tx,`start:${who.kind}:${who.id}:${Math.floor(Date.now()/3600000)}`,configInt('SESSION_STARTS_PER_HOUR',10));
  await tx.session.create({data:{id,...identity,kind:'open-classroom',problemVersionId:null,personaVersionId:input.personaId,rubricVersionId:'instructor-v1',promptVersion:CHAT_PROMPT_VERSION,provider:'live',difficulty:'guided',state:'teaching',revision:0}});
  return id;
 });return getOpenRoom(id,who);
}
export async function messageOpenRoom(id:string,input:z.infer<typeof openMessageSchema>,who:Identity){
 const hash=createHash('sha256').update(JSON.stringify(input)).digest('hex');
 const reservation=await db.$transaction(async tx=>{
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))::text`;
  const s=await tx.session.findUnique({where:{id},include});assert(s&&owned(s,who)&&s.kind==='open-classroom','NOT_FOUND','Classroom not found.',404);
  const op=await tx.operation.findUnique({where:{sessionId_key:{sessionId:id,key:input.idempotencyKey}}});
  if(op){assert(op.requestHash===hash,'IDEMPOTENCY','This key was used for a different request.',409);assert(op.status!=='pending','IN_PROGRESS','Your student is still responding.',409);assert(op.status==='complete','RETRY','Reload and retry this message with a new key.',409);return {cached:op.result};}
  assert(s.revision===input.revision,'REVISION','The conversation changed. Reload and retry.',409);assert(s.state==='teaching','STATE','This classroom is not open.',409);
  assert(!await tx.operation.findFirst({where:{sessionId:id,status:'pending'}}),'IN_PROGRESS','Your student is still responding.',409);
  assert(s.events.length<100,'QUOTA','This conversation has reached its message limit.',429);
  await tx.operation.create({data:{sessionId:id,key:input.idempotencyKey,kind:'open-message',requestHash:hash,baseRevision:s.revision,status:'pending'}});
  await tx.session.update({where:{id},data:{revision:{increment:1}}});return {s,revision:s.revision+1};
 });
 if('cached' in reservation)return reservation.cached as unknown as {session:OpenClassroom};
 try{
  const connection=await resolveAi(who),provider=liveProvider(connection.model,connection.apiKey),history=roomDTO(reservation.s).discussion;
  const current=[...history].reverse().find(turn=>turn.work)?.work??emptyStudentWork();
  const context={text:input.text,step:current,persona:findPersona(reservation.s.personaVersionId)!,history,openClassroom:true,teacherDrawing:input.drawing};
  const record=recorder(id,connection.model,Date.now()+45000);
  const reply=await provider.converse(context,record);
  let instinct:TeacherInstinct|null=null,instinctStatus:OpenTurn['instinctStatus']='not-needed';
  if(needsInstinctCheck(input.text,!!reply.work)){
   try{instinct=await provider.instinct(context,reply,record);instinctStatus='checked';}catch{instinctStatus='unavailable';}
  }
  return await db.$transaction(async tx=>{
   await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))::text`;
   const s=await tx.session.findUniqueOrThrow({where:{id}});assert(s.revision===reservation.revision,'STALE','The conversation changed while responding.',409);
   await tx.sessionEvent.create({data:{sessionId:id,type:'open-message',data:json({teacher:input.text,message:reply.message,work:reply.work,teacherDrawing:input.drawing,instinct,instinctStatus,promptVersion:CHAT_PROMPT_VERSION})}});
   const saved=await tx.session.update({where:{id},data:{revision:{increment:1},model:connection.model},include});
   const result={session:roomDTO(saved)};await tx.operation.update({where:{sessionId_key:{sessionId:id,key:input.idempotencyKey}},data:{status:'complete',result:json(result)}});return result;
  });
 }catch(error){
  await db.operation.updateMany({where:{sessionId:id,key:input.idempotencyKey,status:'pending'},data:{status:'failed'}});
  if(error instanceof AppError)throw error;
  const providerStatus=(error as {status?:unknown}|null)?.status;
  console.error(JSON.stringify({event:'student-conversation-failed',error:error instanceof Error?error.constructor.name:'unknown',reason:error instanceof Error&&error.message==='Student conversation did not pass its output checks after one repair.'?'reply validation':'provider or transport',...(typeof providerStatus==='number'?{status:providerStatus}:{})}));
  if(providerStatus===401)throw new AppError('AI_AUTHENTICATION','OpenAI rejected the AI connection. Ask the app owner to update the API key. Your message and saved conversation are safe.',503);
  throw new AppError('PROVIDER_FAILURE','Your student could not finish that reply. Your conversation is saved; retry the message.',503);
 }
}
