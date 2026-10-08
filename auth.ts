import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import {CredentialsSignin} from 'next-auth';
import {accountAdapter,authenticateAccount} from '@/lib/auth-store';
class TooManyAttempts extends CredentialsSignin {code='rate_limited';}
export const {handlers,auth,signIn,signOut}=NextAuth({
 adapter:accountAdapter,
 providers:[Credentials({credentials:{email:{type:'email'},password:{type:'password'}},authorize:async(input,request)=>{
  try{return await authenticateAccount(input,request);}catch(error){if((error as {code?:string}).code==='AUTH_RATE_LIMIT')throw new TooManyAttempts();throw error;}
 }}),...(process.env.AUTH_GOOGLE_ID&&process.env.AUTH_GOOGLE_SECRET?[Google]:[]),...(process.env.AUTH_GITHUB_ID&&process.env.AUTH_GITHUB_SECRET?[GitHub]:[])],
 secret:process.env.AUTH_SECRET,
 logger:{error(error){console.error('Authentication failed',{type:(error as {type?:string}).type??'AuthError'});}},
 trustHost:true,
 useSecureCookies:process.env.COOKIE_SECURE==='true'||process.env.NODE_ENV==='production'?true:undefined,
 pages:{signIn:'/login',error:'/login'},
 session:{strategy:'jwt',maxAge:30*24*60*60},
 callbacks:{
  async signIn({account,profile}){
   if(account?.provider==='credentials')return true;
   if(account?.provider==='google')return profile?.email_verified===true;
   return !!process.env.AUTH_OWNER_GITHUB_ID&&account?.provider==='github'&&account.providerAccountId===process.env.AUTH_OWNER_GITHUB_ID;
  },
  async jwt({token,account,user}){if(user?.id)token.sub=user.id;if(account){token.ownerId=account.provider==='github'?account.providerAccountId:undefined;}return token;},
  async session({session,token}){session.ownerId=typeof token.ownerId==='string'?token.ownerId:undefined;if(session.user&&token.sub)session.user.id=token.sub;return session;}
 }
});
