import {ChooseRole} from '@/components/onboarding';
import {requireAccountPage} from '@/lib/page-account';
export default async function Page(){await requireAccountPage('/roles');return <ChooseRole/>;}
