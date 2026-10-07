import {redirect} from 'next/navigation';
import {currentStudentId} from '@/lib/domain';
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{student?:string}>}){
 const [{id},{student}]=await Promise.all([params,searchParams]);
 const studentId=currentStudentId(student);
 redirect(`/problems/${encodeURIComponent(id)}${studentId?`?student=${studentId}`:''}`);
}
