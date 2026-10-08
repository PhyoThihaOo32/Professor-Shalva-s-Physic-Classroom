import {requireAccountPage} from '@/lib/page-account';
import {pageDestination} from '@/lib/account-routing';
import {Classroom} from '@/components/classroom';
import {currentStudentId} from '@/lib/domain';
export default async function Page({searchParams}:{searchParams:Promise<{student?:string;room?:string;new?:string}>}){
 const {student,room,new:newKey}=await searchParams;
 const studentId=currentStudentId(student);
 await requireAccountPage(pageDestination('/classroom',{student,room,new:newKey}));
 return <Classroom studentId={studentId} roomId={room&&/^[a-zA-Z0-9_-]{8,100}$/.test(room)?room:undefined} newKey={newKey&&/^[a-f0-9-]{36}$/.test(newKey)?newKey:undefined}/>;
}
