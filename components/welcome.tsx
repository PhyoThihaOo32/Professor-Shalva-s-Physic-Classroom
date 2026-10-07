import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
export function Welcome(){
 return <div className="page welcome"><div className="eyebrow">WELCOME TO PROFESSOR SHALVA’S PHYSIC CLASSROOM</div><section className="welcome-hero"><div><h1>Little steps.<br/><em>Big discoveries.</em></h1><p>A little room to explore physics.<br/>Learn by teaching, one idea at a time.</p><div className="mode-actions"><Link href="/roles" className="button">Get started <ArrowRight size={18}/></Link></div><p className="tiny welcome-note">Your classroom is just a few steps away.</p></div><div className="welcome-orbits" aria-hidden="true"><span className="orbit-center"/><span className="orbit-satellite"/><span className="orbit-trail"/></div></section></div>;
}
