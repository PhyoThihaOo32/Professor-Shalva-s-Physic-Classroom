// Server-owned answers. Client diagrams contain only public givens and geometry.
import {ProblemSchema} from './schemas';
import type {ProblemData,Step,Template} from './domain';
type Line=[title:string,text:string,equation?:string];
type Lesson={
 id:string;title:string;label:string;original?:boolean;statement:string;
 givens:[string,string,string][];assumptions:string[];caption:string;
 model:Line;work:[Line,Line,Line];check:Line;answer:string;
 result:number;unit:string;finalEquation:string;
};
const lessons:Lesson[]=[
 {
  id:'bird-resolution',title:'What can a bird distinguish?',label:'Example 10–1 · Angles and radians',
  statement:'A bird 100 m above an object can distinguish details subtending an angle of 3.0 × 10⁻⁴ rad. (a) Express this angle in degrees. (b) Estimate the width of the smallest distinguishable detail.',
  givens:[['θ','3.0 × 10⁻⁴','rad'],['R','100','m']],
  assumptions:['Treat 100 m as the viewing distance','The detail is perpendicular to the line of sight','Use the small-angle approximation: detail width ≈ arc length Rθ'],
  caption:'The small viewing angle θ spans a detail of width ℓ at a distance R = 100 m. The sketch exaggerates the angle.',
  model:['Connect the angle with a size','One revolution is both 2π radians and 360°. For a small angular detail, width is approximately distance times angle in radians.','\\ell\\approx R\\theta'],
  work:[
   ['Convert to degrees','Multiply radians by 180°/π.','\\theta=(3.0\\times10^{-4})\\frac{180^\\circ}{\\pi}\\approx0.01719^\\circ'],
   ['Find the width','Keep θ in radians when multiplying by the distance.','\\ell\\approx(100)(3.0\\times10^{-4})=0.030\\;\\mathrm m'],
   ['Convert metres to centimetres','A centimetre is one-hundredth of a metre.','0.030\\;\\mathrm m=3.0\\;\\mathrm{cm}']
  ],
  check:['Check the approximation','The exact flat-detail expression 2R tan(θ/2) is indistinguishable at this precision. Rθ is exact for an arc, approximate for a flat object.'],
  answer:'The angle is about 0.017°, and the smallest distinguishable detail is about 3.0 cm wide.',result:.03,unit:'m',finalEquation:'\\theta\\approx0.017^\\circ,\\qquad\\ell\\approx3.0\\;\\mathrm{cm}'
 },
 {
  id:'carousel-speeds',title:'Two riders on one carousel',label:'Conceptual example 10–2 · Linear and angular speed',
  statement:'A horse is at radius R on a rigid carousel. A lion is at radius R/2. Two children ride these animals while the carousel rotates. Who has (a) the greater linear speed and (b) the greater angular velocity? Give the speed ratio.',
  givens:[['horse radius','R',''],['lion radius','R/2','']],
  assumptions:['Both animals are fixed to the same rigid carousel','Both radii are measured from the same axis','Compare nonzero rotation at the same instant'],
  caption:'Both riders sweep out the same angle in the same time. The horse follows a circle with twice the radius.',
  model:['Relate speed to radius','A point fixed to a rigid rotating object has tangential speed v = rω.','v=r\\omega'],
  work:[
   ['Compare angular motion','Both riders complete every revolution together.','\\omega_{\\mathrm{horse}}=\\omega_{\\mathrm{lion}}'],
   ['Compare linear speeds','The horse travels twice the distance in the same time.','v_{\\mathrm{horse}}=R\\omega,\\quad v_{\\mathrm{lion}}=\\frac R2\\omega'],
   ['Form the ratio','Cancel the common angular velocity.','\\frac{v_{\\mathrm{horse}}}{v_{\\mathrm{lion}}}=2']
  ],
  check:['Distinguish speed from angular velocity','The riders have equal revolution times. This does not mean they cover equal path lengths. Linear velocity is tangent to each circle.'],
  answer:'The horse rider has twice the linear speed. Both riders have the same angular velocity.',result:2,unit:'',finalEquation:'v_{\\mathrm{horse}}=2v_{\\mathrm{lion}},\\qquad\\omega_{\\mathrm{horse}}=\\omega_{\\mathrm{lion}}'
 },
 {
  id:'carousel-acceleration',title:'A carousel starts turning',label:'Example 10–3 · Acceleration components',
  statement:'A carousel starts from rest with constant angular acceleration 0.060 rad/s². At radius 2.5 m, find the angular velocity, linear speed, tangential acceleration, radial acceleration, and total acceleration after 8.0 s.',
  givens:[['α','0.060','rad/s²'],['t','8.0','s'],['R','2.5','m'],['ω₀','0','rad/s']],
  assumptions:['The rider is fixed at radius 2.5 m','Angular acceleration is constant','Evaluate all quantities at t = 8.0 s'],
  caption:'At the right-hand point of the carousel, velocity and tangential acceleration point up; radial acceleration points toward the axis.',
  model:['Find the angular velocity','Constant angular acceleration allows a linear change in angular velocity.','\\omega=\\omega_0+\\alpha t=(0.060)(8.0)=0.48\\;\\mathrm{rad/s}'],
  work:[
   ['Find speed and tangential acceleration','The radius connects angular quantities to tangential ones.','v=R\\omega=1.20\\;\\mathrm{m/s},\\quad a_t=R\\alpha=0.150\\;\\mathrm{m/s^2}'],
   ['Find the inward acceleration','Use the instantaneous angular speed, not the angular acceleration.','a_r=R\\omega^2=(2.5)(0.48)^2=0.576\\;\\mathrm{m/s^2}'],
   ['Combine perpendicular components','Tangential and radial acceleration are perpendicular.','a=\\sqrt{a_t^2+a_r^2}=\\sqrt{0.150^2+0.576^2}\\approx0.5952\\;\\mathrm{m/s^2}']
  ],
  check:['Check the directions','Tangential acceleration changes speed; radial acceleration changes direction. Their magnitudes cannot simply be added.'],
  answer:'At 8.0 s: ω = 0.48 rad/s, v = 1.2 m/s, aₜ = 0.15 m/s², aᵣ = 0.58 m/s², and total acceleration ≈ 0.60 m/s².',result:Math.hypot(.15,.576),unit:'m/s²',finalEquation:'a\\approx0.60\\;\\mathrm{m/s^2}'
 },
 {
  id:'hard-drive',title:'Reading a spinning hard drive',label:'Example 10–4 · rpm and data rate',
  statement:'A hard-drive disk rotates at 7200 rpm. At radius 3.00 cm, each idealized bit occupies 0.50 μm along the track. Find (a) angular velocity, (b) tangential speed, and (c) the ideal number of bits passing the reader each second.',
  givens:[['rotation rate','7200','rpm'],['R','3.00','cm'],['bit length','0.50','μm']],
  assumptions:['The disk rotates uniformly','Bits are contiguous along one track','Ignore gaps, encoding overhead, and electronic limitations'],
  caption:'A reader stays over a circular track 3.00 cm from the axis. The track moves tangentially past it.',
  model:['Convert the inputs to SI','Use metres for the radius and bit length.','R=0.0300\\;\\mathrm m,\\quad\\ell=0.50\\times10^{-6}\\;\\mathrm m'],
  work:[
   ['Convert rpm to angular velocity','One revolution is 2π radians and one minute is 60 seconds.','\\omega=7200\\frac{2\\pi}{60}=240\\pi\\approx753.98\\;\\mathrm{rad/s}'],
   ['Find the track speed','Multiply angular velocity by the radius.','v=R\\omega=(0.0300)(240\\pi)\\approx22.6195\\;\\mathrm{m/s}'],
   ['Find bits per second','Divide the track length passing each second by the length per bit.','\\dot N=\\frac v\\ell\\approx4.5239\\times10^7\\;\\mathrm{bits/s}']
  ],
  check:['Check what the rate means','This is a geometric upper estimate for one ideal track, not a claim about actual file-transfer speed. Metres cancel, leaving bits per second.'],
  answer:'ω ≈ 754 rad/s and v ≈ 22.6 m/s. The ideal rate is about 4.5 × 10⁷ bits/s, or 45 million bits per second.',result:.03*240*Math.PI/(.5e-6),unit:'bits/s',finalEquation:'\\dot N\\approx4.5\\times10^7\\;\\mathrm{bits/s}'
 },
 {
  id:'angular-speed-function',title:'Angular velocity changes with time',label:'Example 10–5 · Differentiate angular velocity',
  statement:'A point is fixed 3.0 m from a rotation axis. Its angular velocity is ω(t) = 1.6 + 1.2t, with ω in rad/s and t in seconds. At t = 2.0 s, find angular acceleration, linear speed, tangential acceleration, and radial acceleration.',
  givens:[['R','3.0','m'],['ω(t)','1.6 + 1.2t','rad/s'],['t','2.0','s']],
  assumptions:['The radius remains fixed','The coefficient of t has units rad/s²','Counterclockwise is positive'],
  caption:'At a fixed radius, a rising angular velocity gives both tangential acceleration and inward radial acceleration.',
  model:['Differentiate angular velocity','The constant term differentiates to zero.','\\alpha=\\frac{d\\omega}{dt}=1.2\\;\\mathrm{rad/s^2}'],
  work:[
   ['Evaluate the angular speed','Use the requested time before calculating radial acceleration.','\\omega(2)=1.6+1.2(2)=4.0\\;\\mathrm{rad/s}'],
   ['Find the tangential quantities','Both quantities scale linearly with radius.','v=R\\omega=12.0\\;\\mathrm{m/s},\\quad a_t=R\\alpha=3.6\\;\\mathrm{m/s^2}'],
   ['Find radial acceleration','Radial acceleration depends on angular speed squared.','a_r=R\\omega^2=(3.0)(4.0)^2=48\\;\\mathrm{m/s^2}']
  ],
  check:['Check speed versus acceleration','The inward component is much larger here. A positive angular acceleration alone does not specify the total acceleration direction.'],
  answer:'α = 1.2 rad/s², v = 12 m/s, aₜ = 3.6 m/s², and aᵣ = 48 m/s² inward.',result:48,unit:'m/s²',finalEquation:'\\alpha=1.2\\;\\mathrm{rad/s^2},\\quad v=12\\;\\mathrm{m/s},\\quad a_t=3.6\\;\\mathrm{m/s^2},\\quad a_r=48\\;\\mathrm{m/s^2}'
 },
 {
  id:'centrifuge-startup',title:'A centrifuge reaches 20,000 rpm',label:'Example 10–6 · Constant angular acceleration',
  statement:'A centrifuge accelerates uniformly from rest to 20,000 rpm in 30 s. Find (a) its angular acceleration and (b) the number of revolutions during startup.',
  givens:[['ω₀','0','rpm'],['final rate','20,000','rpm'],['Δt','30','s']],
  assumptions:['Angular acceleration is constant throughout startup','The time and final rate are nominal values'],
  caption:'The straight angular-velocity graph starts at zero. Its slope gives angular acceleration and its triangular area gives angular displacement.',
  model:['Convert the final angular speed','Keep π until the final calculation.','\\omega_f=20000\\frac{2\\pi}{60}\\approx2094.395\\;\\mathrm{rad/s}'],
  work:[
   ['Calculate angular acceleration','Divide the angular-velocity change by the elapsed time.','\\alpha=\\frac{\\omega_f-0}{30}\\approx69.8132\\;\\mathrm{rad/s^2}'],
   ['Find angular displacement','For constant acceleration, the mean of the endpoint velocities is the average velocity.','\\Delta\\theta=\\frac{\\omega_0+\\omega_f}{2}t=10000\\pi\\;\\mathrm{rad}'],
   ['Convert displacement to revolutions','Divide by the angle per revolution.','N=\\frac{10000\\pi}{2\\pi}=5000\\;\\mathrm{rev}']
  ],
  check:['Check the graph area','Running at the final rate for the entire 30 s would give 10,000 revolutions. Startup from rest gives half as many.'],
  answer:'The angular acceleration is about 69.8 rad/s² and the centrifuge makes about 5000 revolutions during startup.',result:5000,unit:'rev',finalEquation:'\\alpha\\approx69.8\\;\\mathrm{rad/s^2},\\qquad N=5000\\;\\mathrm{rev}'
 },
 {
  id:'grinding-wheel',title:'A fast grinding-wheel rim',label:'Supplied problem 7 · Circular motion',
  statement:'A grinding wheel has diameter 0.35 m and rotates uniformly at 2400 rpm. Find (a) angular velocity, (b) the linear speed of a point on the rim, and (c) its radial acceleration.',
  givens:[['diameter','0.35','m'],['rotation rate','2400','rpm']],
  assumptions:['The wheel is rigid and rotates uniformly','Evaluate a point on the rim'],
  caption:'The rim radius is half the 0.35 m diameter. Velocity is tangent to the wheel; radial acceleration points inward.',
  model:['Use the radius, not the diameter','The centripetal-acceleration formula requires distance from the axis.','R=\\frac{0.35}{2}=0.175\\;\\mathrm m'],
  work:[
   ['Convert rpm','There are 40 revolutions per second.','\\omega=2400\\frac{2\\pi}{60}=80\\pi\\approx251.327\\;\\mathrm{rad/s}'],
   ['Find rim speed','Multiply by the rim radius.','v=(0.175)(80\\pi)\\approx43.9823\\;\\mathrm{m/s}'],
   ['Find radial acceleration','Square the unrounded angular velocity.','a_r=R\\omega^2=(0.175)(80\\pi)^2\\approx11053.96\\;\\mathrm{m/s^2}']
  ],
  check:['Check rounding and interpretation','The source’s 43.9 m/s comes from premature rounding. Using π gives 43.98 m/s, or 44 m/s to two significant figures. Constant speed still requires inward acceleration.'],
  answer:'ω ≈ 251 rad/s, rim speed ≈ 44 m/s, and inward radial acceleration ≈ 1.1 × 10⁴ m/s². Tangential acceleration is zero.',result:.175*(80*Math.PI)**2,unit:'m/s²',finalEquation:'a_r\\approx1.1\\times10^4\\;\\mathrm{m/s^2}'
 },
 {
  id:'earth-angular-velocity',title:'Earth’s orbit and daily rotation',label:'Supplied problem 13 · Period and angular speed',
  statement:'Estimate Earth’s angular speed (a) around the Sun using a 365-day year and (b) about its own axis using a 24-hour day.',
  givens:[['orbital period','365','days'],['rotation period','24','h']],
  assumptions:['Use uniform circular motion as an estimate','Use the stated 24-hour day, not the shorter sidereal day','A day has 86,400 seconds'],
  caption:'Earth’s yearly orbit and daily spin are different rotations with different axes and periods. Not to scale.',
  model:['Relate one turn to its period','A full revolution is 2π radians.','\\omega=\\frac{2\\pi}{T}'],
  work:[
   ['Convert the orbital period','Convert days to seconds before calculating.','T_{\\mathrm{orbit}}=365(86400)=31536000\\;\\mathrm s'],
   ['Calculate orbital angular speed','Divide the full angle by the yearly period.','\\omega_{\\mathrm{orbit}}=\\frac{2\\pi}{31536000}\\approx1.9924\\times10^{-7}\\;\\mathrm{rad/s}'],
   ['Calculate spin angular speed','A 24-hour day is 86,400 seconds.','\\omega_{\\mathrm{spin}}=\\frac{2\\pi}{86400}\\approx7.2722\\times10^{-5}\\;\\mathrm{rad/s}']
  ],
  check:['Compare the rates','Daily rotation is 365 times faster in this model. Angular speed alone does not give linear speed without a radius.'],
  answer:'The orbital angular speed is about 1.99 × 10⁻⁷ rad/s. The daily spin angular speed is about 7.27 × 10⁻⁵ rad/s.',result:2*Math.PI/86400,unit:'rad/s',finalEquation:'\\omega_{\\mathrm{spin}}\\approx7.27\\times10^{-5}\\;\\mathrm{rad/s}'
 },
 {
  id:'centrifuge-revolutions',title:'Counting centrifuge revolutions',label:'Supplied problem 9 · Average rotation rate',
  statement:'A centrifuge accelerates uniformly from rest to 15,000 rpm in 220 s. How many revolutions does it make in this time?',
  givens:[['initial rate','0','rpm'],['final rate','15,000','rpm'],['time','220','s']],
  assumptions:['Angular acceleration is constant','No direction reversal occurs'],
  caption:'During uniform startup, the average angular speed is half the final speed. Count revolutions from the area under the rate graph.',
  model:['Use the average rate','Uniform acceleration makes the average rate equal to the mean of the endpoints.','f_{\\mathrm{avg}}=\\frac{0+15000}{2}=7500\\;\\mathrm{rev/min}'],
  work:[
   ['Convert time to minutes','Keep the exact fraction rather than rounding to 3.667 min.','\\Delta t=\\frac{220}{60}=\\frac{11}{3}\\;\\mathrm{min}'],
   ['Multiply rate by time','Revolutions per minute times minutes gives revolutions.','N=(7500)\\frac{11}{3}=27500\\;\\mathrm{rev}'],
   ['Check in SI units','The same triangular graph area in rad/s must give the same turn count.','N=\\frac{\\tfrac12(500\\pi)(220)}{2\\pi}=27500\\;\\mathrm{rev}']
  ],
  check:['Check the factor of two','Using the final rate for the whole interval would double the answer. The rotor has only just reached that rate at the end.'],
  answer:'The centrifuge makes about 27,500 revolutions during the 220 s startup.',result:27500,unit:'rev',finalEquation:'N=27500\\;\\mathrm{rev}'
 },
 {
  id:'angular-position-function',title:'Angular position as a polynomial',label:'Supplied problem 25 · Instantaneous and average rates',
  statement:'Angular position is θ(t) = 9.5t − 13.0t² + 1.6t⁴, with θ in radians and t in seconds. Find ω(t), α(t), their values at 3.0 s, and the average angular velocity and acceleration from 2.0 to 3.0 s.',
  givens:[['θ(t)','9.5t − 13.0t² + 1.6t⁴','rad'],['interval','2.0 to 3.0','s']],
  assumptions:['The coefficients have the units needed to make θ radians','Angles are continuous, unwrapped positions rather than values reduced modulo 2π','Positive rotation is counterclockwise'],
  caption:'The endpoint positions give average angular velocity; the curve’s tangent at 3 s gives instantaneous angular velocity.',
  model:['Differentiate successively','Velocity is the first derivative; acceleration is the second derivative.','\\omega(t)=9.5-26.0t+6.4t^3,\\quad\\alpha(t)=-26.0+19.2t^2'],
  work:[
   ['Evaluate the instantaneous rates','Substitute t = 3.0 s into the derivative functions.','\\omega(3)=104.3\\;\\mathrm{rad/s},\\quad\\alpha(3)=146.8\\;\\mathrm{rad/s^2}'],
   ['Find average angular velocity','Use endpoint positions, not the mean of endpoint velocities when acceleration varies.','\\theta(2)=-7.4,\\quad\\theta(3)=41.1,\\quad\\omega_{\\mathrm{avg}}=\\frac{41.1-(-7.4)}{3-2}=48.5\\;\\mathrm{rad/s}'],
   ['Find average angular acceleration','Use the difference in angular velocities over the one-second interval.','\\omega(2)=8.7,\\quad\\alpha_{\\mathrm{avg}}=\\frac{104.3-8.7}{3-2}=95.6\\;\\mathrm{rad/s^2}']
  ],
  check:['Keep average and instantaneous separate','The average acceleration 95.6 rad/s² differs from α(3) = 146.8 rad/s² because acceleration changes during the interval.'],
  answer:'ω(t) = 9.5 − 26.0t + 6.4t³ and α(t) = −26.0 + 19.2t². At 3.0 s: ω = 104.3 rad/s and α = 146.8 rad/s². Over 2–3 s: average ω = 48.5 rad/s and average α = 95.6 rad/s².',result:95.6,unit:'rad/s²',finalEquation:'\\omega_{\\mathrm{avg}}=48.5\\;\\mathrm{rad/s},\\quad\\alpha_{\\mathrm{avg}}=95.6\\;\\mathrm{rad/s^2}'
 },
 {
  id:'original-compound-wheel',title:'Opposing torques on a compound wheel',label:'Adapted example 10–7 · Signed torque',original:true,
  statement:'Two forces act on a compound wheel. Force A is 50 N downward at the left edge of the inner radius 0.30 m. Force B is 50 N at the top of the outer radius 0.50 m, directed 60° clockwise from the upward radius. Find net torque about the central axis, taking counterclockwise as positive.',
  givens:[['Rₐ','0.30','m'],['Rᵦ','0.50','m'],['Fₐ and Fᵦ','50','N'],['angle between rᵦ and Fᵦ','60','°']],
  assumptions:['Original figure and force locations supply the missing geometry','Force A is perpendicular to its radius','Both radii and forces lie in the page'],
  caption:'A downward force at the left inner rim turns counterclockwise. At the top outer rim, only B’s rightward component turns the wheel clockwise.',
  model:['Choose the torque sign','A left-side downward push gives positive counterclockwise torque. A top-side rightward push gives negative clockwise torque.','\\tau_z=r_xF_y-r_yF_x'],
  work:[
   ['Calculate torque A','The force is perpendicular to the 0.30 m radius.','\\tau_A=(0.30)(50)=+15\\;\\mathrm{N\\,m}'],
   ['Calculate torque B','At the top, the horizontal component is perpendicular to the upward radius.','\\tau_B=-(0.50)(50)\\sin60^\\circ\\approx-21.6506\\;\\mathrm{N\\,m}'],
   ['Add signed torques','Add algebraically before taking the magnitude.','\\tau_{\\mathrm{net}}=15-21.6506=-6.6506\\;\\mathrm{N\\,m}']
  ],
  check:['Check the lever arm','B’s vertical component is parallel to the radius and gives no central torque. Its larger clockwise torque outweighs A.'],
  answer:'The net torque is about −6.7 N·m, meaning a magnitude of 6.7 N·m clockwise.',result:15-25*Math.sin(Math.PI/3),unit:'N·m',finalEquation:'\\tau_{\\mathrm{net}}\\approx-6.7\\;\\mathrm{N\\,m}'
 },
 {
  id:'bicycle-pedal',title:'Maximum torque on a bicycle pedal',label:'Supplied problem 27 · Perpendicular force',
  statement:'A 58 kg rider applies their full body weight to one bicycle pedal. The crank length is 0.17 m. Find the maximum torque about the crank axle, and state the crank orientation that gives it.',
  givens:[['m','58','kg'],['crank length','0.17','m'],['g','9.80','m/s²']],
  assumptions:['The pedal force equals the rider’s body weight and acts vertically downward','Ignore other support and dynamic body forces','The crank axle is the rotation axis'],
  caption:'With the right-hand crank horizontal, a downward pedal force is perpendicular to the crank and produces maximum clockwise torque.',
  model:['Write the torque magnitude','Only the force component perpendicular to the crank contributes.','|\\tau|=rF\\sin\\theta'],
  work:[
   ['Find the assumed pedal force','Mass is not itself a force. Multiply by gravitational acceleration.','F=mg=(58)(9.80)=568.4\\;\\mathrm N'],
   ['Choose the best orientation','A downward force is perpendicular to a horizontal crank.','\\theta=90^\\circ,\\quad\\sin\\theta=1'],
   ['Calculate maximum torque','Use the distance from axle to pedal.','|\\tau|_{\\mathrm{max}}=(0.17)(568.4)=96.628\\;\\mathrm{N\\,m}']
  ],
  check:['Check the dead spot','A vertical crank has its force line through the axle and gives zero torque in this model. Maximum torque requires a horizontal crank.'],
  answer:'The maximum torque magnitude is about 97 N·m with a horizontal crank. On the right side, the downward force turns it clockwise.',result:58*9.8*.17,unit:'N·m',finalEquation:'|\\tau|_{\\mathrm{max}}\\approx97\\;\\mathrm{N\\,m}'
 },
 {
  id:'door-torque',title:'Opening a door at two force angles',label:'Supplied problem 29 · Lever arm',
  statement:'A 37 N force is applied 96 cm from a door’s hinge axis. Find torque magnitude when the force makes (a) 90° and (b) 60° with the radius from the hinges to the handle.',
  givens:[['F','37','N'],['r','96','cm'],['force angles','90 and 60','°']],
  assumptions:['View the door from above','Angles are between the radius and applied force, not between force and door normal','Only torque about the vertical hinge axis is requested'],
  caption:'Top view: the force acts at the handle. The perpendicular component creates torque; the component along the door does not.',
  model:['Convert the lever distance','Use metres for a torque in N·m.','r=0.96\\;\\mathrm m,\\quad|\\tau|=rF\\sin\\theta'],
  work:[
   ['Part (a): perpendicular force','The full force contributes to turning.','|\\tau_{90}|=(0.96)(37)=35.52\\;\\mathrm{N\\,m}'],
   ['Part (b): resolve the force','Only the perpendicular component contributes.','F_\\perp=37\\sin60^\\circ\\approx32.0429\\;\\mathrm N'],
   ['Calculate the angled torque','Multiply by the radius after resolving the force.','|\\tau_{60}|=(0.96)(37)\\sin60^\\circ\\approx30.7612\\;\\mathrm{N\\,m}']
  ],
  check:['Check limiting angles','An angle of 90° gives maximum torque. At 0° or 180°, the force line passes through the hinge and gives zero torque.'],
  answer:'Unrounded torque magnitudes are 35.52 N·m and 30.76 N·m. To two significant figures, they are 36 N·m and 31 N·m.',result:.96*37*Math.sin(Math.PI/3),unit:'N·m',finalEquation:'|\\tau_{90}|\\approx36\\;\\mathrm{N\\,m},\\quad|\\tau_{60}|\\approx31\\;\\mathrm{N\\,m}'
 },
 {
  id:'original-hollow-cylinder',title:'Rotational inertia of a hollow cylinder',label:'Adapted example 10–12 · Add thin shells',original:true,
  statement:'A uniform hollow cylinder has mass 6.0 kg, inner radius 0.10 m, and outer radius 0.20 m. Derive its moment of inertia about its central longitudinal axis using thin shells, then calculate it.',
  givens:[['M','6.0','kg'],['R₁','0.10','m'],['R₂','0.20','m']],
  assumptions:['Original numerical values supplement the supplied symbolic example','The cylinder has uniform volume density and height H','The axis is the cylinder’s central symmetry axis'],
  caption:'A thin cylindrical shell at radius r contributes r² dm. Add shells from the inner radius R₁ to the outer radius R₂.',
  model:['Build the shell integral','A shell has circumference 2πr, height H, and thickness dr.','dm=2\\pi\\rho Hr\\,dr,\\quad I=2\\pi\\rho H\\int_{R_1}^{R_2}r^3\\,dr'],
  work:[
   ['Integrate the shells','Evaluate the fourth-power difference at the two boundaries.','I=\\frac{\\pi\\rho H}{2}(R_2^4-R_1^4)'],
   ['Replace density and height using mass','Factor the fourth-power difference and use the cylinder’s total mass.','M=\\rho\\pi H(R_2^2-R_1^2),\\quad I=\\frac12M(R_1^2+R_2^2)'],
   ['Substitute the original practice values','Both radii must be squared.','I=\\frac12(6.0)(0.10^2+0.20^2)=0.150\\;\\mathrm{kg\\,m^2}']
  ],
  check:['Check solid and thin-wall limits','Setting R₁ = 0 gives the solid-cylinder formula. Letting both radii approach R gives the thin-hoop result MR².'],
  answer:'For a uniform hollow cylinder, I = ½M(R₁² + R₂²). These practice values give I = 0.15 kg·m².',result:.15,unit:'kg·m²',finalEquation:'I=0.15\\;\\mathrm{kg\\,m^2}'
 },
 {
  id:'original-tangent-cylinder',title:'A cylinder about a tangent axis',label:'Adapted example 10–13 · Parallel-axis theorem',original:true,
  statement:'A uniform solid cylinder has mass 4.0 kg and radius 0.30 m. Find its rotational inertia about an axis parallel to its central longitudinal axis but tangent to its outer surface.',
  givens:[['M','4.0','kg'],['R','0.30','m'],['axis separation h','R','']],
  assumptions:['Original numerical values supplement the supplied symbolic example','The new axis is parallel to the cylinder’s symmetry axis','The cylinder is uniform and solid'],
  caption:'The central and tangent axes are parallel and separated by one radius. The parallel-axis theorem adds Mh² to the central inertia.',
  model:['Start with the central inertia','Use the solid-cylinder formula about its symmetry axis.','I_{\\mathrm{CM}}=\\frac12MR^2'],
  work:[
   ['Identify the axis displacement','A tangent axis is one radius from the center.','h=R=0.30\\;\\mathrm m'],
   ['Apply the parallel-axis theorem','Both terms refer to the same rigid body.','I=I_{\\mathrm{CM}}+Mh^2=\\frac32MR^2'],
   ['Substitute the practice values','The shifted axis increases the inertia.','I=\\frac32(4.0)(0.30)^2=0.540\\;\\mathrm{kg\\,m^2}']
  ],
  check:['Check the ratio','The central inertia is 0.18 kg·m². The tangent-axis result is three times as large, not merely one radius added to inertia.'],
  answer:'The tangent-axis moment of inertia is 3MR²/2, or 0.54 kg·m² for these values.',result:.54,unit:'kg·m²',finalEquation:'I=0.54\\;\\mathrm{kg\\,m^2}'
 },
 {
  id:'original-right-hand-rule',title:'Which way do angular vectors point?',label:'Vector nature of rotation',original:true,
  statement:'Viewed from above, a disk rotates counterclockwise at 6.0 rad/s and slows uniformly to rest in 3.0 s. Take upward, out of the page, as +z. Find the angular-velocity direction and signed angular acceleration.',
  givens:[['ωᵢ','+6.0','rad/s'],['ωf','0','rad/s'],['Δt','3.0','s']],
  assumptions:['The rotation axis is fixed','The disk slows without reversing','Angular acceleration is constant'],
  caption:'Curl right-hand fingers counterclockwise: the thumb points out of the page. During slowing, angular acceleration points into the page.',
  model:['Apply the right-hand rule','Counterclockwise rotation viewed from above gives angular velocity along +z.','\\boldsymbol\\omega_i=+6.0\\,\\hat{\\boldsymbol z}\\;\\mathrm{rad/s}'],
  work:[
   ['Calculate the change in angular velocity','The final vector is zero, so its change points in the negative direction.','\\Delta\\omega_z=0-6.0=-6.0\\;\\mathrm{rad/s}'],
   ['Divide by the time interval','Constant angular acceleration equals its interval average.','\\alpha_z=\\frac{-6.0}{3.0}=-2.0\\;\\mathrm{rad/s^2}'],
   ['Interpret the sign','Negative α points into the page, opposite the initial angular velocity.','\\boldsymbol\\alpha=-2.0\\,\\hat{\\boldsymbol z}\\;\\mathrm{rad/s^2}']
  ],
  check:['Separate negative from slowing','Negative angular acceleration slows a positive rotation, but would speed up a negative rotation. Compare the two vector directions.'],
  answer:'Initially ω points upward/out of the page. Angular acceleration is −2.0 rad/s², downward/into the page.',result:-2,unit:'rad/s²',finalEquation:'\\alpha_z=-2.0\\;\\mathrm{rad/s^2}'
 },
 {
  id:'original-point-masses',title:'Move mass farther from the axis',label:'Moment of inertia · Point masses',original:true,
  statement:'Two 2.0 kg point masses sit at opposite ends of a light rod, each 1.0 m from its central rotation axis. They are then repositioned to 2.0 m from the same axis. Find initial and final moments of inertia and their ratio.',
  givens:[['mass of each','2.0','kg'],['initial radius','1.0','m'],['final radius','2.0','m']],
  assumptions:['The rod’s mass is negligible','Treat the two masses as particles','Compare two separate configurations; angular momentum is not specified'],
  caption:'Both masses move from radius 1.0 m to 2.0 m. Inertia weights each mass by its radius squared.',
  model:['Add particle contributions','Each mass contributes mr² about the chosen axis.','I=\\sum_i m_ir_i^2'],
  work:[
   ['Calculate the initial inertia','Both particles have the same radius.','I_i=2(2.0)(1.0)^2=4.0\\;\\mathrm{kg\\,m^2}'],
   ['Calculate the final inertia','The mass is unchanged, but each radius doubles.','I_f=2(2.0)(2.0)^2=16\\;\\mathrm{kg\\,m^2}'],
   ['Compare configurations','A doubled radius gives a fourfold inertia.','\\frac{I_f}{I_i}=\\frac{16}{4}=4']
  ],
  check:['Check the physical meaning','For the same net torque, the final angular acceleration would be one-quarter as large. No conclusion about angular speed follows without additional information.'],
  answer:'Initial I = 4.0 kg·m² and final I = 16 kg·m². The final inertia is four times the initial value.',result:4,unit:'',finalEquation:'I_f=4I_i'
 },
 {
  id:'original-perpendicular-axes',title:'A thin disk about a diameter',label:'Perpendicular-axis theorem',original:true,
  statement:'A uniform thin disk has mass 2.0 kg and radius 0.40 m. Find its moment of inertia about a diameter in its plane, using the perpendicular-axis theorem.',
  givens:[['M','2.0','kg'],['R','0.40','m']],
  assumptions:['The disk is a planar lamina with negligible thickness','The x and y diameters and perpendicular z-axis meet at the center','Uniform density gives symmetry between x and y'],
  caption:'Three axes meet at the disk center. The z-axis is perpendicular to the disk; x and y are perpendicular diameters in its plane.',
  model:['Use the theorem for a flat object','The three axes must pass through the same point.','I_z=I_x+I_y'],
  work:[
   ['Find inertia about the perpendicular axis','Use the uniform-disk formula.','I_z=\\frac12MR^2=\\frac12(2.0)(0.40)^2=0.160\\;\\mathrm{kg\\,m^2}'],
   ['Use disk symmetry','Both diameters are equivalent.','I_x=I_y,\\quad I_z=2I_x'],
   ['Find the diameter-axis inertia','Divide the perpendicular inertia by two.','I_x=I_y=\\frac14MR^2=0.080\\;\\mathrm{kg\\,m^2}']
  ],
  check:['Check applicability','This theorem is for planar mass distributions. It cannot be applied unchanged to a thick cylinder or a general three-dimensional object.'],
  answer:'The moment of inertia about a diameter is ¼MR² = 0.080 kg·m².',result:.08,unit:'kg·m²',finalEquation:'I_{\\mathrm{diameter}}=0.080\\;\\mathrm{kg\\,m^2}'
 },
 {
  id:'original-rolling-race',title:'Which object reaches the bottom faster?',label:'Rolling energy · Compare mass distributions',original:true,
  statement:'A frictionless sliding block, a uniform solid sphere, a uniform solid cylinder, and a thin hoop start from rest at the same vertical height of 1.20 m. Compare their speeds at the bottom. The three round objects roll without slipping.',
  givens:[['height h','1.20','m'],['g','9.80','m/s²'],['I/(MR²): sphere, cylinder, hoop','2/5, 1/2, 1','']],
  assumptions:['Each has its own otherwise identical straight incline','The block slides without friction; the round objects have sufficient static friction to avoid slipping','Ignore air drag, rolling resistance, and deformation losses'],
  caption:'All objects lose the same gravitational energy per kilogram. Rolling divides this energy between translation and rotation.',
  model:['Write the energy balance','Use the center-of-mass inertia for the rotational term and the no-slip relation.','M g h=\\frac12M v^2+\\frac12I_{\\mathrm{CM}}\\frac{v^2}{R^2}'],
  work:[
   ['Solve using a dimensionless inertia','Write β = I/(MR²). Speed depends on this ratio, not on I alone.','v=\\sqrt{\\frac{2gh}{1+\\beta}}'],
   ['Calculate block and sphere speeds','The block has no rotational term. The sphere has β = 2/5.','v_{\\mathrm{block}}\\approx4.85\\;\\mathrm{m/s},\\quad v_{\\mathrm{sphere}}\\approx4.10\\;\\mathrm{m/s}'],
   ['Calculate cylinder and hoop speeds','The cylinder has β = 1/2 and the thin hoop has β = 1.','v_{\\mathrm{cylinder}}\\approx3.96\\;\\mathrm{m/s},\\quad v_{\\mathrm{hoop}}\\approx3.43\\;\\mathrm{m/s}']
  ],
  check:['Check the comparison conditions','Static friction does no work on an ideal rigid body rolling on a stationary surface without slipping. A thin-walled hollow cylinder ties the hoop; a thick-walled one lies between solid cylinder and hoop.'],
  answer:'Fastest to slowest in this ideal model: frictionless block, solid sphere, solid cylinder, thin hoop. The hoop reaches about 3.43 m/s.',result:Math.sqrt(9.8*1.2),unit:'m/s',finalEquation:'v_{\\mathrm{hoop}}\\approx3.43\\;\\mathrm{m/s}'
 },
 {
  id:'original-rolling-velocities',title:'Speeds at the top, center, and contact point',label:'Rolling without slipping · Reference frames',original:true,
  statement:'A wheel of radius 0.50 m rolls to the right without slipping at center speed 3.0 m/s on stationary ground. Find angular speed and the ground-frame velocities of the bottom, center, and top points.',
  givens:[['R','0.50','m'],['vCM','3.0 right','m/s']],
  assumptions:['The wheel is rigid','Rolling occurs without slipping on stationary ground','Report instantaneous velocities in the ground frame'],
  caption:'Translation adds 3.0 m/s rightward everywhere. Clockwise rotation cancels it at the bottom and adds to it at the top.',
  model:['Use the no-slip condition','A right-moving wheel rotates clockwise.','|\\omega|=\\frac{v_{\\mathrm{CM}}}{R}=\\frac{3.0}{0.50}=6.0\\;\\mathrm{rad/s}'],
  work:[
   ['Find contact-point velocity','At the bottom, rotational velocity points left.','v_{\\mathrm{bottom}}=3.0-3.0=0\\;\\mathrm{m/s}'],
   ['Find center velocity','Rotation about the center contributes zero at the center.','v_{\\mathrm{center}}=3.0\\;\\mathrm{m/s}'],
   ['Find top-point velocity','At the top, translation and rotation both point right.','v_{\\mathrm{top}}=3.0+3.0=6.0\\;\\mathrm{m/s}']
  ],
  check:['Check the frame','The contact point is instantaneously at rest in the ground frame, not permanently fixed. In the center-of-mass frame, the top and bottom have equal opposite velocities.'],
  answer:'Angular speed is 6.0 rad/s clockwise. Ground-frame velocities: bottom 0, center 3.0 m/s right, top 6.0 m/s right.',result:6,unit:'m/s',finalEquation:'v_{\\mathrm{bottom}}=0,\\quad v_{\\mathrm{center}}=3.0\\;\\mathrm{m/s},\\quad v_{\\mathrm{top}}=6.0\\;\\mathrm{m/s}'
 },
 {
  id:'original-torque-work',title:'Work from a constant torque',label:'Rotational work and energy',original:true,
  statement:'A motor applies a constant 12 N·m torque to a rotor through an angular displacement of 3.0 rad in the same direction as the torque. How much work does the motor do? What if the rotor instead turns through 3.0 rad in the opposite direction?',
  givens:[['torque','+12','N·m'],['displacement magnitude','3.0','rad']],
  assumptions:['The rotation axis is fixed','The stated motor torque is constant','Work of this torque is requested, not necessarily total work'],
  caption:'A torque–angle graph is horizontal for constant torque. Signed area gives the work over the angular interval.',
  model:['Relate torque to rotational work','For a fixed axis, work is the signed integral of torque over angle.','W=\\int\\tau\\,d\\theta=\\tau\\Delta\\theta'],
  work:[
   ['Turn with the torque','Torque and angular displacement have the same sign.','W=(12)(3.0)=+36\\;\\mathrm J'],
   ['Turn against the torque','Keep torque positive but make displacement negative.','W=(12)(-3.0)=-36\\;\\mathrm J'],
   ['Check using tangential force','At any radius r, F = τ/r and arc length is rΔθ. The radius cancels.','W=F\\ell=\\frac{\\tau}{r}(r\\Delta\\theta)=\\tau\\Delta\\theta']
  ],
  check:['Check radians and units','Angular displacement must be in radians. N·m is used for torque, while joules describe work; equal dimensions do not make the concepts interchangeable.'],
  answer:'The motor does +36 J for a turn with its torque and −36 J for an equal turn against its torque.',result:36,unit:'J',finalEquation:'W_{\\mathrm{with}}=+36\\;\\mathrm J,\\quad W_{\\mathrm{against}}=-36\\;\\mathrm J'
 },
 {
  id:'original-rolling-resistance',title:'Why a real rolling ball stops',label:'Rolling resistance · Mechanical energy',original:true,
  statement:'A uniform solid sphere of mass 2.0 kg and radius 0.10 m initially rolls without slipping at 1.0 m/s on a level real surface. It eventually comes to rest. How much initial mechanical kinetic energy is dissipated, and what physical effects can explain the slowing?',
  givens:[['M','2.0','kg'],['R','0.10','m'],['vCM','1.0','m/s'],['final speed','0','m/s']],
  assumptions:['The initial sphere is uniform and rolls without slipping','Initial and final center heights are equal','No motor or external energy source acts; energy ultimately becomes internal energy, sound, and deformation'],
  caption:'Real contact deforms the sphere or surface. A shifted contact-force resultant can create a resisting moment about the center.',
  model:['Include both forms of kinetic energy','Use the solid-sphere inertia and initial no-slip angular speed.','I=\\frac25MR^2=0.0080\\;\\mathrm{kg\\,m^2},\\quad\\omega=\\frac vR=10\\;\\mathrm{rad/s}'],
  work:[
   ['Find translational energy','The center of mass carries ordinary kinetic energy.','K_{\\mathrm{trans}}=\\frac12(2.0)(1.0)^2=1.0\\;\\mathrm J'],
   ['Find rotational energy','Rotation supplies an additional energy term.','K_{\\mathrm{rot}}=\\frac12(0.0080)(10)^2=0.40\\;\\mathrm J'],
   ['Find total dissipated energy','Both translation and rotation end at rest, while potential energy is unchanged.','E_{\\mathrm{dissipated}}=1.0+0.40=1.4\\;\\mathrm J']
  ],
  check:['Explain the resisting mechanism','Ideal no-slip rolling alone would not dissipate energy. Real deformation and rolling resistance, and sometimes air drag, remove mechanical energy. A backward force alone is not a complete model: about the center it can increase the wheel’s spin.'],
  answer:'A total of 1.4 J of mechanical kinetic energy is dissipated. Rolling resistance arises from real contact deformation and a resisting moment; ideal static friction alone does not explain stopping.',result:1.4,unit:'J',finalEquation:'E_{\\mathrm{dissipated}}=1.4\\;\\mathrm J'
 },
 {
  id:'original-angular-displacement',title:'Follow a spoke through an angle',label:'Angular displacement and average velocity',original:true,
  statement:'A spoke on a wheel moves counterclockwise from 30° to 150° in 4.0 s, without completing any extra revolution. Its tip is 1.5 m from the axis. Find angular displacement, the tip’s arc length, and average angular velocity.',
  givens:[['θᵢ','30','°'],['θf','150','°'],['Δt','4.0','s'],['R','1.5','m']],
  assumptions:['Counterclockwise is positive','No additional full turns occur','The radius is fixed; constant angular speed is not assumed'],
  caption:'The dashed initial spoke and solid final spoke enclose a positive 120° change. Arc length follows the rim, not the straight chord.',
  model:['Subtract the angular positions','Angular displacement is final position minus initial position.','\\Delta\\theta=150^\\circ-30^\\circ=120^\\circ'],
  work:[
   ['Convert displacement to radians','Arc-length calculations require radians.','\\Delta\\theta=120\\frac{\\pi}{180}=\\frac{2\\pi}{3}\\;\\mathrm{rad}'],
   ['Calculate the arc length','Multiply angle in radians by radius.','\\ell=R\\Delta\\theta=(1.5)\\frac{2\\pi}{3}=\\pi\\;\\mathrm m'],
   ['Find average angular velocity','Divide total angular displacement by elapsed time.','\\omega_{\\mathrm{avg}}=\\frac{2\\pi/3}{4.0}=\\frac{\\pi}{6}\\approx0.5236\\;\\mathrm{rad/s}']
  ],
  check:['Check what is and is not known','This is an average rate. The instantaneous rate and acceleration cannot be determined from only two positions and the elapsed time.'],
  answer:'Angular displacement is +2.09 rad, arc length is about 3.1 m, and average angular velocity is about +0.52 rad/s.',result:Math.PI/6,unit:'rad/s',finalEquation:'\\omega_{\\mathrm{avg}}\\approx+0.52\\;\\mathrm{rad/s}'
 },
 {
  id:'original-rotational-dynamics',title:'Accelerating a solid disk',label:'Newton’s second law for rotation',original:true,
  statement:'A uniform solid disk has mass 4.0 kg and radius 0.50 m. A 6.0 N tangential force acts counterclockwise at its rim. Find its angular acceleration about a fixed frictionless central axle.',
  givens:[['M','4.0','kg'],['R','0.50','m'],['F','6.0','N']],
  assumptions:['The disk rotates about a fixed symmetry axis','The force stays tangential','The axle exerts no resisting torque and the disk’s inertia is constant'],
  caption:'A tangential rim force creates torque about the fixed axle. Axle forces pass through that axis and give zero torque about it.',
  model:['Choose the axis and rotational law','For this fixed axis and constant inertia, net torque equals Iα.','\\sum\\tau_z=I\\alpha_z'],
  work:[
   ['Find central rotational inertia','A uniform solid disk has I = MR²/2 about its central perpendicular axis.','I=\\frac12(4.0)(0.50)^2=0.50\\;\\mathrm{kg\\,m^2}'],
   ['Calculate signed net torque','The tangential force is perpendicular to its radius and turns counterclockwise.','\\tau_z=RF=(0.50)(6.0)=+3.0\\;\\mathrm{N\\,m}'],
   ['Solve for angular acceleration','Divide by inertia about the same axis.','\\alpha_z=\\frac{3.0}{0.50}=+6.0\\;\\mathrm{rad/s^2}']
  ],
  check:['Check the translation constraint','The axle holds the center fixed, so axle reaction forces balance the force sum for the center. They do not remove the applied torque.'],
  answer:'The disk’s angular acceleration is +6.0 rad/s², counterclockwise.',result:6,unit:'rad/s²',finalEquation:'\\alpha_z=+6.0\\;\\mathrm{rad/s^2}'
 },
 {
  id:'original-rotational-energy',title:'Energy stored in a spinning rotor',label:'Rotational kinetic energy',original:true,
  statement:'A rigid rotor with moment of inertia 0.20 kg·m² spins about a fixed axis at 6.0 rad/s. Find its rotational kinetic energy and the factor by which that energy changes if angular speed doubles.',
  givens:[['I','0.20','kg·m²'],['ω','6.0','rad/s']],
  assumptions:['Rotation is about the axis used for the stated inertia','The inertia stays constant','Only rotational kinetic energy is requested'],
  caption:'Each mass element moves at speed rω. Adding its kinetic energy over the rotor gives ½Iω².',
  model:['Build energy from particle motion','All points share ω, but their linear speeds depend on their radii.','K=\\sum_i\\frac12m_i(r_i\\omega)^2=\\frac12I\\omega^2'],
  work:[
   ['Calculate the initial energy','Square angular speed before multiplying by half the inertia.','K_i=\\frac12(0.20)(6.0)^2=3.6\\;\\mathrm J'],
   ['Double the angular speed','The new angular speed is 12 rad/s.','K_f=\\frac12(0.20)(12)^2=14.4\\;\\mathrm J'],
   ['Find the energy multiplier','The common inertia cancels in the ratio.','\\frac{K_f}{K_i}=\\left(\\frac{12}{6.0}\\right)^2=4']
  ],
  check:['Check dimensions and scaling','With radians treated as dimensionless, kg·m²/s² is a joule. Doubling angular speed quadruples rotational energy at fixed inertia.'],
  answer:'The initial rotational kinetic energy is 3.6 J. Doubling angular speed multiplies that energy by four.',result:3.6,unit:'J',finalEquation:'K_i=3.6\\;\\mathrm J,\\qquad K_f=4K_i'
 }
];

