import {ChooseStudent} from '@/components/onboarding';
import {requireAccountPage} from '@/lib/page-account';
export default async function Page(){await requireAccountPage('/students');return <ChooseStudent/>;}
