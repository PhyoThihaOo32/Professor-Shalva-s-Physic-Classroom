import 'server-only';
import {redirect} from 'next/navigation';
import {authenticatedIdentity} from './security';
import {loginHref} from './account-routing';

export async function requireAccountPage(destination:string){
 const user=await authenticatedIdentity();if(!user)redirect(loginHref(destination));return user;
}
