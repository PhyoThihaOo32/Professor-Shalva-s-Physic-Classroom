'use client';
import {createContext,Fragment,useCallback,useContext,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {UserRound} from 'lucide-react';
import {api} from '@/lib/client';
import type {AccountState} from '@/lib/account-types';

type ContextValue={account:AccountState|null;loading:boolean;refresh:()=>Promise<void>};
const AccountContext=createContext<ContextValue>({account:null,loading:true,refresh:async()=>{}});
const accountEvent='classroom-account-changed';
export function AccountProvider({children}:{children:React.ReactNode}){
 const path=usePathname();
 const [account,setAccount]=useState<AccountState|null>(null),[loading,setLoading]=useState(true);
 const request=useRef(0);
 const channelRef=useRef<BroadcastChannel|null>(null);
 const load=useCallback(async(clear=false)=>{
  const version=++request.current;if(clear)setLoading(true);
  try{const current=await api<AccountState>('account');if(version===request.current)setAccount(current);}
  catch{if(version===request.current)setAccount(null);}
  finally{if(version===request.current)setLoading(false);}
 },[]);
 useEffect(()=>{
  let cancelled=false;queueMicrotask(()=>{if(!cancelled)void load();});
  const changed=()=>{setAccount(null);void load(true);},focus=()=>void load(),invalidate=()=>{request.current++;};
  const channel=typeof BroadcastChannel==='undefined'?null:new BroadcastChannel(accountEvent);channelRef.current=channel;channel?.addEventListener('message',changed);
  window.addEventListener('focus',focus);
  return()=>{cancelled=true;invalidate();channel?.close();channelRef.current=null;window.removeEventListener('focus',focus);};
 },[load]);
 const refresh=useCallback(async()=>{await load(true);channelRef.current?.postMessage('changed');},[load]);
 const publicPage=['/','/roles','/students','/login'].includes(path)||path.startsWith('/library')||path.startsWith('/problems');
 const scope=publicPage?'public':account?`${account.identity.kind}:${account.identity.id}`:'checking';
 return <AccountContext.Provider value={{account,loading,refresh}}><Fragment key={scope}>{children}</Fragment></AccountContext.Provider>;
}
export const useAccount=()=>useContext(AccountContext);
export function AccountLink(){const {account}=useAccount();const label=account?.user?'My space':'Sign in';return <Link className="account-link" href={account?.user?'/space':'/login'} aria-label={label} title={label}><UserRound size={16}/><span>{label}</span></Link>;}
