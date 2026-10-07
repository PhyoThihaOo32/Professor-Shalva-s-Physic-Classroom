import {Library} from '@/components/library';
import {currentStudentId} from '@/lib/domain';
export default async function Page({searchParams}:{searchParams:Promise<{student?:string}>}){
 const {student}=await searchParams;
 return <Library studentId={currentStudentId(student)}/>;
}
