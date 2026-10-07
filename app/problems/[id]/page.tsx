import {Setup} from '@/components/setup';
import {currentStudentId} from '@/lib/domain';
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{student?:string}>}){
 const [{id},{student}]=await Promise.all([params,searchParams]);
 return <Setup id={id} studentId={currentStudentId(student)}/>;
}
