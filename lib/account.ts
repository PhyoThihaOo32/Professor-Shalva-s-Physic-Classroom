import 'server-only';
import {cookies} from 'next/headers';
import {z} from 'zod';
import {db} from './db';
import {verifyGuest,requireUser,type Identity} from './security';
import {assert} from './errors';
import {moveGuestConnection} from './ai-connection';
import {ProblemSchema} from './schemas';
import type {AccountState,SpaceConversation} from './account-types';

export async function accountStatus(who:Identity):Promise<AccountState>{
 const user=who.kind==='user'?await db.user.findUnique({where:{id:who.id},select:{id:true,name:true,email:true,accounts:{select:{provider:true}}}}):null;
 return {identity:{id:who.id,kind:who.kind},user:user?{id:user.id,name:user.name,email:user.email,googleLinked:user.accounts.some(a=>a.provider==='google')}:null,googleAvailable:!!(process.env.AUTH_GOOGLE_ID&&process.env.AUTH_GOOGLE_SECRET)};
}
export async function claimGuestHistory(guestId:string,userId:string){
 return db.$transaction(async tx=>{
  await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id"=${userId} FOR UPDATE`;
  assert(await tx.user.findUnique({where:{id:userId}}),'UNAUTHORIZED','Please sign in again.',401);
  await tx.$queryRaw`SELECT "id" FROM "GuestIdentity" WHERE "id"=${guestId} FOR UPDATE`;
  if(!await tx.guestIdentity.findUnique({where:{id:guestId}}))return 0;
  await moveGuestConnection(tx,guestId,userId);
  const result=await tx.session.updateMany({where:{guestId,userId:null},data:{userId,guestId:null}});
  await tx.guestIdentity.delete({where:{id:guestId}});
  return result.count;
 });
}
export const completeLoginSchema=z.object({importGuest:z.boolean()}).strict();
export async function completeLogin(who:Identity,importGuest:boolean){
 assert(who.kind==='user','UNAUTHORIZED','Please sign in first.',401);
 const jar=await cookies(),value=jar.get('chalklight_guest')?.value;
 const guestId=value?verifyGuest(value):null;
 const imported=importGuest&&guestId?await claimGuestHistory(guestId,who.id):0;
 jar.delete('chalklight_guest');
 return {imported};
}
export async function resetGuestCookie(){(await cookies()).delete('chalklight_guest');return {reset:true};}
export async function conversationHistory(who:Identity):Promise<SpaceConversation[]>{
 const owner=who.kind==='user'?{userId:who.id}:{guestId:who.id};
 const sessions=await db.session.findMany({where:owner,orderBy:[{updatedAt:'desc'},{id:'desc'}],take:60,select:{id:true,kind:true,personaVersionId:true,updatedAt:true,problemVersion:{select:{data:true}},events:{where:{type:'open-message'},orderBy:[{createdAt:'desc'},{id:'desc'}],take:1,select:{data:true}}}});
 return sessions.map(s=>{
  const event=s.events[0]?.data as {teacher?:unknown}|undefined;
  const preview=typeof event?.teacher==='string'?event.teacher.slice(0,160):'';
  return {id:s.id,kind:s.kind==='open-classroom'?'open-classroom':'problem',personaId:s.personaVersionId,title:s.kind==='open-classroom'?(preview||'A fresh conversation'):ProblemSchema.parse(s.problemVersion!.data).title,updatedAt:s.updatedAt.toISOString()};
 });
}
export async function deleteConversation(id:string,who:Identity){
 requireUser(who);
 return db.$transaction(async tx=>{
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))::text`;
  const result=await tx.session.deleteMany({where:{id,userId:who.id}});
  assert(result.count,'NOT_FOUND','Conversation not found.',404);
  return {deleted:true};
 });
}
