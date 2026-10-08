import {Login} from '@/components/login';
export default async function Page({searchParams}:{searchParams:Promise<{error?:string;complete?:string}>}){
 const query=await searchParams;return <Login errorCode={query.error} complete={query.complete==='1'}/>;
}
