'use client';
import {useId} from 'react';
import {practiceVectors,practicePositionPoints,practiceDrone,practiceProjectile,practiceBoat,type PracticeFigureKind} from '@/lib/practice-data';
export function PracticeDiagram({kind,caption,large}:{kind:PracticeFigureKind;caption:string;large:boolean}){
 const id=useId().replace(/:/g,''),teal='#397e79',purple='#7b639b',amber='#aa704b',ink='#35485d',muted='#87989f';
 const arrow=(x1:number,y1:number,x2:number,y2:number,color:'teal'|'purple'|'amber'|'ink'='teal',dashed=false)=><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={{teal,purple,amber,ink}[color]??ink} strokeWidth="3" strokeDasharray={dashed?'7 5':undefined} markerEnd={`url(#${id}-${color})`}/>;
 const droneEnd={x:100+2*practiceDrone.firstDistance*Math.cos(practiceDrone.angle*Math.PI/180),y:250-2*practiceDrone.firstDistance*Math.sin(practiceDrone.angle*Math.PI/180)};
 const droneFinish=droneEnd.x-2*practiceDrone.westDistance;
 const launchVy=practiceProjectile.speed*Math.sin(practiceProjectile.angle*Math.PI/180),range=practiceProjectile.speed**2*Math.sin(2*practiceProjectile.angle*Math.PI/180)/practiceProjectile.g,height=launchVy**2/(2*practiceProjectile.g);
 const riverFinish=160+.9*practiceBoat.current*practiceBoat.width/practiceBoat.northSpeed;
 return <figure className={`diagram chapter-three-diagram original-practice-diagram ${large?'large':''}`}><svg viewBox="0 0 500 320" role="img" aria-label={caption}>
  <defs>{[['teal',teal],['purple',purple],['amber',amber],['ink',ink]].map(([name,color])=><marker key={name} id={`${id}-${name}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 1L7 4L0 7" fill="none" stroke={color} strokeWidth="1.5"/></marker>)}</defs>
  <g fill={ink} fontSize="16" fontFamily="inherit">
   {(kind==='vector-pair'||kind==='vector-set')&&<>
    <text x="250" y="24" textAnchor="middle">Components (x, y) in units</text>
    <path d="M45 180H450M250 40V300" stroke={muted} fill="none"/>
    {[-4,-2,2,4,6].map(t=><g key={t}><path d={`M${250+t*24} 48V292M60 ${180-t*24}H442`} stroke="#87989f24"/><text x={250+t*24} y="204" textAnchor="middle">{t}</text>{t!==6&&<text x="232" y={185-t*24} textAnchor="end">{t}</text>}</g>)}
    <text x="458" y="185">+x</text><text x="257" y="46">+y</text><text x="236" y="200" textAnchor="end">O</text>
    {arrow(250,180,250+practiceVectors.A.x*24,180-practiceVectors.A.y*24)}
    {arrow(250,180,250+practiceVectors.B.x*24,180-practiceVectors.B.y*24,'purple')}
    <text x="380" y="92" textAnchor="middle">A = (4, 3)</text><text x="145" y="57" textAnchor="middle">B = (−2, 5)</text>
    {kind==='vector-set'&&<>{arrow(250,180,250+practiceVectors.C.x*24,180-practiceVectors.C.y*24,'amber')}<text x="382" y="286" textAnchor="middle">C = (3, −4)</text></>}
   </>}
   {kind==='position-graph'&&<>
    <path d="M60 40V265H450" fill="none" stroke={muted}/>
    {[0,2,4,6,8,10].map(t=><g key={t}><path d={`M${60+t*36} 45V265`} stroke="#87989f28"/><text x={60+t*36} y="290" textAnchor="middle">{t}</text></g>)}
    {[0,4,8,12].map(x=><g key={x}><path d={`M60 ${265-x*16}H438`} stroke="#87989f28"/><text x="42" y={270-x*16} textAnchor="end">{x}</text></g>)}
    <polyline points={practicePositionPoints.map(p=>`${60+p.t*36},${265-p.x*16}`).join(' ')} fill="none" stroke={teal} strokeWidth="3"/>
    {practicePositionPoints.map(p=><circle key={p.t} cx={60+p.t*36} cy={265-p.x*16} r="4" fill={teal}/>)}
    <text x="60" y="25">Position x (m)</text><text x="450" y="314" textAnchor="end">Time t (s)</text>
   </>}
   {kind==='drone-route'&&<>
    {arrow(100,250,droneEnd.x,droneEnd.y)}{arrow(droneEnd.x,droneEnd.y,droneFinish,droneEnd.y,'purple')}{arrow(100,250,droneFinish,droneEnd.y,'ink',true)}
    <path d="M100 250H180M137 250A37 37 0 0 0 132 231" stroke={muted} fill="none"/>
    <circle cx="100" cy="250" r="4" fill={ink}/><circle cx={droneFinish} cy={droneEnd.y} r="4" fill={purple}/>
    <text x="100" y="282" textAnchor="middle">Start</text><text x={droneFinish} y="103" textAnchor="middle">Finish</text>
    <text x="218" y="95" textAnchor="middle">90.0 m west</text><text x="266" y="199" textAnchor="middle">120 m</text><text x="285" y="230" textAnchor="middle">30° north of east</text>
    <text x="162" y="243" textAnchor="middle">30°</text><text x="250" y="35" textAnchor="middle">Head-to-tail addition · north is up</text>
   </>}
   {kind==='projectile'&&<>
    <path d="M45 245H460" stroke={muted}/>
    <path d={`M80 245Q${80+range*5} ${245-height*20} ${80+range*10} 245`} fill="none" stroke={teal} strokeWidth="3"/>
    {arrow(80,245,80+100*Math.cos(Math.PI/6),245-100*Math.sin(Math.PI/6))}
    <path d="M115 245A35 35 0 0 0 110 227" stroke={purple} fill="none"/><text x="140" y="239">30°</text>
    <text x="196" y="170" textAnchor="middle">20.0 m/s at launch</text>
    <path d={`M${80+range*5} ${245-height*10}V245`} stroke={muted} strokeDasharray="5 4"/><text x="280" y="225">H</text>
    <path d={`M80 274H${80+range*10}M80 267V281M${80+range*10} 267V281`} stroke={muted}/><text x="257" y="303" textAnchor="middle">Range R</text>
    {arrow(428,90,428,145,'purple')}<text x="450" y="124">g</text><text x="250" y="30" textAnchor="middle">Equal launch and landing heights</text>
   </>}
   {kind==='river-crossing'&&<>
    <path d="M45 70H455V250H45Z" fill="#397e7912"/><path d="M45 70H455M45 250H455" stroke={muted} strokeWidth="2"/>
    <path d="M88 70V250M81 70H95M81 250H95" stroke={muted}/><text x="78" y="185" textAnchor="end">200 m</text>
    {arrow(160,250,160,145)}{arrow(330,175,425,175,'purple')}{arrow(160,250,riverFinish,70,'ink',true)}
    <text x="135" y="130" textAnchor="end">4.00 m/s north</text><text x="377" y="145" textAnchor="middle">1.50 m/s east</text>
    <path d={`M160 52H${riverFinish}M160 46V58M${riverFinish} 46V58`} stroke={muted}/><text x={(160+riverFinish)/2} y="36" textAnchor="middle">Drift</text>
    <circle cx="160" cy="250" r="4" fill={teal}/><circle cx={riverFinish} cy="70" r="4" fill={ink}/><text x="160" y="280" textAnchor="middle">Start</text><text x="302" y="226" textAnchor="middle">Ground track</text>
   </>}
  </g>
 </svg><figcaption>{caption}</figcaption></figure>;
}
