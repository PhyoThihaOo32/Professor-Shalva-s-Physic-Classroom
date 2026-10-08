'use client';
import Link from 'next/link';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {useStudentChoice} from '@/lib/student-choice';
import {appName} from '@/lib/brand';
import {Brand} from './brand';
import {AccountLink,useAccount} from './account-provider';
import {UserRound} from 'lucide-react';
import {AudioControls} from './audio-controls';
import {useSyncExternalStore} from 'react';
import {BookOpen,Settings,MessageCircle,GraduationCap,PanelLeftClose,PanelLeftOpen} from 'lucide-react';
const sidebarPreference='chalklight-sidebar-folded';
let foldedFallback=false;
function readSidebar(){try{return localStorage.getItem(sidebarPreference)==='true';}catch{return foldedFallback;}}
function subscribeSidebar(onChange:()=>void){
 const onStorage=(event:StorageEvent)=>{if(event.key===sidebarPreference||event.key===null)onChange();};
 window.addEventListener('storage',onStorage);window.addEventListener('chalklight-sidebar-changed',onChange);
 return ()=>{window.removeEventListener('storage',onStorage);window.removeEventListener('chalklight-sidebar-changed',onChange);};
}
function expandedSidebar(){return false;}
function setSidebar(folded:boolean){foldedFallback=folded;try{localStorage.setItem(sidebarPreference,String(foldedFallback));}catch{}window.dispatchEvent(new Event('chalklight-sidebar-changed'));}
function toggleSidebar(){setSidebar(!readSidebar());}
export {AudioControls} from './audio-controls';
export function Shell({children}:{children:React.ReactNode}){
 const path=usePathname(),studentId=useStudentChoice();
 const {account}=useAccount();
 const folded=useSyncExternalStore(subscribeSidebar,readSidebar,expandedSidebar);
 const location=path.startsWith('/library')||path.startsWith('/problems')?'problems':path==='/settings'?'settings':path==='/space'?'my space':'classroom';
 const onboarding=['/','/roles','/students','/login'].includes(path);
 const entryAnimation=path==='/'||path==='/login'?'space':path==='/roles'?'astronaut':path==='/students'?'students':null;
 const entryStep=path==='/login'?2:path==='/roles'||path==='/students'?3:1;
 if(onboarding)return <div className={`onboarding-shell${entryAnimation?` animated-entry entry-${entryAnimation}`:''}`}>{entryAnimation&&<picture className={`entry-animation welcome-${entryAnimation}`}><source media="(prefers-reduced-motion: reduce)" srcSet={`/images/welcome-${entryAnimation}-still.png`}/><Image src={`/images/welcome-${entryAnimation}.gif`} width={480} height={entryAnimation==='students'?296:360} alt="" unoptimized loading="eager"/></picture>}<a className="skip-link" href="#main">Skip to content</a><header className="onboarding-header"><Brand/><div className="onboarding-meta">{path!=='/login'&&<AccountLink/>}<div className="onboarding-music"><AudioControls compact/></div></div></header><main id="main">{path!=='/login'&&<nav className="entry-progress" aria-label="Getting started"><ol>{['Welcome','Sign in','Your student','Classroom'].map((label,i)=><li key={label} className={entryStep===i+1?'active':entryStep>i+1?'done':''} aria-current={entryStep===i+1?'step':undefined}><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span>{label}</li>)}</ol></nav>}{children}</main><footer>PHY215H · {appName}</footer></div>;
 return <div className={`app-shell${folded?' sidebar-folded':''}`}><a className="skip-link" href="#main">Skip to content</a><aside className="sidebar" id="app-sidebar"><Brand/><div className="course-label">PHY215H</div><nav aria-label="Main navigation"><Link className={path==='/classroom'||path.startsWith('/sessions')?'active':''} href={`/classroom?student=${studentId}`} aria-label="Classroom" title="Classroom"><MessageCircle size={18}/><span className="nav-label">Classroom</span></Link><Link className={path.startsWith('/library')||path.startsWith('/problems')?'active':''} href={`/library?student=${studentId}`} aria-label="Problems" title="Problems"><BookOpen size={18}/><span className="nav-label">Problems</span></Link><Link className={path==='/settings'?'active':''} href="/settings" aria-label="Settings" title="Settings"><Settings size={18}/><span className="nav-label">Settings</span></Link>{account?.user&&<Link className={path==='/space'?'active':''} href="/space" aria-label="My space" title="My space"><UserRound size={18}/><span className="nav-label">My space</span></Link>}</nav><div className="sidebar-bottom"><section className="sidebar-music" aria-label="Study music"><AudioControls/></section><div className="guest-label"><GraduationCap size={17}/><span>PHY215H<small>Honors project · Teacher mode</small></span></div></div></aside><div className="main-shell"><header className="topbar"><div className="topbar-location"><button className="sidebar-toggle" aria-label={folded?'Expand sidebar':'Fold sidebar'} title={folded?'Expand sidebar':'Fold sidebar'} aria-expanded={!folded} aria-controls="app-sidebar" onClick={toggleSidebar}>{folded?<PanelLeftOpen size={18}/>:<PanelLeftClose size={18}/>}<span>{folded?'Show sidebar':'Hide sidebar'}</span></button><span><span className="status-dot"/> Physics / {location}</span></div><div className="topbar-actions"><AccountLink/><div className="topbar-audio"><AudioControls compact/></div><Link className="mode-badge" href="/roles">Teacher mode <span>↗</span></Link></div></header><main id="main">{children}</main><footer>PHY215H · {appName}</footer></div></div>;
}