export const chapterTenProblems:{id:string;data:ProblemData}[]=lessons.map((p,index)=>{
 const id='ch10-'+p.id;
 const toStep=(n:number,line:Line,value:number|null=null,unit=''):Step=>({id:'s'+n,title:line[0],text:line[1],equation:line[2]??'',value,unit,diagram:false});
 const reference=[
  toStep(1,['Read the question and givens',p.statement]),
  toStep(2,['Read the diagram',p.caption]),
  toStep(3,p.model),...p.work.map((line,i)=>toStep(i+4,line)),
  toStep(7,p.check),toStep(8,['State the answer',p.answer,p.finalEquation],p.result,p.unit)
 ];
 const template:Template={id:id+'-check-v1',family:'JUSTIFICATION',severity:'minor',rootStep:'s7',dependentSteps:[],expectedCorrection:p.check[1],criteria:['identify','physics','correction','check','clarity'],terms:['rotation','torque','radius','units','axis','radians','inertia','rolling'],wrong:[{...reference[6],text:'The result looks familiar, so I can skip checking the units, rotation axis, and assumptions.',equation:''}],nudge:'Which axis, unit conversion, sign convention, or limiting case could test this result?',cue:p.check[1],guidance:p.check[1]};
 return {id,data:ProblemSchema.parse({
  kind:p.original?'original':'textbook',chapterId:'chapter-10',problemNumber:index+1,title:p.title,
  subtitle:(p.original?'Original practice · ':'')+p.label,
  statement:p.statement,givens:p.givens.map(([symbol,value,unit])=>({symbol,value,unit})),requested:p.statement,
  assumptions:p.assumptions,diagram:'motion',diagramCaption:p.caption,diagramRequired:true,
  objectives:[p.label,'Connect rotational and linear motion; check axes, directions, units, and assumptions'],
  target:{symbol:'result',value:p.result,unit:p.unit,tolerance:.03},reference,
  rubric:['Use an applicable rotational relationship','Show the conversions and signed calculations','State all requested results and physical conditions'],
  templates:[template],
  source:p.original?'Original educational practice based on the user-supplied Chapter 10 concepts. Added values and missing figure geometry are explicitly stated.':'Chapter 10 worked example or exercise supplied by the user. Original explanatory diagrams and normalized notation.',
  permission:p.original?'Original practice questions, figures, and explanations authored for this educational application.':'User-supplied educational material; source material remains credited to its respective owners. Explanations and figures are original.',
  reviewNotes:'Independently checked using derivatives, graph areas, cross-product signs, shell integrals, inertia theorems, and energy balances. Bank numbers are local sequence numbers; original example and exercise labels remain in subtitles. Small-angle, fixed-axis, planar-body, and no-slip assumptions are explicit.'
 })};
});
