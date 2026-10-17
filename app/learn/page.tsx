import {requireAccountPage} from '@/lib/page-account';
import {pageDestination} from '@/lib/account-routing';
import {Classroom} from '@/components/classroom';
import {currentProfessorId} from '@/lib/domain';
export default async function Page({searchParams}:{searchParams:Promise<{professor?:string;room?:string;new?:string}>}){
 const {professor,room,new:newKey}=await searchParams;
 await requireAccountPage(pageDestination('/learn',{professor,room,new:newKey}));
 return <Classroom mode="student" professorId={currentProfessorId(professor)} roomId={room&&/^[a-zA-Z0-9_-]{8,100}$/.test(room)?room:undefined} newKey={newKey&&/^[a-f0-9-]{36}$/.test(newKey)?newKey:undefined}/>;
}
