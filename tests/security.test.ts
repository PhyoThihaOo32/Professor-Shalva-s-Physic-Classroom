import {describe,it,expect,vi,beforeAll,beforeEach} from 'vitest';
const mocks=vi.hoisted(()=>({auth:vi.fn(),user:vi.fn(),guest:vi.fn(),upsert:vi.fn(),get:vi.fn(),set:vi.fn()}));
vi.mock('@/auth',()=>({auth:mocks.auth}));
vi.mock('../lib/db',()=>({db:{user:{findUnique:mocks.user},guestIdentity:{findUnique:mocks.guest,upsert:mocks.upsert}}}));
vi.mock('next/headers',()=>({cookies:async()=>({get:mocks.get,set:mocks.set})}));
import {signGuest,verifyGuest,owned,checkOrigin,requireOwner,identity} from '../lib/security';
beforeAll(()=>{process.env.GUEST_COOKIE_SECRET='a-long-fixture-secret-used-only-for-unit-tests';process.env.APP_ORIGIN='http://127.0.0.1:3000';});
beforeEach(()=>{Object.values(mocks).forEach(mock=>mock.mockReset());});
describe('guest and owner authentication boundaries',()=>{
 it('rejects tampering, malformed, future, and expired guest signatures',()=>{const id=crypto.randomUUID();const cookie=signGuest(id);expect(verifyGuest(cookie)).toBe(id);expect(verifyGuest(cookie+'tampered')).toBeNull();expect(verifyGuest('garbage')).toBeNull();expect(verifyGuest(signGuest(id,1))).toBeNull();expect(verifyGuest(signGuest(id,Math.floor(Date.now()/1000)+120))).toBeNull();});
 it('does not authorize an owner globally to read another guest session',()=>{expect(owned({userId:null,guestId:'alice'},{id:'bob',kind:'guest',owner:false})).toBe(false);expect(owned({userId:null,guestId:'alice'},{id:'owner',kind:'user',owner:true})).toBe(false);expect(owned({userId:null,guestId:'alice'},{id:'alice',kind:'guest',owner:false})).toBe(true);});
 it('role choice is never admin authorization',()=>{expect(()=>requireOwner({id:'teacher',kind:'guest',owner:false})).toThrow('authenticated content owner');expect(()=>requireOwner({id:'owner',kind:'guest',owner:true})).toThrow();});
 it('requires configured exact Origin and rejects cross-site fetches',()=>{expect(()=>checkOrigin(new Request('http://127.0.0.1:3000/api/sessions',{method:'POST'}))).toThrow();expect(()=>checkOrigin(new Request('http://127.0.0.1:3000/api/sessions',{method:'POST',headers:{origin:'https://evil.example'}}))).toThrow();expect(()=>checkOrigin(new Request('http://127.0.0.1:3000/api/sessions',{method:'POST',headers:{origin:'http://127.0.0.1:3000','sec-fetch-site':'cross-site'}}))).toThrow();});
 it('recognizes an account without granting teacher or owner privileges',async()=>{
  process.env.AUTH_SECRET='a-fixture-secret-longer-than-thirty-two-characters';process.env.AUTH_OWNER_GITHUB_ID='immutable-owner';mocks.auth.mockResolvedValue({user:{id:'account-user'}});mocks.user.mockResolvedValue({id:'account-user'});
  expect(await identity()).toEqual({id:'account-user',kind:'user',owner:false});expect(mocks.get).not.toHaveBeenCalled();
 });
 it('recovers the original immutable owner identity from a legacy token',async()=>{
  process.env.AUTH_SECRET='a-fixture-secret-longer-than-thirty-two-characters';process.env.AUTH_OWNER_GITHUB_ID='immutable-owner';mocks.auth.mockResolvedValue({user:{id:'old-provider-id'},ownerId:'immutable-owner'});mocks.user.mockResolvedValueOnce(null).mockResolvedValueOnce({id:'github:immutable-owner'});
  expect(await identity()).toEqual({id:'github:immutable-owner',kind:'user',owner:true});
 });
 it('does not keep a deleted or unrecognized account authenticated',async()=>{
  process.env.AUTH_SECRET='a-fixture-secret-longer-than-thirty-two-characters';mocks.auth.mockResolvedValue({user:{id:'deleted-user'}});mocks.user.mockResolvedValue(null);
  const who=await identity();expect(who.kind).toBe('guest');expect(who.owner).toBe(false);expect(who.id).not.toBe('deleted-user');expect(mocks.set).toHaveBeenCalled();
 });
});
