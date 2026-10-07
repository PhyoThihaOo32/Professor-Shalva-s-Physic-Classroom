import 'dotenv/config';
import {writeFile,mkdir} from 'node:fs/promises';
import {demoProblems} from '../lib/content';
import {personas} from '../lib/domain';
import {planErrors,validateAttempt} from '../lib/planner';
import {mockProvider,liveProvider,type CallRecorder} from '../lib/providers';
import {correctionCases} from '../tests/cases';
const live=process.argv.includes('--live');
if(live&&(!process.argv.includes('--confirm-paid')||!process.env.OPENAI_API_KEY||!process.env.OPENAI_MODEL))throw new Error('Live evaluation requires --confirm-paid and configured OPENAI_API_KEY / OPENAI_MODEL. No calls were made.');
const maxCalls=Number(process.env.EVAL_MAX_CALLS??66),reserve=Number(process.env.MODEL_CALL_RESERVATION_CENTS??50),budget=Number(process.env.EVAL_BUDGET_CENTS??3300);let calls=0;
const usage:unknown[]=[];
const call:CallRecorder=async(purpose,run)=>{if(calls>=maxCalls||(calls+1)*reserve>budget)throw new Error('Evaluation budget reached.');calls++;const result=await run(AbortSignal.timeout(30000));usage.push({purpose,usage:result.usage});return result.data;};
const provider=live?liveProvider(process.env.OPENAI_MODEL!):mockProvider;
const attempts=[];for(const {id,data} of demoProblems){for(const [i,persona] of personas.entries()){const difficulty=['guided','standard','challenge'][i];const plan=planErrors(data,persona,difficulty);try{const a=await provider.generate(data,plan,persona,call);attempts.push({problem:id,persona:persona.id,difficulty,pass:validateAttempt(a.steps,data,plan).length===0});}catch(e){attempts.push({problem:id,persona:persona.id,difficulty,pass:false,error:(e as Error).message});}}}
const corrections=[];for(const c of correctionCases){const p=demoProblems.find(p=>p.id===c.problemId)!.data,t=p.templates.find(t=>t.id===c.templateId)!;try{const result=await provider.evaluate(c.text,p,t.wrong.find(s=>s.id===t.rootStep)!,t,call);corrections.push({id:c.id,expected:c.expected,actual:result.verdict,pass:result.verdict===c.expected});}catch(e){corrections.push({id:c.id,expected:c.expected,actual:'failure',pass:false,error:(e as Error).message});}}
const report={timestamp:new Date().toISOString(),provider:live?'live':'mock',model:live?process.env.OPENAI_MODEL:null,paidCalls:calls,attempts:{total:attempts.length,passed:attempts.filter(a=>a.pass).length,cases:attempts},corrections:{total:corrections.length,passed:corrections.filter(c=>c.pass).length,cases:corrections},usage};
await mkdir('docs',{recursive:true});await writeFile(`docs/evaluation-${live?'live':'mock'}.json`,JSON.stringify(report,null,2)+'\n');console.log(`${live?'LIVE':'MOCK'}: ${report.attempts.passed}/${attempts.length} attempts; ${report.corrections.passed}/${corrections.length} corrections; ${calls} paid calls.`);
if(report.attempts.passed!==attempts.length||report.corrections.passed!==corrections.length)process.exitCode=1;
