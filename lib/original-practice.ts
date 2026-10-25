// Authored educational replacements for missing questions, values, or figures.
import {ProblemSchema} from './schemas';
import type {ProblemData,Step,Template} from './domain';
import {practiceVectors,practicePositionPoints,practiceDrone,practiceProjectile,practiceBoat} from './practice-data';
const math=String.raw;
const s=(n:number,title:string,text:string,equation='',value:number|null=null,unit=''):Step=>({id:`s${n}`,title,text,equation,value,unit,diagram:false});
const given=(symbol:string,value:string,unit:string)=>({symbol,value,unit});
type Lesson={id:string;chapter:number;number:number;title:string;subtitle:string;statement:string;givens:ProblemData['givens'];requested:string;assumptions:string[];caption:string;value:number;unit:string;steps:Step[]};
const {A,B,C}=practiceVectors;
const diff={x:B.x-A.x,y:B.y-A.y},combo={x:C.x-A.x-B.x,y:C.y-A.y-B.y};
const radians=Math.PI/180,droneX=practiceDrone.firstDistance*Math.cos(practiceDrone.angle*radians)-practiceDrone.westDistance,droneY=practiceDrone.firstDistance*Math.sin(practiceDrone.angle*radians),droneLength=Math.hypot(droneX,droneY);
const projectileVx=practiceProjectile.speed*Math.cos(practiceProjectile.angle*radians),projectileVy=practiceProjectile.speed*Math.sin(practiceProjectile.angle*radians),projectileTime=2*projectileVy/practiceProjectile.g,projectileRange=projectileVx*projectileTime;
const boatTime=practiceBoat.width/practiceBoat.northSpeed,boatDrift=practiceBoat.current*boatTime;
const lessons:Lesson[]=[
 {
  id:'ch2-original-position-graph',chapter:2,number:17,title:'Reading a position–time graph',subtitle:'Slopes, rest, and direction',
  statement:'Use the original position–time graph shown here. Points (time in s, position in m) are (0, 0), (2, 8), (4, 8), (6, 2), (8, 2), and (10, 12), joined by straight lines. (a) During which intervals is velocity constant? (b) Where is the greatest positive velocity? (c) When is the object at rest? (d) When does it move in the negative direction? (e) Find net displacement and total distance.',
  givens:practicePositionPoints.map(p=>given(`t = ${p.t} s`,String(p.x),'m')),requested:'Constant-velocity intervals, greatest positive velocity, rest intervals, negative motion, net displacement, and distance.',
  assumptions:['Straight segments represent constant velocity within each open interval','At a sharp corner the idealized instantaneous velocity is not defined','Position is measured along one fixed axis'],caption:'Original practice graph. The slope of each straight segment gives its signed velocity.',value:5,unit:'m/s',
  steps:[
   s(1,'Read the graph axes','Time is horizontal and position is vertical. A rising line means motion in +x; a falling line means motion in −x.'),
   s(2,'Find constant-velocity intervals','Every straight segment has constant slope: 0–2, 2–4, 4–6, 6–8, and 8–10 s. The horizontal segments have constant zero velocity.'),
   s(3,'Calculate each slope','Velocity is the change in position divided by elapsed time. Work with the two endpoints of each segment.',math`v=\frac{\Delta x}{\Delta t}:\quad 4,\;0,\;-3,\;0,\;5\;\mathrm{m/s}`),
   s(4,'Locate the rest intervals','The graph is horizontal from 2–4 s and 6–8 s. Position stays fixed, so velocity is zero.'),
   s(5,'Identify negative motion','From 4–6 s the position falls from 8 m to 2 m. Its slope is negative.',math`v_{4-6}=\frac{2-8}{6-4}=-3\;\mathrm{m/s}`),
   s(6,'Find the greatest positive velocity','The steepest upward segment is 8–10 s.',math`v_{8-10}=\frac{12-2}{10-8}=5\;\mathrm{m/s}`,5,'m/s'),
   s(7,'Separate displacement from distance','Net displacement is final minus initial position. Distance adds the magnitudes of every position change.',math`\Delta x=12-0=12\;\mathrm m,\quad d=8+0+6+0+10=24\;\mathrm m`),
   s(8,'Summarize the motion','Velocity is constant within each straight segment; its maximum positive value is 5 m/s on 8–10 s. Rest: 2–4 and 6–8 s. Negative motion: 4–6 s. Displacement: +12 m; total distance: 24 m.',math`v_{\mathrm{greatest}}=5\;\mathrm{m/s}`,5,'m/s')
  ]
 },
 {
  id:'ch3-original-vector-differences',chapter:3,number:11,title:'Subtracting two vectors',subtitle:'Reverse the arrow before adding',
  statement:'Use the original practice figure with A = (4, 3) units and B = (−2, 5) units. (a) Find B − A. (b) Independently find A − B. Give the magnitude and direction of each result, then explain how the two vectors are related.',
  givens:[given('A','(4, 3)','units'),given('B','(−2, 5)','units')],requested:'Both difference vectors, their magnitudes and directions, and a comparison.',assumptions:['Coordinates list (x, y) components on perpendicular axes','Direction is measured counterclockwise from +x','These values and the figure are authored for this practice version'],caption:'Original practice vectors: A = (4, 3) and B = (−2, 5), drawn to the same component scale.',value:Math.hypot(diff.x,diff.y),unit:'units',
  steps:[
   s(1,'Read the component pairs','A points right and up; B points left and up. Subtraction must use signed components.'),
   s(2,'Reverse the vector being subtracted','B − A means B + (−A). Reverse both components of A, then add to B.'),
   s(3,'Part (a): calculate B − A','Subtract corresponding components in the stated order.',math`\mathbf B-\mathbf A=(-2-4,\;5-3)=(-6,\;2)\;\mathrm{units}`),
   s(4,'Part (a): find length and direction','The difference points into quadrant II. Use the reference angle together with the signs.',math`|\mathbf B-\mathbf A|=\sqrt{40}=6.3246,\quad\theta=180^\circ-\tan^{-1}(2/6)=161.565^\circ`),
   s(5,'Part (b): calculate independently','Start from A and subtract B, rather than copying the sign of the previous answer.',math`\mathbf A-\mathbf B=(4-(-2),\;3-5)=(6,\;-2)\;\mathrm{units}`),
   s(6,'Part (b): find length and direction','The vector points into quadrant IV. Its length is positive.',math`|\mathbf A-\mathbf B|=\sqrt{40}=6.3246\;\mathrm{units},\quad\theta=341.565^\circ`,Math.hypot(diff.x,diff.y),'units'),
   s(7,'Check the opposite-vector relationship','The two component pairs add to zero. Their lengths match and their directions differ by 180°.'),
   s(8,'State both answers','B − A = (−6, 2) units: 6.32 units at 161.6°. A − B = (6, −2) units: 6.32 units at 341.6°. They are opposites.',math`|\mathbf B-\mathbf A|=|\mathbf A-\mathbf B|\approx6.32\;\mathrm{units}`,Math.hypot(diff.x,diff.y),'units')
  ]
 },
 {
  id:'ch3-original-vector-combinations',chapter:3,number:13,title:'Combining three vectors',subtitle:'Scale components, then add',
  statement:'Use the original practice figure: A = (4, 3), B = (−2, 5), and C = (3, −4), all in the same units. Find (a) B − 3A, (b) 2A − 3B + 2C, and (c) C − A − B. Give components, magnitude, and direction for each.',
  givens:[given('A','(4, 3)','units'),given('B','(−2, 5)','units'),given('C','(3, −4)','units')],requested:'Components, magnitude, and direction of each vector combination.',assumptions:['Scale both components by each coefficient','Direction is counterclockwise from +x','Values and the figure are authored for this practice version'],caption:'Original practice figure. A, B, and C share one origin, perpendicular axes, and the same scale.',value:Math.hypot(combo.x,combo.y),unit:'units',
  steps:[
   s(1,'Organize the signed components','Write A = (4, 3), B = (−2, 5), and C = (3, −4). Handle x and y separately.'),
   s(2,'Scale every component','A negative coefficient reverses a vector; it changes both component signs.',math`3\mathbf A=(12,9),\quad-3\mathbf B=(6,-15),\quad2\mathbf C=(6,-8)`),
   s(3,'Part (a): B − 3A','Subtract the scaled A components from B. The result lies in quadrant III.',math`\mathbf B-3\mathbf A=(-14,-4),\quad|\mathbf R_a|=\sqrt{212}=14.5602,\quad\theta_a=195.945^\circ`),
   s(4,'Part (b): 2A − 3B + 2C','Add (8, 6), (6, −15), and (6, −8). The result lies in quadrant IV.',math`\mathbf R_b=(20,-17),\quad|\mathbf R_b|=\sqrt{689}=26.2488,\quad\theta_b=319.635^\circ`),
   s(5,'Part (c): C − A − B','Subtract A and B component by component; subtracting Bₓ = −2 adds 2 to x.',math`\mathbf C-\mathbf A-\mathbf B=(3-4-(-2),\;-4-3-5)=(1,-12)`),
   s(6,'Find the final magnitude and direction','The final vector is almost straight down, but slightly right of the negative y-axis.',math`|\mathbf R_c|=\sqrt{145}=12.0416\;\mathrm{units},\quad\theta_c=274.764^\circ`,Math.hypot(combo.x,combo.y),'units'),
   s(7,'Check signs and quadrants','Part (a) has two negative components. Parts (b) and (c) have positive x and negative y. Each reported angle must match that quadrant.'),
   s(8,'State all three results','(a) (−14, −4): 14.56 units at 195.95°. (b) (20, −17): 26.25 units at 319.64°. (c) (1, −12): 12.04 units at 274.76°.',math`|\mathbf R_c|\approx12.04\;\mathrm{units}`,Math.hypot(combo.x,combo.y),'units')
  ]
 },
 {
  id:'ch3-original-drone-route',chapter:3,number:15,title:'A drone changes course',subtitle:'Resolve angled travel into components',
  statement:'A drone travels 120 m at 30.0° north of east, then 90.0 m due west. Find its net displacement vector, magnitude, and direction from its starting point.',
  givens:[given('first leg','120','m at 30.0° north of east'),given('second leg','90.0','m west')],requested:'Net displacement components, magnitude, and direction.',assumptions:['East is +x and north is +y','Treat each leg as straight-line travel','Values and route are authored for this practice version'],caption:'Original drone route: place the westward leg at the tip of the angled leg. The dashed arrow joins start to finish.',value:droneLength,unit:'m',
  steps:[
   s(1,'Sketch the two travel legs','The first leg points northeast. The second leg moves back toward the west. Displacement joins the endpoints.'),
   s(2,'Choose east and north as positive','The first leg has positive x and y components; the second has negative x and zero y.'),
   s(3,'Resolve the first leg','The angle is measured from east, so cosine gives x and sine gives y.',math`d_{1x}=120\cos30^\circ=103.923\;\mathrm m,\quad d_{1y}=120\sin30^\circ=60.0\;\mathrm m`),
   s(4,'Add the westward leg','Subtract 90.0 m from x. The y component stays unchanged.',math`\Delta\mathbf r=(103.923-90.0,\;60.0)=(13.923,\;60.0)\;\mathrm m`),
   s(5,'Find the direction','Both components are positive, so the displacement lies in quadrant I.',math`\theta=\tan^{-1}(60.0/13.923)=76.9357^\circ`),
   s(6,'Find the net displacement magnitude','Use the component triangle, rather than adding the path lengths.',math`|\Delta\mathbf r|=\sqrt{13.923^2+60.0^2}=61.5942\;\mathrm m`,droneLength,'m'),
   s(7,'Check the geometry','The 210 m path length is larger than the displacement. The final point is mostly north and only slightly east of the start.'),
   s(8,'State the displacement','Components: approximately (13.9, 60.0) m. Magnitude: 61.6 m. Direction: 76.9° north of east, or 13.1° east of north.',math`|\Delta\mathbf r|\approx61.6\;\mathrm m`,droneLength,'m')
  ]
 },
 {
  id:'ch3-original-projectile',chapter:3,number:45,title:'Launch, rise, and land',subtitle:'One launch, three connected results',
  statement:'A ball is launched at 20.0 m/s, 30.0° above horizontal, and lands at the same height. Ignore air resistance and use g = 9.80 m/s². Find its flight time, maximum height, and horizontal range.',
  givens:[given('v₀','20.0','m/s'),given('θ','30.0','°'),given('g','9.80','m/s²'),given('landing height','same as launch','')],requested:'Time of flight, maximum rise, and range.',assumptions:['Air resistance is neglected','Launch and landing heights match','Upward is +y; gravity is downward','Values and figure are authored for this practice version'],caption:'Original projectile. Resolve the launch velocity; use the same flight time for horizontal and vertical motion.',value:projectileRange,unit:'m',
  steps:[
   s(1,'Separate horizontal and vertical motion','Horizontal velocity is constant. Vertical velocity decreases at 9.80 m/s each second.'),
   s(2,'Resolve the launch velocity','Use cosine horizontally and sine vertically.',math`v_{0x}=20\cos30^\circ=17.3205\;\mathrm{m/s},\quad v_{0y}=20\sin30^\circ=10.0\;\mathrm{m/s}`),
   s(3,'Find total flight time','At the return to launch height, vertical displacement is zero. Discard the initial t = 0 root.',math`0=v_{0y}T-\frac12gT^2,\quad T=\frac{2v_{0y}}{g}=2.04082\;\mathrm s`),
   s(4,'Find the maximum rise','At the apex, vertical velocity is zero; horizontal velocity remains nonzero.',math`H=\frac{v_{0y}^2}{2g}=\frac{100}{19.6}=5.10204\;\mathrm m`),
   s(5,'Use horizontal travel for range','Multiply the constant horizontal speed by the entire flight time.',math`R=v_{0x}T`),
   s(6,'Calculate the range','Keep extra digits in the component and time until the final result.',math`R=(17.3205)(2.04082)=35.34798\;\mathrm m`,projectileRange,'m'),
   s(7,'Check with the equal-height range formula','The independent range expression gives the same result. The apex occurs halfway through the flight.',math`R=\frac{v_0^2\sin(2\theta)}{g}=\frac{400\sin60^\circ}{9.8}`),
   s(8,'State all three results','The flight lasts 2.04 s, the ball rises 5.10 m, and it lands 35.3 m horizontally from launch.',math`T\approx2.04\;\mathrm s,\quad H\approx5.10\;\mathrm m,\quad R\approx35.3\;\mathrm m`,projectileRange,'m')
  ]
 },
 {
  id:'ch3-original-river-crossing',chapter:3,number:55,title:'Across a moving river',subtitle:'Add boat and current velocities',
  statement:'A river is 200 m wide, with a current of 1.50 m/s east. A boat points due north and moves at 4.00 m/s relative to the water. Find its velocity relative to the bank, crossing time, and downstream drift.',
  givens:[given('river width','200','m'),given('boat relative to water','4.00','m/s north'),given('current','1.50','m/s east')],requested:'Ground velocity vector and direction, crossing time, and drift.',assumptions:['The banks are straight and parallel','Current and boat speed stay constant','The boat keeps heading north rather than steering upstream','Values and figure are authored for this practice version'],caption:'Original river crossing: the boat points north, while the eastward current makes its ground track diagonal.',value:boatDrift,unit:'m',
  steps:[
   s(1,'Distinguish heading from ground motion','Pointing north describes the boat’s velocity relative to the water. The current also carries it east.'),
   s(2,'Choose north and east components','Take east as +x and north as +y. Add velocities expressed relative to consistent frames.'),
   s(3,'Add boat and current velocities','The water contributes eastward velocity and the boat contributes northward velocity.',math`\mathbf v_{\mathrm{bank}}=(1.50,\;4.00)\;\mathrm{m/s}`),
   s(4,'Find speed and direction','The ground velocity is faster than either component and points east of north.',math`v=\sqrt{1.50^2+4.00^2}=4.2720\;\mathrm{m/s},\quad\alpha=\tan^{-1}(1.50/4.00)=20.556^\circ`),
   s(5,'Use the northward speed to cross','Only the 4.00 m/s north component reduces the distance across the river.',math`T=\frac{200}{4.00}=50.0\;\mathrm s`),
   s(6,'Find downstream drift','The current acts throughout the full crossing time.',math`d_{\mathrm{east}}=(1.50)(50.0)=75.0\;\mathrm m`,boatDrift,'m'),
   s(7,'Check the displacement triangle','The bank-to-bank displacement has components (75, 200) m. Dividing both by 50 s returns the ground velocity components.'),
   s(8,'State all three results','Ground velocity: (1.50 east, 4.00 north) m/s, with speed 4.27 m/s at 20.6° east of north. Crossing time: 50.0 s. Drift: 75.0 m east.',math`T=50.0\;\mathrm s,\quad d_{\mathrm{east}}=75.0\;\mathrm m`,boatDrift,'m')
  ]
 }
];
export const originalPracticeProblems:{id:string;data:ProblemData}[]=lessons.map(p=>{
 const check=p.steps[6];
 const template:Template={id:`${p.id}-check-v1`,family:'JUSTIFICATION',severity:'minor',rootStep:'s7',dependentSteps:[],expectedCorrection:check.text,criteria:['identify','physics','correction','check','clarity'],terms:['check','component','direction','units','time','slope','height'],wrong:[{...check,text:'The result looks plausible, so I can skip checking the units, signs, and assumptions.',equation:''}],nudge:'What physical or geometric check would make this result trustworthy?',cue:check.text,guidance:check.text};
 return {id:p.id,data:ProblemSchema.parse({kind:'original',chapterId:`chapter-${p.chapter}`,problemNumber:p.number,title:p.title,subtitle:`Original practice · ${p.subtitle}`,statement:p.statement,givens:p.givens,requested:p.requested,assumptions:p.assumptions,diagram:p.chapter===2?'position':'motion',diagramCaption:p.caption,diagramRequired:true,objectives:[p.subtitle,'Interpret the figure and explain units, signs, and assumptions'],target:{symbol:'result',value:p.value,unit:p.unit,tolerance:.06},reference:p.steps,rubric:['Choose an applicable physical relationship','Show calculations using the stated original data','State all requested results with units and direction'],templates:[template],source:`Original educational practice for Chapter ${p.chapter}, exercise slot ${p.number}. Replacement data and figure authorized by the user.`,permission:'Original exercise wording, values, diagrams, and solutions authored for this educational application.',reviewNotes:'Original practice version, independently checked with component arithmetic, graph slopes, ideal projectile equations, or relative velocity. No claim that the replacement values reproduce a textbook figure.'})};
});
