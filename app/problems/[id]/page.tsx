import {ProblemReference} from '@/components/problem-reference';
import {currentStudentId} from '@/lib/domain';
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{student?:string}>}){
 const [{id},{student}]=await Promise.all([params,searchParams]);
 return <ProblemReference key={id} id={id} studentId={currentStudentId(student)}/>;
}
