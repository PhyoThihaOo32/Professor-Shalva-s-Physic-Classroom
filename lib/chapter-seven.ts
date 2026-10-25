// Server-owned references. Figure modules contain only public givens.
import {ProblemSchema} from './schemas';
import type {ProblemData,Step,Template} from './domain';
const math=String.raw;
const s=(n:number,title:string,text:string,equation='',value:number|null=null,unit=''):Step=>({id:'s'+n,title,text,equation,value,unit,diagram:false});
const given=(symbol:string,value:string,unit:string)=>({symbol,value,unit});
type Lesson={id:string;number:number;title:string;subtitle:string;original?:boolean;statement:string;givens:ProblemData['givens'];requested:string;assumptions:string[];caption:string;value:number;unit:string;steps:Step[]};
const lessons:Lesson[]=[
 {
  id:'ch7-pile-driver',number:1,title:'A falling pile driver',subtitle:'Work done by gravity',
  statement:'A 280 kg pile driver falls vertically through 3.80 m. How much work does the gravitational force do on it?',
  givens:[given('m','280','kg'),given('vertical fall','3.80','m'),given('g','9.80','m/s²')],
  requested:'Work done by gravity during the fall.',assumptions:['Gravity is uniform at g = 9.80 m/s²','Only the work of gravity is requested; other forces need not be assumed absent'],
  caption:'Gravity and the 3.80 m displacement both point downward. Their angle is 0°, so gravity does positive work.',value:280*9.8*3.8,unit:'J',
  steps:[
   s(1,'Identify the force and motion','The pile driver moves downward. Its weight also acts downward. We need the work of this particular force.'),
   s(2,'Choose the work relationship','For a constant force, work is the force component along the displacement multiplied by the distance.',math`W_g=F_gd\cos\theta`),
   s(3,'Find the weight','Weight is a force, measured in newtons; mass is measured in kilograms.',math`F_g=mg=(280)(9.80)=2744\;\mathrm N`),
   s(4,'Check the angle and sign','Both arrows point downward, so the included angle is zero. Gravity transfers energy to the falling pile driver.',math`\theta=0^\circ,\quad\cos\theta=1`),
   s(5,'Substitute the vertical drop','Use the positive fall distance with the explicitly chosen angle.',math`W_g=(280)(9.80)(3.80)\cos0^\circ`),
   s(6,'Calculate the work','Keep guard digits before rounding the final answer.',math`W_g=10427.2\;\mathrm J`,280*9.8*3.8,'J'),
   s(7,'Check dimensions and direction','A newton times a metre is a joule. A downward force on a downward displacement must give positive work.',math`\mathrm{N\,m}=\mathrm J`),
   s(8,'State the result','Gravity does approximately +10.4 kJ of work. The positive sign describes energy transferred by gravity.',math`W_g\approx+1.04\times10^4\;\mathrm J`,280*9.8*3.8,'J')
  ]
 },
 {
  id:'ch7-rough-crate',number:5,title:'Moving a crate across a rough floor',subtitle:'Applied work at constant speed',
  statement:'Movers push a 46.0 kg crate horizontally across a rough, level floor for 10.3 m without acceleration. The effective coefficient of kinetic friction is 0.40. How much work do the movers do?',
  givens:[given('m','46.0','kg'),given('d','10.3','m'),given('μₖ','0.40',''),given('a','0','m/s²')],
  requested:'Work done by the movers, distinguished from net work.',assumptions:['The applied push is horizontal','The crate slides on a level floor','Use g = 9.80 m/s² and constant kinetic friction'],
  caption:'A horizontal push balances friction. Weight and the normal force are perpendicular to the 10.3 m horizontal displacement.',value:.4*46*9.8*10.3,unit:'J',
  steps:[
   s(1,'Read the force diagram','There is no vertical acceleration. The horizontal push has no vertical component, so the normal force equals the weight.'),
   s(2,'Find the normal force','Balance vertical forces before using the friction law.',math`N=mg=(46.0)(9.80)=450.8\;\mathrm N`),
   s(3,'Calculate kinetic friction','The friction force opposes sliding.',math`f_k=\mu_kN=(0.40)(450.8)=180.32\;\mathrm N`),
   s(4,'Use zero horizontal acceleration','The movers must balance friction. Zero net force does not mean every individual force does zero work.',math`F_{\mathrm{push}}=f_k=180.32\;\mathrm N`),
   s(5,'Calculate the movers’ work','The push and displacement are parallel.',math`W_{\mathrm{push}}=F_{\mathrm{push}}d=(180.32)(10.3)=1857.296\;\mathrm J`,.4*46*9.8*10.3,'J'),
   s(6,'Compare the other forces','Friction does equally large negative work. Gravity and the normal force do no work on a horizontal displacement.',math`W_f=-1857.296\;\mathrm J,\quad W_g=W_N=0`),
   s(7,'Check with kinetic energy','The crate’s speed is constant, so its kinetic energy and the total work are unchanged.',math`W_{\mathrm{net}}=\Delta K=0`),
   s(8,'State the movers’ work','The movers do +1.9 kJ of work, to two significant figures. Net work on the crate is zero.',math`W_{\mathrm{push}}\approx+1.9\times10^3\;\mathrm J`,.4*46*9.8*10.3,'J')
  ]
 },
 {
  id:'ch7-accelerating-box',number:11,title:'Accelerating a box from rest',subtitle:'Net work and the change in speed',
  statement:'A 4.0 kg box starts from rest and accelerates uniformly at 2.0 m/s² across a floor for 8.0 s. Find the net work done on the box.',
  givens:[given('m','4.0','kg'),given('v₀','0','m/s'),given('a','2.0','m/s²'),given('t','8.0','s')],
  requested:'Net work on the box.',assumptions:['Acceleration is constant and along the motion','Use the net force; the separate applied force and friction are not specified','This question is placed in exercise slot 11 to organize the unnumbered pasted text'],
  caption:'The box starts at rest and speeds up to the right for 8.0 s. The acceleration arrow points along its motion.',value:512,unit:'J',
  steps:[
   s(1,'Identify net work','We need the sum of the work of all forces. The work–energy theorem gives this from the change in kinetic energy.'),
   s(2,'Find the final speed','The box starts at rest and has constant acceleration.',math`v=v_0+at=0+(2.0)(8.0)=16\;\mathrm{m/s}`),
   s(3,'Write the kinetic-energy change','Initial kinetic energy is zero.',math`W_{\mathrm{net}}=\Delta K=\frac12mv^2-\frac12mv_0^2`),
   s(4,'Substitute mass and speed','Square the speed before multiplying by half the mass.',math`W_{\mathrm{net}}=\frac12(4.0)(16^2)=512\;\mathrm J`,512,'J'),
   s(5,'Check the displacement independently','Constant acceleration from rest gives the distance covered.',math`d=\frac12at^2=\frac12(2.0)(8.0)^2=64\;\mathrm m`),
   s(6,'Verify with force times displacement','The net force is 8.0 N, parallel to the 64 m displacement.',math`F_{\mathrm{net}}=ma=8.0\;\mathrm N,\quad W_{\mathrm{net}}=(8.0)(64)=512\;\mathrm J`),
   s(7,'Check sign and units','The speed increases, so net work must be positive. Both energy and force-times-distance checks give joules.'),
   s(8,'State the net work','The net work is +5.1 × 10² J, to two significant figures.',math`W_{\mathrm{net}}\approx+5.1\times10^2\;\mathrm J`,512,'J')
  ]
 },
 {
  id:'ch7-book-stack',number:13,title:'Stacking eight books',subtitle:'Add the rise of each book',
  statement:'Eight books, each 4.0 cm thick and with mass 1.6 kg, initially lie flat side by side on a table. How much minimum work is required to stack all eight one on top of another?',
  givens:[given('number of books','8',''),given('mass of each','1.6','kg'),given('thickness of each','4.0','cm')],
  requested:'Minimum external work required to build the stack.',assumptions:['Lift gently, with all books starting and ending at rest','Neglect dissipative losses','Use g = 9.80 m/s²; all books have equal, uniform thickness'],
  caption:'Initially every centre is 2 cm above the table. In the stack, the centres are at 2, 6, 10, …, 30 cm; the bottom book need not rise.',value:1.6*9.8*.04*28,unit:'J',
  steps:[
   s(1,'Track the centres of the books','Work against gravity depends on how far each book’s centre rises, not on its final height above the table.'),
   s(2,'Convert thickness to metres','Each level in the stack raises the next book by one book thickness.',math`h=4.0\;\mathrm{cm}=0.040\;\mathrm m`),
   s(3,'List the eight vertical rises','The bottom book stays at its original height. The top book rises by seven thicknesses.',math`\Delta y=0,\;h,\;2h,\;3h,\;4h,\;5h,\;6h,\;7h`),
   s(4,'Add the height changes','Use the arithmetic series, counting each book once.',math`\sum\Delta y=h(0+1+2+3+4+5+6+7)=28h=1.12\;\mathrm m`),
   s(5,'Relate work to gravitational energy','The minimum external work equals the increase in gravitational potential energy.',math`W_{\mathrm{ext}}=\sum mg\Delta y=mg(28h)`),
   s(6,'Calculate the total','The mass in this expression is the mass of one book because the height sum already includes all eight.',math`W_{\mathrm{ext}}=(1.6)(9.80)(1.12)=17.5616\;\mathrm J`,1.6*9.8*.04*28,'J'),
   s(7,'Check with the combined centre of mass','The total mass is 12.8 kg. Its centre rises from 0.020 m to 0.160 m, a change of 0.140 m.',math`(12.8)(9.80)(0.140)=17.5616\;\mathrm J`),
   s(8,'State the required work','The minimum external work is 18 J, to two significant figures. Gravity does the opposite work during stacking.',math`W_{\mathrm{ext}}\approx18\;\mathrm J`,1.6*9.8*.04*28,'J')
  ]
 },
 {
  id:'ch7-original-gondola',number:15,title:'Taking a gondola to the summit',subtitle:'Height gain, motor work, and acceleration',original:true,
  statement:'A full gondola carries up to 20 skiers. For this practice version, its total moving mass, including gondola and passengers, is 2250 kg. It travels on a straight 30.0° incline from elevation 2150 m to 3625 m. (a) At constant speed, how much work does the pulling motor do? (b) How much work does gravity do? (c) Starting from the same speed at the base, the motor supplies 10% more pulling work over the same route using a constant pulling force along the cable. Find the acceleration along the incline.',
  givens:[given('total moving mass','2250','kg'),given('base elevation','2150','m'),given('summit elevation','3625','m'),given('incline θ','30.0','°'),given('extra motor work','10','%')],
  requested:'Motor work, gravitational work, and acceleration along the cable with 10% extra pulling work.',
  assumptions:['Original practice adds a 30.0° straight incline and defines 2250 kg as the entire moving mass','Ignore drag, friction, and motor losses; use g = 9.80 m/s²','The extra work comes from a constant pulling force over the same path; average extra work alone would not specify instantaneous acceleration'],
  caption:'Original practice geometry: a straight cable at 30°. The 1475 m vertical rise determines gravitational work; the slope is also needed for acceleration.',value:.1*9.8*Math.sin(Math.PI/6),unit:'m/s²',
  steps:[
   s(1,'Separate elevation from cable distance','The motor pulls along an incline, while gravity is vertical. The elevation gain is summit minus base.',math`\Delta h=3625-2150=1475\;\mathrm m`),
   s(2,'Part (a): use constant speed','Kinetic energy is unchanged. With no losses, the motor work balances negative gravitational work.',math`W_m=mg\Delta h=(2250)(9.80)(1475)=32523750\;\mathrm J`),
   s(3,'Part (b): find the work of gravity','Gravity points downward while elevation increases, so its work is negative.',math`W_g=-mg\Delta h=-32523750\;\mathrm J`),
   s(4,'Find the original pull along the incline','The component of gravity down the cable is mg sin θ. The original motor pull balances it.',math`F_0=mg\sin30^\circ=11025\;\mathrm N`),
   s(5,'Part (c): translate extra work into force','Over the same route, a constant force doing 10% more work is 1.10 times the original force.',math`F_1=1.10F_0,\quad F_{\mathrm{net}}=F_1-F_0=0.10mg\sin\theta`),
   s(6,'Calculate acceleration along the cable','Divide the net force by the total moving mass. The mass cancels.',math`a=0.10g\sin30^\circ=0.490\;\mathrm{m/s^2}`,.1*9.8*Math.sin(Math.PI/6),'m/s²'),
   s(7,'Check using the cable length','The path length is Δh / sin θ = 2950 m. Net work is 0.10mgΔh; dividing by m times that path length gives the same acceleration.',math`a=\frac{0.10mg\Delta h}{m(\Delta h/\sin\theta)}=0.10g\sin\theta`),
   s(8,'State the results and model','(a) Motor: +32.5 MJ. (b) Gravity: −32.5 MJ. (c) Acceleration: 0.490 m/s² up the cable in this 30° practice model. A different slope changes (c), while (a) and (b) depend only on elevation gain.',math`W_m\approx+32.5\;\mathrm{MJ},\quad W_g\approx-32.5\;\mathrm{MJ},\quad a=0.490\;\mathrm{m/s^2}`,.1*9.8*Math.sin(Math.PI/6),'m/s²')
  ]
 },
 {
  id:'ch7-ramp-cart',number:17,title:'Pushing a cart up a ramp',subtitle:'A push below horizontal, motion uphill',
  statement:'A 16 kg grocery cart moves at constant speed up a ramp inclined 12° above horizontal. The pushing force acts at 17° below horizontal, toward the uphill side. For this idealized exercise, neglect friction. Find the work done by gravity, the normal force, and the push over 7.5 m along the ramp.',
  givens:[given('m','16','kg'),given('ramp angle','12','°'),given('push angle','17','° below horizontal'),given('ramp distance','7.5','m')],
  requested:'Work done by each of gravity, the normal force, and the applied push.',assumptions:['Friction is neglected because no friction coefficient is supplied','The cart stays in contact with a straight, rigid ramp and travels at constant speed','Use g = 9.80 m/s²; exercise slot 17 organizes the unnumbered pasted question'],
  caption:'Motion is 12° above horizontal, but the push is 17° below it. The included angle is 29°. The normal force is perpendicular to the ramp.',value:16*9.8*7.5*Math.sin(12*Math.PI/180),unit:'J',
  steps:[
   s(1,'Read the two different angles','The push is not parallel to the ramp. Its angle with the uphill displacement is the sum of 12° and 17°.',math`\phi=12^\circ+17^\circ=29^\circ`),
   s(2,'Find the vertical rise','Only the vertical part of the 7.5 m motion changes gravitational potential energy.',math`\Delta h=L\sin12^\circ=7.5\sin12^\circ=1.55934\;\mathrm m`),
   s(3,'Calculate gravitational work','Gravity does negative work during the rise.',math`W_g=-mg\,L\sin12^\circ=-(16)(9.80)(7.5)\sin12^\circ=-244.504\;\mathrm J`),
   s(4,'Find the normal-force work','The cart’s displacement is tangent to the ramp. The normal force remains perpendicular to it, even though its magnitude is increased by the push.',math`W_N=NL\cos90^\circ=0`),
   s(5,'Balance forces along the ramp','Constant speed means the uphill push component balances the downhill weight component.',math`F_P\cos29^\circ=mg\sin12^\circ,\quad F_P=37.274\;\mathrm N`),
   s(6,'Calculate work by the push','Use the 29° force–displacement angle, not 17°.',math`W_P=F_PL\cos29^\circ=+244.504\;\mathrm J`,16*9.8*7.5*Math.sin(12*Math.PI/180),'J'),
   s(7,'Check total work','The positive push work cancels gravitational work. This agrees with unchanged kinetic energy.',math`W_{\mathrm{net}}=W_g+W_N+W_P=0=\Delta K`),
   s(8,'State all three works','Gravity: −2.4 × 10² J. Normal: 0 J. Push: +2.4 × 10² J, to two significant figures, under the stated frictionless model.',math`W_g\approx-2.4\times10^2\;\mathrm J,\quad W_N=0,\quad W_P\approx+2.4\times10^2\;\mathrm J`,16*9.8*7.5*Math.sin(12*Math.PI/180),'J')
  ]
 },
 {
  id:'ch7-dot-variable',number:18,title:'A dot product with a variable',subtitle:'Multiply matching components',
  statement:'Let a = (2.0x²)i − (4.0x)j + 5.0k and B = 11.0i + (2.5x)j. Find a · B as a function of x, using common arbitrary vector units and dimensionless x.',
  givens:[given('a','(2.0x², −4.0x, 5.0)','units'),given('B','(11.0, 2.5x, 0)','units')],
  requested:'A simplified expression for a · B.',assumptions:['i, j, k are orthonormal unit vectors','x is a dimensionless scalar; all components use common arbitrary units','B has zero k component; the pasted x2 is interpreted as x²'],
  caption:'A dot product pairs only matching axes. B has no z component, so a’s 5.0k contributes zero.',value:12,unit:'units²',
  steps:[
   s(1,'Write the component triples','Keep x as a variable. Do not confuse the scalar x with the x-axis unit vector.',math`\mathbf a=(2.0x^2,-4.0x,5.0),\quad\mathbf B=(11.0,2.5x,0)`),
   s(2,'Use the component dot product','The result is a scalar; multiply corresponding components and add.',math`\mathbf a\cdot\mathbf B=a_xB_x+a_yB_y+a_zB_z`),
   s(3,'Multiply the x components','The constant 11.0 multiplies 2.0x².',math`a_xB_x=(2.0x^2)(11.0)=22.0x^2`),
   s(4,'Multiply the y components','Include the negative sign and multiply x by x.',math`a_yB_y=(-4.0x)(2.5x)=-10.0x^2`),
   s(5,'Check the missing z component','B has no k term, so its z component is zero.',math`a_zB_z=(5.0)(0)=0`),
   s(6,'Collect like terms','Both nonzero terms contain x².',math`\mathbf a\cdot\mathbf B=22.0x^2-10.0x^2=12x^2\;\mathrm{units^2}`,12,'units²'),
   s(7,'Check a simple value','At x = 0 the only nonzero component of a is along z, while B points along x. The vectors are perpendicular, so their dot product is zero.'),
   s(8,'State the scalar expression','The dot product is 12x² in squared vector units. It has no direction; 12 is the coefficient, not the value for every x.',math`\mathbf a\cdot\mathbf B=12x^2\;\mathrm{units^2}`,12,'units²')
  ]
 },
 {
  id:'ch7-original-dot-combinations',number:25,title:'Dot products of vector sums',subtitle:'Add components before taking the dot product',original:true,
  statement:'For this normalized practice version, use a = (9.0, −8.5, 0), B = (−8.0, 6.1, 4.2), and C = (5.8, −9.2, 0), in common arbitrary units. Determine (a) a · (B + C), (b) (a + C) · B, and (c) (B + a) · C.',
  givens:[given('a','(9.0, −8.5, 0)','units'),given('B','(−8.0, 6.1, 4.2)','units'),given('C','(5.8, −9.2, 0)','units')],
  requested:'Three scalar dot products in squared vector units.',assumptions:['Original practice explicitly assigns the scrambled components in the pasted text','Use orthonormal Cartesian axes and retain extra digits through the sums','The z component 4.2 belongs to B in this version; a and C have zero z components'],
  caption:'Original practice component table. Columns identify matching axes; sum the required pair before multiplying each matching component.',value:27.88,unit:'units²',
  steps:[
   s(1,'Organize the three vectors','The declared component table removes ambiguity in the pasted notation. Keep zero z components in the calculation.'),
   s(2,'Part (a): add B and C','Add each component in the parentheses before taking the dot product.',math`\mathbf B+\mathbf C=(-2.2,-3.1,4.2)`),
   s(3,'Part (a): multiply and add','Only x and y contribute because a has zero z component.',math`\mathbf a\cdot(\mathbf B+\mathbf C)=(9.0)(-2.2)+(-8.5)(-3.1)=6.55\;\mathrm{units^2}`),
   s(4,'Part (b): add a and C','Form the new component triple.',math`\mathbf a+\mathbf C=(14.8,-17.7,0)`),
   s(5,'Part (b): dot with B','A positive x component times a negative x component gives a negative contribution; so does the y pair.',math`(\mathbf a+\mathbf C)\cdot\mathbf B=(14.8)(-8.0)+(-17.7)(6.1)=-226.37\;\mathrm{units^2}`),
   s(6,'Part (c): add B and a, then dot with C','The new z component is 4.2, but C has zero z component.',math`\mathbf B+\mathbf a=(1.0,-2.4,4.2),\quad(\mathbf B+\mathbf a)\cdot\mathbf C=5.8+22.08=27.88\;\mathrm{units^2}`,27.88,'units²'),
   s(7,'Check with the distributive law','Independent pair products are a·B = −123.85, a·C = 130.40, and B·C = −102.52. Adding the appropriate pairs reproduces all three answers.',math`-123.85+130.40=6.55,\quad-123.85-102.52=-226.37,\quad-102.52+130.40=27.88`),
   s(8,'State the three scalar results','Using the declared components: (a) 6.55, (b) −226.37, (c) 27.88 units². These are arithmetic values before measurement rounding; each answer is a scalar.',math`(a)\;6.55,\quad(b)\;-226.37,\quad(c)\;27.88\;\mathrm{units^2}`,27.88,'units²')
  ]
 },
 {
  id:'ch7-vector-axis-angles',number:29,title:'Angles a vector makes with the axes',subtitle:'Three direction cosines',
  statement:'The vector V = 20.0i + 26.0j − 14.0k is given in common units. Find the angle it makes with each positive coordinate axis: x, y, and z.',
  givens:[given('Vₓ','20.0','units'),given('Vᵧ','26.0','units'),given('V𝓏','−14.0','units')],
  requested:'Direction angles α, β, and γ from the positive x, y, and z axes.',assumptions:['The coordinate axes are mutually perpendicular','Each angle is measured from a positive axis and lies between 0° and 180°'],
  caption:'The vector has positive x and y components and a negative z component. Therefore the angle from +z must be obtuse; this schematic is not an angle-scale drawing.',value:Math.acos(-14/Math.hypot(20,26,-14))*180/Math.PI,unit:'°',
  steps:[
   s(1,'Identify direction angles','These are three separate angles from the positive axes, rather than an azimuth and elevation pair.'),
   s(2,'Calculate the magnitude','All three signed components contribute their squares.',math`|\mathbf V|=\sqrt{20.0^2+26.0^2+(-14.0)^2}=\sqrt{1272}=35.6651\;\mathrm{units}`),
   s(3,'Write the direction-cosine relationships','Take each signed component divided by the magnitude.',math`\cos\alpha=\frac{V_x}{|\mathbf V|},\quad\cos\beta=\frac{V_y}{|\mathbf V|},\quad\cos\gamma=\frac{V_z}{|\mathbf V|}`),
   s(4,'Find the angle from +x','The x component is positive, so this angle is acute.',math`\alpha=\cos^{-1}\left(\frac{20.0}{35.6651}\right)=55.8908^\circ`),
   s(5,'Find the angle from +y','The y component is positive and larger than x, giving a smaller angle.',math`\beta=\cos^{-1}\left(\frac{26.0}{35.6651}\right)=43.1971^\circ`),
   s(6,'Find the angle from +z','Retain the negative sign of the z component.',math`\gamma=\cos^{-1}\left(\frac{-14.0}{35.6651}\right)=113.1127^\circ`,Math.acos(-14/Math.hypot(20,26,-14))*180/Math.PI,'°'),
   s(7,'Check the direction cosines','The squares of the three direction cosines must sum to one. The three angles themselves do not have to add to 180°.',math`\cos^2\alpha+\cos^2\beta+\cos^2\gamma=\frac{400+676+196}{1272}=1`),
   s(8,'State the three angles','From the positive axes: α = 55.9°, β = 43.2°, and γ = 113.1°. The obtuse z angle agrees with the negative z component.',math`\alpha\approx55.9^\circ,\quad\beta\approx43.2^\circ,\quad\gamma\approx113.1^\circ`,Math.acos(-14/Math.hypot(20,26,-14))*180/Math.PI,'°')
  ]
 },
 {
  id:'ch7-spring-work',number:37,title:'Stretching a spring a little farther',subtitle:'Work is the area under a force–extension graph',
  statement:'A spring has force constant k = 65 N/m. Draw a force–extension graph and use it to find the work required to stretch the spring from x = 3.0 cm to x = 7.5 cm, measured from its unstretched length.',
  givens:[given('k','65','N/m'),given('x₁','3.0','cm'),given('x₂','7.5','cm')],
  requested:'External work required to stretch the spring over the stated interval.',assumptions:['The spring obeys Hooke’s law over this range','Stretch quasistatically, without changes in kinetic energy or dissipative losses','The graph shows the positive external stretching force, not the negative restoring force'],
  caption:'The shaded trapezoid under Fext = kx, from 0.030 m to 0.075 m, is the required external work. Only the shaded interval counts.',value:.5*65*(.075**2-.03**2),unit:'J',
  steps:[
   s(1,'Convert both extensions to metres','The force constant uses metres, so centimetres must be converted before calculating force or area.',math`x_1=0.030\;\mathrm m,\quad x_2=0.075\;\mathrm m`),
   s(2,'Draw the straight force line','For gentle stretching the required external force grows linearly with extension.',math`F_{\mathrm{ext}}=kx`),
   s(3,'Find the two endpoint forces','These are the parallel sides of the shaded trapezoid.',math`F_1=(65)(0.030)=1.95\;\mathrm N,\quad F_2=(65)(0.075)=4.875\;\mathrm N`),
   s(4,'Use the area over the correct interval','The spring is already stretched at the start. Do not count the whole triangle from x = 0.',math`W_{\mathrm{ext}}=\frac{F_1+F_2}{2}(x_2-x_1)`),
   s(5,'Calculate the trapezoid area','Multiply average force by the additional extension.',math`W_{\mathrm{ext}}=\frac{1.95+4.875}{2}(0.075-0.030)=0.1535625\;\mathrm J`,.5*65*(.075**2-.03**2),'J'),
   s(6,'Check using elastic potential energy','The energy difference gives the same result; square both endpoints separately.',math`W_{\mathrm{ext}}=\frac12k(x_2^2-x_1^2)=\frac12(65)(0.075^2-0.030^2)`),
   s(7,'Check the force sign','The external stretching force points along the displacement and does positive work. The spring’s restoring force does equally large negative work.'),
   s(8,'State the work required','The required external work is +0.15 J, to two significant figures. The graph’s area has units N·m = J.',math`W_{\mathrm{ext}}\approx+0.15\;\mathrm J`,.5*65*(.075**2-.03**2),'J')
  ]
 },
 {
  id:'ch7-kinetic-factors',number:55,title:'How kinetic energy scales with speed',subtitle:'A square-law comparison',
  statement:'For a particle of fixed mass: (a) if its kinetic energy is tripled, by what factor does its speed increase? (b) if its speed is halved, by what factor does its kinetic energy change?',
  givens:[given('mass','unchanged',''),given('part (a)','K₂ = 3K₁',''),given('part (b)','v₂ = v₁/2','')],
  requested:'A speed multiplier in (a), and a kinetic-energy multiplier in (b).',assumptions:['The mass stays fixed','Use nonrelativistic kinetic energy and compare nonzero initial speed','A factor means new value divided by original value'],
  caption:'Equal masses: kinetic energy scales with the square of speed. The arrows show speed ratios; the bars show energy ratios.',value:.25,unit:'',
  steps:[
   s(1,'Identify the square-law relationship','Kinetic energy depends on the square of speed, with mass fixed.',math`K=\frac12mv^2`),
   s(2,'Form a ratio','The common mass and one-half cancel.',math`\frac{K_2}{K_1}=\left(\frac{v_2}{v_1}\right)^2`),
   s(3,'Part (a): triple the energy','Set the energy ratio to three, rather than the speed ratio.',math`3=\left(\frac{v_2}{v_1}\right)^2`),
   s(4,'Take the positive square root','Speed is a magnitude, so use the positive root.',math`\frac{v_2}{v_1}=\sqrt3\approx1.73`),
   s(5,'Part (b): halve the speed','Use the new speed ratio in the squared relationship.',math`\frac{v_2}{v_1}=\frac12`),
   s(6,'Square the speed ratio','Half speed gives one-quarter of the kinetic energy.',math`\frac{K_2}{K_1}=\left(\frac12\right)^2=\frac14=0.25`,.25,''),
   s(7,'Check the distinction','Tripling speed would multiply kinetic energy by nine. Halving kinetic energy would instead multiply speed by 1/√2. These are different comparisons.'),
   s(8,'State both multipliers','(a) Speed becomes √3 ≈ 1.73 times its original value. (b) Kinetic energy becomes 1/4 of its original value, a 75% decrease.',math`(a)\;\frac{v_2}{v_1}=\sqrt3,\qquad(b)\;\frac{K_2}{K_1}=\frac14`,.25,'')
  ]
 },
 {
  id:'ch7-car-stop-restart',number:57,title:'A car stops and speeds up again',subtitle:'Different distances, opposite energy changes',
  statement:'A 1300 kg car moving at 20.0 m/s slows steadily to rest over 30 m. It then accelerates uniformly back to 20.0 m/s over 100 m. Find the net work done on the car (a) while slowing, (b) while speeding up, and (c) over both stages.',
  givens:[given('m','1300','kg'),given('initial and final speed','20.0','m/s'),given('braking distance','30','m'),given('speeding-up distance','100','m')],
  requested:'Net work in each stage and overall.',assumptions:['The mass is constant; treat the car as a particle','Work requested is the total work of all forces, not fuel energy or motor work alone','Nonrelativistic kinetic energy applies'],
  caption:'The car loses speed over 30 m, then gains the same speed over 100 m. Net work follows the kinetic-energy change, not distance alone.',value:0,unit:'J',
  steps:[
   s(1,'Use the work–energy theorem for each stage','Net work is final kinetic energy minus initial kinetic energy. The distances are not needed to find this energy difference.',math`W_{\mathrm{net}}=K_f-K_i`),
   s(2,'Calculate kinetic energy at 20.0 m/s','Both the initial state and the final state have this kinetic energy.',math`K_{20}=\frac12(1300)(20.0)^2=260000\;\mathrm J`),
   s(3,'Part (a): braking to rest','The final kinetic energy of the braking stage is zero.',math`W_{\mathrm{brake}}=0-260000=-260000\;\mathrm J`),
   s(4,'Part (b): accelerating from rest','The car regains the kinetic energy it lost.',math`W_{\mathrm{speedup}}=260000-0=+260000\;\mathrm J`),
   s(5,'Part (c): add both stages','The intermediate zero-speed state cancels in the energy sum.',math`W_{\mathrm{overall}}=-260000+260000=0\;\mathrm J`,0,'J'),
   s(6,'Explain the different distances','With constant net force in each stage, the shorter braking distance requires a larger force magnitude, even though the work magnitudes match.',math`F_{\mathrm{brake}}=\frac{-260000}{30}\approx-8667\;\mathrm N,\quad F_{\mathrm{speedup}}=\frac{260000}{100}=2600\;\mathrm N`),
   s(7,'Check what zero overall work means','Initial and final speeds match, so the total kinetic-energy change is zero. The car still uses energy; net work is not the same as fuel consumption.'),
   s(8,'State the three net works','(a) −260 kJ, (b) +260 kJ, (c) 0 J overall. Opposite signs describe the loss and gain of kinetic energy.',math`W_a=-2.60\times10^5\;\mathrm J,\quad W_b=+2.60\times10^5\;\mathrm J,\quad W_c=0\;\mathrm J`,0,'J')
  ]
 },
 {
  id:'ch7-friction-stop',number:65,title:'Sliding to a stop',subtitle:'Find friction from the lost kinetic energy',
  statement:'A box is initially moving at 5.0 m/s across a level floor. Kinetic friction brings it to rest after 8.0 m. What is the coefficient of kinetic friction between the box and the floor?',
  givens:[given('v₀','5.0','m/s'),given('v','0','m/s'),given('d','8.0','m'),given('g','9.80','m/s²')],
  requested:'Coefficient of kinetic friction μₖ.',assumptions:['The floor is horizontal; no push continues during sliding','Constant kinetic friction is the only horizontal force','Weight and normal force balance; ignore air drag'],
  caption:'The box slides to the right and friction points left throughout the 8.0 m stopping distance. Initial speed is 5.0 m/s; final speed is zero.',value:25/(2*9.8*8),unit:'',
  steps:[
   s(1,'Identify the energy loss','The box loses all of its initial kinetic energy. Friction does negative work. Mass is not supplied because it will cancel.'),
   s(2,'Write the kinetic-energy change','The final speed is zero.',math`\Delta K=0-\frac12mv_0^2`),
   s(3,'Write frictional work','The normal force is mg and friction is opposite to the displacement.',math`W_f=-f_kd=-\mu_kmgd`),
   s(4,'Apply the work–energy theorem','Equate the friction work to the kinetic-energy change.',math`-\mu_kmgd=-\frac12mv_0^2`),
   s(5,'Solve before substituting','Cancel mass and the two negative signs. The coefficient must be dimensionless.',math`\mu_k=\frac{v_0^2}{2gd}`),
   s(6,'Calculate the coefficient','Square 5.0 m/s and use the full 8.0 m stopping distance.',math`\mu_k=\frac{(5.0)^2}{2(9.80)(8.0)}=0.1594388`,25/(2*9.8*8),''),
   s(7,'Check with constant acceleration','The kinematic equation gives a = −1.5625 m/s². Dividing its magnitude by g reproduces μₖ.',math`a=\frac{0^2-5.0^2}{2(8.0)}=-1.5625\;\mathrm{m/s^2},\quad\mu_k=\frac{|a|}{g}`),
   s(8,'State the friction coefficient','The coefficient of kinetic friction is approximately 0.16. It has no units; the negative sign belongs to friction’s direction, not to the coefficient.',math`\mu_k\approx0.16`,25/(2*9.8*8),'')
  ]
 }
];
export const chapterSevenProblems:{id:string;data:ProblemData}[]=lessons.map(p=>{
 const check=p.steps[6];
 const template:Template={id:p.id+'-check-v1',family:'JUSTIFICATION',severity:'minor',rootStep:'s7',dependentSteps:[],expectedCorrection:check.text,criteria:['identify','physics','correction','check','clarity'],terms:['work','energy','force','sign','units','component','speed'],wrong:[{...check,text:'The number looks right, so checking force direction, units, and assumptions is unnecessary.',equation:''}],nudge:'How could force direction, an energy balance, or a unit check test this result?',cue:check.text,guidance:check.text};
 return {id:p.id,data:ProblemSchema.parse({kind:p.original?'original':'textbook',chapterId:'chapter-7',problemNumber:p.number,title:p.title,subtitle:(p.original?'Original practice · ':'')+p.subtitle,statement:p.statement,givens:p.givens,requested:p.requested,assumptions:p.assumptions,diagram:'motion',diagramCaption:p.caption,diagramRequired:true,objectives:[p.subtitle,'Use a descriptive figure and check signs, units, and assumptions'],target:{symbol:p.number===18?'coefficient of x²':p.number===55?'K₂/K₁':'result',value:p.value,unit:p.unit,tolerance:.06},reference:p.steps,rubric:['Choose the correct force or energy relationship','Show signed calculations using the stated model','State every requested result with units or dimensionless ratios'],templates:[template],source:p.original?'Original educational practice adapted from the user’s Chapter 7 request. Additional geometry or normalized component assignments are explicitly stated.':'Chapter 7 exercise supplied by the user; notation and layout normalized, with an original explanatory figure.',permission:p.original?'Original practice wording, model, diagrams, and solutions authored for this educational application.':'User-supplied educational exercise text; source material remains credited to its respective owners. Figures and worked explanations are original.',reviewNotes:'Independently checked using signed force-displacement work, energy changes, scalar products, or direction cosines. Duplicate book text and an isolated lever caption are omitted. Unnumbered box and cart questions occupy slots 11 and 17. Original practice supplies missing gondola geometry and resolves scrambled vector assignments.'})};
});
