import {describe,it,expect} from 'vitest';
import {hashPassword,verifyPassword,signupSchema} from '../lib/passwords';
describe('account passwords',()=>{
 it('salts equal passwords independently and verifies without exposing the original',async()=>{
  const password='a sufficiently long test password';const first=await hashPassword(password),second=await hashPassword(password);
  expect(first).not.toBe(second);expect(first).not.toContain(password);
  expect(await verifyPassword(password,first)).toBe(true);expect(await verifyPassword('wrong password',first)).toBe(false);
 });
 it('rejects missing, corrupt, and unsupported hashes',async()=>{
  for(const stored of [null,'broken','scrypt$1$8$3$salt$hash'])expect(await verifyPassword('fixture password',stored)).toBe(false);
 });
 it('normalizes email, bounds credentials, and rejects privilege fields',()=>{
  const data={name:'  Alex  ',email:' ALEX@Example.COM ',password:'a long enough password'};
  expect(signupSchema.parse(data)).toMatchObject({name:'Alex',email:'alex@example.com'});
  for(const extra of [{owner:true},{role:'owner'},{password:'short'},{password:'a'.repeat(129)}])expect(signupSchema.safeParse({...data,...extra}).success).toBe(false);
 });
});
