import {describe,it,expect,vi,beforeAll} from 'vitest';
vi.mock('@/auth',()=>({auth:vi.fn()}));
import {signGuest,verifyGuest,owned,checkOrigin,requireOwner} from '../lib/security';
beforeAll(()=>{process.env.GUEST_COOKIE_SECRET='a-long-fixture-secret-used-only-for-unit-tests';process.env.APP_ORIGIN='http://127.0.0.1:3000';});
describe('guest and owner authentication boundaries',()=>{
 it('rejects tampering, malformed, future, and expired guest signatures',()=>{const id=crypto.randomUUID();const cookie=signGuest(id);expect(verifyGuest(cookie)).toBe(id);expect(verifyGuest(cookie+'tampered')).toBeNull();expect(verifyGuest('garbage')).toBeNull();expect(verifyGuest(signGuest(id,1))).toBeNull();expect(verifyGuest(signGuest(id,Math.floor(Date.now()/1000)+120))).toBeNull();});
 it('does not authorize an owner globally to read another guest session',()=>{expect(owned({userId:null,guestId:'alice'},{id:'bob',kind:'guest',owner:false})).toBe(false);expect(owned({userId:null,guestId:'alice'},{id:'owner',kind:'user',owner:true})).toBe(false);expect(owned({userId:null,guestId:'alice'},{id:'alice',kind:'guest',owner:false})).toBe(true);});
 it('role choice is never admin authorization',()=>{expect(()=>requireOwner({id:'teacher',kind:'guest',owner:false})).toThrow('authenticated content owner');expect(()=>requireOwner({id:'owner',kind:'guest',owner:true})).toThrow();});
 it('requires configured exact Origin and rejects cross-site fetches',()=>{expect(()=>checkOrigin(new Request('http://127.0.0.1:3000/api/sessions',{method:'POST'}))).toThrow();expect(()=>checkOrigin(new Request('http://127.0.0.1:3000/api/sessions',{method:'POST',headers:{origin:'https://evil.example'}}))).toThrow();expect(()=>checkOrigin(new Request('http://127.0.0.1:3000/api/sessions',{method:'POST',headers:{origin:'http://127.0.0.1:3000','sec-fetch-site':'cross-site'}}))).toThrow();});
});
