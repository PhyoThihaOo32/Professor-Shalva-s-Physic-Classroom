'use client';
import {ArrowRight} from 'lucide-react';
import Link from 'next/link';
import {useAccount} from './account-provider';

export function Welcome(){
 const {account}=useAccount(),signedIn=!!account?.user;
 return <div className="page welcome">
  <div className="eyebrow">WELCOME TO PROFESSOR SHALVA’S PHYSIC CLASSROOM</div>
  <section className="welcome-hero">
   <div className="welcome-copy">
    <h1>Little steps.<br/><em>Big discoveries.</em></h1>
    <p>A little room to explore physics.<br/>Learn by teaching, one idea at a time.</p>
    <div className="mode-actions welcome-account-actions">
     <Link href={signedIn?'/roles':'/login'} className="button welcome-primary">{signedIn?'Enter my classroom':'Sign in'} <ArrowRight size={18}/></Link>
     <Link href={signedIn?'/space':'/login?mode=signup'} className="button welcome-secondary">{signedIn?'My space':'Create account'}</Link>
    </div>
    <p className="tiny welcome-note">{signedIn?'Your conversations are waiting for you.':'Sign in to make this classroom yours.'}</p>
   </div>

  </section>
 </div>;
}
