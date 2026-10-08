import 'server-only';
import {createHash,randomUUID} from 'node:crypto';
import type {Adapter} from 'next-auth/adapters';
import {db} from './db';
import {emailSchema,hashPassword,signupSchema,verifyPassword} from './passwords';
import {assert} from './errors';

const publicUser={id:true,email:true,name:true,image:true,emailVerified:true} as const;
export const accountAdapter:Adapter={
 createUser:async data=>db.user.create({data:{id:randomUUID(),email:data.email.trim().toLowerCase(),name:data.name,image:data.image,emailVerified:data.emailVerified},select:publicUser}),
 getUser:async id=>db.user.findUnique({where:{id},select:publicUser}),
 getUserByEmail:async email=>db.user.findUnique({where:{email:email.trim().toLowerCase()},select:publicUser}),
 getUserByAccount:async ({provider,providerAccountId})=>{
  const account=await db.authAccount.findUnique({where:{provider_providerAccountId:{provider,providerAccountId}},select:{user:{select:publicUser}}});
  if(account)return account.user;
  // Keep any existing owner history attached to its original immutable ID.
  if(provider==='github'&&providerAccountId===process.env.AUTH_OWNER_GITHUB_ID)return db.user.findUnique({where:{id:`github:${providerAccountId}`},select:publicUser});
  return null;
 },
 updateUser:async ({id,...data})=>db.user.update({where:{id},data:{name:data.name,email:data.email?.trim().toLowerCase(),image:data.image,emailVerified:data.emailVerified},select:publicUser}),
 linkAccount:async account=>{await db.authAccount.create({data:{userId:account.userId,provider:account.provider,providerAccountId:account.providerAccountId,type:account.type}});return account;},
 unlinkAccount:async ({provider,providerAccountId})=>{await db.authAccount.deleteMany({where:{provider,providerAccountId}});},
};

export async function limitAccountAction(action:'signin'|'signup',email:string,request:Request){
 const bucket=Math.floor(Date.now()/(15*60*1000));
 const digest=(value:string)=>createHash('sha256').update(`${process.env.AUTH_SECRET}:${value}`).digest('hex');
 const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()??'local';
 const keys=[{key:`auth:${action}:email:${digest(email)}:${bucket}`,max:action==='signup'?5:10},{key:`auth:${action}:network:${digest(ip)}:${bucket}`,max:action==='signup'?20:60}];
 await db.$transaction(async tx=>{
  for(const {key,max} of keys){
   await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))::text`;
   const quota=await tx.quota.upsert({where:{key},create:{key,count:0,expiresAt:new Date(Date.now()+30*60*1000)},update:{}});
   assert(quota.count<max,'AUTH_RATE_LIMIT','Too many attempts. Please try again in 15 minutes.',429);
   await tx.quota.update({where:{key},data:{count:{increment:1}}});
  }
 });
}
export async function registerAccount(input:unknown,request:Request){
 assert(process.env.AUTH_SECRET&&process.env.AUTH_SECRET.length>=32,'CONFIG','Account sign-in is temporarily unavailable.',503);
 const data=signupSchema.parse(input);await limitAccountAction('signup',data.email,request);
 const passwordHash=await hashPassword(data.password);
 try{return await db.user.create({data:{id:randomUUID(),email:data.email,name:data.name,passwordHash},select:{id:true,name:true,email:true}});}
 catch(error){if((error as {code?:string}).code==='P2002')assert(false,'ACCOUNT_EXISTS','An account already uses this email. Sign in instead.',409);throw error;}
}
export async function authenticateAccount(input:Partial<Record<string,unknown>>,request:Request){
 const email=emailSchema.safeParse(input.email);
 if(!email.success||typeof input.password!=='string'||!input.password||input.password.length>128)return null;
 await limitAccountAction('signin',email.data,request);
 const user=await db.user.findUnique({where:{email:email.data}});
 const valid=await verifyPassword(input.password,user?.passwordHash??null);
 return valid&&user?{id:user.id,name:user.name,email:user.email,image:user.image}:null;
}
