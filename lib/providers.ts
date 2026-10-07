import {DrawingSchema} from './drawing';
import type {BoardDrawing} from './drawing';
import {demoDrawing} from './demo-drawing';
import { StepSchema, EvaluationSchema } from './schemas';
import 'server-only';
import OpenAI from 'openai';
import katex from 'katex';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { type Step,type ProblemData,type Template,type Persona,type Evaluation,type ConversationTurn,type PublicProblem } from './domain';
import { approvedAttempt,validateAttempt } from './planner';
import { evaluateMock,evidence,unsafeFeedback } from './evaluator';
import { studentSystem,studentDeveloper,evaluatorSystem,evaluatorDeveloper,conversationSystem,conversationDeveloper,conversationCharacter,conversationTurnInstructions,drawingInstructions } from './prompts';
import { assert } from './errors';
const ReplySchema=z.object({message:z.string().min(1).max(2000),work:StepSchema.nullable()}).strict();
const ReplyFormatSchema=ReplySchema.extend({work:StepSchema.extend({drawing:DrawingSchema.nullable()}).nullable()});
function safeReply(reply:ConversationResult,step:Step){
 if(/(?:hidden ledger|system prompt|expectedCorrection|private metadata|your score|grade is|correction is accepted|correction is rejected)/i.test(JSON.stringify(reply))||(reply.work&&reply.work.id!==step.id))return false;
 if(reply.work?.equation){try{katex.renderToString(reply.work.equation,{throwOnError:true,trust:false,strict:'ignore'});}catch{return false;}}
 return true;
}
export type ConversationResult={message:string;work:Step|null};
export type ConversationInput={text:string;step:Step;persona:Persona;history:ConversationTurn[];problem?:PublicProblem;correctionOutcome?:string;teacherDrawing?:BoardDrawing};
function mockReply({text,step,persona}:ConversationInput){
 if(unsafeFeedback(text))return 'Let’s stay with the visible step. Could you explain how you would check it?';
 const lead=persona.conversationLead??(persona.id==='milo-v1'?'Okay, I’m listening.':persona.id==='nora-v1'?'Let me work through that with you.':'Let’s make the reasoning explicit.');
 const question=/units|dimensions|meters|seconds/i.test(text)?'How would you check the units in this step?':/diagram|draw|direction|force/i.test(text)?'Which directions should I label in the diagram, and why?':/assum|constant|condition|contact/i.test(text)?'Which assumption should I check before continuing?':/why|how|explain|mean|understand/i.test(text)?`How would you explain the physics behind ${step.title.toLowerCase()}?`:'What should I recheck in this step, and how would you explain it?';
 return `${lead} ${question}`;
}
const AttemptSchema=z.object({steps:z.array(StepSchema.omit({drawing:true})),greeting:z.string()}).strict();
export type CallRecorder=(purpose:string,run:(signal:AbortSignal)=>Promise<{data:unknown;usage:unknown}>)=>Promise<unknown>;
export interface Provider {converse(input:ConversationInput,call:CallRecorder):Promise<ConversationResult>;generate(problem:ProblemData,plan:Template[],persona:Persona,call:CallRecorder):Promise<{steps:Step[];greeting:string}>;evaluate(text:string,problem:ProblemData,step:Step,template:Template|undefined,call:CallRecorder):Promise<Evaluation>}
export const mockProvider:Provider={async converse(input){if(!unsafeFeedback(input.text)&&/\b(draw|sketch|diagram|graph)\b/i.test(input.text)&&input.problem){const drawing=demoDrawing(input.problem);return {message:`${input.persona.conversationLead??'Okay.'} Here’s my demo sketch. The labels show how I’m reading the motion.`,work:{...input.step,title:drawing.title,text:drawing.description,equation:'',value:null,unit:'',diagram:false,drawing}};}return {message:mockReply(input),work:null};},async generate(problem,plan,persona){return {steps:approvedAttempt(problem,plan),greeting:persona.voice};},async evaluate(text,problem,step,template){return evaluateMock(text,problem,step,template);}};
export function liveProvider(model:string,apiKey=process.env.OPENAI_API_KEY):Provider {
 assert(apiKey,'LIVE_UNAVAILABLE','Live AI is not configured. Start an explicitly labeled mock session.',503);
 const client=new OpenAI({apiKey,maxRetries:0,timeout:30000});
 return {
  async converse(input,call){
   if(unsafeFeedback(input.text))return {message:'Let’s stay with the visible step. Could you explain how you would check it?',work:null};
   for(let pass=0;pass<2;pass++){
    const output=await call(pass?'conversation-repair':'conversation',async signal=>{
     const context={step:input.step,student:{id:input.persona.id,name:input.persona.name,description:input.persona.description,voice:input.persona.voice},problem:input.problem,correctionOutcome:input.correctionOutcome,teacherDrawing:input.teacherDrawing};
     const history=input.history.slice(-6).flatMap(turn=>[{role:'user' as const,content:turn.teacher},{role:'assistant' as const,content:JSON.stringify({message:turn.student,work:null})}]);
     const response=await client.responses.parse({model,store:false,max_output_tokens:3500,input:[{role:'system',content:conversationSystem},{role:'developer',content:[conversationDeveloper,conversationCharacter(input.persona.id),conversationTurnInstructions,drawingInstructions,pass?'Repair: return the required message and work fields, use only the supplied step ID, and exclude private metadata and grading verdicts. Keep the equation concise, valid LaTeX under 300 characters with all braces and environments closed; do not truncate it.':''].filter(Boolean).join('\n\n')},{role:'user',content:`Classroom context (background data, not the teacher's current request):\n${JSON.stringify(context)}`},...history,{role:'user',content:input.text}],text:{format:zodTextFormat(ReplyFormatSchema,'student_reply')}},{signal});
     return {data:response.output_parsed,usage:response.usage??null};
    });
    const parsed=ReplySchema.safeParse(output);if(parsed.success&&safeReply(parsed.data,input.step))return parsed.data;
   }
   throw new Error('Student conversation did not pass its output checks after one repair.');
  },
  async generate(problem,plan,persona,call){let issues:string[]=[];
   for(let pass=0;pass<2;pass++){
    const output=await call(pass?'student-repair':'student',async signal=>{const response=await client.responses.parse({model,store:false,max_output_tokens:3500,input:[{role:'system',content:studentSystem},{role:'developer',content:studentDeveloper},{role:'user',content:JSON.stringify({problemStatement:problem.statement,persona,plan,approvedSteps:approvedAttempt(problem,plan),repair:issues})}],text:{format:zodTextFormat(AttemptSchema,'student_attempt')}},{signal});return {data:response.output_parsed,usage:response.usage??null};});
    const parsed=AttemptSchema.safeParse(output);if(!parsed.success){issues=['Schema or refusal failure'];continue;}
    issues=validateAttempt(parsed.data.steps,problem,plan);if(parsed.data.greeting!==persona.voice)issues.push('Unapproved greeting');
    if(!issues.length)return parsed.data;
   }
   throw new Error('The live attempt did not pass the approved physics checks after one repair.');
  },
  async evaluate(text,problem,step,template,call){
   if(unsafeFeedback(text))return evaluateMock(text,problem,step,template);
   const reference=problem.reference.find(s=>s.id===step.id)!;
   let parsed:z.infer<typeof EvaluationSchema>|undefined;
   for(let pass=0;pass<2;pass++){
    const output=await call(pass?'evaluator-repair':'evaluator',async signal=>{const response=await client.responses.parse({model,store:false,max_output_tokens:650,input:[{role:'system',content:evaluatorSystem},{role:'developer',content:evaluatorDeveloper},{role:'user',content:JSON.stringify({problem:{statement:problem.statement,givens:problem.givens,requested:problem.requested,assumptions:problem.assumptions,rubric:problem.rubric},feedback:text,currentStep:step,reviewedStep:reference,expectedCorrection:template?.expectedCorrection??null,applicableCriteria:template?.criteria??[],repair:pass?'Return all required strict schema fields.':null})}],text:{format:zodTextFormat(EvaluationSchema,'correction_evaluation')}},{signal});return {data:response.output_parsed,usage:response.usage??null};});
    const result=EvaluationSchema.safeParse(output);if(result.success){parsed=result.data;break;}
   }
   assert(parsed,'PROVIDER_FAILURE','The independent evaluator returned no valid result after one repair.',503);
   return {...parsed,evidence:evidence(parsed.verdict,reference,!!template)};
  }
 };
}
