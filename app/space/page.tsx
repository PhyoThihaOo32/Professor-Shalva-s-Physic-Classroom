import {PersonalSpace} from '@/components/personal-space';
import {requireAccountPage} from '@/lib/page-account';
export default async function Page(){await requireAccountPage('/space');return <PersonalSpace/>;}
