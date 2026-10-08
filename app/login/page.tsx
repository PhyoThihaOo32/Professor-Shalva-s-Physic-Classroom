import {Login} from '@/components/login';
import {redirect} from 'next/navigation';
import {authenticatedIdentity} from '@/lib/security';
import {accountDestination} from '@/lib/account-routing';
export default async function Page({searchParams}:{searchParams:Promise<{error?:string;complete?:string;mode?:string;next?:string}>}){
 const query=await searchParams,next=accountDestination(query.next),signup=query.mode==='signup';
 if(query.complete!=='1'&&!query.error&&await authenticatedIdentity())redirect(next??(signup?'/roles':'/space'));
 return <Login errorCode={query.error} complete={query.complete==='1'} signup={signup} nextPath={next}/>;
}
