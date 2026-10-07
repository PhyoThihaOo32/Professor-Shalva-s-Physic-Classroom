import { type ProblemData, type Persona, type Template, type Step } from './domain';
export function planErrors(problem:ProblemData,persona:Persona,difficulty:string,seed=0):Template[]{
 const count=difficulty==='guided'?1:difficulty==='challenge'?3:2;
 const sorted=[...problem.templates].sort((a,b)=>(persona.weights[b.family]??1)-(persona.weights[a.family]??1)||((a.id.length+seed)%7)-((b.id.length+seed)%7));
 const selected:Template[]=[];
 for(const t of sorted){
  if(t.family==='DIAGRAM'&&!problem.diagramRequired)continue;
  if(selected.length===count)break;
  if(selected.some(s=>s.rootStep===t.rootStep||s.dependentSteps.includes(t.rootStep)||t.dependentSteps.includes(s.rootStep)))continue;
  if(t.severity!=='minor'&&selected.some(s=>s.severity!=='minor'))continue;
  selected.push(t);
 }
 return selected;
}
export function approvedAttempt(problem:ProblemData,plan:Template[]):Step[]{
 const steps=structuredClone(problem.reference);
 for(const t of plan)for(const wrong of t.wrong){const index=steps.findIndex(s=>s.id===wrong.id);steps[index]=structuredClone(wrong);}
 return steps;
}
export function validateAttempt(actual:Step[],problem:ProblemData,plan:Template[]):string[]{
 const expected=approvedAttempt(problem,plan);
 if(actual.length!==expected.length)return ['Wrong number of steps'];
 return expected.flatMap((e,i)=>JSON.stringify(e)===JSON.stringify(actual[i])?[]:[`Unapproved change at ${e.id}: physics, numeric value, units, diagram, or explanation do not match the approved plan`]);
}
export function downstream(stepId:string,steps:Step[]){const index=steps.findIndex(s=>s.id===stepId);return steps.slice(index+1).map(s=>s.id);}
