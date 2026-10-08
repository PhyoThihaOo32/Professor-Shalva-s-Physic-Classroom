'use client';
import {ArrowRight} from 'lucide-react';
import Link from 'next/link';
import {useAccount} from './account-provider';

export function Welcome(){
 const {account}=useAccount(),signedIn=!!account?.user;
 return <div className="page welcome">
  <section className="welcome-hero">
   <div className="welcome-copy">
    <h1>Little steps.<br/><em>Big discoveries.</em></h1>
    <p>A little room to explore physics.</p>
    <div className="mode-actions welcome-account-actions">
     <Link href={signedIn?'/roles':'/login'} className="button welcome-primary">{signedIn?'Enter my classroom':'Sign in'} <ArrowRight size={18}/></Link>
     {!signedIn&&<Link href="/login?mode=signup" className="button welcome-secondary">Create account</Link>}
    </div>
    {!signedIn&&<p className="tiny welcome-note">Sign in to make this classroom yours.</p>}
   </div>

  </section>
 </div>;
}
