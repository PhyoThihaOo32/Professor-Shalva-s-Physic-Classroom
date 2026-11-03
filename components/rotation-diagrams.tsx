'use client';
import {useId} from 'react';
import type {RotationFigure} from '@/lib/rotation-figures';

export function RotationDiagram({figure,caption,large}:{figure:RotationFigure;caption:string;large:boolean}){
 const id=useId().replace(/:/g,''),{kind,heading,labels}=figure;
 const colors={teal:'#397e79',purple:'#7b639b',amber:'#aa704b',ink:'#35485d'},muted='#87989f';
 const arrow=(x1:number,y1:number,x2:number,y2:number,c:keyof typeof colors='teal',dashed=false)=><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors[c]} strokeWidth="3" strokeDasharray={dashed?'5 4':undefined} markerEnd={'url(#'+id+'-'+c+')'}/>;
 const pathArrow=(d:string,c:keyof typeof colors='teal')=><path d={d} fill="none" stroke={colors[c]} strokeWidth="3" markerEnd={'url(#'+id+'-'+c+')'}/>;
 const dot=(x:number,y:number,r=5)=><circle cx={x} cy={y} r={r} fill={colors.teal}/>;
 const wheel=(x=215,y=166,r=83)=><><circle cx={x} cy={y} r={r} fill="#397e790d" stroke={muted} strokeWidth="2"/>{dot(x,y,4)}</>;
 const label=(x:number,y:number,t:string,anchor:'start'|'middle'|'end'='start')=><text x={x} y={y} textAnchor={anchor}>{t}</text>;
 return <figure className={'diagram chapter-three-diagram rotation-diagram '+(large?'large':'')}><svg viewBox="0 0 500 340" role="img" aria-label={caption}>
  <defs>{Object.entries(colors).map(([name,color])=><marker key={name} id={id+'-'+name} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 1L7 4L0 7" fill="none" stroke={color} strokeWidth="1.5"/></marker>)}</defs>
  <g fill={colors.ink} fontSize="16" fontFamily="inherit">
   {label(250,25,heading,'middle')}
   {kind==='angle'&&(figure.labels[0]==='R = 100 m'?<>
    {dot(75,164)}<path d="M75 164L390 85M75 164L390 245" stroke={muted} fill="none" strokeWidth="2"/>
    <path d="M129 151Q136 164 129 179" fill="none" stroke={colors.purple} strokeWidth="2"/>
    {label(147,174,'θ')}{label(222,104,labels[0])}
    <path d="M390 85V245" stroke={colors.teal} strokeWidth="4"/>{label(385,274,labels[2],'end')}
    {label(250,311,labels[1],'middle')}
   </>:<>
    {wheel(245,170,91)}<path d="M245 170L324 125" stroke={muted} strokeWidth="2" strokeDasharray="5 4"/>
    <path d="M245 170L166 125" stroke={colors.teal} strokeWidth="3"/>
    {pathArrow('M305 135A69 69 0 0 0 185 135','purple')}
    {label(337,120,'30°')}{label(150,120,'150°','end')}{label(245,87,'Δθ','middle')}
    {label(245,208,labels[0],'middle')}{label(250,309,labels[2],'middle')}
   </>)}
   {kind==='carousel'&&<>
    {wheel(218,173,88)}<circle cx="218" cy="173" r="44" stroke={muted} fill="none" strokeDasharray="4 4"/>
    {arrow(218,173,306,173,'ink')}{dot(262,173)}{dot(306,173)}
    {arrow(262,173,262,128,'purple')}{arrow(306,173,306,82)}
    {label(185,226,labels[0],'end')}{label(324,192,labels[1])}{label(240,115,'vₗ','end')}{label(323,91,'vₕ')}
    {label(250,308,labels[2],'middle')}
   </>}
   {(kind==='acceleration'||kind==='rim')&&<>
    {wheel(211,168,83)}{dot(294,168)}
    {arrow(211,168,294,168,'ink',true)}{label(235,194,'R')}
    {arrow(294,168,294,70)}{label(310,78,'v')}
    {arrow(294,168,225,168,'purple')}{label(254,145,'aᵣ','middle')}
    {kind==='acceleration'&&<>{arrow(321,168,321,105,'amber')}{label(339,121,'aₜ')}</>}
    {label(66,270,labels[0])}{label(250,299,labels[1],'middle')}{label(250,326,labels[2],'middle')}
   </>}
   {kind==='rate'&&<>
    <path d="M90 64V250H431" stroke={muted} fill="none" strokeWidth="2"/>
    <path d="M90 250L401 88V250Z" fill="#397e7926" data-area="startup-triangle"/>
    <path d="M90 250L401 88" stroke={colors.teal} strokeWidth="3"/>
    <path d="M401 88V250" stroke={muted} strokeDasharray="5 4"/>
    {label(92,58,'ω (rpm)')}{label(402,72,labels[0],'end')}{label(91,274,'0','middle')}
    {label(402,274,labels[1],'middle')}{label(444,249,'t')}
    {label(250,317,labels[2],'middle')}
   </>}
   {kind==='earth'&&<>
    <ellipse cx="190" cy="175" rx="125" ry="80" fill="none" stroke={muted}/><circle cx="190" cy="175" r="20" fill="#aa704b30" stroke={colors.amber}/>
    <circle cx="315" cy="175" r="19" fill="#397e7926" stroke={colors.teal}/>
    {pathArrow('M121 109Q177 78 237 108','purple')}{pathArrow('M330 150Q354 175 332 200')}
    {label(190,212,'Sun','middle')}{label(367,180,'Earth')}{label(184,65,labels[0],'middle')}
    {label(372,242,labels[1],'middle')}{label(250,315,labels[2],'middle')}
   </>}
   {kind==='polynomial'&&<>
    <path d="M83 60V262H438" stroke={muted} fill="none" strokeWidth="2"/>
    <path d="M105 244C210 239 276 203 404 78" stroke={colors.teal} strokeWidth="3" fill="none"/>
    <path d="M105 244L404 78" stroke={colors.purple} strokeWidth="2" strokeDasharray="6 4"/>
    <path d="M346 145L433 52" stroke={colors.amber} strokeWidth="2"/>
    {dot(105,244)}{dot(404,78)}
    {label(105,284,'2.0 s','middle')}{label(404,284,'3.0 s','middle')}{label(45,64,'θ')}{label(450,259,'t')}
    {label(93,107,'Average: secant')}{label(93,137,'Instantaneous: tangent')}
    {label(250,321,labels[0],'middle')}
   </>}
   {kind==='compound'&&<>
    {wheel(230,176,88)}<circle cx="230" cy="176" r="53" fill="none" stroke={muted}/>
    <path d="M230 176V88M230 176H177" stroke={muted} strokeDasharray="4 4"/>
    {arrow(177,176,177,261,'amber')}{arrow(230,88,308,43)}
    {arrow(230,88,308,88,'purple',true)}<path d="M230 88V48" stroke={muted} strokeDasharray="4 4"/>
    <path d="M230 61Q247 61 253 75" stroke={colors.purple} fill="none"/>
    {label(258,58,'60°')}{label(325,49,'Fᵦ')}{label(112,241,'Fₐ')}
    {label(102,149,'Rₐ','middle')}{label(248,132,'Rᵦ')}{label(335,111,'Fᵦ⊥')}
    {label(250,300,labels[0]+' · '+labels[1],'middle')}{label(250,328,labels[2],'middle')}
   </>}
   {kind==='pedal'&&<>
    {dot(122,169,9)}<path d="M122 169H331" stroke={muted} strokeWidth="7"/><rect x="311" y="161" width="42" height="16" rx="4" fill="#397e7933" stroke={colors.teal}/>
    {arrow(332,178,332,266,'amber')}{label(349,235,'F = mg')}{label(221,145,labels[0],'middle')}
    <path d="M307 169V194H332" stroke={colors.purple} fill="none"/>
    {label(115,207,'Axle','end')}{label(250,306,labels[2]+' · force vertical','middle')}
   </>}
   {kind==='door'&&<>
    {dot(83,221,8)}<path d="M83 221H333" stroke={muted} strokeWidth="8"/>
    {arrow(333,221,333,86)}{arrow(333,221,402,101,'purple')}
    <path d="M333 221H425" stroke={muted} strokeDasharray="4 4"/>
    {label(324,74,'90°','end')}{label(420,108,'60°')}{label(65,253,'Hinge')}
    {label(201,204,labels[0],'middle')}{label(250,279,labels[1],'middle')}
    {label(250,318,labels[2],'middle')}
   </>}
   {(kind==='cylinder'||kind==='tangent')&&<>
    {wheel(199,170,85)}
    {kind==='cylinder'?<>
     <circle cx="199" cy="170" r="43" fill="#f6f5ef" stroke={muted} strokeWidth="2"/>
     <circle cx="199" cy="170" r="67" fill="none" stroke={colors.teal} strokeWidth="9" opacity=".22"/>
     {arrow(199,170,242,170,'ink')}{arrow(199,170,199,85,'purple')}
     {label(264,190,labels[0])}{label(264,220,labels[1])}{label(280,131,'Thin shell dm')}
     {label(150,270,'Central axis ⊙')}
    </>:<>
     {dot(284,170,6)}<path d="M199 170H284" stroke={colors.purple} strokeWidth="3"/>
     {label(192,213,'CM','end')}{label(310,174,'Tangent axis ⊙')}{label(240,145,labels[1],'middle')}
     {label(250,270,labels[0],'middle')}
    </>}
    {label(250,316,labels[2],'middle')}
   </>}
   {kind==='hand'&&<>
    {wheel(250,165,68)}{pathArrow('M310 199A69 69 0 0 0 210 109')}
    <circle cx="85" cy="172" r="16" fill="none" stroke={colors.teal} strokeWidth="2"/>{dot(85,172,4)}
    <circle cx="415" cy="172" r="16" fill="none" stroke={colors.amber} strokeWidth="2"/><path d="M405 162l20 20M405 182l20-20" stroke={colors.amber} strokeWidth="2"/>
    {label(85,223,'ω: out','middle')}{label(415,223,'α: into','middle')}
    {label(250,274,labels[0],'middle')}{label(250,307,labels[1],'middle')}
   </>}
   {kind==='masses'&&<>
    <path d="M190 112H310M130 228H370" stroke={muted} strokeWidth="4"/>
    {dot(250,112,4)}{dot(250,228,4)}{dot(190,112,12)}{dot(310,112,12)}{dot(130,228,12)}{dot(370,228,12)}
    <path d="M250 68V263" stroke={colors.purple} strokeDasharray="5 4"/>
    {label(250,67,'Axis','middle')}{label(250,157,labels[1],'middle')}{label(250,273,labels[2],'middle')}
    {label(250,319,labels[0],'middle')}
   </>}
   {kind==='axes'&&<>
    {wheel(230,166,84)}{arrow(230,166,365,166,'ink')}{arrow(230,166,230,57,'purple')}
    <circle cx="230" cy="166" r="10" fill="#f6f5ef" stroke={colors.teal}/>{dot(230,166,3)}
    {label(380,172,'x')}{label(248,61,'y')}{label(254,195,'z ⊙')}
    {label(250,271,labels[0],'middle')}{label(250,302,labels[1],'middle')}{label(250,330,labels[2],'middle')}
   </>}
   {kind==='race'&&<>
    {['Block','Sphere','Cylinder','Thin hoop'].map((name,i)=><g key={name}>
     <path d={'M170 '+(74+i*53)+'l245 25'} stroke={muted} fill="none"/>
     {i===0?<rect x="169" y="58" width="22" height="16" fill="#aa704b26" stroke={colors.amber}/>:<circle cx="180" cy={63+i*53} r="11" fill={i===3?'none':'#397e7926'} stroke={colors.teal} strokeWidth={i===3?3:2}/>}
     {label(142,79+i*53,name,'end')}
    </g>)}
    {label(250,296,labels[1],'middle')}{label(250,325,labels[2],'middle')}
   </>}
   {kind==='velocities'&&<>
    {wheel(213,171,79)}<path d="M70 251H430" stroke={muted} strokeWidth="2"/>
    {dot(213,92)}{dot(213,250)}{arrow(213,92,377,92)}{arrow(213,171,295,171,'purple')}
    {label(390,97,'vtop = ?')}{label(311,175,'vCM = 3.0 m/s')}{label(219,66,'Clockwise spin','middle')}
    {label(212,278,'vbottom = ?','middle')}{label(250,310,labels[0],'middle')}
   </>}
   {kind==='work'&&<>
    <path d="M90 58V250H436" fill="none" stroke={muted} strokeWidth="2"/>
    <path d="M90 109H390V250H90Z" fill="#397e7926" data-area="torque-rectangle"/>
    <path d="M90 109H390" stroke={colors.teal} strokeWidth="3"/>
    {label(74,115,'12','end')}{label(93,53,'τ (N·m)')}{label(390,275,'3.0','middle')}
    {label(435,246,'θ')}{label(250,176,'W = signed area','middle')}{label(250,318,labels[2],'middle')}
   </>}
   {kind==='resistance'&&<>
    {wheel(216,170,76)}<path d="M70 249H430" stroke={muted} strokeWidth="3"/>
    {arrow(216,59,337,59)}{label(351,64,'vCM')}
    {arrow(216,170,216,276,'amber')}{label(185,270,'mg','end')}
    {arrow(240,249,240,110,'purple')}{label(260,128,'N')}
    <ellipse cx="234" cy="248" rx="26" ry="6" fill="#aa704b45"/>
    {label(274,228,'Shifted contact')}
    {label(250,305,labels[0],'middle')}{label(250,331,labels[1],'middle')}
   </>}
   {kind==='dynamics'&&<>
    {wheel(205,170,79)}{arrow(284,170,284,69)}
    <path d="M205 170H284" stroke={muted} strokeDasharray="5 4"/>
    {label(247,195,'R')}{label(306,79,'F = 6.0 N')}{label(194,213,'Fixed axle','end')}
    {label(250,274,labels[0],'middle')}{label(250,316,labels[2],'middle')}
   </>}
   {kind==='energy'&&<>
    {wheel(218,164,81)}
    <path d="M218 164L275 107M218 164L162 220M218 164L278 217" stroke={muted}/>
    {pathArrow('M269 235A88 88 0 0 0 297 126','purple')}
    {arrow(275,107,233,65)}{dot(275,107,8)}{label(314,91,'v = rω')}
    {label(250,273,labels[0],'middle')}{label(250,304,labels[1],'middle')}
   </>}
  </g>
 </svg><figcaption>{caption}</figcaption></figure>;
}
