import {describe,it,expect} from 'vitest';
import katex from 'katex';
import {chapterTenProblems} from '../lib/chapter-ten';
import {rotationFigure} from '../lib/rotation-figures';
import {courseChapter,problemLibraryHref,problemPageChapter} from '../lib/course';
import {guideForChapter,problemSolvingGuide,rotationalDynamicsGuide} from '../lib/problem-solving-guide';
import {publicProblem,personas} from '../lib/domain';
import {approvedAttempt,planErrors,validateAttempt} from '../lib/planner';
import {equationLines,equationFragments,isProseMath} from '../lib/math-text';
const p=(id:string)=>chapterTenProblems.find(p=>p.id==='ch10-'+id)!.data;
const last=(id:string)=>p(id).reference.at(-1)!;
describe('Chapter 10: independently checked rotational physics',()=>{
 it('provides a distinct rotational guide without changing the general guide',()=>{
  expect(guideForChapter('chapter-10').steps).toBe(rotationalDynamicsGuide);
  expect(rotationalDynamicsGuide).toHaveLength(8);
  expect(rotationalDynamicsGuide[3].detail).toContain('perpendicular lever arms');
  expect(rotationalDynamicsGuide[4].detail).toContain('same axis');
  expect(rotationalDynamicsGuide[5].detail).toContain('only when it applies');
  for(const id of ['chapter-2','chapter-3','chapter-7',undefined])expect(guideForChapter(id).steps).toBe(problemSolvingGuide);
  expect(problemSolvingGuide).toHaveLength(9);
  expect(courseChapter('chapter-10').title).toBe('Rotational Motion');
  expect(problemLibraryHref('chapter-10','bart-v1')).toBe('/library?chapter=chapter-10&student=bart-v1');
  expect(problemPageChapter('/problems/ch10-door-torque').number).toBe(10);
  expect(rotationFigure('constructor')).toBeUndefined();
 });
 it('keeps source labels distinct from local bank numbers and labels authored data',()=>{
  expect(chapterTenProblems).toHaveLength(25);
  expect(new Set(chapterTenProblems.map(p=>p.id)).size).toBe(25);
  expect(chapterTenProblems.map(p=>p.data.problemNumber)).toEqual(Array.from({length:25},(_,i)=>i+1));
  expect(p('grinding-wheel').subtitle).toContain('Supplied problem 7');
  expect(p('original-compound-wheel').kind).toBe('original');
  expect(p('original-compound-wheel').statement).toContain('left edge');
  expect(p('original-hollow-cylinder').assumptions.join(' ')).toContain('Original numerical values');
 });
 it('checks radians, resolution, and the small-angle approximation',()=>{
  const theta=.0003,range=100;
  expect(p('bird-resolution').target.value).toBeCloseTo(2*range*Math.tan(theta/2),8);
  expect(theta*180/Math.PI).toBeCloseTo(.0171887,6);
  expect(p('carousel-speeds').target.value).toBe(2);
  expect(p('original-angular-displacement').target.value).toBeCloseTo(((150-30)*Math.PI/180)/4,12);
  expect(p('original-angular-displacement').assumptions.join(' ')).toContain('No additional full turns');
 });
 it('keeps radial and tangential accelerations perpendicular',()=>{
  const radius=2.5,angularSpeed=.060*8,tangent=.060*radius,radial=(angularSpeed*radius)**2/radius;
  expect(p('carousel-acceleration').target.value).toBeCloseTo(Math.sqrt(tangent*tangent+radial*radial),12);
  expect(p('angular-speed-function').target.value).toBeCloseTo(((1.6+1.2*2)*3)**2/3,12);
  const speed=2400/60*Math.PI*.35;
  expect(p('grinding-wheel').target.value).toBeCloseTo(speed**2/(.35/2),8);
  expect(speed).toBeCloseTo(43.98229715,7);
 });
 it('converts rate and bit length before calculating a data rate',()=>{
  const revolutionsPerSecond=7200/60,circumference=2*Math.PI*.03,bitsPerRevolution=circumference/.0000005;
  expect(p('hard-drive').target.value).toBeCloseTo(revolutionsPerSecond*bitsPerRevolution,5);
  expect(p('earth-angular-velocity').target.value).toBeCloseTo(2*Math.PI/(24*3600),15);
  expect(2*Math.PI/(365*24*3600)).toBeCloseTo(1.99238499e-7,14);
 });
 it('checks uniform startup using revolutions per second and triangular graph areas',()=>{
  expect(p('centrifuge-startup').target.value).toBe(.5*(20000/60)*30);
  expect(p('centrifuge-revolutions').target.value).toBe(.5*(15000/60)*220);
  expect(p('centrifuge-startup').assumptions.join(' ')).toContain('constant');
 });
 it('checks polynomial average rates independently from instantaneous derivatives',()=>{
  const theta=(t:number)=>9.5*t-13*t*t+1.6*t**4;
  const velocity=(t:number)=>9.5-26*t+6.4*t**3;
  const eps=1e-5,derivative=(f:(x:number)=>number,t:number)=>(f(t+eps)-f(t-eps))/(2*eps);
  expect(derivative(theta,3)).toBeCloseTo(104.3,5);
  expect(derivative(velocity,3)).toBeCloseTo(146.8,5);
  expect((theta(3)-theta(2))/(3-2)).toBeCloseTo(48.5,10);
  expect(p('angular-position-function').target.value).toBeCloseTo((velocity(3)-velocity(2))/(3-2),10);
 });
 it('checks signed torques from Cartesian force components and zero lever-arm limits',()=>{
  const cross=(r:number[],f:number[])=>r[0]*f[1]-r[1]*f[0];
  const torqueA=cross([-.3,0],[0,-50]),torqueB=cross([0,.5],[50*Math.sin(Math.PI/3),50*Math.cos(Math.PI/3)]);
  expect(p('original-compound-wheel').target.value).toBeCloseTo(torqueA+torqueB,10);
  expect(torqueA).toBe(15);expect(torqueB).toBeLessThan(0);
  expect(p('bicycle-pedal').target.value).toBeCloseTo(cross([.17,0],[0,58*9.8]),10);
  expect(p('door-torque').target.value).toBeCloseTo(cross([.96,0],[37*Math.cos(Math.PI/3),37*Math.sin(Math.PI/3)]),10);
  expect(cross([.96,0],[37,0])).toBe(0);
 });
 it('checks a shell integral and axis theorems',()=>{
  const mass=6,inner=.1,outer=.2,slices=10000,dr=(outer-inner)/slices;
  const densityPerArea=mass/(Math.PI*(outer*outer-inner*inner));
  let sum=0;
  for(let i=0;i<slices;i++){const r=inner+(i+.5)*dr;sum+=r*r*densityPerArea*2*Math.PI*r*dr;}
  expect(p('original-hollow-cylinder').target.value).toBeCloseTo(sum,9);
  expect(p('original-tangent-cylinder').target.value).toBeCloseTo(.5*4*.3**2+4*.3**2,12);
  const polar=.5*2*.4**2;
  expect(p('original-perpendicular-axes').target.value*2).toBeCloseTo(polar,12);
  expect(p('original-perpendicular-axes').assumptions.join(' ')).toContain('negligible thickness');
 });
 it('checks directions, inertia ratios, fixed-axis dynamics, and energy',()=>{
  expect(p('original-right-hand-rule').target.value).toBe((0-6)/3);
  const initial=[[-1,2],[1,2]].reduce((s,[r,m])=>s+m*r*r,0),final=[[-2,2],[2,2]].reduce((s,[r,m])=>s+m*r*r,0);
  expect(p('original-point-masses').target.value).toBe(final/initial);
  const diskInertia=4*.5**2/2,appliedTorque=.5*6;
  expect(p('original-rotational-dynamics').target.value).toBe(appliedTorque/diskInertia);
  expect(p('original-rotational-energy').target.value).toBeCloseTo(.2*6**2/2,12);
  expect(p('original-torque-work').target.value).toBe(12*3);
  expect(p('original-torque-work').reference[4].equation).toContain('=-36');
 });
 it('checks rolling energy, frame-dependent speeds, and dissipated energy',()=>{
  const h=1.2,g=9.8,speeds=[0,.4,.5,1].map(beta=>Math.sqrt(2*g*h/(1+beta)));
  expect(speeds).toEqual([...speeds].sort((a,b)=>b-a));
  expect(p('original-rolling-race').target.value).toBeCloseTo(speeds[3],12);
  expect(p('original-rolling-race').reference[6].text).toContain('ties the hoop');
  expect(p('original-rolling-race').assumptions.join(' ')).toContain('without friction');
  expect(p('original-rolling-velocities').target.value).toBe(3+(.5*(3/.5)));
  const inertia=.4*2*.1**2,omega=1/.1,energy=2*1**2/2+inertia*omega**2/2;
  expect(p('original-rolling-resistance').target.value).toBeCloseTo(energy,12);
 });
 it.each(chapterTenProblems)('$id has a matching figure, readable math, and no answer leak',({id,data})=>{
  expect(rotationFigure(id)).toBeDefined();expect(data.reference).toHaveLength(8);
  expect(data.reference.at(-1)?.value).toBeCloseTo(data.target.value,10);
  expect(data.reference.at(-1)?.unit).toBe(data.target.unit);
  data.reference.forEach((step,i)=>{
   expect(step.id).toBe('s'+(i+1));
   if(step.equation){
    expect(isProseMath(step.equation),step.equation).toBe(false);
    for(const line of equationLines(step.equation))for(const fragment of equationFragments(line))expect(()=>katex.renderToString(fragment,{throwOnError:true,trust:false}),fragment).not.toThrow();
   }
  });
  for(const persona of personas){const plan=planErrors(data,persona,'standard');expect(validateAttempt(approvedAttempt(data,plan),data,plan)).toEqual([]);}
  const dto=publicProblem(id,id+'-v1',1,data);
  for(const key of ['reference','target','templates','reviewNotes'])expect(dto).not.toHaveProperty(key);
  expect(last(id.replace('ch10-','')).value).toBe(data.target.value);
 });
});
