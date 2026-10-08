import {Settings} from '@/components/settings';
import {requireAccountPage} from '@/lib/page-account';
export default async function Page(){await requireAccountPage('/settings');return <Settings/>;}
