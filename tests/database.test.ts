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
 it('opens an owned classroom without a preset problem or generation, restores it, and separates students',async()=>{
  const {openRoom,getOpenRoom}=await import('../lib/open-classroom');const owner=await who(),stranger=await who();
  const first=await openRoom({personaId:'bart-v1',idempotencyKey:crypto.randomUUID()},owner);
  expect(first.discussion).toEqual([]);expect(parse).not.toHaveBeenCalled();
  const stored=await db.session.findUniqueOrThrow({where:{id:first.id},include:{steps:true,errors:true}});expect(stored.problemVersionId).toBeNull();expect(stored.kind).toBe('open-classroom');expect(stored.steps).toHaveLength(0);expect(stored.errors).toHaveLength(0);
  expect((await openRoom({personaId:'bart-v1',idempotencyKey:crypto.randomUUID()},owner)).id).toBe(first.id);
  expect((await openRoom({personaId:'stewie-v1',idempotencyKey:crypto.randomUUID()},owner)).id).not.toBe(first.id);
  await expect(getOpenRoom(first.id,stranger)).rejects.toThrow('not found');await expect(getSession(first.id,owner)).rejects.toThrow('not found');
 });
 it('saves independent teacher-instinct cues, permits arbitrary new questions, and preserves corrections and replay',async()=>{
  const {openRoom,messageOpenRoom,getOpenRoom}=await import('../lib/open-classroom');const owner=await who(),room=await openRoom({personaId:'bart-v1',idempotencyKey:crypto.randomUUID()},owner);
  parse.mockResolvedValueOnce({output_parsed:{message:'I’ll take 20 divided by 8. That’s 4 m/s², right?',work:null}}).mockResolvedValueOnce({output_parsed:{signal:'check',focus:'arithmetic'}});
  const body={revision:room.revision,idempotencyKey:crypto.randomUUID(),text:'A car starts from rest and reaches 20 m/s in 8 s. What is its acceleration?'};
  const result=await messageOpenRoom(room.id,body,owner);expect(result.session.discussion[0].instinct).toEqual({signal:'check',focus:'arithmetic'});expect(result.session.discussion[0].work).toBeUndefined();
  const studentContext=JSON.parse(parse.mock.calls[0][0].input[2].content.split('\n').slice(1).join('\n'));expect(studentContext.problem).toBeUndefined();expect(JSON.stringify(studentContext)).not.toMatch(/ch2|95|210|expectedCorrection/);
  expect(parse.mock.calls[1][0].input[0].content).toContain('separate physics reviewer');
  expect(await messageOpenRoom(room.id,body,owner)).toEqual(result);expect(parse).toHaveBeenCalledTimes(2);
  parse.mockResolvedValueOnce({output_parsed:{message:'Oh, 20 ÷ 8 is 2.5 m/s². I rushed that.',work:null}}).mockResolvedValueOnce({output_parsed:{signal:'clear',focus:'none'}});
  const corrected=await messageOpenRoom(room.id,{revision:result.session.revision,idempotencyKey:crypto.randomUUID(),text:'Check 20 divided by 8 again.'},owner);expect(corrected.session.discussion[1].instinct?.signal).toBe('clear');expect(corrected.session.discussion[0].instinct?.signal).toBe('check');
  parse.mockResolvedValueOnce({output_parsed:{message:'For two approaching trains, I should add the speeds—310 km/h.',work:null}}).mockResolvedValueOnce({output_parsed:{signal:'clear',focus:'none'}});
  const next=await messageOpenRoom(room.id,{revision:corrected.session.revision,idempotencyKey:crypto.randomUUID(),text:'New question: two trains each travel at 155 km/h toward each other. What is their closing speed?'},owner);
  expect(next.session.discussion.at(-1)?.teacher).toContain('New question');expect((await getOpenRoom(room.id,owner)).discussion).toEqual(next.session.discussion);expect(next.session).not.toHaveProperty('problem');expect(next.session).not.toHaveProperty('score');
 });
 it('does not fake a response without a key, and preserves replies when the optional instinct check is unavailable',async()=>{
  const {openRoom,messageOpenRoom,getOpenRoom}=await import('../lib/open-classroom');const owner=await who(),room=await openRoom({personaId:'spongebob-v1',idempotencyKey:crypto.randomUUID()},owner);
  delete process.env.OPENAI_API_KEY;process.env.ALLOW_LIVE_AI='false';
  await expect(messageOpenRoom(room.id,{revision:room.revision,idempotencyKey:crypto.randomUUID(),text:'Hello'},owner)).rejects.toThrow('Live AI is not connected');expect(parse).not.toHaveBeenCalled();
  let saved=await getOpenRoom(room.id,owner);expect(saved.discussion).toHaveLength(0);
  process.env.ALLOW_LIVE_AI='true';process.env.OPENAI_API_KEY='fake-test-no-network';
  parse.mockResolvedValueOnce({output_parsed:{message:'I think it travels 80 m.',work:null}}).mockRejectedValueOnce(new Error('Review unavailable'));
  saved=(await messageOpenRoom(room.id,{revision:saved.revision,idempotencyKey:crypto.randomUUID(),text:'Calculate the distance.'},owner)).session;
  expect(saved.discussion[0].student).toContain('80 m');expect(saved.discussion[0].instinct).toBeNull();expect(saved.discussion[0].instinctStatus).toBe('unavailable');
 });
 it('rejects cross-owner writes, simultaneous or stale messages, and shares model quotas with reference sessions',async()=>{
  const {openRoom,messageOpenRoom}=await import('../lib/open-classroom');const owner=await who(),stranger=await who(),room=await openRoom({personaId:'stewie-v1',idempotencyKey:crypto.randomUUID()},owner);
  const body={revision:room.revision,idempotencyKey:crypto.randomUUID(),text:'Hi'};
  await expect(messageOpenRoom(room.id,body,stranger)).rejects.toThrow('not found');
  parse.mockResolvedValue({output_parsed:{message:'At last, a teacher arrives.',work:null}});const results=await Promise.allSettled([messageOpenRoom(room.id,body,owner),messageOpenRoom(room.id,{...body,idempotencyKey:crypto.randomUUID()},owner)]);expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);
  await expect(messageOpenRoom(room.id,{...body,idempotencyKey:crypto.randomUUID()},owner)).rejects.toThrow('changed');
  const stored=await db.session.findUniqueOrThrow({where:{id:room.id},include:{calls:true}});expect(stored.calls).toHaveLength(1);expect(stored.modelCalls).toBe(1);
 });
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
 it('requires a connected key for live classroom sends, then promotes the same session on its next message',async()=>{
  const {saveConnection}=await import('../lib/ai-connection');process.env.ALLOW_LIVE_AI='false';
  const owner=await who();let s=await createSession({...input(),personaId:'bart-v1'},owner);
  const send=()=>({revision:s.revision,idempotencyKey:crypto.randomUUID(),stepId:'s1',text:'hello',provider:'live' as const});
  await expect(mutateSession(s.id,'messages',send(),owner)).rejects.toThrow('Live AI is not connected');
  s=await getSession(s.id,owner);expect(s.discussion).toHaveLength(0);expect(parse).not.toHaveBeenCalled();
  await saveConnection({apiKey:'sk-test-fixture-no-paid-calls',model:'personal-model-one'},owner);
  parse.mockResolvedValue({output_parsed:{message:'Hey! I was hoping today’s homework had an escape hatch.',work:null}});
  s=(await mutateSession(s.id,'messages',send(),owner)).session;
  expect(s.provider).toBe('live');expect(s.discussion).toHaveLength(1);expect(parse.mock.calls[0][0].model).toBe('personal-model-one');
  await saveConnection({apiKey:'sk-test-fixture-replaced-no-paid-calls',model:'personal-model-two'},owner);
  parse.mockResolvedValue({output_parsed:{message:'Back already? Fine, I’ve still got my pencil.',work:null}});
  s=(await mutateSession(s.id,'messages',{...send(),text:'hey'},owner)).session;
  expect(parse.mock.calls[1][0].model).toBe('personal-model-two');
  expect((await db.session.findUniqueOrThrow({where:{id:s.id}})).model).toBe('personal-model-two');
  expect(s.discussion).toHaveLength(2);
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

 it('uses the shared app connection ahead of old browser credentials without changing stored keys',async()=>{
  const {saveConnection,resolveAi,connectionStatus}=await import('../lib/ai-connection');
  const owner=await who(),stranger=await who(),apiKey='sk-test-old-personal-never-networked';
  await saveConnection({apiKey,model:'old-personal-model'},owner);
  const saved=await db.aiConnection.findUniqueOrThrow({where:{guestId:owner.id}});
  const shared={apiKey:'fake-test-no-network',model:'stubbed-model'};
  expect(await resolveAi(owner)).toEqual(shared);expect(await resolveAi(stranger)).toEqual(shared);
  expect(await connectionStatus(owner)).toEqual({configured:true,personal:true,model:shared.model,source:'server'});
  expect(await connectionStatus(stranger)).toEqual({configured:true,personal:false,model:shared.model,source:'server'});
  expect(JSON.stringify(await connectionStatus(owner))).not.toContain(apiKey);
  expect(await db.aiConnection.findUniqueOrThrow({where:{guestId:owner.id}})).toEqual(saved);
  for(const missing of ['ALLOW_LIVE_AI','OPENAI_API_KEY','OPENAI_MODEL']){
   const previous=process.env[missing];delete process.env[missing];
   expect(await resolveAi(owner)).toEqual({apiKey,model:'old-personal-model'});
   expect(await connectionStatus(owner)).toMatchObject({configured:true,personal:true,model:'old-personal-model',source:'personal'});
   await expect(resolveAi(stranger)).rejects.toThrow('Live AI is not connected');process.env[missing]=previous;
  }
 });
 it('preserves saved chat after an authentication failure and retries the same message exactly once',async()=>{
  const {openRoom,messageOpenRoom,getOpenRoom}=await import('../lib/open-classroom');
  const owner=await who();let room=await openRoom({personaId:'bart-v1',idempotencyKey:crypto.randomUUID()},owner);
  parse.mockResolvedValueOnce({output_parsed:{message:'Hey, teach! What’s up?',work:null}});
  room=(await messageOpenRoom(room.id,{revision:room.revision,idempotencyKey:crypto.randomUUID(),text:'hey bart'},owner)).session;
  const history=room.discussion,failed={revision:room.revision,idempotencyKey:crypto.randomUUID(),text:'hey'};
  parse.mockRejectedValueOnce(Object.assign(new Error('Invalid API key: sk-private-provider-detail'),{status:401}));
  const logging=vi.spyOn(console,'error').mockImplementation(()=>{});
  try{
   await expect(messageOpenRoom(room.id,failed,owner)).rejects.toMatchObject({code:'AI_AUTHENTICATION',status:503,message:'OpenAI rejected the AI connection. Ask the app owner to update the API key. Your message and saved conversation are safe.'});
   expect(JSON.stringify(logging.mock.calls)).not.toContain('sk-private-provider-detail');
  }finally{logging.mockRestore();}
  room=await getOpenRoom(room.id,owner);expect(room.discussion).toEqual(history);expect(room.revision).toBe(failed.revision+1);
  expect((await db.operation.findUniqueOrThrow({where:{sessionId_key:{sessionId:room.id,key:failed.idempotencyKey}}})).status).toBe('failed');
  const retry={...failed,revision:room.revision,idempotencyKey:crypto.randomUUID()};
  parse.mockResolvedValueOnce({output_parsed:{message:'Still here, teach. Got something for me?',work:null}});
  const result=await messageOpenRoom(room.id,retry,owner);expect(result.session.discussion).toHaveLength(2);expect(result.session.discussion[0]).toEqual(history[0]);expect(result.session.discussion[1].teacher).toBe('hey');
  expect(await messageOpenRoom(room.id,retry,owner)).toEqual(result);expect(parse).toHaveBeenCalledTimes(3);
 });
 it('saves only encrypted personal keys, isolates owners, and removes access without exposing credentials',async()=>{
  const {saveConnection,resolveAi,connectionStatus,removeConnection}=await import('../lib/ai-connection');
  const owner=await who(),stranger=await who();const apiKey='sk-test-fixture-never-sent-to-openai';
  process.env.ALLOW_LIVE_AI='false';
  const status=await saveConnection({apiKey,model:'stubbed-personal-model'},owner);
  expect(status).toMatchObject({configured:true,personal:true,model:'stubbed-personal-model'});expect(JSON.stringify(status)).not.toContain(apiKey);
  const saved=await db.aiConnection.findUniqueOrThrow({where:{guestId:owner.id}});expect(saved.encryptedKey).not.toContain(apiKey);
  expect(await resolveAi(owner)).toEqual({apiKey,model:'stubbed-personal-model'});
  expect((await connectionStatus(stranger)).configured).toBe(false);await expect(resolveAi(stranger)).rejects.toThrow('Live AI is not connected');
  const other=await db.aiConnection.create({data:{guestId:stranger.id,encryptedKey:saved.encryptedKey,model:saved.model}});
  await expect(resolveAi(stranger)).rejects.toThrow('cannot be opened');await db.aiConnection.delete({where:{id:other.id}});
  await removeConnection(owner);await expect(resolveAi(owner)).rejects.toThrow('Live AI is not connected');
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
  const saved=await getSession(s.id,owner);expect(saved.steps[0].current).toEqual(work);expect(saved.conversation.at(-1)?.student).toContain('2.21');expect(saved.discussion?.at(-1)?.work).toEqual(work);
  s=(await mutateSession(s.id,'provider',{revision:saved.revision,idempotencyKey:crypto.randomUUID(),provider:'mock'},owner)).session;expect(s.steps[0].current).toEqual(work);expect(s.conversation).toHaveLength(1);
 });
 it('does not save an invalid live rewrite or silently substitute a demo reply',async()=>{
  const owner=await who();let s=await createSession(input(),owner);s=(await mutateSession(s.id,'provider',{revision:s.revision,idempotencyKey:crypto.randomUUID(),provider:'live'},owner)).session;
  parse.mockResolvedValue({output_parsed:{message:'Updated.',work:{...s.steps[0].current,id:'s8'}}});
  await expect(mutateSession(s.id,'messages',{revision:s.revision,idempotencyKey:crypto.randomUUID(),stepId:'s1',text:'Recalculate.'},owner)).rejects.toThrow('provider');
  const saved=await getSession(s.id,owner);expect(saved.steps[0].current).toEqual(s.steps[0].current);expect(saved.conversation).toHaveLength(0);expect(parse).toHaveBeenCalledTimes(2);
 });

 it('saves diagram snapshots and teacher annotations atomically, preserves old drawings, and rejects invalid coordinates',async()=>{
  const owner=await who();let s=await createSession({...input(),problemId:'ch2-driving-home'},owner);const original=s.steps[0].current;
  const teacherDrawing={title:'Teacher direction',description:'Choose right as positive.',elements:[{kind:'arrow' as const,x1:100,y1:300,x2:600,y2:300,color:'coral' as const}]};
  const body={revision:s.revision,idempotencyKey:crypto.randomUUID(),stepId:'s1',text:'Draw the motion.',drawing:teacherDrawing};
  const result=await mutateSession(s.id,'messages',body,owner);s=result.session;expect(s.discussion?.at(-1)?.drawing?.elements.length).toBeGreaterThan(0);expect(s.discussion?.at(-1)?.teacherDrawing).toEqual(teacherDrawing);expect(s.steps[0].current.drawing).toEqual(s.discussion?.at(-1)?.drawing);expect(s.discussion?.at(-1)?.work).toEqual(s.steps[0].current);expect(s.steps[0].original).toEqual(original);expect(s.verified).toBeNull();
  expect(await mutateSession(s.id,'messages',body,owner)).toEqual(result);const first=s.discussion?.at(-1)?.drawing;const refreshed=await getSession(s.id,owner);expect(refreshed.discussion).toEqual(s.discussion);
  const second=await mutateSession(s.id,'messages',{...body,revision:s.revision,idempotencyKey:crypto.randomUUID(),text:'Please sketch it again.'},owner);expect(second.session.discussion?.[0].drawing).toEqual(first);
  const {mutationSchema}=await import('../lib/sessions');expect(mutationSchema.safeParse({...body,drawing:{...teacherDrawing,elements:[{...teacherDrawing.elements[0],x1:-1}]}}).success).toBe(false);
 });

 it('persists structured worked sections and shaded graph areas across refresh and later revisions',async()=>{
  const owner=await who();let s=await createSession({...input(),problemId:'ch2-driving-home'},owner);
  s=(await mutateSession(s.id,'provider',{revision:s.revision,idempotencyKey:crypto.randomUUID(),provider:'live'},owner)).session;
  const original=s.steps[0].current;
  const work={...original,text:'Acceleration is constant.',solution:[{title:'Find acceleration',explanation:'Divide the velocity change by time.',formula:'a=(v_f-v_i)/t',substitution:'a=(20-0)/8',result:'a=2.5'}],drawing:{title:'Velocity–time graph',description:'The shaded area gives displacement.',elements:[{kind:'region' as const,points:[{x:180,y:440},{x:820,y:440},{x:820,y:120}],color:'teal' as const}]}};
  parse.mockResolvedValue({output_parsed:{message:'Here is my worked example.',work}});
  const body={revision:s.revision,idempotencyKey:crypto.randomUUID(),stepId:'s1',text:'Give a step-by-step worked solution.'};
  s=(await mutateSession(s.id,'messages',body,owner)).session;
  const refreshed=await getSession(s.id,owner);expect(refreshed.steps[0].current).toEqual(work);expect(refreshed.discussion?.at(-1)?.work).toEqual(work);expect(refreshed.steps[0].original).toEqual(original);
  const next={...work,solution:[{...work.solution[0],title:'Check acceleration'}]};parse.mockResolvedValue({output_parsed:{message:'I checked the acceleration.',work:next}});
  s=(await mutateSession(s.id,'messages',{...body,revision:s.revision,idempotencyKey:crypto.randomUUID(),text:'Check the acceleration.'},owner)).session;
  expect(s.discussion?.[0].work).toEqual(work);expect(s.steps[0].history.at(-1)).toEqual(work);expect(s.steps[0].current).toEqual(next);
 });
 it('recovers old reply calculations from exact history and avoids guessing when revisions do not match',async()=>{
  const owner=await who();let s=await createSession({...input(),problemId:'ch2-driving-home'},owner);
  s=(await mutateSession(s.id,'provider',{revision:s.revision,idempotencyKey:crypto.randomUUID(),provider:'live'},owner)).session;
  const first={...s.steps[0].current,title:'First calculation',text:'Divide distance by speed.',equation:'t=210/95',value:2.21,unit:'h'};
  parse.mockResolvedValue({output_parsed:{message:'First result.',work:first}});
  s=(await mutateSession(s.id,'messages',{revision:s.revision,idempotencyKey:crypto.randomUUID(),stepId:'s1',text:'Calculate the first time.'},owner)).session;
  const second={...first,title:'Hypothetical calculation',text:'Try a hypothetical speed of 100 km/h.',equation:'t=210/100',value:2.1};
  parse.mockResolvedValue({output_parsed:{message:'Second result.',work:second}});
  s=(await mutateSession(s.id,'messages',{revision:s.revision,idempotencyKey:crypto.randomUUID(),stepId:'s1',text:'Try 100 km/h.'},owner)).session;
  expect(s.discussion?.map(t=>t.work)).toEqual([first,second]);
  for(const turn of s.discussion!){const event=await db.sessionEvent.findUniqueOrThrow({where:{id:turn.id}});const data={...event.data as Record<string,unknown>};delete data.work;await db.sessionEvent.update({where:{id:event.id},data:{data:JSON.parse(JSON.stringify(data))}});}
  const recovered=await getSession(s.id,owner);expect(recovered.discussion?.map(t=>t.work)).toEqual([first,second]);expect(recovered.verified).toBeNull();
  await db.attemptStep.updateMany({where:{sessionId:s.id,stableId:'s1'},data:{history:JSON.parse(JSON.stringify([s.steps[0].original,first,first]))}});
  const uncertain=await getSession(s.id,owner);expect(uncertain.discussion?.every(t=>t.work===undefined)).toBe(true);expect(uncertain.steps[0].current).toEqual(second);
 });

});
