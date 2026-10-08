'use client';
import {ArrowRight} from 'lucide-react';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useAccount} from './account-provider';
import {welcomeQuotes,type WelcomeQuote} from '@/lib/welcome-quotes';

export function Welcome(){
 const {account}=useAccount(),signedIn=!!account?.user;
 const [quote,setQuote]=useState<WelcomeQuote|null>(null);
 useEffect(()=>{
  const frame=requestAnimationFrame(()=>{
   let previous:string|null=null;
   try{previous=sessionStorage.getItem('welcome-quote');}catch{}
   const choices=welcomeQuotes.filter(item=>item.text!==previous);
   const next=choices[Math.floor(Math.random()*choices.length)];
   try{sessionStorage.setItem('welcome-quote',next.text);}catch{}
   setQuote(next);
  });
  return()=>cancelAnimationFrame(frame);
 },[]);
 return <div className="page welcome">
  <section className="welcome-hero">
   <div className="welcome-copy">
    <figure className="welcome-quote" aria-label="Science quote">
     {quote&&<><blockquote>“{quote.text}”</blockquote>
     <figcaption>— {quote.author}</figcaption></>}
    </figure>
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
