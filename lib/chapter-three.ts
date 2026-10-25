// Server-owned references. Client components receive only the published DTOs.
import {ProblemSchema} from './schemas';
import type {ProblemData,Step,Template} from './domain';
const math=String.raw;
const s=(n:number,title:string,text:string,equation='',value:number|null=null,unit=''):Step=>({id:`s${n}`,title,text,equation,value,unit,diagram:false});
const given=(symbol:string,value:string,unit:string)=>({symbol,value,unit});
type Lesson={id:string;number:number;title:string;subtitle:string;statement:string;givens:ProblemData['givens'];requested:string;assumptions:string[];diagram:ProblemData['diagram'];caption:string;value:number;unit:string;steps:Step[]};
const tripX=-245-118/Math.sqrt(2),tripY=-118/Math.sqrt(2),tripLength=Math.hypot(tripX,tripY);
const vectorLength=Math.hypot(9.4,6.8),flightTime=21/10.8,roofHeight=9.8*flightTime**2/2;
const displacement=Math.hypot(173,375),lowAngle=Math.asin(68/95)*90/Math.PI;
const lessons:Lesson[]=[
 {
  id:'ch3-car-displacement',number:1,title:'West, then southwest',subtitle:'Resolve a journey into vector components',
  statement:'A car travels 245 km west, then 118 km southwest at 45.0° south of west. Find the magnitude and direction of its displacement from the starting point. Draw a diagram.',
  givens:[given('first leg','245','km west'),given('second leg','118','km southwest'),given('angle','45.0','° south of west')],
  requested:'Magnitude and direction of the net displacement.',assumptions:['East is +x and north is +y','Southwest means 45.0° south of west','Displacement joins the initial and final positions; it is not total path length'],
  diagram:'vector-journey',caption:'Add the westward leg and the southwest leg head to tail. The dashed arrow joins start to finish.',value:tripLength,unit:'km',
  steps:[
   s(1,'Draw the two legs','Place the second arrow at the end of the first. The displacement points from the starting point directly to the final point.'),
   s(2,'Choose axes and signs','Take east as positive x and north as positive y. Both legs have negative x components; the southwest leg also has a negative y component.'),
   s(3,'Resolve the southwest leg','Use the angle measured from west. Cosine gives its westward component and sine gives its southward component.',math`d_{2x}=-118\cos45^\circ=-83.4386\;\mathrm{km},\quad d_{2y}=-118\sin45^\circ=-83.4386\;\mathrm{km}`),
   s(4,'Add like components','The first leg contributes −245 km horizontally and zero vertically.',math`D_x=-245-83.4386=-328.4386\;\mathrm{km},\quad D_y=-83.4386\;\mathrm{km}`),
   s(5,'Find the direction','The final point is west and south of the origin. Measure the small angle southward from the west direction.',math`\theta=\tan^{-1}\!\left(\frac{|D_y|}{|D_x|}\right)=14.2542^\circ`),
   s(6,'Find the displacement magnitude','The perpendicular components form a right triangle.',math`D=\sqrt{D_x^2+D_y^2}=338.8715\;\mathrm{km}`,tripLength,'km'),
   s(7,'Check the geometry','The magnitude is less than the 363 km path length and greater than 245 km. The direction lies between west and southwest.'),
   s(8,'State magnitude and direction','The displacement is about 339 km, directed 14.3° south of west. Equivalently, its standard counterclockwise angle from east is 194.3°.',math`D\approx339\;\mathrm{km},\quad 14.3^\circ\text{ south of west}`,tripLength,'km')
  ]
 },
 {
  id:'ch3-vector-components',number:3,title:'A vector from its components',subtitle:'Magnitude and direction in the fourth quadrant',
  statement:'A vector has components Vₓ = 9.40 units and Vᵧ = −6.80 units. Determine its magnitude and direction.',
  givens:[given('Vₓ','9.40','units'),given('Vᵧ','−6.80','units')],requested:'Vector magnitude and direction relative to the positive x-axis.',
  assumptions:['The x and y axes are perpendicular','Angles are measured counterclockwise from +x unless a clockwise direction is stated'],
  diagram:'vector-components',caption:'The vector points right and downward. Dashed projections show its positive x and negative y components.',value:vectorLength,unit:'units',
  steps:[
   s(1,'Locate the vector','A positive x component and a negative y component put the vector in quadrant IV.'),
   s(2,'Separate length from direction','Magnitude is nonnegative. A negative y component affects direction, rather than making the length negative.'),
   s(3,'Apply the component relationship','Square and add the perpendicular components to find the squared magnitude.',math`|\mathbf V|^2=V_x^2+V_y^2=(9.40)^2+(-6.80)^2`),
   s(4,'Find the angle below +x','Use the ratio of component magnitudes, then identify the quadrant from the original signs.',math`\alpha=\tan^{-1}\!\left(\frac{6.80}{9.40}\right)=35.8821^\circ`),
   s(5,'Express the direction consistently','The vector is 35.9° clockwise from +x. A counterclockwise angle uses 360° minus that angle.',math`\theta=360^\circ-35.8821^\circ=324.1179^\circ`),
   s(6,'Calculate the magnitude','Take the square root only after adding the squares.',math`|\mathbf V|=\sqrt{134.60}=11.6017\;\mathrm{units}`,vectorLength,'units'),
   s(7,'Check both components','The magnitude exceeds either component magnitude. Using 11.6017 cos(−35.8821°) and 11.6017 sin(−35.8821°) recovers +9.40 and −6.80.'),
   s(8,'State the vector','Magnitude: 11.6 units. Direction: 35.9° below +x, or 324.1° counterclockwise from +x.',math`|\mathbf V|\approx11.6\;\mathrm{units},\quad\theta\approx-35.9^\circ`,vectorLength,'units')
  ]
 },
 {
  id:'ch3-opposite-vectors',number:7,title:'Two arrows on one axis',subtitle:'Vector addition and subtraction from Figure 3–39',
  statement:'In the supplied Figure 3–39, A points along +x with magnitude 6.8 units and B points along −x with magnitude 5.5 units. Find the magnitude and direction of C for (a) C = A + B, (b) C = A − B, and (c) C = B − A.',
  givens:[given('Aₓ','+6.8','units'),given('Bₓ','−5.5','units')],requested:'Magnitude and direction for all three vector combinations.',
  assumptions:['The supplied arrows lie on the x-axis','A points right and B points left','A direction of 0° means +x; 180° means −x'],
  diagram:'opposite-vectors',caption:'Figure 3–39 redrawn from the supplied image: A points right and B points left on the same axis.',value:12.3,unit:'units',
  steps:[
   s(1,'Use the directions in the figure','These are collinear vectors, so each can be represented by one signed x component.'),
   s(2,'Attach signs before calculating','The magnitudes are positive, but the components have opposite signs.',math`A_x=+6.8,\quad B_x=-5.5`),
   s(3,'Part (a): add the components','The opposite arrows partly cancel. The positive result points right.',math`(A+B)_x=6.8+(-5.5)=+1.3\;\mathrm{units}`),
   s(4,'Part (b): subtract B','Subtracting B reverses its direction. Both contributions now point right.',math`(A-B)_x=6.8-(-5.5)=+12.3\;\mathrm{units}`),
   s(5,'Part (c): subtract A','Begin with B and subtract the positive A component. The result points left.',math`(B-A)_x=-5.5-6.8=-12.3\;\mathrm{units}`),
   s(6,'Convert components to magnitudes','Take absolute values for lengths, while keeping direction separate. Parts (b) and (c) both have magnitude 12.3 units.',math`|\mathbf B-\mathbf A|=|-12.3|=12.3\;\mathrm{units}`,12.3,'units'),
   s(7,'Compare the subtraction results','A − B and B − A have equal magnitudes and opposite directions. Reversing the subtraction must reverse the vector.'),
   s(8,'State all three results','(a) 1.3 units right (+x, 0°). (b) 12.3 units right (+x, 0°). (c) 12.3 units left (−x, 180°).',math`|\mathbf C_c|=12.3\;\mathrm{units},\quad\theta_c=180^\circ`,12.3,'units')
  ]
 },
 {
  id:'ch3-particle-derivatives',number:9,title:'Motion in three dimensions',subtitle:'Differentiate a position vector component by component',
  statement:math`A particle’s position is \(\mathbf r(t)=(9.60t\,\hat{\mathbf i}+6.45\,\hat{\mathbf j}-1.50t^2\,\hat{\mathbf k})\,\mathrm m\), with t in seconds. Find its velocity and acceleration as functions of time.`,
  givens:[given('x(t)','9.60t','m'),given('y(t)','6.45','m'),given('z(t)','−1.50t²','m')],requested:'The full velocity vector v(t) and acceleration vector a(t).',
  assumptions:['The Cartesian unit vectors are fixed','t is in seconds; coefficients have the units needed to produce metres','The constant y term is 6.45 m, without a factor of t'],
  diagram:'particle-3d',caption:'The path stays in the plane y = 6.45 m. x increases linearly while z bends downward quadratically.',value:3,unit:'m/s²',
  steps:[
   s(1,'Identify the three position components','The i, j, and k directions correspond to x, y, and z. Differentiate each component separately.'),
   s(2,'Keep the constant y position','The particle is offset by 6.45 m in y, but that coordinate does not change with time.'),
   s(3,'Use velocity as the first derivative','For fixed Cartesian unit vectors, differentiate the scalar coefficients.',math`v_x=\frac{d(9.60t)}{dt}=9.60,\quad v_y=\frac{d(6.45)}{dt}=0,\quad v_z=\frac{d(-1.50t^2)}{dt}=-3.00t`),
   s(4,'Assemble the velocity vector','The x velocity is constant; the z velocity becomes more negative with time.',math`\mathbf v(t)=(9.60\,\hat{\mathbf i}-3.00t\,\hat{\mathbf k})\;\mathrm{m/s}`),
   s(5,'Differentiate velocity again','Only the z velocity changes with time.',math`a_x=0,\quad a_y=0,\quad a_z=\frac{d(-3.00t)}{dt}=-3.00`),
   s(6,'Assemble acceleration','Acceleration is constant and points along −z. Its magnitude is 3.00 m/s².',math`\mathbf a(t)=-3.00\,\hat{\mathbf k}\;\mathrm{m/s^2}`,3,'m/s²'),
   s(7,'Check powers and units','Each derivative lowers the time power by one. The constant y position gives zero y velocity; it is not a constant nonzero y velocity.'),
   s(8,'State both functions','Velocity is (9.60 i − 3.00t k) m/s. Acceleration is −3.00 k m/s². There is no j component in either derivative.',math`\mathbf v(t)=(9.60\hat{\mathbf i}-3.00t\hat{\mathbf k})\;\mathrm{m/s},\quad\mathbf a=-3.00\hat{\mathbf k}\;\mathrm{m/s^2}`,3,'m/s²')
  ]
 },
 {
  id:'ch3-displacement-at-five',number:27,title:'Displacement at five seconds',subtitle:'Subtract the reference position before finding a direction',
  statement:math`A particle has position \(\mathbf r(t)=(5.0t+6.0t^2)\hat{\mathbf i}+(7.0-3.0t^3)\hat{\mathbf j}\) in metres, with t in seconds. At t = 5.0 s, find the magnitude and direction of its displacement relative to \(\mathbf r_0=(2.0\hat{\mathbf i}+7.0\hat{\mathbf j})\,\mathrm m\).`,
  givens:[given('x(t)','5.0t + 6.0t²','m'),given('y(t)','7.0 − 3.0t³','m'),given('t','5.0','s'),given('reference (x₀, y₀)','(2.0, 7.0)','m')],requested:'Magnitude and direction of Δr = r(5.0 s) − r₀.',
  assumptions:['The supplied r₀ is the reference location, not necessarily r(0)','Angles are measured from +x; negative angles are clockwise','Coefficients carry the units required for t in seconds and position in metres'],
  diagram:'vector-displacement',caption:'Displacement joins the reference point (2, 7) to the final point. It is different from the final position vector.',value:displacement,unit:'m',
  steps:[
   s(1,'Identify the two endpoints','We need displacement from the supplied reference point. It is not the distance from the coordinate origin.'),
   s(2,'Evaluate position at 5.0 s','Substitute t = 5.0 into both components before subtracting the reference.',math`x=5.0(5.0)+6.0(5.0)^2=175\;\mathrm m,\quad y=7.0-3.0(5.0)^3=-368\;\mathrm m`),
   s(3,'Subtract the reference vector','Subtract corresponding coordinates: final minus reference.',math`\Delta x=175-2=173\;\mathrm m,\quad\Delta y=-368-7=-375\;\mathrm m`),
   s(4,'Form the displacement vector','Its horizontal component is positive and its vertical component is negative, so it points into quadrant IV.',math`\Delta\mathbf r=(173\hat{\mathbf i}-375\hat{\mathbf j})\;\mathrm m`),
   s(5,'Find its direction','Measure clockwise from +x, or give the equivalent counterclockwise angle.',math`\theta=\tan^{-1}\!\left(\frac{-375}{173}\right)=-65.2345^\circ`),
   s(6,'Calculate its magnitude','Apply the Pythagorean relationship to the displacement components, not to the final coordinates.',math`|\Delta\mathbf r|=\sqrt{173^2+375^2}=412.9818\;\mathrm m`,displacement,'m'),
   s(7,'Check the reference and quadrant','Using (175, −368) as the displacement would omit the reference subtraction. The downward component is larger, so the angle below +x should exceed 45°.'),
   s(8,'State magnitude and direction','The displacement is approximately 4.1 × 10² m at 65° below +x (two significant figures). Unrounded values are 412.98 m and 65.2345°, or 294.7655° counterclockwise.',math`|\Delta\mathbf r|\approx4.1\times10^2\;\mathrm m,\quad\theta\approx-65^\circ`,displacement,'m')
  ]
 },
 {
  id:'ch3-horizontal-launch',number:35,title:'A ball off the roof',subtitle:'One flight time connects horizontal and vertical motion',
  statement:'A ball is thrown horizontally at 10.8 m/s from a building roof and lands 21.0 m from the base. How high is the building?',
  givens:[given('v₀ₓ','10.8','m/s'),given('horizontal range','21.0','m'),given('v₀ᵧ','0','m/s'),given('g','9.8','m/s²')],requested:'Roof height above the landing ground.',
  assumptions:['The launch is horizontal, so initial vertical velocity is zero','Air resistance is neglected','The ground is level with the building base','Use g = 9.8 m/s²; take upward as +y'],
  diagram:'horizontal-projectile',caption:'Horizontal motion fixes the flight time; gravity determines how far the ball falls during that same time.',value:roofHeight,unit:'m',
  steps:[
   s(1,'Separate the two directions','Horizontal speed stays constant. Vertically, the ball starts with zero velocity and accelerates downward.'),
   s(2,'Choose a shared flight time','Both motions begin at release and end at impact. The same t must be used in the horizontal and vertical equations.'),
   s(3,'Use the horizontal motion','Distance equals constant horizontal speed multiplied by flight time.',math`\Delta x=v_{0x}t,\quad t=\frac{21.0}{10.8}=1.94444\;\mathrm s`),
   s(4,'Write vertical displacement','With release at y = 0, the ground is y = −h. The initial vertical velocity is zero.',math`-h=0\cdot t-\frac12gt^2`),
   s(5,'Solve for the positive height','Height is the magnitude of the downward displacement.',math`h=\frac12gt^2=\frac12(9.8)\left(\frac{21.0}{10.8}\right)^2`),
   s(6,'Calculate the height','Keep the unrounded time to avoid an early rounding error.',math`h=18.5262\;\mathrm m`,roofHeight,'m'),
   s(7,'Check the launch condition','A horizontal throw has zero initial vertical speed, not zero vertical acceleration. Substituting t back into v₀ₓt gives 21.0 m.'),
   s(8,'State the building height','Using g = 9.8 m/s², the building is approximately 18.5 m high (about 19 m if g is treated as a two-significant-figure input).',math`h\approx18.5\;\mathrm m`,roofHeight,'m')
  ]
 },
 {
  id:'ch3-projectile-range',number:41,title:'Two angles, one range',subtitle:'A projectile can reach the same distance on two paths',
  statement:'For a given launch speed, a projectile’s maximum horizontal range is 95 m. It instead lands 68 m from launch. What launch angle or angles are possible?',
  givens:[given('maximum range','95','m'),given('actual range','68','m')],requested:'Both launch angles that give a 68 m range.',
  assumptions:['Launch and landing are at the same height','The launch speed is unchanged from the maximum-range case','Air resistance is neglected and gravity is uniform','Consider forward launches between 0° and 90°'],
  diagram:'projectile-range',caption:'A low arc and a high arc can reach the same landing point at the same launch speed; a 45° launch goes farthest. Schematic, not to scale.',value:lowAngle,unit:'°',
  steps:[
   s(1,'Identify the range conditions','The usual range formula assumes equal launch and landing heights. Keep the launch speed fixed when comparing ranges.'),
   s(2,'Use the maximum-range case','The maximum occurs at 45°, where sin(2θ) = 1.',math`R_{max}=\frac{v_0^2}{g}=95\;\mathrm m`),
   s(3,'Divide by the maximum range','The unknown speed cancels when the two range formulas are divided.',math`\frac{R}{R_{max}}=\sin(2\theta)=\frac{68}{95}=0.715789`),
   s(4,'Find both sine solutions','For 0° < 2θ < 180°, the two angles with the same positive sine are α and 180° − α.',math`\alpha=\sin^{-1}(68/95)=45.7079^\circ`),
   s(5,'Halve each possible double angle','One trajectory is shallow and the other is steep.',math`\theta_1=\frac{45.7079^\circ}{2},\quad\theta_2=\frac{180^\circ-45.7079^\circ}{2}`),
   s(6,'Calculate the two launch angles','The angles are complementary: their sum is 90°.',math`\theta_1=22.8540^\circ,\quad\theta_2=67.1460^\circ`,lowAngle,'°'),
   s(7,'Check both trajectories','Both give sin(2θ) = 68/95 and hence a 68 m range. A single inverse-sine result would miss the high trajectory.'),
   s(8,'State both valid angles','The projectile may be launched about 23° or 67° above horizontal. More precise values are 22.854° and 67.146°.',math`\theta\approx23^\circ\quad\text{or}\quad67^\circ`,lowAngle,'°')
  ]
 }
];
export const chapterThreeProblems:{id:string;data:ProblemData}[]=lessons.map(p=>{
 const check=p.steps[6];
 const template:Template={id:`${p.id}-check-v1`,family:'JUSTIFICATION',severity:'minor',rootStep:'s7',dependentSteps:[],expectedCorrection:check.text,criteria:['identify','physics','correction','check','clarity'],terms:['check','component','direction','units','reference','height','angle'],wrong:[{...check,text:'The result looks fine, so I can skip checking directions, units, and assumptions.'}],nudge:'Which direction, unit, or assumption should we check?',cue:check.text,guidance:check.text};
 return {id:p.id,data:ProblemSchema.parse({kind:'textbook',chapterId:'chapter-3',problemNumber:p.number,title:p.title,subtitle:p.subtitle,statement:p.statement,givens:p.givens,requested:p.requested,assumptions:p.assumptions,diagram:p.diagram,diagramCaption:p.caption,diagramRequired:true,objectives:[p.subtitle,'Interpret components, directions, units, and assumptions'],target:{symbol:'result',value:p.value,unit:p.unit,tolerance:.06},reference:p.steps,rubric:['Choose coordinates and applicable physical relationships','Show the component calculation or derivatives','State every requested result with units and direction'],templates:[template],source:`User-provided Chapter 3 exercise ${p.number}${p.number===7?' and Figure 3–39':''}`,permission:'Question text and the Figure 3–39 image were supplied by the user for this course application. Notation normalized; diagrams and solutions authored for the app.',reviewNotes:'Checked using independent component sums, derivatives, projectile equations, and quadrant-aware angles. Missing Figure 3–41 exercises are not published. Exercise 9 retains the number and constant y term exactly as supplied.'})};
});
