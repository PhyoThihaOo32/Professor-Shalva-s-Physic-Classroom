import 'dotenv/config';
import {test as base,type APIRequestContext,type BrowserContext} from '@playwright/test';
import {encode} from 'next-auth/jwt';
import {db} from '../lib/db';
const origin=process.env.E2E_BASE_URL??'http://127.0.0.1:3100';
// Chromium accepts Secure cookies on loopback HTTP; Playwright's API client does
// not. Reuse that test context's cookie jar for requests to the same local app.
// Browser behavior and the application's production cookie flags stay intact.
function loopbackRequests(request:APIRequestContext):APIRequestContext{
 return new Proxy(request,{get(target,property){
  const value=Reflect.get(target,property);
  if(['get','post','put','patch','delete','head'].includes(String(property)))return async(url:string,options:Parameters<APIRequestContext['fetch']>[1]={})=>{
   const destination=new URL(url,origin);let headers=options.headers;
   if(destination.origin===origin&&destination.protocol==='http:'&&['127.0.0.1','localhost'].includes(destination.hostname)){
    const {cookies}=await target.storageState();
    const cookie=cookies.filter(c=>c.domain.replace(/^\./,'')===destination.hostname&&destination.pathname.startsWith(c.path)).map(c=>`${c.name}=${c.value}`).join('; ');
    if(cookie&&!Object.keys(headers??{}).some(name=>name.toLowerCase()==='cookie'))headers={...headers,Cookie:cookie};
   }
   return value.call(target,url,{...options,headers});
  };
  return typeof value==='function'?value.bind(target):value;
 }});
}
export const anonymousTest=base.extend({page:async({page},provide)=>{
 Object.defineProperty(page,'request',{value:loopbackRequests(page.request)});
 await provide(page);
}});

// Non-authentication scenarios use a real account and the server's normal JWT
// format. Sign-up and credential behavior are exercised separately via the UI.
export async function fixtureAccount(context:BrowserContext){
 const id=crypto.randomUUID(),name='Classroom test',email=`routing-fixture-${id}@example.test`;
 await db.user.create({data:{id,name,email}});
 const cookieName='__Secure-authjs.session-token';
 const token=await encode({token:{sub:id,name,email},secret:process.env.AUTH_SECRET!,salt:cookieName,maxAge:3600});
 await context.addCookies([{name:cookieName,value:token,domain:new URL(origin).hostname,path:'/',httpOnly:true,secure:true,sameSite:'Lax'}]);
 return ()=>db.user.deleteMany({where:{id,email}});
}
export const test=anonymousTest.extend({page:async({page},provide)=>{
 const cleanup=await fixtureAccount(page.context());try{await provide(page);}finally{await cleanup();}
}});
