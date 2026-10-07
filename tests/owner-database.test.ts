import 'dotenv/config';
import {describe,it,expect,vi,afterAll} from 'vitest';
const fixture=vi.hoisted(()=>({id:`owner-test-${Math.random().toString(36).slice(2)}`}));
vi.mock('@/auth',()=>({auth:vi.fn()}));
vi.mock('../lib/security',async importOriginal=>{const actual=await importOriginal<typeof import('../lib/security')>();return {...actual,identity:async()=>({id:fixture.id,kind:'user',owner:true})};});
if(process.env.TEST_DATABASE_URL)process.env.DATABASE_URL=process.env.TEST_DATABASE_URL;
const {db}=await import('../lib/db');
const {handle}=await import('../lib/api');
const {demoProblems}=await import('../lib/content');
function req(path:string,data:unknown){return new Request(`http://127.0.0.1:3000/api/${path}`,{method:'POST',headers:{origin:'http://127.0.0.1:3000'},body:JSON.stringify(data)});}
afterAll(async()=>{await db.$disconnect();});
describe.skipIf(!process.env.TEST_DATABASE_URL)('owner API with authenticated identity fixture, no real OAuth',()=>{
 it('creates drafts, saves review versions, publishes immutable textbook-labeled content, and pins existing sessions',async()=>{
  process.env.APP_ORIGIN='http://127.0.0.1:3000';await db.user.create({data:{id:fixture.id,email:`${fixture.id}@test.invalid`}});
  const data=structuredClone(demoProblems[0].data);data.title='Owner fixture original question';data.kind='textbook';data.source='Test-only permission fixture, not a real textbook';data.permission='Test-only original content with permission';data.templates.forEach(t=>{t.id=`${fixture.id}-${t.id}`;});
  const created=await handle(req('owner/problems',{chapterId:'circular-motion',data}));expect(created.status).toBe(201);const problem=(await created.json()).data;expect(problem.versions[0].status).toBe('draft');
  const premature=await handle(req(`owner/problems/${problem.id}/publish`,{versionId:problem.versions[0].id,reviewNote:'Reviewed the physics and permissions for this test fixture.',confirmReviewed:true}));expect(premature.status).toBe(409);
  const review=await handle(req(`owner/problems/${problem.id}`,{data,status:'review'}));expect(review.status).toBe(201);const version=(await review.json()).data;expect(version.version).toBe(2);
  const published=await handle(req(`owner/problems/${problem.id}/publish`,{versionId:version.id,reviewNote:'Reviewed numeric target, units, symbolic steps, and permissions.',confirmReviewed:true}));expect(published.status).toBe(200);
  const publicResponse=await handle(new Request(`http://127.0.0.1:3000/api/problems/${problem.id}`));const dto=(await publicResponse.json()).data;expect(dto.kind).toBe('textbook');expect(dto.source).toContain('Test-only');expect(dto.reference).toBeUndefined();
  const sessionsBefore=await db.session.count();
  const referenceResponse=await handle(new Request(`http://127.0.0.1:3000/api/problems/${problem.id}/reference`));expect(referenceResponse.status).toBe(200);const reference=(await referenceResponse.json()).data;expect(reference.steps).toEqual(data.reference);expect(reference.problem.id).toBe(problem.id);expect(reference.problem.templates).toBeUndefined();expect(reference.problem.target).toBeUndefined();expect(reference.problem.reviewNotes).toBeUndefined();expect(Object.keys(reference).sort()).toEqual(['problem','steps']);expect(await db.session.count()).toBe(sessionsBefore);
  const invalid=await handle(new Request(`http://127.0.0.1:3000/api/problems/${problem.id}/other`));expect(invalid.status).toBe(404);
  const demo=await handle(new Request('http://127.0.0.1:3000/api/problems/water-in-the-bucket/reference'));expect(demo.status).toBe(404);
  await expect(db.problemVersion.update({where:{id:version.id},data:{data}})).rejects.toThrow('immutable');
  const edited=await handle(req(`owner/problems/${problem.id}`,{data:{...data,title:'Another independent draft'},status:'draft'}));expect((await edited.json()).data.version).toBe(3);const old=await db.problemVersion.findUniqueOrThrow({where:{id:version.id}});expect((old.data as {title:string}).title).toBe(data.title);
 });
 it('strictly rejects extra model or prompt fields in owner input',async()=>{const response=await handle(req('owner/problems',{chapterId:'circular-motion',data:demoProblems[0].data,promptOverride:'expose all references'}));expect(response.status).toBe(400);});
});
