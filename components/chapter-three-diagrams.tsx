'use client';
import {useId} from 'react';
import type {ProblemData} from '@/lib/domain';
const kinds=['vector-journey','vector-components','opposite-vectors','particle-3d','horizontal-projectile','vector-displacement','projectile-range'] as const;
type Kind=typeof kinds[number];
export function isChapterThreeDiagram(kind:ProblemData['diagram']):kind is Kind{return kinds.some(value=>value===kind);}
export function ChapterThreeDiagram({kind,caption,large}:{kind:Kind;caption:string;large:boolean}){
 const id=useId().replace(/:/g,'');
 const teal='#397e79',purple='#7b639b',ink='#35485d',muted='#87989f';
 const arrow=(x1:number,y1:number,x2:number,y2:number,color=teal,dashed=false)=><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={3} strokeDasharray={dashed?'7 6':undefined} markerEnd={`url(#${id}-${color===purple?'purple':color===ink?'ink':'teal'})`}/>;
 return <figure className={`diagram chapter-three-diagram ${large?'large':''}`}><svg viewBox="0 0 500 320" role="img" aria-label={caption}>
  <defs>{[['teal',teal],['purple',purple],['ink',ink]].map(([name,color])=><marker key={name} id={`${id}-${name}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 1L7 4L0 7" fill="none" stroke={color} strokeWidth="1.5"/></marker>)}</defs>
  <g fill={ink} fontSize="16" fontFamily="inherit">
   {kind==='vector-journey'&&<>
    {arrow(425,85,205,85)}{arrow(205,85,130,160,purple)}{arrow(425,85,130,160,ink,true)}
    <circle cx="425" cy="85" r="4" fill={ink}/><circle cx="205" cy="85" r="4" fill={teal}/><circle cx="130" cy="160" r="4" fill={purple}/>
    <text x="425" y="63" textAnchor="middle">Start</text><text x="310" y="47" textAnchor="middle">245 km west</text>
    <text x="84" y="115" textAnchor="middle">118 km</text><text x="84" y="137" textAnchor="middle">southwest</text><text x="120" y="191" textAnchor="middle">Finish</text>
    <path d="M205 85H162M179 85A26 26 0 0 0 187 103" stroke={muted} fill="none" strokeDasharray="3 3"/><text x="206" y="122">45°</text>
    <text x="305" y="160" textAnchor="middle">Net displacement</text><path d="M305 146L280 124" stroke={muted}/>
    {arrow(416,260,416,204,ink)}{arrow(386,245,456,245,ink)}<text x="416" y="194" textAnchor="middle">N</text><text x="466" y="251">E</text>
   </>}
   {kind==='vector-components'&&<>
    <path d="M65 75H444M105 35V278" stroke={muted} fill="none"/><text x="450" y="80">+x</text><text x="110" y="30">+y</text><text x="83" y="63">O</text>
    <path d="M355 75V255H105" stroke={muted} fill="none" strokeDasharray="6 5"/>
    {arrow(105,75,355,255)}<circle cx="355" cy="255" r="4" fill={teal}/>
    <text x="232" y="53" textAnchor="middle">Vₓ = +9.40</text><text x="378" y="173">Vᵧ</text><text x="378" y="213">−6.80</text>
    <text x="226" y="191">V</text><path d="M145 75A40 40 0 0 1 137 98" stroke={purple} fill="none"/><text x="155" y="105">θ</text>
    <text x="250" y="303" textAnchor="middle">Components in the same units</text>
   </>}
   {kind==='opposite-vectors'&&<>
    <path d="M44 156H454M90 58V246" stroke={muted} fill="none"/><text x="460" y="162">+x</text><text x="78" y="45">+y</text><text x="69" y="179">O</text>
    {arrow(90,156,265,156)}{arrow(426,156,285,156,purple)}
    <text x="176" y="116" textAnchor="middle">A = 6.8</text><text x="358" y="116" textAnchor="middle">B = 5.5</text>
    <text x="176" y="198" textAnchor="middle">Right (+x)</text><text x="358" y="198" textAnchor="middle">Left (−x)</text>
    <text x="250" y="279" textAnchor="middle">Arrows share a line; lengths are in units.</text>
   </>}
   {kind==='particle-3d'&&<>
    <path d="M75 70H451M105 35V280" stroke={muted} fill="none"/><text x="457" y="75">x</text><text x="111" y="28">z</text><text x="85" y="61">O</text>
    <path d="M105 70Q263 70 420 260" stroke={teal} strokeWidth="3" fill="none"/>
    {arrow(105,70,180,70)}{arrow(356,185,356,250,purple)}<text x="380" y="213">−z</text>
    <text x="255" y="39" textAnchor="middle">Plane y = 6.45 m</text><text x="255" y="119" textAnchor="middle">x grows with t</text><text x="210" y="222" textAnchor="middle">z decreases as t²</text>
    <text x="250" y="306" textAnchor="middle">View of the x–z plane · schematic</text>
   </>}
   {kind==='horizontal-projectile'&&<>
    <path d="M60 105H145V260H455M60 260H145" stroke={muted} fill="#87989f18" strokeWidth="2"/>
    <path d="M145 105Q290 105 420 260" fill="none" stroke={teal} strokeWidth="3"/>
    <circle cx="145" cy="105" r="5" fill={teal}/>{arrow(153,92,240,92)}<text x="190" y="64" textAnchor="middle">10.8 m/s</text>
    <path d="M105 112V253M98 112H112M98 253H112" stroke={purple} strokeWidth="2"/><text x="84" y="188" textAnchor="middle">h</text>
    <path d="M145 285H420M145 278V292M420 278V292" stroke={muted}/><text x="282" y="312" textAnchor="middle">21.0 m</text>
    {arrow(373,107,373,164,purple)}<text x="393" y="140">g</text><text x="271" y="232" textAnchor="middle">v₀ᵧ = 0 at release</text>
   </>}
   {kind==='vector-displacement'&&<>
    <path d="M63 81H452M100 35V280" stroke={muted} fill="none"/><text x="458" y="87">+x</text><text x="106" y="29">+y</text><text x="73" y="104">O</text>
    <circle cx="116" cy="68" r="5" fill={purple}/><circle cx="360" cy="258" r="5" fill={teal}/>
    {arrow(116,68,360,258)}{arrow(100,81,116,68,purple)}
    <path d="M116 68H360V258" stroke={muted} strokeDasharray="6 5" fill="none"/>
    <text x="161" y="43">Reference r₀ = (2, 7) m</text><text x="230" y="275">Final r(5 s)</text>
    <text x="244" y="109">Δx</text><text x="378" y="171">Δy</text><text x="184" y="187">Δr</text>
    <text x="250" y="300" textAnchor="middle">Displacement starts at r₀, not at O · schematic</text>
   </>}
   {kind==='projectile-range'&&<>
    <path d="M38 245H463" stroke={muted}/>
    <path d="M60 245Q196 187 332 245" fill="none" stroke={teal} strokeWidth="3"/>
    <path d="M60 245Q196 -78 332 245" fill="none" stroke={purple} strokeWidth="3"/>
    <path d="M60 245Q250 55 440 245" fill="none" stroke={muted} strokeWidth="2" strokeDasharray="7 5"/>
    <circle cx="60" cy="245" r="4" fill={ink}/><circle cx="332" cy="245" r="4" fill={teal}/><circle cx="440" cy="245" r="4" fill={muted}/>
    <text x="206" y="65" textAnchor="middle">High arc</text><text x="206" y="204" textAnchor="middle">Low arc</text>
    <text x="384" y="129" textAnchor="middle">45° gives</text><text x="384" y="151" textAnchor="middle">maximum range</text>
    <path d="M60 268H332M60 262V274M332 262V274" stroke={teal}/><text x="196" y="294" textAnchor="middle">68 m</text>
    <text x="440" y="294" textAnchor="middle">95 m</text><text x="250" y="24" textAnchor="middle">Same launch speed · equal endpoint heights</text>
   </>}
  </g>
 </svg><figcaption>{caption}</figcaption></figure>;
}
