'use client';
import {createContext,Fragment,useCallback,useContext,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {usePathname,useRouter} from 'next/navigation';
import {UserRound} from 'lucide-react';
import {api} from '@/lib/client';
import type {AccountState} from '@/lib/account-types';
import {loginHref} from '@/lib/account-routing';

type ContextValue={account:AccountState|null;loading:boolean;refresh:(options?:{signedOut:boolean})=>Promise<void>};
const AccountContext=createContext<ContextValue>({account:null,loading:true,refresh:async()=>{}});
const accountEvent='classroom-account-changed';
export function AccountProvider({children}:{children:React.ReactNode}){
 const path=usePathname(),router=useRouter();
 const [account,setAccount]=useState<AccountState|null>(null),[loading,setLoading]=useState(true);
 const request=useRef(0);
 const channelRef=useRef<BroadcastChannel|null>(null);
 const signedOut=useRef(false);
 const load=useCallback(async(clear=false)=>{
  const version=++request.current;if(clear)setLoading(true);
  try{const current=await api<AccountState>('account');if(version===request.current)setAccount(current);}
  catch{if(version===request.current)setAccount(null);}
  finally{if(version===request.current)setLoading(false);}
 },[]);
 useEffect(()=>{
  const changed=()=>{setAccount(null);void load(true);},focus=()=>void load(),invalidate=()=>{request.current++;};
  const channel=typeof BroadcastChannel==='undefined'?null:new BroadcastChannel(accountEvent);channelRef.current=channel;channel?.addEventListener('message',changed);
  window.addEventListener('focus',focus);
  window.addEventListener('classroom-auth-expired',changed);
  return()=>{invalidate();channel?.close();channelRef.current=null;window.removeEventListener('focus',focus);window.removeEventListener('classroom-auth-expired',changed);};
 },[load]);
 // Recheck cached navigation too. An expired cookie must not leave the client
 // remembering an old account or replacing the sign-in form with Welcome back.
 useEffect(()=>{let active=true;queueMicrotask(()=>{if(active)void load(path==='/login');});return()=>{active=false;};},[path,load]);
 const refresh=useCallback(async(options?:{signedOut:boolean})=>{signedOut.current=!!options?.signedOut;await load(true);channelRef.current?.postMessage('changed');},[load]);
 const publicPage=path==='/'||path==='/login';
 useEffect(()=>{if(!publicPage&&!loading&&!account?.user)router.replace(loginHref(signedOut.current?undefined:path+window.location.search));},[publicPage,loading,account?.user,path,router]);
 const scope=publicPage?'public':account?`${account.identity.kind}:${account.identity.id}`:'checking';
 return <AccountContext.Provider value={{account,loading,refresh}}><Fragment key={scope}>{publicPage||account?.user?children:<div className="account-opening" role="status">Opening your classroom…</div>}</Fragment></AccountContext.Provider>;
}
export const useAccount=()=>useContext(AccountContext);
export function AccountLink(){const {account}=useAccount();const label=account?.user?'My space':'Sign in';return <Link className={`account-link${account?.user?'':' account-link-signin'}`} href={account?.user?'/space':'/login'} aria-label={label} title={label}><UserRound size={16}/><span>{label}</span></Link>;}
