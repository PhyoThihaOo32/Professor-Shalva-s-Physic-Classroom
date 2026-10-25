'use client';
import Link from 'next/link';
import {usePathname,useSearchParams} from 'next/navigation';
import {courseChapters,problemLibraryHref,problemPageChapter} from '@/lib/course';

export function ChapterNavigation({studentId}:{studentId:string}){
 const path=usePathname(),params=useSearchParams();
 const selected=problemPageChapter(path,params.get('chapter')??undefined);
 const student=params.get('student')??studentId;
 return <section className="sidebar-chapters" aria-label="Problem selection">
  <p className="sidebar-chapters-label">Chapters</p>
  <nav className="chapter-options" aria-label="Problem chapters">{courseChapters.map(c=><Link key={c.id} href={problemLibraryHref(c.id,student)} aria-label={String(c.number).padStart(2,'0')+' '+c.shortTitle} aria-current={c.id===selected.id?'page':undefined} title={c.title}>
   <span className="chapter-number">{String(c.number).padStart(2,'0')}</span><span className="chapter-name">{c.shortTitle}</span>
  </Link>)}</nav>
 </section>;
}
