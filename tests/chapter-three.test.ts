import {describe,it,expect} from 'vitest';
import katex from 'katex';
import {chapterThreeProblems} from '../lib/chapter-three';
import {courseChapter,courseChapters,problemLibraryHref} from '../lib/course';
import {publicProblem,personas} from '../lib/domain';
import {approvedAttempt,planErrors,validateAttempt} from '../lib/planner';
import {equationLines,equationFragments,isProseMath} from '../lib/math-text';
const problem=(number:number)=>chapterThreeProblems.find(p=>p.data.problemNumber===number)!.data;
describe('Chapter 3 reference physics',()=>{
 it('adds displacement components with the correct southwest quadrant',()=>{
  const x=-245-118*Math.cos(Math.PI/4),y=-118*Math.sin(Math.PI/4),p=problem(1);
  expect(p.target.value).toBeCloseTo(Math.sqrt(x*x+y*y),10);
  expect(Math.atan2(-y,-x)*180/Math.PI).toBeCloseTo(14.25423158,7);
  expect(p.reference[4].equation).toContain('14.2542');
  expect(p.reference.at(-1)?.text).toContain('south of west');
 });
 it('preserves the component signs and both opposite-vector subtraction directions',()=>{
  expect(problem(3).target.value).toBeCloseTo(Math.sqrt(9.4**2+6.8**2),10);
  expect(problem(3).reference[4].equation).toContain('324.1179');
  const p=problem(7);
  expect(p.reference[2].equation).toContain('=+1.3');
  expect(p.reference[3].equation).toContain('=+12.3');
  expect(p.reference[4].equation).toContain('=-12.3');
  expect(p.reference.at(-1)?.text).toContain('180°');
 });
 it('differentiates the supplied constant y term to zero',()=>{
  const p=problem(9);
  expect(p.givens.find(g=>g.symbol==='y(t)')?.value).toBe('6.45');
  expect(p.reference[2].equation).toContain('v_y=\\frac{d(6.45)}{dt}=0');
  expect(p.reference[3].equation).toContain('-3.00t');
  expect(p.target.value).toBe(3);
  expect(p.reference[5].equation).toContain('-3.00');
 });
 it('subtracts the supplied reference point rather than assuming it is r(0)',()=>{
  const x=5*5+6*5**2-2,y=7-3*5**3-7,p=problem(27);
  expect(p.target.value).toBeCloseTo(Math.hypot(x,y),10);
  expect(p.reference[2].equation).toContain('173');
  expect(p.reference[2].equation).toContain('-375');
  expect(p.reference[4].equation).toContain('-65.2345');
 });
 it('uses the common flight time and retains both valid range angles',()=>{
  expect(problem(35).target.value).toBeCloseTo(4.9*(21/10.8)**2,10);
  const p=problem(41),theta=p.target.value*Math.PI/180;
  expect(95*Math.sin(2*theta)).toBeCloseTo(68,10);
  expect(95*Math.sin(2*(Math.PI/2-theta))).toBeCloseTo(68,10);
  expect(p.reference[5].equation).toContain('67.1460');
  expect(p.assumptions.join(' ')).toContain('same height');
 });
 it.each(chapterThreeProblems)('$id has complete, renderable steps and safe legacy planning',({id,data:p})=>{
  expect(p.reference).toHaveLength(8);
  expect(p.reference.at(-1)?.value).toBeCloseTo(p.target.value,10);
  expect(p.reference.at(-1)?.unit).toBe(p.target.unit);
  p.reference.forEach((step,index)=>{
   expect(step.id).toBe(`s${index+1}`);
   if(step.equation){
    expect(isProseMath(step.equation)).toBe(false);
    for(const line of equationLines(step.equation))for(const fragment of equationFragments(line))expect(()=>katex.renderToString(fragment,{throwOnError:true,trust:false})).not.toThrow();
   }
  });
  for(const persona of personas){const plan=planErrors(p,persona,'standard');expect(validateAttempt(approvedAttempt(p,plan),p,plan)).toEqual([]);}
  const dto=publicProblem(id,`${id}-v1`,1,p);
  for(const key of ['target','reference','templates','reviewNotes'])expect(dto).not.toHaveProperty(key);
 });
});
describe('chapter navigation and incomplete content',()=>{
 it('has no unresolved missing-data rows after original replacements',()=>{
  expect(courseChapters.map(c=>c.number)).toEqual([2,3,4,5,7]);
  const pending=courseChapter('chapter-3').pending;
  expect(pending).toEqual([]);
 });
 it('retains chapter and student context in refreshable local URLs',()=>{
  expect(problemLibraryHref('chapter-3','bart-v1')).toBe('/library?chapter=chapter-3&student=bart-v1');
  expect(problemLibraryHref('chapter-2','stewie-v1')).toBe('/library?student=stewie-v1');
  expect(courseChapter('demo').id).toBe('chapter-2');
  expect(problemLibraryHref('chapter-3','x&chapter=chapter-5')).toBe('/library?chapter=chapter-3&student=x%26chapter%3Dchapter-5');
 });
});
