import {ArrowRight} from 'lucide-react';

export function Welcome(){
 return <div className="page welcome">
  <div className="eyebrow">WELCOME TO PROFESSOR SHALVA’S PHYSIC CLASSROOM</div>
  <section className="welcome-hero">
   <div className="welcome-copy">
    <h1>Little steps.<br/><em>Big discoveries.</em></h1>
    <p>A little room to explore physics.<br/>Learn by teaching, one idea at a time.</p>
    <div className="mode-actions">
     {/* A native link keeps the first step usable before the client finishes loading. */}
     <a href="/roles" className="button">Get started <ArrowRight size={18}/></a>
    </div>
    <p className="tiny welcome-note">Your classroom is just a few steps away.</p>
   </div>

  </section>
 </div>;
}
