'use client';
import {useId} from 'react';
import type {EnergyFigureKind} from '@/lib/energy-figures';

export function EnergyDiagram({kind,caption,large}:{kind:EnergyFigureKind;caption:string;large:boolean}){
 const id=useId().replace(/:/g,''),colors={teal:'#397e79',purple:'#7b639b',amber:'#aa704b',ink:'#35485d'},muted='#87989f';
 const arrow=(x1:number,y1:number,x2:number,y2:number,color:keyof typeof colors='teal',dashed=false)=><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors[color]} strokeWidth="3" strokeDasharray={dashed?'6 5':undefined} markerEnd={'url(#'+id+'-'+color+')'}/>;
 const block=(x:number,y:number,w=50,h=38)=><rect x={x} y={y} width={w} height={h} rx="5" fill="#397e7916" stroke={colors.teal} strokeWidth="2"/>;
 return <figure className={'diagram chapter-three-diagram energy-diagram '+(large?'large':'')}><svg viewBox="0 0 500 320" role="img" aria-label={caption}>
  <defs>{Object.entries(colors).map(([name,color])=><marker key={name} id={id+'-'+name} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 1L7 4L0 7" fill="none" stroke={color} strokeWidth="1.5"/></marker>)}</defs>
  <g fill={colors.ink} fontSize="16" fontFamily="inherit">
   {kind==='fall'&&<>
    <text x="250" y="30" textAnchor="middle">280 kg pile driver · vertical fall</text>
    {block(120,65,64,42)}<text x="105" y="90" textAnchor="end">Start</text>
    <rect x="120" y="233" width="64" height="42" rx="5" stroke={muted} fill="none" strokeDasharray="5 4"/><text x="105" y="260" textAnchor="end">End</text>
    {arrow(152,120,152,213,'amber')}<text x="172" y="172">mg</text>
    {arrow(290,86,290,254)}<path d="M278 86H303M278 254H303" stroke={muted}/>
    <text x="316" y="160">3.80 m</text><text x="316" y="186">downward</text>
    <path d="M75 284H424" stroke={muted}/><text x="250" y="310" textAnchor="middle">Force and displacement are parallel</text>
   </>}
   {kind==='crate'&&<>
    <text x="250" y="26" textAnchor="middle">46.0 kg crate · constant speed</text>
    <path d="M40 225H460" stroke={muted} strokeWidth="2"/>
    {Array.from({length:18},(_,i)=><path key={i} d={'M'+(45+i*23)+' 225l-8 10'} stroke={muted}/>)}
    {block(220,147,60,64)}
    {arrow(250,172,250,68,'purple')}<text x="268" y="80">N</text>
    {arrow(250,172,250,270,'amber')}<text x="272" y="267">mg</text>
    {arrow(250,172,404,172)}<text x="372" y="150">Push</text>
    {arrow(250,172,96,172,'amber')}<text x="75" y="149">Friction</text>
    {arrow(76,288,425,288,'ink')}<text x="250" y="312" textAnchor="middle">10.3 m → · μₖ = 0.40</text>
   </>}
   {kind==='acceleration'&&<>
    <text x="250" y="30" textAnchor="middle">4.0 kg box · uniform acceleration</text>
    <path d="M45 218H455" stroke={muted}/>
    {block(70,160)}{block(350,160)}
    <text x="95" y="141" textAnchor="middle">At rest</text><text x="375" y="141" textAnchor="middle">After 8.0 s</text>
    {arrow(140,181,315,181)}<text x="228" y="162" textAnchor="middle">Speeds up</text>
    {arrow(135,92,305,92,'purple')}<text x="220" y="68" textAnchor="middle">a = 2.0 m/s²</text>
    <text x="250" y="268" textAnchor="middle">Net force points along the motion</text>
   </>}
   {kind==='books'&&<>
    <text x="250" y="26" textAnchor="middle">8 books · 1.6 kg each · 4.0 cm thick</text>
    <text x="140" y="72" textAnchor="middle">Before: side by side</text><text x="380" y="72" textAnchor="middle">After: one stack</text>
    {Array.from({length:8},(_,i)=><rect key={i} x={35+i*27} y="239" width="23" height="14" rx="2" fill="#397e7922" stroke={colors.teal}/>)}
    {Array.from({length:8},(_,i)=><g key={i}><rect x="350" y={239-i*18} width="60" height="18" rx="2" fill={i%2?'#7b639b20':'#397e7920'} stroke={colors.teal}/><circle cx="380" cy={248-i*18} r="2.5" fill={colors.ink}/></g>)}
    <path d="M30 257H260M325 257H450" stroke={muted} strokeWidth="2"/>
    {arrow(267,179,321,179,'ink')}
    <text x="140" y="291" textAnchor="middle">Equal initial centre heights</text>
    <text x="385" y="291" textAnchor="middle">Centres rise by 0h … 7h</text>
    <text x="140" y="197" textAnchor="middle">Each book starts flat</text>
   </>}
   {kind==='gondola'&&<>
    <text x="250" y="26" textAnchor="middle">Original practice · straight 30° cable</text>
    <path d="M55 246L418 36M55 246H418V36" fill="none" stroke={muted} strokeDasharray="5 5"/>
    <path d="M55 246L418 36" stroke={colors.teal} strokeWidth="3"/>
    <path d="M98 246A43 43 0 0 0 92 224" stroke={colors.purple} fill="none"/><text x="115" y="240">30°</text>
    <path d="M244 137V159" stroke={colors.ink}/>{block(218,159,53,41)}
    {arrow(278,123,335,90)}<text x="305" y="69">Pull uphill</text>
    {arrow(245,204,245,257,'amber')}<text x="265" y="254">mg</text>
    <text x="57" y="282">Base: 2150 m</text><text x="305" y="311">Summit: 3625 m</text>
    <text x="443" y="152" textAnchor="middle">Δh</text>
    <text x="140" y="104" textAnchor="middle">Total moving mass</text><text x="140" y="129" textAnchor="middle">2250 kg</text>
   </>}
   {kind==='ramp'&&<>
    <text x="250" y="25" textAnchor="middle">16 kg cart · constant speed · no friction</text>
    <path d="M40 250L460 161M40 250H155" stroke={muted} fill="none"/>
    <path d="M99 250A59 59 0 0 0 98 238" stroke={colors.purple} fill="none"/><text x="121" y="243">12°</text>
    <g transform="translate(236 191) rotate(-12)">{block(-27,-15,54,30)}<circle cx="-15" cy="22" r="6" fill={muted}/><circle cx="15" cy="22" r="6" fill={muted}/></g>
    {arrow(236,191,212,79,'purple')}<text x="182" y="73">N</text>
    {arrow(236,191,236,280,'amber')}<text x="253" y="282">mg</text>
    {arrow(236,191,349,226)}<text x="360" y="234">Push Fₚ</text>
    <path d="M236 191H355M298 191A62 62 0 0 1 295 209" stroke={muted} fill="none" strokeDasharray="4 3"/><text x="365" y="204">17°</text>
    {arrow(281,143,414,115,'ink')}<text x="350" y="96" textAnchor="middle">7.5 m uphill</text>
    <text x="130" y="154" textAnchor="middle">Push–motion</text><text x="130" y="177" textAnchor="middle">angle: 29°</text>
   </>}
   {(kind==='variable'||kind==='components')&&<>
    <text x="250" y="30" textAnchor="middle">Match x with x, y with y, z with z</text>
    <rect x="115" y="60" width="104" height="194" rx="8" fill="#397e7910"/>
    <rect x="225" y="60" width="104" height="194" rx="8" fill="#7b639b10"/>
    <rect x="335" y="60" width="104" height="194" rx="8" fill="#aa704b10"/>
    {['x','y','z'].map((v,i)=><text key={v} x={167+110*i} y="89" textAnchor="middle">{v}</text>)}
    {(kind==='variable'?[['a','2.0x²','−4.0x','5.0'],['B','11.0','2.5x','0']]:[['a','9.0','−8.5','0'],['B','−8.0','6.1','4.2'],['C','5.8','−9.2','0']]).map((row,i)=><g key={row[0]}><text x="80" y={137+i*48} textAnchor="middle">{row[0]}</text>{row.slice(1).map((v,j)=><text key={j} x={167+j*110} y={137+i*48} textAnchor="middle">{v}</text>)}</g>)}
    <text x="250" y="287" textAnchor="middle">{kind==='variable'?'x is a scalar variable · common vector units':'Declared practice vectors · common units'}</text>
    <text x="250" y="313" textAnchor="middle">The dot product is a scalar</text>
   </>}
   {kind==='axes'&&<>
    <text x="250" y="26" textAnchor="middle">Direction angles from positive axes</text>
    {arrow(175,163,404,163,'ink')}{arrow(175,163,68,253,'ink')}{arrow(175,163,175,53,'ink')}
    <text x="426" y="169">+x</text><text x="54" y="280">+y</text><text x="190" y="57">+z</text>
    {arrow(175,163,329,256)}
    <path d="M175 163L355 163L329 184V256" stroke={muted} fill="none" strokeDasharray="5 4"/>
    <text x="351" y="267">V</text><text x="245" y="91">Vₓ = +20.0</text><text x="245" y="119">Vᵧ = +26.0</text><text x="355" y="220">V𝓏 = −14.0</text>
    <text x="250" y="309" textAnchor="middle">Schematic · negative z means γ &gt; 90°</text>
   </>}
   {kind==='spring'&&<>
    <text x="65" y="26">External force F (N)</text>
    {[1,2,3,4,5].map(f=><g key={f}><path d={'M65 '+(260-f*40)+'H445'} stroke="#87989f25"/><text x="49" y={265-f*40} textAnchor="end">{f}</text></g>)}
    <path d="M65 42V260H452" stroke={muted} fill="none"/>
    <polygon points="200,260 200,182 402.5,65 402.5,260" fill="#397e7926" data-work-area="trapezoid"/>
    <path d="M65 260L425 52" stroke={colors.teal} strokeWidth="3" fill="none"/>
    <path d="M200 260V182M402.5 260V65" stroke={colors.purple} strokeDasharray="5 4"/>
    <circle cx="200" cy="182" r="4" fill={colors.purple}/><circle cx="402.5" cy="65" r="4" fill={colors.purple}/>
    <text x="65" y="284" textAnchor="middle">0</text><text x="200" y="284" textAnchor="middle">0.030</text><text x="402.5" y="284" textAnchor="middle">0.075</text>
    <text x="430" y="313" textAnchor="end">Extension x (m)</text>
    <text x="178" y="82">F = kx</text><text x="178" y="109">k = 65 N/m</text>
    <text x="310" y="224" textAnchor="middle">Work = shaded area</text>
   </>}
   {kind==='ratios'&&<>
    <text x="250" y="27" textAnchor="middle">Fixed mass · kinetic energy follows speed²</text>
    <text x="52" y="78">Speed</text><text x="322" y="78">Energy</text>
    {[{y:123,label:'v',speed:78,energy:44,energyLabel:'K'},{y:198,label:'√3 v',speed:78*Math.sqrt(3),energy:132,energyLabel:'3K'},{y:273,label:'v / 2',speed:39,energy:11,energyLabel:'K / 4'}].map(row=><g key={row.y}>
     <text x="50" y={row.y+5}>{row.label}</text>{arrow(112,row.y,112+row.speed,row.y)}
     <rect x="302" y={row.y-12} width={row.energy} height="24" rx="3" fill="#7b639b44"/><text x="451" y={row.y+5}>{row.energyLabel}</text>
    </g>)}
    <text x="250" y="313" textAnchor="middle">Arrow length: speed · bar length: kinetic energy</text>
   </>}
   {kind==='car'&&<>
    <text x="250" y="26" textAnchor="middle">1300 kg car · two stages</text>
    <text x="250" y="55" textAnchor="middle">Schematic distances, not to scale</text>
    <path d="M40 190H460" stroke={muted}/>
    {[{x:70,label:'20.0 m/s'},{x:250,label:'At rest'},{x:430,label:'20.0 m/s'}].map(car=><g key={car.x}><rect x={car.x-25} y="146" width="50" height="26" rx="7" fill="#397e7920" stroke={colors.teal}/><circle cx={car.x-15} cy="180" r="7" fill={muted}/><circle cx={car.x+15} cy="180" r="7" fill={muted}/><text x={car.x} y="118" textAnchor="middle">{car.label}</text></g>)}
    {arrow(90,218,229,218,'amber')}{arrow(273,218,410,218)}
    <text x="160" y="251" textAnchor="middle">30 m · slowing</text><text x="343" y="251" textAnchor="middle">100 m · speeding up</text>
    <text x="250" y="304" textAnchor="middle">Compare kinetic energy at each endpoint</text>
   </>}
   {kind==='stop'&&<>
    <text x="250" y="30" textAnchor="middle">Sliding box · no continuing push</text>
    <path d="M40 219H460" stroke={muted}/>{block(150,156)}<rect x="385" y="156" width="50" height="38" rx="5" stroke={muted} fill="none" strokeDasharray="5 4"/>
    {arrow(175,173,69,173,'amber')}<text x="78" y="149">Friction</text>
    {arrow(175,107,280,107)}<text x="198" y="80">v₀ = 5.0 m/s</text>
    <text x="410" y="139" textAnchor="middle">v = 0</text>
    {arrow(175,254,410,254,'ink')}<text x="293" y="282" textAnchor="middle">8.0 m stopping distance</text>
    <text x="250" y="310" textAnchor="middle">Friction points opposite to displacement</text>
   </>}
  </g>
 </svg><figcaption>{caption}</figcaption></figure>;
}
