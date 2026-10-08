import {requireAccountPage} from '@/lib/page-account';
import {Review} from '@/components/workspace';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;await requireAccountPage(`/sessions/${encodeURIComponent(id)}/review`);return <Review id={id}/>;}
