import {openRoom,getOpenRoom,messageOpenRoom,openSchema,openMessageSchema} from './open-classroom';
import { ProblemSchema } from './schemas';
import 'server-only';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { db } from './db';
import { identity,checkOrigin,requireOwner,requireUser } from './security';
import { AppError,assert } from './errors';
import { personas,publicProblem } from './domain';
import { createSchema,mutationSchema,createSession,getSession,mutateSession,json,loadSession,sessionDTO } from './sessions';
import {connectionSchema,connectionStatus,saveConnection,removeConnection,testConnection} from './ai-connection';
import {accountStatus,completeLogin,completeLoginSchema,resetGuestCookie,conversationHistory,deleteConversation} from './account';
import {registerAccount} from './auth-store';
const contentInput=z.object({chapterId:z.string().max(100),data:ProblemSchema}).strict();
async function readBody(request:Request){const raw=await request.text();assert(raw.length<=100000,'BODY','Request is too large.',413);return JSON.parse(raw) as unknown;}
export async function handle(request:Request){
 const requestId=randomUUID();const path=new URL(request.url).pathname.slice(5).split('/');const method=request.method;
 const ok=(data:unknown,status=200)=>NextResponse.json({data,requestId},{status,headers:{'Cache-Control':'private, no-store','X-Request-ID':requestId}});
 try{
  if(method!=='GET')checkOrigin(request);
  if(path[0]==='account'&&path[1]==='signup'&&path.length===2&&method==='POST')return ok(await registerAccount(await readBody(request),request),201);
  if(path[0]==='account'&&path[1]==='reset-guest'&&path.length===2&&method==='POST')return ok(await resetGuestCookie());
  if(path[0]==='chapters'&&method==='GET')return ok(await db.chapter.findMany({select:{id:true,title:true,source:true,_count:{select:{problems:true}}}}));
  if(path[0]==='problems'&&method==='GET'){
   assert(path.length<=2||(path.length===3&&path[1]&&path[2]==='reference'),'NOT_FOUND','Route not found.',404);
   const versions=path[1]?await db.problemVersion.findMany({where:{problemId:path[1],status:'published'},orderBy:{version:'desc'},take:1}):await db.problemVersion.findMany({where:{status:'published'},orderBy:{version:'desc'}});
   const seen=new Set<string>();const data=versions.filter(p=>{if(seen.has(p.problemId))return false;seen.add(p.problemId);return true;}).map(p=>publicProblem(p.problemId,p.id,p.version,ProblemSchema.parse(p.data)));
   if(path[1]){assert(data.length,'NOT_FOUND','Published problem not found.',404);if(path[2]==='reference'){const problem=ProblemSchema.parse(versions[0].data);assert(problem.kind!=='original-demo','NOT_FOUND','Problem reference not found.',404);return ok({problem:data[0],steps:problem.reference});}return ok(data[0]);}return ok(data);
  }
  const who=await identity();
  if(path[0]==='account'){
   if(path.length===1&&method==='GET')return ok(await accountStatus(who));
   if(path[1]==='complete'&&path.length===2&&method==='POST')return ok(await completeLogin(who,completeLoginSchema.parse(await readBody(request)).importGuest));
  }
  requireUser(who);
  if(path[0]==='account'&&path[1]==='conversations'&&path.length===2&&method==='GET')return ok(await conversationHistory(who));
  if(path[0]==='account'&&path[1]==='conversations'&&path.length===3&&method==='DELETE')return ok(await deleteConversation(path[2],who));
  if(path[0]==='config'&&method==='GET')return ok({personas,liveEnabled:(await connectionStatus(who)).configured,owner:who.owner,authenticationConfigured:!!process.env.AUTH_GITHUB_ID,identity:who.kind});
  if(path[0]==='ai-connection'){
   if(method==='GET'&&!path[1])return ok(await connectionStatus(who));
   if(method==='POST'&&!path[1])return ok(await saveConnection(connectionSchema.parse(await readBody(request)),who));
   if(method==='DELETE'&&!path[1])return ok(await removeConnection(who));
   if(method==='POST'&&path[1]==='test')return ok(await testConnection(who));
  }
  if(path[0]==='classrooms'){
   if(path.length===1&&method==='POST')return ok(await openRoom(openSchema.parse(await readBody(request)),who),201);
   if(path.length===2&&method==='GET')return ok(await getOpenRoom(path[1],who));
   if(path.length===3&&path[2]==='messages'&&method==='POST')return ok(await messageOpenRoom(path[1],openMessageSchema.parse(await readBody(request)),who));
  }
  if(path[0]==='sessions'){
   if(!path[1]&&method==='POST')return ok(await createSession(createSchema.parse(await readBody(request)),who),201);
   if(path[1]&&!path[2]&&method==='GET')return ok(await getSession(path[1],who));
   if(path[1]&&method==='POST'&&['next','corrections','hints','finish','messages','provider'].includes(path[2]))return ok(await mutateSession(path[1],path[2] as 'next'|'corrections'|'hints'|'finish'|'messages'|'provider',mutationSchema.parse(await readBody(request)),who));
  }
  const ownership=who.kind==='guest'?{guestId:who.id}:{userId:who.id};
  if(path[0]==='progress'&&method==='GET'){
   const sessions=await db.session.findMany({where:ownership,orderBy:{updatedAt:'desc'},include:{problemVersion:true,assessments:true,hints:true,errors:true,events:{select:{type:true}},_count:{select:{corrections:true}}}});
   const finished=sessions.filter(s=>['completed','revealed'].includes(s.state));
   return ok({sessions:sessions.map(s=>({mode:s.kind==='open-classroom'?'open-classroom':s.events.some(event=>event.type==='manual')?'manual':'classroom',id:s.id,title:s.kind==='open-classroom'?'Open classroom':ProblemSchema.parse(s.problemVersion!.data).title,chapterId:s.kind==='open-classroom'?undefined:ProblemSchema.parse(s.problemVersion!.data).chapterId,state:s.state,provider:s.provider,difficulty:s.difficulty,personaId:s.personaVersionId,updatedAt:s.updatedAt,corrections:s._count.corrections,hints:s.hints.length})),stats:{sessions:sessions.length,finished:finished.length,corrections:sessions.reduce((n,s)=>n+s._count.corrections,0),hints:sessions.reduce((n,s)=>n+s.hints.length,0)},families:finished.flatMap(s=>s.errors.map(e=>({family:e.family,resolved:e.resolved,score:e.resolved?s.assessments.find(a=>a.rootStep===e.rootStep)?.score??0:0,provisional:!!s.assessments.find(a=>a.rootStep===e.rootStep)?.provisional}))) });
  }
  if(path[0]==='history'&&path[1]==='export'&&method==='GET'){
   const sessions=await db.session.findMany({where:ownership,select:{id:true,kind:true}});const data=await Promise.all(sessions.map(async s=>s.kind==='open-classroom'?getOpenRoom(s.id,who):sessionDTO(await loadSession(s.id,who))));return ok({exportedAt:new Date().toISOString(),sessions:data});
  }
  if(path[0]==='history'&&!path[1]&&method==='DELETE'){const input=z.object({confirm:z.literal('DELETE MY HISTORY')}).strict().parse(await readBody(request));void input;const result=await db.session.deleteMany({where:ownership});return ok({deleted:result.count});}
  if(path[0]==='owner'){
   requireOwner(who);
   if(path[1]==='problems'&&method==='GET')return ok(await db.problem.findMany({include:{versions:{orderBy:{version:'desc'}}}}));
   if(path[1]==='problems'&&!path[2]&&method==='POST'){
    const input=contentInput.parse(await readBody(request));const problem=await db.problem.create({data:{chapterId:input.chapterId,versions:{create:{version:1,data:json(input.data),status:'draft'}}},include:{versions:true}});return ok(problem,201);
   }
   if(path[1]==='problems'&&path[2]&&method==='POST'){
    if(path[3]==='publish'){
     const input=z.object({versionId:z.string(),reviewNote:z.string().min(20).max(2000),confirmReviewed:z.literal(true)}).strict().parse(await readBody(request));
     const pv=await db.$transaction(async tx=>{await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${path[2]}))::text`;const pv=await tx.problemVersion.findUnique({where:{id:input.versionId}});assert(pv&&pv.problemId===path[2]&&pv.status==='review','REVIEW','Save this version as reviewed before publishing.',409);const data=ProblemSchema.parse(pv.data);assert(data.reference.every((s,i)=>s.id===`s${i+1}`),'CONTENT','Use sequential stable IDs s1 through sN.');const final=data.reference.at(-1)!;assert(final.value!==null&&Math.abs(final.value-data.target.value)<=data.target.tolerance&&final.unit===data.target.unit,'PHYSICS','Final numeric target and units must match the reference.');for(const template of data.templates){assert(data.reference.some(s=>s.id===template.rootStep)&&template.wrong.some(s=>s.id===template.rootStep),'CONTENT','Every error must have a valid root step.');await tx.errorTemplate.upsert({where:{id:template.id},create:{id:template.id,data:json(template)},update:{}});}return tx.problemVersion.update({where:{id:pv.id},data:{status:'published',reviewedAt:new Date(),reviewedBy:who.id,data:json({...data,reviewNotes:input.reviewNote})}});});return ok(pv);
    }
    const input=z.object({data:ProblemSchema,status:z.enum(['draft','review'])}).strict().parse(await readBody(request));
    const pv=await db.$transaction(async tx=>{await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${path[2]}))::text`;const last=await tx.problemVersion.findFirst({where:{problemId:path[2]},orderBy:{version:'desc'}});assert(last,'NOT_FOUND','Problem not found.',404);return tx.problemVersion.create({data:{problemId:path[2],version:last.version+1,status:input.status,data:json(input.data)}});});return ok(pv,201);
   }
  }
  throw new AppError('NOT_FOUND','Route not found.',404);
 }catch(e){
  const status=e instanceof AppError?e.status:e instanceof z.ZodError||e instanceof SyntaxError?400:503;
  const code=e instanceof AppError?e.code:status===400?'VALIDATION':'SERVICE_UNAVAILABLE';
  const message=e instanceof AppError?e.message:status===400?'The request did not match the required input schema.':'The service is unavailable. Check the database and server configuration.';
  if(status>=500)console.error(JSON.stringify({requestId,code,error:e instanceof Error?e.name:'unknown'}));
  return NextResponse.json({error:{code,message},requestId},{status,headers:{'Cache-Control':'private, no-store','X-Request-ID':requestId}});
 }
}
