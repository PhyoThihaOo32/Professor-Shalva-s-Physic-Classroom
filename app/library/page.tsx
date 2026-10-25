import {requireAccountPage} from '@/lib/page-account';
import {Library} from '@/components/library';
import {currentStudentId} from '@/lib/domain';
import {courseChapter,problemLibraryHref} from '@/lib/course';
import {redirect} from 'next/navigation';
export default async function Page({searchParams}:{searchParams:Promise<{student?:string;chapter?:string}>}){
 const {student,chapter}=await searchParams,selected=courseChapter(chapter);
 await requireAccountPage(problemLibraryHref(selected.id,student));
 if(chapter&&chapter!==selected.id)redirect(problemLibraryHref(selected.id,student));
 return <Library studentId={currentStudentId(student)} chapterId={selected.id}/>;
}
