'use client';
import Link from 'next/link';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {signIn,signOut} from 'next-auth/react';
import {LogOut,UserRound,Check} from 'lucide-react';
import {api} from '@/lib/client';
import {useAccount} from './account-provider';
import {GoogleMark} from './login';
export function AccountSettings(){
 const {account,loading,refresh}=useAccount(),router=useRouter(),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function logout(){setBusy(true);setError('');try{await api('account/reset-guest',{method:'POST'});await signOut({redirect:false});await refresh();router.replace('/login');}catch{setBusy(false);setError('Sign-out couldn’t finish. Please try again.');}}
 return <section className="paper settings-section account-settings"><UserRound size={25}/><div><h2>Your account</h2>{loading?<p className="tiny">Loading…</p>:account?.user?<><p className="account-name">{account.user.name||'Your classroom'}</p><p className="tiny account-email">{account.user.email}</p><div className="action-row"><Link className="text-button" href="/space">My space →</Link><button className="text-button" disabled={busy} onClick={()=>void logout()}><LogOut size={15}/>Sign out</button></div>{account.googleAvailable&&(account.user.googleLinked?<p className="tiny google-linked"><Check size={14}/>Google connected</p>:<button className="text-button google-connect" disabled={busy} onClick={()=>void signIn('google',{redirectTo:'/login?complete=1'})}><GoogleMark/>Connect Google</button>)}</>:<><p>Save your conversations and return from any device.</p><Link className="text-button" href="/login">Sign in or create an account →</Link></>}{error&&<p role="alert" className="error">{error}</p>}</div></section>;
}
