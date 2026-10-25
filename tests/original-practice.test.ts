import {describe,it,expect} from 'vitest';
import katex from 'katex';
import {originalPracticeProblems} from '../lib/original-practice';
import {practiceVectors,practicePositionPoints,originalPracticeFigure} from '../lib/practice-data';
import {publicProblem,personas} from '../lib/domain';
import {approvedAttempt,planErrors,validateAttempt} from '../lib/planner';
import {equationLines,equationFragments,isProseMath} from '../lib/math-text';
const p=(chapter:number,number:number)=>originalPracticeProblems.find(p=>p.data.chapterId===`chapter-${chapter}`&&p.data.problemNumber===number)!.data;
describe('original educational practice',()=>{
 it('completes every missing exercise as an explicitly original version',()=>{
  expect(originalPracticeFigure('constructor')).toBeUndefined();expect(originalPracticeFigure()).toBeUndefined();
  expect(originalPracticeProblems.map(p=>[p.data.chapterId,p.data.problemNumber])).toEqual([['chapter-2',17],['chapter-3',11],['chapter-3',13],['chapter-3',15],['chapter-3',45],['chapter-3',55]]);
  for(const {id,data} of originalPracticeProblems){expect(data.kind).toBe('original');expect(data.subtitle).toContain('Original practice');expect(data.source).toContain('Replacement data');expect(originalPracticeFigure(id)).toBeDefined();}
 });
 it('checks vector subtraction, scaling, and quadrants with independently calculated components',()=>{
  expect(practiceVectors).toEqual({A:{x:4,y:3},B:{x:-2,y:5},C:{x:3,y:-4}});
  expect(p(3,11).target.value).toBeCloseTo(Math.sqrt(40),10);
  expect(p(3,11).reference[2].equation).toContain('(-6,\\;2)');
  expect(p(3,11).reference[4].equation).toContain('(6,\\;-2)');
  const combine=p(3,13);
  expect(combine.reference[2].equation).toContain('(-14,-4)');
  expect(combine.reference[2].equation).toContain('195.945');
  expect(combine.reference[3].equation).toContain('(20,-17)');
  expect(combine.reference[3].equation).toContain('319.635');
  expect(combine.reference[4].equation).toContain('(1,-12)');
  expect(combine.target.value).toBeCloseTo(Math.sqrt(145),10);
 });
 it('checks the original graph slopes, rest intervals, signed travel, and distance',()=>{
  expect(practicePositionPoints.map((v,i,a)=>i?(v.x-a[i-1].x)/(v.t-a[i-1].t):null).slice(1)).toEqual([4,0,-3,0,5]);
  const distance=practicePositionPoints.reduce((d,v,i,a)=>d+(i?Math.abs(v.x-a[i-1].x):0),0);
  expect(distance).toBe(24);expect(p(2,17).target.value).toBe(5);
  expect(p(2,17).reference[6].equation).toContain('24');
 });
 it('checks the route, projectile, and moving-river answers independently',()=>{
  expect(p(3,15).target.value).toBeCloseTo(Math.hypot(120*Math.sqrt(3)/2-90,60),10);
  expect(p(3,45).target.value).toBeCloseTo(400*Math.sqrt(3)/2/9.8,10);
  expect(p(3,45).reference[2].equation).toContain('2.04082');
  expect(p(3,45).reference[3].equation).toContain('5.10204');
  expect(p(3,55).target.value).toBeCloseTo(200/4*1.5,10);
  expect(p(3,55).reference[3].equation).toContain('20.556');
 });
 it.each(originalPracticeProblems)('$id renders each equation and preserves schema and session boundaries',({id,data})=>{
  expect(data.reference).toHaveLength(8);expect(data.reference.at(-1)?.value).toBeCloseTo(data.target.value,10);expect(data.reference.at(-1)?.unit).toBe(data.target.unit);
  data.reference.forEach((step,i)=>{expect(step.id).toBe(`s${i+1}`);if(step.equation){expect(isProseMath(step.equation)).toBe(false);for(const line of equationLines(step.equation))for(const fragment of equationFragments(line))expect(()=>katex.renderToString(fragment,{throwOnError:true,trust:false})).not.toThrow();}});
  for(const persona of personas){const plan=planErrors(data,persona,'guided');expect(validateAttempt(approvedAttempt(data,plan),data,plan)).toEqual([]);}
  const dto=publicProblem(id,`${id}-v1`,1,data);for(const key of ['reference','target','templates'])expect(dto).not.toHaveProperty(key);
 });
});
