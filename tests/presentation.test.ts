import {needsInstinctCheck,instinctNote,instinctLight,InstinctSchema} from '../lib/teacher-instinct';
import {describe,it,expect} from 'vitest';
import katex from 'katex';
import {mathParts,plainMath,explanationLines,equationLines,equationFragments,isProseMath} from '../lib/math-text';
import {layoutDrawing} from '../lib/drawing-layout';
import {DrawingSchema} from '../lib/drawing';
import {StepSchema} from '../lib/schemas';
import type {BoardDrawing} from '../lib/drawing';
export const crowdedTrip:BoardDrawing={title:'Trip legs',description:'The first leg is 210 km at 95 km/h. After the rain starts, the speed is 65 km/h.',elements:[
 {kind:'line',x1:140,y1:241,x2:557,y2:241,color:'ink'},
 {kind:'arrow',x1:150,y1:257,x2:330,y2:257,color:'violet'},
 {kind:'arrow',x1:360,y1:257,x2:550,y2:257,color:'teal'},
 {kind:'text',x:220,y:210,text:'210 km (v=95 km/h, t=t_1)',color:'violet'},
 {kind:'text',x:438,y:210,text:'d_2 km (v=65 km/h, t=t_2)',color:'teal'},
 {kind:'text',x:270,y:280,text:'t_1 = 210/95 h',color:'violet'},
 {kind:'text',x:470,y:280,text:'t_2 = 4.5 - t_1 h',color:'teal'}]};
describe('readable saved calculations',()=>{
 it('renders the actual unwrapped legacy calculation without changing the student answer',()=>{
  const text=String.raw`First leg time: t_1=\frac{210}{95} \text{ h} \approx 2.210526 \text{ h}. Second leg time: t_2=4.5 - t_1 = 4.5 - \frac{210}{95} \approx 2.289474 \text{ h}. Second leg distance: d_2 = 65 \times t_2 = 65 \times \left(4.5 - \frac{210}{95}\right) \approx 148.815 \text{ km}. Total distance: d = 210 + 148.815 = 358.815 \text{ km}. Average speed: v\_{avg} = \frac{d}{4.5} = \frac{358.815}{4.5} \approx 79.73 \text{ km/h}.`;
  expect(explanationLines(text)).toHaveLength(5);
  const parts=mathParts(text),math=parts.filter(p=>p.kind==='math');expect(math).toHaveLength(5);
  for(const part of math)expect(()=>katex.renderToString(part.value,{throwOnError:true})).not.toThrow();
  expect(parts.filter(p=>p.kind==='text').map(p=>p.value).join('')).not.toMatch(/\\[A-Za-z]+/);
  expect(math.at(-1)?.value).toContain('79.73');
 });
 it('supports explicit math and code fences while preserving ordinary prose and currency',()=>{
  expect(mathParts(String.raw`Time \(t_1=2\) then \[v=4\]`).filter(p=>p.kind==='math').map(p=>p.block)).toEqual([false,true]);
  expect(mathParts('```math\nx=2\n```')[0]).toEqual({kind:'math',value:'x=2',block:true});
  expect(mathParts('It costs $5 and $10.')).toEqual([{kind:'text',value:'It costs $5 and $10.'}]);
  expect(mathParts('A normal conversation.')).toEqual([{kind:'text',value:'A normal conversation.'}]);
 });
 it('keeps conceptual conclusions readable even when saved as math',()=>{
  for(const sentence of ['Weight on Earth and Moon differ because g is different.','Weights are not the same because gravitational acceleration differs.']){
   expect(isProseMath(sentence)).toBe(true);
   for(const wrapped of [String.raw`\(${sentence}\)`,String.raw`\[${sentence}\]`,`$$${sentence}$$`,`$${sentence}$`,'```math\n'+sentence+'\n```'])expect(mathParts(wrapped)).toEqual([{kind:'text',value:sentence}]);
  }
  expect(mathParts(String.raw`Weight differs because \(g\) differs.`)).toEqual([{kind:'text',value:'Weight differs because '},{kind:'math',value:'g',block:false},{kind:'text',value:' differs.'}]);
  const mixed=mathParts(String.raw`\[Use W=m\times g because gravity differs.\]`);
  expect(mixed).toContainEqual({kind:'math',value:String.raw`W=m\times g`,block:false});
  expect(mixed).toEqual([{kind:'text',value:'Use '},{kind:'math',value:String.raw`W=m\times g`,block:false},{kind:'text',value:' because gravity differs.'}]);
  expect(mathParts(String.raw`\[Weight = m\times g\]`)).toEqual([{kind:'text',value:'Weight = m× g'}]);
 });
 it('preserves equations with named subscripts, units, labels, and standard functions',()=>{
  for(const math of [String.raw`W=m\times g`,String.raw`W_{Earth}=m g_{Earth}`,String.raw`a=2.5\,\mathrm{m/s^2}`,String.raw`F_{net}=ma\quad\text{net force}`,String.raw`x=\sin(\theta)`,String.raw`\begin{aligned}a&=1\\b&=2\end{aligned}`]){
   expect(isProseMath(math)).toBe(false);
   expect(mathParts(`\\[${math}\\]`)).toEqual([{kind:'math',value:math,block:true}]);
  }
 });
 it('wraps long calculations between complete relations, preserving fractions',()=>{
  const math=String.raw`t_2=4.5-t_1=4.5-\frac{210}{95}\approx2.289474\,\mathrm{h}\approx137.368\,\mathrm{min}`;
  const fragments=equationFragments(math);expect(fragments.length).toBeGreaterThan(1);
  expect(fragments.join('')).toBe(math);
  for(const fragment of fragments)expect(()=>katex.renderToString(fragment,{throwOnError:true})).not.toThrow();
 });
 it('splits only top-level chained equations and converts label notation safely',()=>{
  expect(equationLines(String.raw`t_1=\frac{210}{95},t_2=4.5-t_1,d_2=65t_2,d=210+d_2,v_{avg}=d/4.5`)).toHaveLength(5);
  expect(equationLines(String.raw`\begin{aligned}a&=1\\b&=2\end{aligned}`)).toHaveLength(1);
  expect(plainMath(String.raw`t_1 = \frac{210}{95} h, x^2`)).toBe('t₁ = (210) ÷ (95) h, x²');
 });
});
describe('student diagram label layout',()=>{
 it('separates the overlapping trip labels, leaves geometry untouched, and fits the paper',()=>{
  const original=structuredClone(crowdedTrip),{labels}=layoutDrawing(crowdedTrip);expect(labels).toHaveLength(4);
  expect(crowdedTrip).toEqual(original);
  for(const [i,a] of labels.entries()){
   expect(a.x).toBeGreaterThanOrEqual(30);expect(a.y).toBeGreaterThanOrEqual(30);
   expect(a.x+a.width).toBeLessThanOrEqual(970);expect(a.y+a.height).toBeLessThanOrEqual(570);
   expect(a.text).not.toMatch(/[_\\]/);
   for(const b of labels.slice(i+1))expect(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y).toBe(false);
  }
 });
 it('uses a readable legend for paragraphs and crops excess blank space',()=>{
  const drawing:BoardDrawing={title:'Long description',description:'',elements:[{kind:'text',x:990,y:599,text:'This very long label should be described beneath the figure rather than squeezed onto the diagram with tiny unreadable text.',color:'ink'}]};
  const layout=layoutDrawing(drawing);expect(layout.labels[0].callout).toBe(true);expect(layout.labels[0].text).toContain('described beneath');expect(Number(layout.viewBox.split(' ')[3])).toBeLessThan(600);
 });
});

