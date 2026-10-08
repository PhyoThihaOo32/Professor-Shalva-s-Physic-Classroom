import {requireAccountPage} from '@/lib/page-account';
import {pageDestination} from '@/lib/account-routing';
import {ProblemReference} from '@/components/problem-reference';
import {currentStudentId} from '@/lib/domain';
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{student?:string}>}){
 const [{id},{student}]=await Promise.all([params,searchParams]);
 await requireAccountPage(pageDestination(`/problems/${encodeURIComponent(id)}`,{student}));
 return <ProblemReference key={id} id={id} studentId={currentStudentId(student)}/>;
}
