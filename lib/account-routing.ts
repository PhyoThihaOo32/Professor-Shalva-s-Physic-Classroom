// Return only to known application pages, never an external URL or auth endpoint.
export function accountDestination(value?:string):string|undefined{
 if(!value||!value.startsWith('/')||value.startsWith('//')||/[\\\x00-\x20]/.test(value))return;
 try{
  const url=new URL(value,'https://classroom.invalid');
  if(url.origin!=='https://classroom.invalid'||url.hash)return;
  const paths=['/roles','/students','/space','/classroom','/settings','/owner','/library'];
  if(!paths.includes(url.pathname)&&!/^\/(?:problems|sessions)\/[a-zA-Z0-9_-]+(?:\/review)?$/.test(url.pathname)&&url.pathname!=='/library/guide')return;
  return url.pathname+url.search;
 }catch{return;}
}
export function loginHref(next?:string,signup=false){
 const query=new URLSearchParams();if(signup)query.set('mode','signup');
 const destination=accountDestination(next);if(destination)query.set('next',destination);
 return `/login${query.size?`?${query}`:''}`;
}
export function pageDestination(path:string,query:Record<string,string|undefined>={}){
 const params=new URLSearchParams();for(const [key,value] of Object.entries(query))if(value)params.set(key,value);
 return `${path}${params.size?`?${params}`:''}`;
}
