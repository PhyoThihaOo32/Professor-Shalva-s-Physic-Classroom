import {Owner} from '@/components/owner';
import {requireAccountPage} from '@/lib/page-account';
export default async function Page(){await requireAccountPage('/owner');return <Owner/>;}