describe('structured worked answers and graph areas',()=>{
 it('accepts bounded shaded regions but rejects markup and out-of-bounds points',()=>{
  const drawing={title:'Area under velocity',description:'Displacement is the signed area.',elements:[{kind:'region',points:[{x:180,y:440},{x:820,y:440},{x:820,y:120}],color:'teal'}]};
  expect(DrawingSchema.safeParse(drawing).success).toBe(true);
  expect(DrawingSchema.safeParse({...drawing,elements:[{...drawing.elements[0],points:[{x:-1,y:440},{x:820,y:440},{x:820,y:120}]}]}).success).toBe(false);
  expect(DrawingSchema.safeParse({...drawing,elements:[{kind:'region',points:drawing.elements[0].points,color:'teal',html:'<script>'}]}).success).toBe(false);
  expect(()=>layoutDrawing(DrawingSchema.parse(drawing))).not.toThrow();
 });
 it('preserves old saved steps and rejects excessively large solution sections',()=>{
  const step={id:'s1',title:'Acceleration',text:'Divide the velocity change by time.',equation:'a=20/8',value:2.5,unit:'m/s²',diagram:false};
  expect(StepSchema.parse(step)).toEqual(step);
  const part={title:'Find acceleration',explanation:'Constant acceleration is assumed.',formula:'a=(v_f-v_i)/t',substitution:'a=(20-0)/8',result:'a=2.5'};
  expect(StepSchema.safeParse({...step,solution:[part]}).success).toBe(true);
  expect(StepSchema.safeParse({...step,solution:Array(6).fill(part)}).success).toBe(false);
 });
});

describe('teacher instinct without answer disclosure',()=>{
 it('distinguishes social replies from reasonable physics, doubts, and unavailable checks',()=>{
  expect(instinctLight().color).toBe('grey');
  expect(instinctLight({instinct:null,instinctStatus:'not-needed'}).color).toBe('grey');
  const social=InstinctSchema.parse({signal:'not-physics',focus:'none'});
  expect(instinctLight({instinct:social,instinctStatus:'checked'}).color).toBe('grey');
  expect(instinctLight({instinct:{signal:'clear',focus:'none'},instinctStatus:'checked'}).color).toBe('green');
  for(const signal of ['check','uncertain'] as const)expect(instinctLight({instinct:{signal,focus:'arithmetic'},instinctStatus:'checked'}).color).toBe('red');
  expect(instinctLight({instinct:null,instinctStatus:'unavailable'}).color).toBe('red');
  expect(instinctLight({instinct:null,instinctStatus:'checked'}).color).toBe('red');
  const saved={instinct:{signal:'clear' as const,focus:'none' as const},instinctStatus:'checked' as const};
  expect(instinctLight({...saved,teacher:'What problem?',student:'You have to give me the question first.'}).color).toBe('grey');
  expect(instinctLight({...saved,teacher:'Don’t be rude.',student:'Just kidding. Give me the question.'}).color).toBe('grey');
  expect(instinctLight({...saved,teacher:'Find the acceleration.',student:'20 ÷ 8 is 2.5 m/s².'}).color).toBe('green');
  expect(instinctLight({...saved,instinctTopicChecked:true,teacher:'Why?',student:'Because it stays the same.'}).color).toBe('green');
 });
 it('checks conceptual attempts as well as calculations, while skipping brief social replies',()=>{
  expect(needsInstinctCheck('Why can an object at rest still have forces acting on it?',false)).toBe(true);
  expect(needsInstinctCheck('Try that again.',false)).toBe(true);
  expect(needsInstinctCheck('Hello Bart!',false)).toBe(false);
  expect(needsInstinctCheck('Thank you, Stewie.',false)).toBe(false);
  expect(needsInstinctCheck('Hi',true)).toBe(true);
  expect(instinctNote({signal:'check',focus:'arithmetic'})).not.toMatch(/\d/);
 });
});
