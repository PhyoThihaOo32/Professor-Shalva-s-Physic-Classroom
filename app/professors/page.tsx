import {ChooseProfessor} from '@/components/onboarding';
import {requireAccountPage} from '@/lib/page-account';
export default async function Page(){await requireAccountPage('/professors');return <ChooseProfessor/>;}
