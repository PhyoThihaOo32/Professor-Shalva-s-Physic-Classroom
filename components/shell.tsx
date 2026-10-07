'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useStudentChoice} from '@/lib/student-choice';
import {appName} from '@/lib/brand';
import {Brand} from './brand';
import {AudioControls} from './audio-controls';
import {useEffect,useSyncExternalStore} from 'react';
import {FileText,BookOpen,ChartNoAxesColumnIncreasing,Settings,MessageCircle,ArrowUpRight,GraduationCap,PanelLeftClose,PanelLeftOpen} from 'lucide-react';
const sidebarPreference='chalklight-sidebar-folded';
let foldedFallback=false;
function readSidebar(){try{return localStorage.getItem(sidebarPreference)==='true';}catch{return foldedFallback;}}
function subscribeSidebar(onChange:()=>void){
 const onStorage=(event:StorageEvent)=>{if(event.key===sidebarPreference||event.key===null)onChange();};
 window.addEventListener('storage',onStorage);window.addEventListener('chalklight-sidebar-changed',onChange);
 return ()=>{window.removeEventListener('storage',onStorage);window.removeEventListener('chalklight-sidebar-changed',onChange);};
}
function expandedSidebar(){return false;}
function toggleSidebar(){foldedFallback=!readSidebar();try{localStorage.setItem(sidebarPreference,String(foldedFallback));}catch{}window.dispatchEvent(new Event('chalklight-sidebar-changed'));}
export {AudioControls} from './audio-controls';
export function Shell({children}:{children:React.ReactNode}){
 const path=usePathname(),studentId=useStudentChoice();
 const folded=useSyncExternalStore(subscribeSidebar,readSidebar,expandedSidebar);
 const location=path.startsWith('/library')||path.startsWith('/problems')?'library':path==='/progress'?'progress':path==='/resources'?'course notes':path==='/settings'?'settings':'classroom';
 useEffect(()=>{document.documentElement.dataset.contrast=localStorage.getItem('chalklight-contrast')??'normal';},[]);
 const onboarding=['/','/roles','/students'].includes(path);
 const entryStep=path==='/roles'?2:path==='/students'?3:1;
 if(onboarding)return <div className="onboarding-shell"><a className="skip-link" href="#main">Skip to content</a><header className="onboarding-header"><Brand/><div className="onboarding-meta"><span className="tiny">PHY215H · Honors physics</span><AudioControls compact/></div></header><main id="main"><nav className="entry-progress" aria-label="Getting started"><ol>{['Welcome','Your role','Your student','Classroom'].map((label,i)=><li key={label} className={entryStep===i+1?'active':entryStep>i+1?'done':''} aria-current={entryStep===i+1?'step':undefined}><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span>{label}</li>)}</ol></nav>{children}</main><footer>PHY215H · {appName}<span>Learn by teaching</span></footer></div>;
 return <div className={`app-shell${folded?' sidebar-folded':''}`}><a className="skip-link" href="#main">Skip to content</a><aside className="sidebar" id="app-sidebar"><Brand/><div className="course-label">PHY215H</div><nav aria-label="Main navigation"><Link className={path==='/classroom'||path.startsWith('/sessions')?'active':''} href={`/classroom?student=${studentId}`} aria-label="Classroom" title="Classroom"><MessageCircle size={18}/><span className="nav-label">Classroom</span></Link><Link className={path.startsWith('/library')||path.startsWith('/problems')?'active':''} href={`/library?student=${studentId}`} aria-label="Library" title="Library"><BookOpen size={18}/><span className="nav-label">Library</span></Link><Link className={path==='/progress'?'active':''} href="/progress" aria-label="Your progress" title="Your progress"><ChartNoAxesColumnIncreasing size={18}/><span className="nav-label">Your progress</span></Link><Link className={path==='/resources'?'active':''} href="/resources" aria-label="Course notes" title="Course notes"><FileText size={18}/><span className="nav-label">Course notes</span></Link><Link className={path==='/settings'?'active':''} href="/settings" aria-label="Settings" title="Settings"><Settings size={18}/><span className="nav-label">Settings</span></Link></nav><div className="sidebar-bottom"><AudioControls/><Link className="owner-link" href="/owner" aria-label="Content studio" title="Content studio"><span>Content studio</span> <ArrowUpRight size={13}/></Link><div className="guest-label"><GraduationCap size={17}/><span>PHY215H<small>Honors project · Teacher mode</small></span></div></div></aside><div className="main-shell"><header className="topbar"><div className="topbar-location"><button className="sidebar-toggle" aria-label={folded?'Expand sidebar':'Fold sidebar'} title={folded?'Expand sidebar':'Fold sidebar'} aria-expanded={!folded} aria-controls="app-sidebar" onClick={toggleSidebar}>{folded?<PanelLeftOpen size={18}/>:<PanelLeftClose size={18}/>}<span>{folded?'Show sidebar':'Hide sidebar'}</span></button><span><span className="status-dot"/> Physics / {location}</span></div><div className="topbar-actions"><div className="topbar-audio"><AudioControls compact/></div><Link className="mode-badge" href="/roles">Teacher mode <span>↗</span></Link></div></header><main id="main">{children}</main><footer>PHY215H · {appName}<span>Learn by teaching</span></footer></div></div>;
}
