import {test as base,type APIRequestContext} from '@playwright/test';
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
export const test=base.extend({page:async({page},provide)=>{
 Object.defineProperty(page,'request',{value:loopbackRequests(page.request)});
 await provide(page);
}});
