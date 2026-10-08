'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {signIn} from 'next-auth/react';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import {api} from '@/lib/client';
import {useAccount} from './account-provider';
import {loginHref} from '@/lib/account-routing';

export function GoogleMark(){return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.2H3.1v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.8a6 6 0 0 1 0-3.6V7.6H3.1a10 10 0 0 0 0 8.8l3.3-2.6Z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.5 9.5 0 0 0 12 2a10 10 0 0 0-8.9 5.6l3.3 2.6C7.2 7.8 9.4 6 12 6Z"/></svg>;}
function oauthError(code?:string){
 if(code==='OAuthAccountNotLinked')return 'Sign in with your password first, then connect Google in Settings.';
 if(code==='AccessDenied')return 'Google could not confirm your email. Please try another account.';
 return code?'Sign-in couldn’t finish. Please try again.':'';
}
export function Login({errorCode,complete=false,signup=false,nextPath}:{errorCode?:string;complete?:boolean;signup?:boolean;nextPath?:string}){
 const {account,loading,refresh}=useAccount(),router=useRouter();
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState('');
 const [importGuest,setImportGuest]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(oauthError(errorCode));
 const completed=useRef(false);
 const userId=account?.user?.id;
 const destination=nextPath??(signup?'/roles':'/space');
 const finish=useCallback(async(keep:boolean)=>{await api('account/complete',{method:'POST',body:{importGuest:keep}});await refresh();router.replace(destination);},[refresh,router,destination]);
 useEffect(()=>{
  if(!complete||loading||!userId||completed.current)return;
  completed.current=true;let keep=true;try{keep=sessionStorage.getItem('classroom-import-guest')!=='false';sessionStorage.removeItem('classroom-import-guest');}catch{}
  void finish(keep).catch(()=>setError('You’re signed in, but your browser history could not be imported. Please try again.'));
 },[complete,loading,userId,finish]);
 async function submit(event:React.FormEvent){
  event.preventDefault();if(busy)return;setBusy(true);setError('');
  try{
   if(signup)await api('account/signup',{method:'POST',body:{name,email,password}});
   const result=await signIn('credentials',{email,password,redirect:false,redirectTo:destination});
   if(!result?.ok||result.error){setError(result?.code==='rate_limited'?'Too many attempts. Try again in 15 minutes.':'That email and password don’t match. Please try again.');return;}
   setPassword('');await finish(importGuest);
  }catch(e){setError((e as Error).message||'Sign-in couldn’t finish. Please try again.');}
  finally{setBusy(false);}
 }
 async function google(){if(busy||!account?.googleAvailable)return;setBusy(true);setError('');try{sessionStorage.setItem('classroom-import-guest',String(importGuest));await signIn('google',{redirectTo:`${loginHref(destination)}&complete=1`});}catch{setBusy(false);setError('Google sign-in is unavailable right now.');}}
 return <div className="page login-page"><Link href="/" className="breadcrumb"><ArrowLeft size={14}/>Welcome</Link><section className="login-content"><div className="eyebrow">A SPACE OF YOUR OWN</div><h1>{account?.user?'Welcome back':signup?'Make yourself at home':'Welcome'}</h1><p className="subtitle">Your students. Your conversations. Wherever you study.</p>{account?.user?<div className="signed-in-welcome"><p>Signed in as {account.user.name||account.user.email}.</p>{error&&<p role="alert" className="error">{error}</p>}<Link className="button" href="/space">Go to my space <ArrowRight size={17}/></Link>{error&&complete&&<button className="text-button" onClick={()=>void finish(true).catch(()=>setError('Couldn’t import this browser’s history. Try again shortly.'))}>Retry history import</button>}</div>:<>
  <div className="login-tabs" role="group" aria-label="Account action"><button type="button" aria-pressed={!signup} disabled={busy||loading} onClick={()=>{router.replace(loginHref(nextPath));setError('');}}>Sign in</button><button type="button" aria-pressed={signup} disabled={busy||loading} onClick={()=>{router.replace(loginHref(nextPath,true));setError('');}}>Create account</button></div>
  <button className="google-signin" type="button" disabled={busy||loading||!account?.googleAvailable} onClick={()=>void google()}><GoogleMark/>Continue with Google</button>
  <div className="login-divider"><span>or use your email</span></div>
  <form onSubmit={e=>void submit(e)} className="login-form">{signup&&<label>Name<input value={name} onChange={e=>setName(e.target.value)} name="name" autoComplete="name" required maxLength={60} disabled={busy||loading}/></label>}<label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} name="email" autoComplete="email" required maxLength={254} disabled={busy||loading}/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} name="password" autoComplete={signup?'new-password':'current-password'} required minLength={signup?12:undefined} maxLength={128} disabled={busy||loading}/></label>{signup&&<p className="tiny password-hint">At least 12 characters.</p>}<label className="import-conversations"><input type="checkbox" checked={importGuest} onChange={e=>setImportGuest(e.target.checked)} disabled={busy||loading}/>Keep conversations from this browser</label>{error&&<p role="alert" className="error">{error}</p>}<button className="button full" disabled={busy||loading} type="submit">{busy?'Opening your space…':signup?'Create my account':'Sign in'}<ArrowRight size={17}/></button></form>
 </>}</section></div>;
}
