import {describe,it,expect} from 'vitest';
import {accountDestination,loginHref,pageDestination} from '../lib/account-routing';
describe('account return destinations',()=>{
 it('preserves a classroom or reference link through sign-in and sign-up',()=>{
  const classroom=pageDestination('/classroom',{student:'bart-v1',room:'saved-room',new:undefined});
  expect(accountDestination(classroom)).toBe('/classroom?student=bart-v1&room=saved-room');
  expect(new URL(loginHref(classroom,true),'https://classroom.invalid').searchParams.get('next')).toBe(classroom);
  expect(accountDestination('/library/guide?student=stewie-v1')).toBe('/library/guide?student=stewie-v1');
  expect(accountDestination('/sessions/saved-room/review')).toBe('/sessions/saved-room/review');
 });
 it('rejects external, malformed, and authentication destinations',()=>{
  for(const value of ['https://evil.example','//evil.example','/\\evil.example','/roles\n','/login','/api/auth/signout','/roles#redirect','/roles/../../login','/%2f%2fevil.example','javascript:alert(1)']){
   expect(accountDestination(value)).toBeUndefined();expect(loginHref(value)).toBe('/login');
  }
 });
});
