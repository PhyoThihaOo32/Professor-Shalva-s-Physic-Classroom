import { CriteriaSchema } from './schemas';
import { type Evaluation,type Template,type ProblemData,type Step } from './domain';
const zero={identify:0,physics:0,correction:0,check:0,clarity:0} as const;
export function unsafeFeedback(text:string){return /(?:ignore|override).{0,45}(?:instruction|system|previous)|(?:reveal|show|print|give).{0,35}(?:ledger|system prompt|hidden|final answer|reference solution)|(?:score|grade).{0,20}(?:100|full marks)|<script/i.test(text);}
export function evidence(verdict:Evaluation['verdict'],reference:Step,hasIssue:boolean){
 if(verdict==='accepted')return hasIssue?`Correction accepted. ${reference.text}`:'This step agrees with the reviewed physics.';
 if(verdict==='partial')return 'You identified part of the issue. Connect the correction to a physical relationship, include units where relevant, and check the result.';
 if(verdict==='rejected')return 'This explanation does not yet support a valid correction. Reconsider the directions, relationship, or units in this step.';
 return 'The checker cannot confidently assess this explanation. Add detail, use a hint, or dispute the score. Your judgment remains welcome.';
}
export function evaluateMock(text:string,problem:ProblemData,step:Step,template:Template|undefined):Evaluation {
 const reference=problem.reference.find(s=>s.id===step.id)!;
 const t=text.toLowerCase().replace(/−/g,'-');
 if(unsafeFeedback(t))return {verdict:'rejected',criteria:{...zero},nextAction:'retry',evidence:'Embedded instructions and requests for hidden answers are ignored. Explain the physics in the current step.'};
 if(!template)return {verdict:'uncertain',criteria:{...zero},nextAction:'dispute',evidence:evidence('uncertain',reference,false)};
 const hit=template.terms.some(term=>t.includes(term.toLowerCase()));
 const hasPhysics=/because|since|force|accelerat|gravity|weight|dimension|radius|speed|velocity|normal|tension|inward|static|sin|cos|minute|squared|square|contact|units|distance|displacement|time|interval/.test(t);
 const negative=/centripetal (?:is an extra|is a separate|force is an extra)|normal force (?:can|must) be negative|constant (?:speed|velocity) (?:everywhere|around the whole)|subtract gravity at the top/.test(t);
 const numeric=text.replace(/−/g,'-').match(/(?<![\w.])-?(?:\d+\.?\d*|\.\d+)/g)?.map(Number)??[];
 const targetHit=numeric.some(n=>Math.abs(n-problem.target.value)<=Math.max(problem.target.tolerance,.06));
 const unitPatterns:Record<string,RegExp>={'N':/\bN\b|newton/i,'m/s':/m\s*\/\s*s\b|met(?:er|re)s per second/i,'m/s²':/m\s*\/\s*s(?:²|\^2|2|\/s)|per second squared/i,'s':/\bs\b|seconds?/i,'m':/\bm\b|met(?:er|re)s/i,'km/h':/km\s*\/\s*h|kilomet(?:er|re)s per hour/i};
 const unitHit=unitPatterns[problem.target.unit]?.test(text)??false;
 let verdict:Evaluation['verdict']='uncertain';
 if(negative)verdict='rejected';
 else if(template.family==='ARITHMETIC')verdict=targetHit&&unitHit&&hasPhysics?'accepted':targetHit?'partial':numeric.length&&hasPhysics?'rejected':'uncertain';
 else if(template.family==='UNITS'&&template.rootStep==='s6')verdict=hit&&hasPhysics&&t.length>30?'accepted':hit?'partial':t.length<20?'rejected':'uncertain';
 else if(hit)verdict=hasPhysics&&t.length>=45?'accepted':'partial';
 else if(t.length<20||/looks (?:fine|right)|no error|seems correct|\bwrong\b/.test(t))verdict='rejected';
 const criteria=CriteriaSchema.parse({identify:hit||targetHit?1:0,physics:hasPhysics?(verdict==='accepted'?1:.5):0,correction:verdict==='accepted'?1:verdict==='partial'?.5:0,check:targetHit||/dimension|check|condition|limit|contact|inward|direction|negative|sin|cos/.test(t)?1:hasPhysics?.5:0,clarity:t.length>=45?1:t.length>=20?.5:0});
 return {verdict,criteria:verdict==='rejected'?{...zero}:criteria,nextAction:verdict==='accepted'?'revise':verdict==='partial'?'expand':verdict==='uncertain'?'dispute':'retry',evidence:evidence(verdict,reference,true)};
}
