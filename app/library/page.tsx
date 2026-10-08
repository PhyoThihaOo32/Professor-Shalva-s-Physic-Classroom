import {requireAccountPage} from '@/lib/page-account';
import {pageDestination} from '@/lib/account-routing';
import {Library} from '@/components/library';
import {currentStudentId} from '@/lib/domain';
export default async function Page({searchParams}:{searchParams:Promise<{student?:string}>}){
 const {student}=await searchParams;
 await requireAccountPage(pageDestination('/library',{student}));
 return <Library studentId={currentStudentId(student)}/>;
}
