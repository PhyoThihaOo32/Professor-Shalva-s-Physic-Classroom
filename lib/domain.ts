import type {BoardDrawing} from './drawing';
import type { z } from 'zod';
import type { StepSchema, CriteriaSchema, EvaluationSchema, TemplateSchema, ProblemSchema } from './schemas';
export const families = ['CONCEPT','FORMULA','SIGN','ALGEBRA','ARITHMETIC','UNITS','DIAGRAM','JUSTIFICATION','ASSUMPTION','CONCLUSION'] as const;
export type Step = z.infer<typeof StepSchema>;
export type Criteria = z.infer<typeof CriteriaSchema>;
export type Evaluation = z.infer<typeof EvaluationSchema> & { evidence: string };
export type Template = z.infer<typeof TemplateSchema>;
export type ProblemData=z.infer<typeof ProblemSchema>;
export type Persona = { id:string; name:string; tag:string; description:string; voice:string; weights:Partial<Record<typeof families[number],number>>; color:string; avatar?:{src:string;width:number;height:number}; conversationLead?:string; correctionReply?:string };
// Retain the original versions so saved sessions keep their student identity.
export const legacyPersonas:Persona[] = [
 {id:'milo-v1',name:'Milo Doodle',tag:'The curious shortcut taker',description:'Friendly, distracted, and always ready to guess a formula. A little encouragement goes a long way.',voice:'Okay, I have an idea! Can you help me check it?',weights:{FORMULA:4,ARITHMETIC:4,UNITS:3,DIAGRAM:3},color:'#dbaa61'},
 {id:'nora-v1',name:'Nora Finch',tag:'The thoughtful work in progress',description:'Organized notes, good instincts, occasional slips. Help Nora connect each step to the physics.',voice:'I wrote out my steps. Let’s check whether they fit together.',weights:{SIGN:4,FORMULA:3,UNITS:4,JUSTIFICATION:2},color:'#a9b9a0'},
 {id:'theo-v1',name:'Theo Quill',tag:'The confident big picture thinker',description:'Quick with an answer, less quick with the assumptions. Ask Theo to show why it works.',voice:'I think I see the result. Let’s make the reasoning precise.',weights:{ASSUMPTION:5,JUSTIFICATION:5,CONCLUSION:4,FORMULA:1},color:'#a5b1c1'},
];
export const personas:Persona[] = [
 {id:'spongebob-v1',name:'SpongeBob SquarePants',tag:'The eager learner',description:'All enthusiasm, a few mixed-up formulas. Help SpongeBob slow down, check his units, and connect the dots.',voice:'I’m ready to learn! I have an idea—can we check it together?',weights:{FORMULA:4,ARITHMETIC:4,UNITS:3,DIAGRAM:3},color:'#e5ebbc',avatar:{src:'/students/spongebob.png',width:500,height:647},conversationLead:'Okay, I’m ready to learn!',correctionReply:'Oh, I see it now! I fixed that step and the work that depended on it.'},
 {id:'bart-v1',name:'Bart Simpson',tag:'The shortcut enthusiast',description:'Quick guesses, skipped checks. Get Bart to show his work and explain why his answer makes sense.',voice:'Okay, teach. I tried a shortcut. Want to check my work?',weights:{SIGN:4,FORMULA:3,UNITS:4,JUSTIFICATION:2},color:'#e9d5cb',avatar:{src:'/students/bart.png',width:200,height:298},conversationLead:'All right, teach. Let’s check my shortcut.',correctionReply:'Okay, that shortcut missed something. I fixed the step and will recheck what follows.'},
 {id:'stewie-v1',name:'Stewie Griffin',tag:'The confident strategist',description:'Clever ideas, ambitious assumptions. Challenge Stewie to justify every step and test his conclusions.',voice:'I have a rather elegant approach. Let’s see whether the reasoning holds up.',weights:{ASSUMPTION:5,JUSTIFICATION:5,CONCLUSION:4,FORMULA:1},color:'#dcd7ed',avatar:{src:'/students/stewie.png',width:781,height:987},conversationLead:'Let’s make the reasoning explicit.',correctionReply:'Agreed. I’ve made that correction explicit and updated the dependent work.'},
];
export const sessionPersonas=[...personas,...legacyPersonas];
export function findPersona(id:string){return sessionPersonas.find(p=>p.id===id);}
export function currentStudentId(id:string|undefined){
 const successor:Record<string,string>={'milo-v1':'spongebob-v1','nora-v1':'bart-v1','theo-v1':'stewie-v1'};
 const current=id?successor[id]??id:undefined;
 return personas.find(p=>p.id===current)?.id;
}
export const rubricWeights={identify:25,physics:30,correction:25,check:10,clarity:10} as const;
export const severityWeights={minor:1,major:2,critical:3} as const;
export function criterionScore(criteria:Criteria, applicable: readonly (keyof Criteria)[]=Object.keys(rubricWeights) as (keyof Criteria)[]) { const max=applicable.reduce((s,k)=>s+rubricWeights[k],0); return max ? Math.round(applicable.reduce((s,k)=>s+criteria[k]*rubricWeights[k],0)/max*100):0; }
export type PublicProblem={kind:ProblemData['kind'];chapterId?:string;problemNumber?:number;id:string;versionId:string;version:number;title:string;subtitle:string;statement:string;objectives:string[];givens:ProblemData['givens'];requested:string;assumptions:string[];diagram:ProblemData['diagram'];diagramCaption:string;diagramRequired:boolean;source:string;permission:string;rubric:string[]};
export type PublicReference={problem:PublicProblem;steps:Step[]};
export function publicProblem(id:string,versionId:string,version:number,p:ProblemData):PublicProblem {return {kind:p.kind,chapterId:p.chapterId,problemNumber:p.problemNumber,id,versionId,version,title:p.title,subtitle:p.subtitle,statement:p.statement,objectives:p.objectives,givens:p.givens,requested:p.requested,assumptions:p.assumptions,diagram:p.diagram,diagramCaption:p.diagramCaption,diagramRequired:p.diagramRequired,source:p.source,permission:p.permission,rubric:p.rubric};}
export type ConversationTurn={id:string;stepId:string;teacher:string;student:string;createdAt:string};
export type DiscussionTurn=ConversationTurn & {kind:'message'|'correction'|'check';workUpdated?:boolean;work?:Step;drawing?:BoardDrawing;teacherDrawing?:BoardDrawing};
export type PublicSession={mode?:'manual'|'classroom';id:string;revision:number;state:string;provider:string;difficulty:string;personaId:string;problem:PublicProblem;visibleCount:number;totalSteps:number;steps:{id:string;position:number;original:Step;current:Step;valid:boolean;history:Step[]}[];corrections:{id:string;stepId:string;text:string;verdict:string;feedback:Evaluation}[];hints:{stepId:string;level:number}[];assessments:{rootStep:string;score:number;provisional:boolean;disputed:boolean;disputeReason:string|null}[];score:number;provisional:boolean;assistance:{hints:number;revealed:boolean};verified:Step[]|null;message:string;conversation:ConversationTurn[];discussion?:DiscussionTurn[]};
