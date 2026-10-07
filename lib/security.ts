import 'server-only';
import { createHmac,randomUUID,timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { db } from './db';
import { assert } from './errors';
export type Identity={id:string;kind:'user'|'guest';owner:boolean};
const lifetime=30*24*60*60;
function secret(){assert(process.env.GUEST_COOKIE_SECRET&&process.env.GUEST_COOKIE_SECRET.length>=32,'CONFIG','Configure a GUEST_COOKIE_SECRET of at least 32 characters.',503);return process.env.GUEST_COOKIE_SECRET;}
export function signGuest(id:string,issued=Math.floor(Date.now()/1000)){const data=`${id}.${issued}`;return `${data}.${createHmac('sha256',secret()).update(data).digest('base64url')}`;}
export function verifyGuest(value:string):string|null{
 const parts=value.split('.');if(parts.length!==3||!/^[-a-z0-9]{36}$/.test(parts[0]))return null;
 const issued=Number(parts[1]);if(!Number.isFinite(issued)||issued>Date.now()/1000+60||issued<Date.now()/1000-lifetime)return null;
 const expected=signGuest(parts[0],issued).split('.')[2];const a=Buffer.from(expected),b=Buffer.from(parts[2]);return a.length===b.length&&timingSafeEqual(a,b)?parts[0]:null;
}
export async function identity():Promise<Identity>{
 if(process.env.AUTH_GITHUB_ID&&process.env.AUTH_SECRET){const session=await auth();if(session?.ownerId&&session.ownerId===process.env.AUTH_OWNER_GITHUB_ID){const id=`github:${session.ownerId}`;await db.user.upsert({where:{id},create:{id,email:session.user?.email??`${id}@local.invalid`},update:{}});return {id,kind:'user',owner:true};}}
 const jar=await cookies();const cookie=jar.get('chalklight_guest')?.value;let id=cookie?verifyGuest(cookie):null;
 if(id&&!await db.guestIdentity.findUnique({where:{id}}))id=null;
 if(!id){id=randomUUID();jar.set('chalklight_guest',signGuest(id),{httpOnly:true,sameSite:'lax',secure:process.env.COOKIE_SECURE==='true'||process.env.NODE_ENV==='production',path:'/',maxAge:lifetime});}
 await db.guestIdentity.upsert({where:{id},create:{id},update:{lastSeenAt:new Date()}});
 return {id,kind:'guest',owner:false};
}
export function owned(session:{userId:string|null;guestId:string|null},who:Identity){return who.kind==='user'?session.userId===who.id:session.guestId===who.id;}
export function requireOwner(who:Identity){assert(who.owner&&who.kind==='user','FORBIDDEN','Only the authenticated content owner may edit or publish.',403);}
export function checkOrigin(request:Request){const expected=process.env.APP_ORIGIN??'http://127.0.0.1:3000';assert(request.headers.get('origin')===expected,'ORIGIN','Request origin was not accepted.',403);assert(!request.headers.get('sec-fetch-site')||['same-origin','none'].includes(request.headers.get('sec-fetch-site')!),'CSRF','Cross-site mutation rejected.',403);}
