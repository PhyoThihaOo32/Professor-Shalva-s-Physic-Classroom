import {describe,it,expect} from 'vitest';
import katex from 'katex';
import {chapterSevenProblems} from '../lib/chapter-seven';
import {energyFigure} from '../lib/energy-figures';
import {courseChapter,problemLibraryHref} from '../lib/course';
import {publicProblem,personas} from '../lib/domain';
import {approvedAttempt,planErrors,validateAttempt} from '../lib/planner';
import {equationLines,equationFragments,isProseMath} from '../lib/math-text';
const problem=(n:number)=>chapterSevenProblems.find(p=>p.data.problemNumber===n)!.data;
describe('Chapter 7: signed work, energy, and dot products',()=>{
 it('includes every unique complete exercise and labels added data',()=>{
  expect(chapterSevenProblems.map(p=>p.data.problemNumber)).toEqual([1,5,11,13,15,17,18,25,29,37,55,57,65]);
  expect(chapterSevenProblems.filter(p=>p.data.kind==='original').map(p=>p.data.problemNumber)).toEqual([15,25]);
  expect(problem(15).statement).toContain('30.0°');expect(problem(15).statement).toContain('including gondola and passengers');
  expect(problem(25).givens[1].value).toBe('(−8.0, 6.1, 4.2)');
  expect(courseChapter('chapter-7').title).toBe('Work and Energy');
  expect(problemLibraryHref('chapter-7','bart-v1')).toBe('/library?chapter=chapter-7&student=bart-v1');
  expect(energyFigure('constructor')).toBeUndefined();expect(energyFigure()).toBeUndefined();
 });
 it('distinguishes a single force’s positive work from zero total work',()=>{
  expect(problem(1).target.value).toBeCloseTo(10427.2,8);
  expect(problem(5).target.value).toBeCloseTo(1857.296,8);
  expect(problem(5).reference[5].equation).toContain('W_f=-1857.296');
  expect(problem(5).reference[6].equation).toContain('=0');
  const netForce=4*2,displacement=(0+2*8)/2*8;
  expect(problem(11).target.value).toBe(netForce*displacement);
 });
 it('adds the eight books’ centre rises without lifting the bottom book',()=>{
  const before=Array(8).fill(.02),after=Array.from({length:8},(_,i)=>(i+.5)*.04);
  const work=after.reduce((sum,h,i)=>sum+1.6*9.8*(h-before[i]),0);
  expect(problem(13).target.value).toBeCloseTo(work,10);
  expect(work).toBeCloseTo(17.5616,10);
  expect(problem(13).reference[6].text).toContain('0.140 m');
 });
 it('uses height for work and the explicit path geometry for acceleration',()=>{
  const weight=2250*9.8,rise=3625-2150,path=rise/Math.sin(Math.PI/6);
  const extraWork=.1*weight*rise,a=extraWork/(2250*path);
  expect(problem(15).reference[1].equation).toContain('32523750');
  expect(problem(15).reference[2].equation).toContain('-32523750');
  expect(problem(15).target.value).toBeCloseTo(a,12);
  expect(a).toBeCloseTo(.49,12);
  // A vertical lift would accelerate twice as fast; the authored slope matters.
  expect(a).not.toBeCloseTo(.98,6);
 });
 it('balances a push below horizontal on an uphill frictionless ramp',()=>{
  const theta=12*Math.PI/180,phi=29*Math.PI/180;
  const push=16*9.8*Math.sin(theta)/Math.cos(phi),work=push*7.5*Math.cos(phi);
  expect(problem(17).target.value).toBeCloseTo(work,10);
  expect(work).toBeCloseTo(244.5041484017,8);
  expect(problem(17).reference[3].equation).toContain('W_N=NL\\cos90^\\circ=0');
  expect(problem(17).reference[5].equation).toContain('cos29');
  expect(problem(17).assumptions[0]).toContain('Friction is neglected');
 });
 it('checks variable and summed dot products using independent arithmetic',()=>{
  const dot=(a:number[],b:number[])=>a.reduce((v,c,i)=>v+c*b[i],0);
  const sum=(a:number[],b:number[])=>a.map((c,i)=>c+b[i]);
  for(const x of [-3,0,2.5])expect(dot([2*x*x,-4*x,5],[11,2.5*x,0])).toBeCloseTo(problem(18).target.value*x*x,12);
  const a=[9,-8.5,0],b=[-8,6.1,4.2],c=[5.8,-9.2,0];
  expect(dot(a,sum(b,c))).toBeCloseTo(6.55,10);
  expect(dot(sum(a,c),b)).toBeCloseTo(-226.37,10);
  expect(problem(25).target.value).toBeCloseTo(dot(sum(b,a),c),10);
  expect(problem(25).reference[2].equation).toContain('6.55');
  expect(problem(25).reference[4].equation).toContain('-226.37');
 });
 it('keeps the z angle obtuse and the direction-cosine identity intact',()=>{
  const v=[20,26,-14],norm=Math.sqrt(v.reduce((a,c)=>a+c*c,0)),angles=v.map(c=>Math.acos(c/norm)*180/Math.PI);
  expect(problem(29).target.value).toBeCloseTo(angles[2],10);
  expect(angles[2]).toBeGreaterThan(90);
  expect(angles.reduce((a,c)=>a+Math.cos(c*Math.PI/180)**2,0)).toBeCloseTo(1,12);
  expect(problem(29).reference[3].equation).toContain('55.8908');
  expect(problem(29).reference[4].equation).toContain('43.1971');
 });
 it('uses only the spring graph’s trapezoid interval, not the entire triangle',()=>{
  const x1=.03,x2=.075,k=65,area=(k*x1+k*x2)/2*(x2-x1);
  expect(problem(37).target.value).toBeCloseTo(area,12);
  expect(area).toBeCloseTo(.1535625,12);
  expect(problem(37).reference[6].text).toContain('negative work');
 });
 it('checks energy ratios, opposite car works, and dimensionless friction',()=>{
  expect(problem(55).reference[3].equation).toContain('\\sqrt3');
  expect(problem(55).target.value).toBe(.5**2);
  const kinetic=.5*1300*20**2;
  expect(kinetic).toBe(260000);expect(problem(57).target.value).toBe(-kinetic+kinetic);
  expect(problem(57).reference[2].equation).toContain('-260000');
  expect(problem(57).reference[3].equation).toContain('+260000');
  const deceleration=-(5**2)/(2*8);
  expect(problem(65).target.value).toBeCloseTo(-deceleration/9.8,12);
  expect(problem(65).target.unit).toBe('');
 });
 it.each(chapterSevenProblems)('$id has a figure, eight renderable steps, and safe session data',({id,data})=>{
  expect(energyFigure(id)).toBeDefined();expect(data.reference).toHaveLength(8);
  expect(data.reference.at(-1)?.value).toBeCloseTo(data.target.value,10);
  expect(data.reference.at(-1)?.unit).toBe(data.target.unit);
  data.reference.forEach((step,i)=>{
   expect(step.id).toBe('s'+(i+1));
   if(step.equation){
    expect(isProseMath(step.equation)).toBe(false);
    for(const line of equationLines(step.equation))for(const fragment of equationFragments(line))expect(()=>katex.renderToString(fragment,{throwOnError:true,trust:false})).not.toThrow();
   }
  });
  for(const persona of personas){const plan=planErrors(data,persona,'standard');expect(validateAttempt(approvedAttempt(data,plan),data,plan)).toEqual([]);}
  const dto=publicProblem(id,id+'-v1',1,data);
  for(const key of ['reference','target','templates','reviewNotes'])expect(dto).not.toHaveProperty(key);
 });
});
