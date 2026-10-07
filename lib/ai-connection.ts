import 'server-only';
import {createCipheriv,createDecipheriv,hkdfSync,randomBytes} from 'node:crypto';
import OpenAI from 'openai';
import {z} from 'zod';
import {db} from './db';
import {type Identity} from './security';
import {assert,AppError} from './errors';

export const connectionSchema=z.object({apiKey:z.string().regex(/^sk-[A-Za-z0-9_-]{16,}$/).max(500),model:z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_.:-]*$/).max(100)}).strict();
const ownerKey=(who:Identity)=>`${who.kind}:${who.id}`;
function encryptionKey(){
 const secret=process.env.AI_KEY_ENCRYPTION_SECRET??process.env.GUEST_COOKIE_SECRET;
 assert(secret&&secret.length>=32,'CONFIG','Configure a server encryption secret before saving an API key.',503);
 return Buffer.from(hkdfSync('sha256',secret,'chalklight','openai-key-v1',32));
}
function encrypt(apiKey:string,owner:string){
 const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',encryptionKey(),iv);
 cipher.setAAD(Buffer.from(owner));
 const encrypted=Buffer.concat([cipher.update(apiKey,'utf8'),cipher.final()]);
 return [iv,cipher.getAuthTag(),encrypted].map(b=>b.toString('base64url')).join('.');
}
function decrypt(encrypted:string,owner:string){
 try{
  const [iv,tag,payload]=encrypted.split('.').map(s=>Buffer.from(s,'base64url'));
  const cipher=createDecipheriv('aes-256-gcm',encryptionKey(),iv);cipher.setAAD(Buffer.from(owner));cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(payload),cipher.final()]).toString('utf8');
 }catch{throw new AppError('AI_KEY_UNAVAILABLE','The saved API connection cannot be opened.',503);}
}
const where=(who:Identity)=>who.kind==='guest'?{guestId:who.id}:{userId:who.id};
export async function saveConnection(input:z.infer<typeof connectionSchema>,who:Identity){
 const data={encryptedKey:encrypt(input.apiKey,ownerKey(who)),model:input.model};
 await db.aiConnection.upsert({where:where(who),create:{...where(who),...data},update:data});
 return connectionStatus(who);
}
export async function removeConnection(who:Identity){await db.aiConnection.deleteMany({where:where(who)});return connectionStatus(who);}
export async function connectionStatus(who:Identity){
 const saved=await db.aiConnection.findUnique({where:where(who),select:{model:true}});
 const shared=process.env.ALLOW_LIVE_AI==='true'&&!!process.env.OPENAI_API_KEY&&!!process.env.OPENAI_MODEL;
 return {configured:!!saved||shared,personal:!!saved,model:saved?.model??process.env.OPENAI_MODEL??'gpt-4.1-mini',source:saved?'personal':shared?'server':'none'};
}
export async function resolveAi(who:Identity){
 const saved=await db.aiConnection.findUnique({where:where(who)});
 if(saved)return {apiKey:decrypt(saved.encryptedKey,ownerKey(who)),model:saved.model};
 assert(process.env.ALLOW_LIVE_AI==='true'&&process.env.OPENAI_API_KEY&&process.env.OPENAI_MODEL,'LIVE_UNAVAILABLE','Live AI is not connected for this browser.',503);
 return {apiKey:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL};
}
export async function testConnection(who:Identity){
 const connection=await resolveAi(who);
 try{
  const client=new OpenAI({apiKey:connection.apiKey,maxRetries:0,timeout:10000});
  await client.models.retrieve(connection.model);
  return {message:'Key and model access confirmed. Return to the classroom to start talking.'};
 }catch(error){
  const status=(error as {status?:number}).status;
  throw new AppError('AI_CONNECTION',status===401?'OpenAI did not accept this API key.':status===404?'This model is unavailable to your key. Choose another model.':status===429?'OpenAI reported a rate or usage limit. Check your API account.':'OpenAI could not verify the connection. Check the key, model access, and network.',400);
 }
}
