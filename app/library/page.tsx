import {Library} from '@/components/library';
import {currentStudentId} from '@/lib/domain';
export default async function Page({searchParams}:{searchParams:Promise<{student?:string;chapter?:string;section?:string}>}){
 const {student,chapter,section}=await searchParams;
 return <Library studentId={currentStudentId(student)} chapter={chapter==='demo'?'demo':'chapter-2'} manual={section==='manual'}/>;
}
