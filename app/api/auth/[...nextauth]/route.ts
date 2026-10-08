import { handlers } from '@/auth';
import {checkOrigin} from '@/lib/security';
import {NextResponse,type NextRequest} from 'next/server';
export const runtime='nodejs';
export const GET=handlers.GET;
export async function POST(request:NextRequest){
 try{checkOrigin(request);}catch{return NextResponse.json({error:'Request origin was not accepted.'},{status:403});}
 return handlers.POST(request);
}
