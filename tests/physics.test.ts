import {describe,it,expect} from 'vitest';
import {demoProblems} from '../lib/content';
import {physics,circleTargets,radialBalanceResidual} from '../lib/physics';
import {personas,criterionScore,publicProblem} from '../lib/domain';
import {planErrors,approvedAttempt,validateAttempt,downstream} from '../lib/planner';
import {evaluateMock} from '../lib/evaluator';
import {correctionCases} from './cases';
describe('reviewed physics',()=>{
 it.each(demoProblems.map((p,i)=>({p,i})))('$p.id agrees with independent SI calculation',({p,i})=>{expect(p.data.target.value).toBeCloseTo(circleTargets()[i],8);const final=p.data.reference.at(-1)!;expect(final.value).toBeCloseTo(p.data.target.value,8);expect(final.unit).toBe(p.data.target.unit);expect(p.data.reference.length).toBeGreaterThanOrEqual(6);});
 it('top bucket contact and both sign conventions',()=>{const v=physics.topMinimum(9.81,.8);expect(v).toBeCloseTo(2.8,2);expect(physics.topNormal(.1,v,.8,9.81)).toBeCloseTo(0,10);expect(physics.topNormal(.1,2,.8,9.81)).toBeLessThan(0);for(const outwardPositive of [true,false])expect(radialBalanceResidual({weight:.981,normal:0,mass:.1,speed:v,radius:.8,outwardPositive})).toBeCloseTo(0,10);const p=demoProblems[2].data;expect(p.reference[2].equation).toBe('mg+N=\\frac{mv^2}{r}');expect(p.reference[7].text).toContain('Do not assume');expect(p.reference[2].text).toContain('not an additional force');});
 it('converts centimetres and rpm, not diameter or revolutions/second',()=>{expect(physics.cmToMetres(20)).toBe(.2);expect(physics.rpmToRadians(120)).toBeCloseTo(4*Math.PI,12);});
});
describe('approved independent error planning',()=>{
 it.each(personas.flatMap(persona=>['guided','standard','challenge'].map(difficulty=>({persona,difficulty}))))('$persona.name $difficulty obeys limits and preserves correct steps',({persona,difficulty})=>{for(const {data:p} of demoProblems){const plan=planErrors(p,persona,difficulty);expect(plan).toHaveLength(difficulty==='guided'?1:difficulty==='standard'?2:3);expect(plan.filter(e=>e.severity!=='minor').length).toBeLessThanOrEqual(1);for(const root of plan){for(const other of plan.filter(e=>e!==root)){expect(root.dependentSteps).not.toContain(other.rootStep);expect(root.rootStep).not.toBe(other.rootStep);}}const a=approvedAttempt(p,plan);expect(validateAttempt(a,p,plan)).toEqual([]);expect(a.some((step,i)=>JSON.stringify(step)===JSON.stringify(p.reference[i]))).toBe(true);}});
 it('rejects schema-valid unplanned physics, numeric, unit, and diagram changes',()=>{const p=demoProblems[2].data;for(const field of ['value','unit','diagram','text'] as const){const a=approvedAttempt(p,[]);if(field==='value')a[5].value=99;else if(field==='unit')a[5].unit='kg';else if(field==='diagram')a[1].diagram=false;else a[0].text='Gravity points upward.';expect(validateAttempt(a,p,[]).length).toBe(1);}});
 it('does not penalize omitted diagrams when diagrams are optional',()=>{const p={...demoProblems[0].data,diagramRequired:false};const student={...personas[0],weights:{DIAGRAM:100}};expect(planErrors(p,student,'challenge').some(t=>t.family==='DIAGRAM')).toBe(false);});
 it('tracks descendants for earlier revisions',()=>expect(downstream('s3',demoProblems[0].data.reference)).toEqual(['s4','s5','s6','s7','s8']));
});
describe('scoring and public boundaries',()=>{
 it('weights and normalizes applicable criteria',()=>{expect(criterionScore({identify:1,physics:.5,correction:1,check:0,clarity:1})).toBe(75);expect(criterionScore({identify:1,physics:0,correction:0,check:0,clarity:0},['identify'])).toBe(100);});
 it('never exposes references or error templates in problem DTOs',()=>{const p=demoProblems[2];const dto=publicProblem(p.id,'v1',1,p.data);expect(dto).not.toHaveProperty('reference');expect(dto).not.toHaveProperty('templates');expect(dto).not.toHaveProperty('target');expect(JSON.stringify(dto)).not.toContain('expectedCorrection');});
});
describe('36 labeled corrections',()=>{
 it.each(correctionCases)('$id → $expected',c=>{const p=demoProblems.find(p=>p.id===c.problemId)!.data;const t=p.templates.find(t=>t.id===c.templateId)!;const step=t.wrong.find(s=>s.id===t.rootStep)!;expect(evaluateMock(c.text,p,step,t).verdict).toBe(c.expected);});
});
