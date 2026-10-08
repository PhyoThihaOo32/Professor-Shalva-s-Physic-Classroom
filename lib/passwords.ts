import 'server-only';
import {randomBytes,scrypt,timingSafeEqual} from 'node:crypto';
import {z} from 'zod';

const options={N:32768,r:8,p:3,maxmem:64*1024*1024};
function derive(password:string,salt:string){return new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,64,options,(error,key)=>error?reject(error):resolve(key)));}
export const emailSchema=z.string().trim().toLowerCase().email().max(254);
export const passwordSchema=z.string().min(12,'Use at least 12 characters.').max(128);
export const signupSchema=z.object({name:z.string().trim().min(1).max(60),email:emailSchema,password:passwordSchema}).strict();
export async function hashPassword(password:string){
 const salt=randomBytes(16).toString('hex');
 const key=await derive(password,salt);
 return `scrypt$32768$8$3$${salt}$${key.toString('hex')}`;
}
export async function verifyPassword(password:string,stored:string|null){
 const parts=stored?.split('$');
 const valid=parts?.length===6&&parts.slice(0,4).join('$')==='scrypt$32768$8$3'&&/^[a-f0-9]{32}$/.test(parts[4])&&/^[a-f0-9]{128}$/.test(parts[5]);
 // Missing accounts incur the same password work as existing accounts.
 const salt=valid?parts![4]:'00000000000000000000000000000000';
 const expected=valid?Buffer.from(parts![5],'hex'):Buffer.alloc(64);
 const actual=await derive(password,salt);
 return timingSafeEqual(actual,expected)&&!!valid;
}
