import 'dotenv/config';
import {describe,it,expect,vi,afterAll,beforeAll} from 'vitest';
vi.mock('@/auth',()=>({auth:vi.fn()}));
if(process.env.TEST_DATABASE_URL)process.env.DATABASE_URL=process.env.TEST_DATABASE_URL;
const {db}=await import('../lib/db');
const {registerAccount,authenticateAccount,accountAdapter,limitAccountAction}=await import('../lib/auth-store');
const {claimGuestHistory,conversationHistory,accountStatus}=await import('../lib/account');
const {openRoom,getOpenRoom}=await import('../lib/open-classroom');
const {saveConnection,resolveAi}=await import('../lib/ai-connection');
const userIds:string[]=[],guestIds:string[]=[];
const password='account test password 123';
const request=()=>new Request('http://localhost/api/account/signup',{headers:{'x-forwarded-for':crypto.randomUUID()}});
async function user(){const u=await registerAccount({name:'Account test',email:`${crypto.randomUUID()}@example.test`,password},request());userIds.push(u.id);return {id:u.id,kind:'user' as const,owner:false,email:u.email};}
async function guest(){const id=crypto.randomUUID();guestIds.push(id);await db.guestIdentity.create({data:{id}});return {id,kind:'guest' as const,owner:false};}
const room=(who:Parameters<typeof openRoom>[1],fresh=false,nonce=crypto.randomUUID())=>openRoom({personaId:'bart-v1',fresh,idempotencyKey:nonce},who);
beforeAll(()=>{process.env.AUTH_SECRET='a-dedicated-auth-test-secret-longer-than-32-characters';process.env.AI_KEY_ENCRYPTION_SECRET='a-dedicated-key-test-secret-longer-than-32-characters';process.env.ALLOW_LIVE_AI='false';});
afterAll(async()=>{if(process.env.TEST_DATABASE_URL){await db.user.deleteMany({where:{id:{in:userIds}}});await db.guestIdentity.deleteMany({where:{id:{in:guestIds}}});}await db.$disconnect();});
describe.skipIf(!process.env.TEST_DATABASE_URL)('account integrity in isolated PostgreSQL',()=>{
 it('authenticates a normalized email and never returns password hashes',async()=>{
  const who=await user();const authenticated=await authenticateAccount({email:`  ${who.email.toUpperCase()} `,password},request());
  expect(authenticated?.id).toBe(who.id);expect(authenticated).not.toHaveProperty('passwordHash');expect(await authenticateAccount({email:who.email,password:'incorrect password'},request())).toBeNull();
  await expect(registerAccount({name:'Duplicate',email:who.email.toUpperCase(),password},request())).rejects.toMatchObject({code:'ACCOUNT_EXISTS',status:409});
  const status=await accountStatus(who);expect(status.identity.kind).toBe('user');expect(JSON.stringify(status)).not.toMatch(/passwordHash|scrypt\$/);
 });
 it('preserves guest chat and rebinds its encrypted connection when imported',async()=>{
  const previous=await guest(),owner=await user(),other=await user(),opened=await room(previous);
  await saveConnection({apiKey:'sk-test-imported-personal-key-not-networked',model:'fixture-model'},previous);
  const encrypted=(await db.aiConnection.findUniqueOrThrow({where:{guestId:previous.id}})).encryptedKey;
  expect(await claimGuestHistory(previous.id,owner.id)).toBe(1);expect(await claimGuestHistory(previous.id,owner.id)).toBe(0);
  expect((await getOpenRoom(opened.id,owner)).id).toBe(opened.id);await expect(getOpenRoom(opened.id,previous)).rejects.toThrow('not found');await expect(getOpenRoom(opened.id,other)).rejects.toThrow('not found');
  expect(await resolveAi(owner)).toEqual({apiKey:'sk-test-imported-personal-key-not-networked',model:'fixture-model'});
  expect((await db.aiConnection.findUniqueOrThrow({where:{userId:owner.id}})).encryptedKey).not.toBe(encrypted);
  expect(await conversationHistory(other)).toEqual([]);expect((await conversationHistory(owner)).map(s=>s.id)).toEqual([opened.id]);
 });
 it('gives one account sole ownership when two sign-ins compete to import a guest',async()=>{
  const previous=await guest(),a=await user(),b=await user(),opened=await room(previous);
  const counts=await Promise.all([claimGuestHistory(previous.id,a.id),claimGuestHistory(previous.id,b.id)]);expect(counts.sort()).toEqual([0,1]);
  const saved=await db.session.findUniqueOrThrow({where:{id:opened.id}});expect(saved.guestId).toBeNull();expect([a.id,b.id]).toContain(saved.userId);
  const winner=saved.userId===a.id?a:b,loser=winner.id===a.id?b:a;expect((await getOpenRoom(opened.id,winner)).id).toBe(opened.id);await expect(getOpenRoom(opened.id,loser)).rejects.toThrow('not found');
 });
 it('preserves an existing account connection when importing another browser',async()=>{
  const previous=await guest(),owner=await user();
  await saveConnection({apiKey:'sk-test-account-existing-not-networked',model:'account-model'},owner);await saveConnection({apiKey:'sk-test-browser-unused-not-networked',model:'browser-model'},previous);
  await claimGuestHistory(previous.id,owner.id);expect(await resolveAi(owner)).toEqual({apiKey:'sk-test-account-existing-not-networked',model:'account-model'});
 });
 it('keeps new conversations separate, retries creation once, and allows resuming older rooms',async()=>{
  const owner=await user(),first=await room(owner),nonce=crypto.randomUUID(),second=await room(owner,true,nonce);
  expect(second.id).not.toBe(first.id);expect((await room(owner,true,nonce)).id).toBe(second.id);expect((await room(owner)).id).toBe(second.id);
  expect((await getOpenRoom(first.id,owner)).id).toBe(first.id);expect(await conversationHistory(owner)).toHaveLength(2);
 });
 it('links stable Google subjects and exposes no OAuth tokens or account privileges',async()=>{
  const owner=await user(),subject=crypto.randomUUID();
  await accountAdapter.linkAccount!({userId:owner.id,provider:'google',providerAccountId:subject,type:'oidc',access_token:'never-store-this-token'});
  expect((await accountAdapter.getUserByAccount!({provider:'google',providerAccountId:subject}))?.id).toBe(owner.id);
  expect((await accountStatus(owner)).user?.googleLinked).toBe(true);
  expect(JSON.stringify(await db.authAccount.findMany({where:{userId:owner.id}}))).not.toContain('never-store-this-token');
  expect((await accountAdapter.getUserByEmail!(owner.email.toUpperCase()))?.id).toBe(owner.id);
 });
 it('enforces a shared sign-in limit without storing plaintext emails',async()=>{
  const email=`${crypto.randomUUID()}@example.test`,req=request();
  for(let i=0;i<10;i++)await limitAccountAction('signin',email,req);
  await expect(limitAccountAction('signin',email,req)).rejects.toMatchObject({status:429,code:'AUTH_RATE_LIMIT'});
  expect(await db.quota.findFirst({where:{key:{contains:email}}})).toBeNull();
 });
});
