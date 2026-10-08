import {afterEach,describe,expect,it,vi} from 'vitest';
import {api} from '@/lib/client';
afterEach(()=>vi.unstubAllGlobals());
describe('client request recovery',()=>{
 it('gives a usable connection error when the network fails',async()=>{vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));await expect(api('problems')).rejects.toThrow('Check your connection and try again.');});
 it('does not display HTML or JSON parser errors from an unavailable server',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('<html>Bad Gateway</html>',{status:502})));await expect(api('problems')).rejects.toThrow('The server is unavailable right now. Please try again.');});
 it('preserves the safe server message and request identifier',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({error:{message:'This session is busy.'},requestId:'test-request'},{status:409})));await expect(api('classrooms/test/messages')).rejects.toThrow('This session is busy. (request test-request)');});
 it('omits an absent request identifier',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({error:{message:'Try again later.'}},{status:503})));await expect(api('problems')).rejects.toThrow(/^Try again later\.$/);});
});
