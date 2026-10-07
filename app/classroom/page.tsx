import {Classroom} from '@/components/classroom';
import {currentStudentId} from '@/lib/domain';
export default async function Page({searchParams}:{searchParams:Promise<{student?:string}>}){
 const {student}=await searchParams;
 const studentId=currentStudentId(student);
 return <Classroom studentId={studentId}/>;
}
