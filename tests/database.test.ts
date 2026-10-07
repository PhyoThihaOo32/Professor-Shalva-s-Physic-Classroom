import 'dotenv/config';
import {describe,it,expect,vi,beforeEach,afterAll} from 'vitest';
const parse=vi.hoisted(()=>vi.fn());
vi.mock('openai',()=>({default:class{responses={parse};}}));
vi.mock('@/auth',()=>({auth:vi.fn()}));
if(process.env.TEST_DATABASE_URL)process.env.DATABASE_URL=process.env.TEST_DATABASE_URL;
const {db}=await import('../lib/db');
const {createSession,mutateSession,getSession,loadSession,sessionDTO}=await import('../lib/sessions');
const {demoProblems}=await import('../lib/content');
const {approvedAttempt}=await import('../lib/planner');
const identities:string[]=[];
async function who(){const id=crypto.randomUUID();identities.push(id);await db.guestIdentity.create({data:{id}});return {id,kind:'guest' as const,owner:false};}
const input=()=>({problemId:'water-in-the-bucket',personaId:'theo-v1' as const,difficulty:'guided' as const,provider:'mock' as 'mock'|'live',idempotencyKey:crypto.randomUUID()});
beforeEach(()=>{parse.mockReset();process.env.ALLOW_LIVE_AI='true';process.env.OPENAI_API_KEY='fake-test-no-network';process.env.OPENAI_MODEL='stubbed-model';process.env.SESSION_STARTS_PER_HOUR='10';process.env.MAX_MODEL_CALLS_PER_SESSION='20';process.env.SESSION_SPEND_LIMIT_CENTS='1000';process.env.DAILY_SPEND_LIMIT_CENTS='100000';process.env.AI_KEY_ENCRYPTION_SECRET='test-encryption-secret-with-at-least-thirty-two-characters';});
afterAll(async()=>{if(identities.length)await db.guestIdentity.deleteMany({where:{id:{in:identities}}});await db.$disconnect();});
describe.skipIf(!process.env.TEST_DATABASE_URL)('isolated PostgreSQL orchestration, stubbed live transport',()=>{
 it('persists manual practice identity separately from classroom sessions without model calls',async()=>{
  const owner=await who(),manual=await createSession({...input(),mode:'manual'},owner),classroom=await createSession(input(),owner);
  expect(manual.mode).toBe('manual');expect(classroom.mode).toBe('classroom');expect(manual.id).not.toBe(classroom.id);expect(parse).not.toHaveBeenCalled();
  await mutateSession(manual.id,'next',{revision:manual.revision,idempotencyKey:crypto.randomUUID()},owner);
  const refreshed=await getSession(manual.id,owner);expect(refreshed.mode).toBe('manual');expect(refreshed.steps).toHaveLength(2);expect(refreshed.verified).toBeNull();
 });
 it('enforces exactly one identity and immutable published references at the database layer',async()=>{await expect(db.session.create({data:{id:crypto.randomUUID(),problemVersionId:'water-in-the-bucket-v1',personaVersionId:'theo-v1',rubricVersionId:'instructor-v1',promptVersion:'v1',provider:'mock',difficulty:'guided'}})).rejects.toThrow();await expect(db.problemVersion.update({where:{id:'water-in-the-bucket-v1'},data:{status:'draft'}})).rejects.toThrow('immutable');});
 it('pins old published versions even when a new draft is created',async()=>{const identity=await who(),s=await createSession(input(),identity);const draft=await db.problemVersion.create({data:{problemId:'water-in-the-bucket',version:Math.floor(Math.random()*1000000)+100,status:'draft',data:demoProblems[2].data}});expect((await getSession(s.id,identity)).problem.versionId).toBe('water-in-the-bucket-v1');await db.problemVersion.delete({where:{id:draft.id}});});
 it('atomically limits simultaneous starts per guest',async()=>{process.env.SESSION_STARTS_PER_HOUR='2';const identity=await who();const results=await Promise.allSettled([createSession(input(),identity),createSession(input(),identity),createSession(input(),identity)]);expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(2);expect(results.filter(r=>r.status==='rejected')).toHaveLength(1);expect(await db.session.count({where:{guestId:identity.id}})).toBe(2);});
 it('provider failure stays live and persists a charged call and recoverable failed state',async()=>{parse.mockRejectedValue(new Error('simulated network outage'));const identity=await who();const s=await createSession({...input(),provider:'live'},identity);expect(s.state).toBe('failed');expect(s.provider).toBe('live');expect(s.steps).toHaveLength(0);const saved=await db.session.findUniqueOrThrow({where:{id:s.id},include:{calls:true}});expect(saved.modelCalls).toBe(1);expect(saved.calls[0].status).toBe('failed');expect(saved.reservedCostCents).toBe(50);});
 it('reserves quotas atomically and prevents repair from exceeding call and spend limits',async()=>{process.env.MAX_MODEL_CALLS_PER_SESSION='1';process.env.SESSION_SPEND_LIMIT_CENTS='50';parse.mockResolvedValue({output_parsed:{steps:[],greeting:'invalid'}});const identity=await who();await expect(createSession({...input(),provider:'live'},identity)).rejects.toThrow('limit');expect(parse).toHaveBeenCalledTimes(1);const saved=await db.session.findFirstOrThrow({where:{guestId:identity.id}});expect(saved.modelCalls).toBe(1);expect(saved.state).toBe('failed');});
 it('failed correction leaves saved steps untouched and can be retried with a new key',async()=>{const identity=await who();let s=await createSession(input(),identity);for(let n=1;n<7;n++)s=(await mutateSession(s.id,'next',{revision:s.revision,idempotencyKey:crypto.randomUUID()},identity)).session;await db.session.update({where:{id:s.id},data:{provider:'live',model:'stubbed-model'}});parse.mockRejectedValue(new Error('offline'));await expect(mutateSession(s.id,'corrections',{revision:s.revision,idempotencyKey:crypto.randomUUID(),stepId:'s7',action:'correct',text:'The top speed is not constant around the circle because energy changes.'},identity)).rejects.toThrow('provider');const saved=await getSession(s.id,identity);expect(saved.steps[6].current).toEqual(s.steps[6].current);expect(saved.corrections).toHaveLength(0);parse.mockImplementation(async payload=>({output_parsed:payload.text.format.name==='student_reply'?{message:'I have redone the calculation and can explain the change.',work:null}:{verdict:'accepted',criteria:{identify:1,physics:1,correction:1,check:1,clarity:1},nextAction:'revise'}}));const fixed=(await mutateSession(saved.id,'corrections',{revision:saved.revision,idempotencyKey:crypto.randomUUID(),stepId:'s7',action:'correct',text:'The speed is not constant because gravity transfers energy around the circle.'},identity)).session;expect(fixed.score).toBe(100);expect(fixed.provider).toBe('live');});
 it('recovers a crashed reserved operation and rejects stale commits',async()=>{const identity=await who();const s=await createSession(input(),identity);await db.operation.create({data:{sessionId:s.id,key:'interrupted-operation',kind:'corrections',requestHash:'fixture',baseRevision:s.revision,status:'pending',createdAt:new Date(Date.now()-36000)}});const recovered=await getSession(s.id,identity);expect(recovered.revision).toBe(s.revision+1);expect((await db.operation.findUniqueOrThrow({where:{sessionId_key:{sessionId:s.id,key:'interrupted-operation'}}})).status).toBe('failed');await expect(mutateSession(s.id,'next',{revision:s.revision,idempotencyKey:crypto.randomUUID()},identity)).rejects.toThrow('changed');});
 it('unresolved independent roots score zero and dependent consequences add no extra penalty',async()=>{const identity=await who(),s=await createSession({...input(),personaId:'milo-v1',difficulty:'standard'},identity);expect(s.score).toBe(0);const stored=await db.session.findUniqueOrThrow({where:{id:s.id},include:{errors:true}});expect(stored.errors).toHaveLength(2);const revealed=(await mutateSession(s.id,'finish',{revision:s.revision,idempotencyKey:crypto.randomUUID(),reveal:true},identity)).session;expect(revealed.score).toBe(0);expect(revealed.assistance.revealed).toBe(true);});
 it('canonical successful live generation uses database-held plan with no browser leakage',async()=>{parse.mockImplementation(async(payload:{input:{content:string}[]})=>{const data=JSON.parse(payload.input.at(-1)!.content);return {output_parsed:{steps:data.approvedSteps,greeting:data.persona.voice},usage:{input_tokens:10,output_tokens:10}};});const identity=await who(),s=await createSession({...input(),provider:'live'},identity);expect(s.state).toBe('teaching');expect(s.steps).toHaveLength(1);expect(s.verified).toBeNull();expect(JSON.stringify(s)).not.toContain('expectedCorrection');expect(parse).toHaveBeenCalledTimes(1);expect(approvedAttempt(demoProblems[2].data,[])).toHaveLength(8);});
 it('persists ungraded conversation atomically, replays idempotently, and enforces ownership and visible steps',async()=>{
  const identity=await who(),s=await createSession(input(),identity),step=s.steps[0].current;
  const body={revision:s.revision,idempotencyKey:crypto.randomUUID(),stepId:'s1',text:'How should we check the units?'};
  const result=await mutateSession(s.id,'messages',body,identity);
  expect(result.session.conversation).toHaveLength(1);expect(result.session.conversation[0].teacher).toBe(body.text);expect(result.session.conversation[0].student).toContain('units');expect(result.session.score).toBe(s.score);expect(result.session.steps[0].current).toEqual(step);expect(result.session.corrections).toHaveLength(0);expect(result.session.verified).toBeNull();
  expect(await mutateSession(s.id,'messages',body,identity)).toEqual(result);const refreshed=await getSession(s.id,identity);expect(refreshed.conversation).toEqual(result.session.conversation);
  const stranger=await who();await expect(mutateSession(s.id,'messages',{...body,idempotencyKey:crypto.randomUUID(),revision:refreshed.revision},stranger)).rejects.toThrow('not found');
  await expect(mutateSession(s.id,'messages',{...body,revision:refreshed.revision,idempotencyKey:crypto.randomUUID(),stepId:'s7'},identity)).rejects.toThrow('visible step');
 });
 it('applies live conversation call limits and preserves saved chat when a provider fails',async()=>{
  const identity=await who();let s=await createSession(input(),identity);await db.session.update({where:{id:s.id},data:{provider:'live',model:'stubbed-model'}});parse.mockRejectedValue(new Error('offline'));
  await expect(mutateSession(s.id,'messages',{revision:s.revision,idempotencyKey:crypto.randomUUID(),stepId:'s1',text:'Can you explain your step?'},identity)).rejects.toThrow('provider');s=await getSession(s.id,identity);expect(s.conversation).toHaveLength(0);expect(s.provider).toBe('live');
  parse.mockResolvedValue({output_parsed:{message:'How would you explain the givens in this step?',work:null}});s=(await mutateSession(s.id,'messages',{revision:s.revision,idempotencyKey:crypto.randomUUID(),stepId:'s1',text:'Let’s check your givens.'},identity)).session;expect(s.conversation).toHaveLength(1);expect(s.score).toBe(0);
  const stored=await db.session.findUniqueOrThrow({where:{id:s.id}});expect(stored.modelCalls).toBe(2);expect(stored.reservedCostCents).toBe(100);
 });

 it('persists correction, check, and guidance in one ordered public discussion without duplicating retries',async()=>{
  const identity=await who();let s=await createSession(input(),identity);
  for(let n=1;n<7;n++)s=(await mutateSession(s.id,'next',{revision:s.revision,idempotencyKey:crypto.randomUUID()},identity)).session;
  const body={revision:s.revision,idempotencyKey:crypto.randomUUID(),stepId:'s7',text:'The speed is not constant around the circle because gravity exchanges energy. The top threshold is where contact fails and N would otherwise be negative.'};
  const corrected=await mutateSession(s.id,'corrections',body,identity);expect(corrected.session.discussion?.at(-1)).toMatchObject({kind:'correction',teacher:body.text,student:'Agreed. I’ve made that correction explicit and updated the dependent work.'});
  expect(await mutateSession(s.id,'corrections',body,identity)).toEqual(corrected);s=corrected.session;
  s=(await mutateSession(s.id,'messages',{revision:s.revision,idempotencyKey:crypto.randomUUID(),stepId:'s7',text:'How can we check the units?'},identity)).session;
  s=(await mutateSession(s.id,'corrections',{revision:s.revision,idempotencyKey:crypto.randomUUID(),stepId:'s7',action:'valid'},identity)).session;
  expect(s.discussion?.map(t=>t.kind)).toEqual(['correction','message','check']);expect(s.conversation).toHaveLength(1);expect((await getSession(s.id,identity)).discussion).toEqual(s.discussion);expect(s.steps[6].history).toHaveLength(1);expect(s.verified).toBeNull();
 });
 it('whitelists public discussion fields, excludes disputes, malformed events, and unrevealed steps',async()=>{
  const identity=await who(),s=await createSession(input(),identity),stored=await loadSession(s.id,identity);
  const events=await db.sessionEvent.createManyAndReturn({data:[
   {sessionId:s.id,type:'messages',data:{stepId:'s1',teacher:'Visible question',message:'Visible reply',privatePrompt:'DO NOT EXPOSE'}},
   {sessionId:s.id,type:'messages',data:{stepId:'s7',teacher:'Future question',message:'Hidden reply'}},
   {sessionId:s.id,type:'corrections',data:{stepId:'s1',action:'dispute',teacher:'My dispute',message:'System dispute status'}},
   {sessionId:s.id,type:'corrections',data:{stepId:'s1',action:'correct',teacher:42,message:'Malformed'}},
  ]});
  const publicView=sessionDTO({...stored,events},'Visible reply',events);
  expect(publicView.discussion).toHaveLength(1);expect(publicView.conversation).toHaveLength(1);expect(publicView.discussion?.[0]).toMatchObject({teacher:'Visible question',student:'Visible reply',kind:'message'});
  for(const hidden of ['DO NOT EXPOSE','Hidden reply','System dispute status','Malformed'])expect(JSON.stringify(publicView)).not.toContain(hidden);
 });

 it('saves only encrypted personal keys, isolates owners, and removes access without exposing credentials',async()=>{
  const {saveConnection,resolveAi,connectionStatus,removeConnection}=await import('../lib/ai-connection');
  const owner=await who(),stranger=await who();const apiKey='sk-test-fixture-never-sent-to-openai';
  process.env.ALLOW_LIVE_AI='false';
  const status=await saveConnection({apiKey,model:'stubbed-personal-model'},owner);
  expect(status).toMatchObject({configured:true,personal:true,model:'stubbed-personal-model'});expect(JSON.stringify(status)).not.toContain(apiKey);
  const saved=await db.aiConnection.findUniqueOrThrow({where:{guestId:owner.id}});expect(saved.encryptedKey).not.toContain(apiKey);
  expect(await resolveAi(owner)).toEqual({apiKey,model:'stubbed-personal-model'});
  expect((await connectionStatus(stranger)).configured).toBe(false);await expect(resolveAi(stranger)).rejects.toThrow('Connect');
  const other=await db.aiConnection.create({data:{guestId:stranger.id,encryptedKey:saved.encryptedKey,model:saved.model}});
  await expect(resolveAi(stranger)).rejects.toThrow('cannot be opened');await db.aiConnection.delete({where:{id:other.id}});
  await removeConnection(owner);await expect(resolveAi(owner)).rejects.toThrow('Connect');
 });
 it('switches an existing mock classroom to a personal live key and saves recalculated drafts exactly once',async()=>{
  const {saveConnection}=await import('../lib/ai-connection');const owner=await who();
  process.env.ALLOW_LIVE_AI='false';await saveConnection({apiKey:'sk-test-personal-never-networked',model:'personal-model'},owner);
  let s=await createSession(input(),owner);const original=s.steps[0].current;
  s=(await mutateSession(s.id,'provider',{revision:s.revision,idempotencyKey:crypto.randomUUID(),provider:'live'},owner)).session;
  expect(s.provider).toBe('live');expect(parse).not.toHaveBeenCalled();
  const work={...original,title:'Trying the teacher’s method',text:'I redid this calculation with the teacher’s guidance.',equation:'t = 210/95',value:2.2105263158,unit:'h'};
  parse.mockResolvedValue({output_parsed:{message:'I get 2.21 h. Let’s check that before continuing.',work},usage:{output_tokens:90}});
  const body={revision:s.revision,idempotencyKey:crypto.randomUUID(),stepId:'s1',text:'Recalculate the first travel time.'};
  const changed=await mutateSession(s.id,'messages',body,owner);expect(changed.session.steps[0].current).toEqual(work);expect(changed.session.steps[0].original).toEqual(original);expect(changed.session.steps[0].history).toHaveLength(1);expect(changed.session.steps[0].valid).toBe(false);expect(changed.session.verified).toBeNull();expect(changed.session.discussion?.at(-1)?.workUpdated).toBe(true);
  expect(await mutateSession(s.id,'messages',body,owner)).toEqual(changed);expect(parse).toHaveBeenCalledTimes(1);
  const messages=parse.mock.calls[0][0].input;const payload=JSON.parse(messages[2].content.split('\n').slice(1).join('\n'));expect(payload.problem.statement).toBe(s.problem.statement);expect(JSON.stringify(payload)).not.toContain('expectedCorrection');expect(payload.problem.reference).toBeUndefined();expect(messages.at(-1)).toEqual({role:'user',content:body.text});
  const saved=await getSession(s.id,owner);expect(saved.steps[0].current).toEqual(work);expect(saved.conversation.at(-1)?.student).toContain('2.21');
  s=(await mutateSession(s.id,'provider',{revision:saved.revision,idempotencyKey:crypto.randomUUID(),provider:'mock'},owner)).session;expect(s.steps[0].current).toEqual(work);expect(s.conversation).toHaveLength(1);
 });
 it('does not save an invalid live rewrite or silently substitute a demo reply',async()=>{
  const owner=await who();let s=await createSession(input(),owner);s=(await mutateSession(s.id,'provider',{revision:s.revision,idempotencyKey:crypto.randomUUID(),provider:'live'},owner)).session;
  parse.mockResolvedValue({output_parsed:{message:'Updated.',work:{...s.steps[0].current,id:'s8'}}});
  await expect(mutateSession(s.id,'messages',{revision:s.revision,idempotencyKey:crypto.randomUUID(),stepId:'s1',text:'Recalculate.'},owner)).rejects.toThrow('provider');
  const saved=await getSession(s.id,owner);expect(saved.steps[0].current).toEqual(s.steps[0].current);expect(saved.conversation).toHaveLength(0);expect(parse).toHaveBeenCalledTimes(2);
 });

});
