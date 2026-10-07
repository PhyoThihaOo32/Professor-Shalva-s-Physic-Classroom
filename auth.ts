import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
export const {handlers,auth,signIn,signOut}=NextAuth({
 providers:process.env.AUTH_GITHUB_ID&&process.env.AUTH_GITHUB_SECRET?[GitHub]:[],
 secret:process.env.AUTH_SECRET,
 session:{strategy:'jwt',maxAge:60*60*8},
 callbacks:{
  async signIn({account}){return !!process.env.AUTH_OWNER_GITHUB_ID && account?.provider==='github' && account.providerAccountId===process.env.AUTH_OWNER_GITHUB_ID;},
  async jwt({token,account}){if(account){token.ownerId=account.providerAccountId;}return token;},
  async session({session,token}){session.ownerId=typeof token.ownerId==='string'?token.ownerId:undefined;return session;}
 }
});
