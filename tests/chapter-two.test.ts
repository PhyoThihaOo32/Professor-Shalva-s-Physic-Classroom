import {describe,it,expect} from 'vitest';
import {chapterTwoProblems} from '../lib/chapter-two';
import {personas,publicProblem} from '../lib/domain';
import {planErrors,approvedAttempt,validateAttempt} from '../lib/planner';
import {evaluateMock} from '../lib/evaluator';
const expected:Record<number,number>={5:(210+65*(4.5-210/95))/4.5,11:9500/(2*155/3.6),13:Math.sqrt(5/3),19:16.5/(2.75-16.5/340),21:9/1.48,33:-(26*26)/(2*88),41:(85/3.6)**2/(2*.5),55:.5*9.8*(2.6/2)**2,63:75+2*(15.5*15.5)/(2*9.8)};
describe('Chapter 2 reviewed kinematics and safe planning',()=>{
 it.each(chapterTwoProblems)('$id agrees with an independent calculation',({data:p})=>{
  expect(p.target.value).toBeCloseTo(expected[p.problemNumber!],9);
  expect(p.reference.at(-1)?.value).toBeCloseTo(p.target.value,9);
  expect(p.reference.at(-1)?.unit).toBe(p.target.unit);
  for(const persona of personas)for(const difficulty of ['guided','standard','challenge']){
   const plan=planErrors(p,persona,difficulty);
   expect(plan).toHaveLength(difficulty==='guided'?1:difficulty==='standard'?2:3);
   expect(plan.filter(t=>t.severity!=='minor').length).toBeLessThanOrEqual(1);
   for(const a of plan)for(const b of plan.filter(t=>t!==a)){expect(a.dependentSteps).not.toContain(b.rootStep);expect(a.rootStep).not.toBe(b.rootStep);}
   expect(validateAttempt(approvedAttempt(p,plan),p,plan)).toEqual([]);
  }
  const dto=publicProblem('id','v1',1,p);expect(dto).not.toHaveProperty('reference');expect(dto).not.toHaveProperty('target');expect(dto).not.toHaveProperty('templates');
 });
 it('keeps the missing graph unavailable and records all multipart interpretations',()=>{
  expect(chapterTwoProblems.some(p=>p.data.problemNumber===17)).toBe(false);
  const p=(number:number)=>chapterTwoProblems.find(p=>p.data.problemNumber===number)!.data;
  expect(p(5).reference[4].text).toContain('359');
  expect(p(13).reference[3].text).toContain('displacement');expect(p(13).reference[3].equation).toContain('-8.0');
  expect(p(41).reference[4].equation).toContain('21.361');expect(p(41).assumptions.join(' ')).toContain('4 to 5');
  expect(p(55).assumptions.join(' ')).toContain('same height');
  expect(p(63).reference[4].equation).toContain('-41.355');expect(p(63).reference[3].equation).toContain('5.802');
 });
 it.each([5,13,33,41])('checks signed arithmetic and the right units for problem %s',number=>{
  const p=chapterTwoProblems.find(p=>p.data.problemNumber===number)!.data,t=p.templates.find(t=>t.family==='ARITHMETIC')!;
  const reply=`Because the kinematics calculation uses the correct time and distance, I get ${p.target.value.toFixed(3)} ${p.target.unit}. Check the units and sign.`;
  expect(evaluateMock(reply,p,t.wrong[0],t).verdict).toBe('accepted');
  if(number===33)expect(evaluateMock(reply.replace('-3.841','3.841'),p,t.wrong[0],t).verdict).toBe('rejected');
 });
});
