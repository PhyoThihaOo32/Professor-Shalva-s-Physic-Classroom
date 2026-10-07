'use client';
import katex from 'katex';
import Image from 'next/image';
import type {CSSProperties} from 'react';
import {findPersona} from '@/lib/domain';
import type {ProblemData} from '@/lib/domain';
export function Equation({math,block=false}:{math:string;block?:boolean}){if(!math)return null;return <span className={block?'equation block':'equation'} aria-label={math} dangerouslySetInnerHTML={{__html:katex.renderToString(math,{throwOnError:false,trust:false,strict:'warn',output:'htmlAndMathml',displayMode:block})}}/>;}
export function MathText({text}:{text:string}){
 return text.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g).map((part,index)=>part.startsWith('\\[')||part.startsWith('\\(')?<Equation key={index} math={part.slice(2,-2)} block={part.startsWith('\\[')}/>:part);
}
export function Avatar({id,size=64}:{id:string;size?:number}){
 const persona=findPersona(id);
 if(persona?.avatar)return <span className={`student-avatar character-avatar avatar-${id}`} style={{'--avatar-size':`${size}px`,backgroundColor:persona.color} as CSSProperties}><Image src={persona.avatar.src} width={persona.avatar.width} height={persona.avatar.height} alt={`${persona.name} profile picture`} unoptimized loading="eager"/></span>;
 const milo=id.startsWith('milo'),nora=id.startsWith('nora');
 const name=milo?'Milo Doodle':nora?'Nora Finch':'Theo Quill';
 return <svg className="student-avatar" width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={`${name} original portrait`}>
 <circle cx="32" cy="32" r="32" fill={milo?'#f0dfc8':nora?'#e1e9df':'#e6e0ef'}/>
 <path d="M9 64c0-16 9-23 23-23s23 7 23 23" fill={milo?'#c18971':nora?'#8ba294':'#9b93b6'}/><path d="M26 39h12v13H26" fill="#dfae8c"/>
 <path d="M18 29c0-16 6-22 14-22s16 7 16 21v14H17Z" fill={milo?'#826552':nora?'#665347':'#535365'}/><ellipse cx="32" cy="29" rx="14" ry="17" fill="#f1c6a5"/>
 <path d={milo?'M17 28c-3-14 4-21 10-20l6-4 2 6c12-5 18 11 14 19l-6-10c-8 6-13-3-21 3Z':nora?'M17 30c-2-16 5-24 15-24 12 0 18 10 16 24l-5-13c-5 4-9 3-13-2l-9 12-1 17h-5Z':'M17 28c-2-15 7-21 17-21 13 0 17 13 14 23l-6-14c-6 7-15 6-20 6Z'} fill={milo?'#826552':nora?'#665347':'#535365'}/>
 <circle cx="26" cy="30" r="1.5" fill="#534852"/><circle cx="39" cy="30" r="1.5" fill="#534852"/>
 <path d="M29 38q4 3 8-1" fill="none" stroke="#b98478" strokeWidth="1.8" strokeLinecap="round"/>
 {!milo&&!nora&&<g fill="none" stroke="#797086" strokeWidth="1.5"><rect x="20" y="26" width="11" height="9" rx="3"/><rect x="34" y="26" width="11" height="9" rx="3"/><path d="M31 29h3"/></g>}
 {nora&&<path d="M18 20l6-6" stroke="#d8b0b8" strokeWidth="3" strokeLinecap="round"/>}
 <path d="M24 48l8 6 8-6" fill="none" stroke="#fff5e8" strokeWidth="2" strokeLinecap="round"/>
 </svg>;
}
export function Diagram({kind,caption,large=false}:{kind:ProblemData['diagram'];caption:string;large?:boolean}){
 if(['motion','position','vertical','trains','cliff'].includes(kind))return <MotionDiagram kind={kind} caption={caption} large={large}/>;
 const top=kind==='top',bottom=kind==='bottom',pendulum=kind==='pendulum';
 return <figure className={`diagram ${large?'large':''}`}><svg viewBox="0 0 360 230" role="img" aria-label={caption}><defs><marker id={`arrow-${kind}`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="#548b85"/></marker><marker id={`amber-${kind}`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="#b38153"/></marker></defs>
 {pendulum?<><ellipse cx="180" cy="177" rx="78" ry="20" fill="none" stroke="#b6b5c9" strokeDasharray="5 5"/><path d="M180 25L250 175M180 25V177" stroke="#8b829d" strokeWidth="2"/><path d="M180 74Q193 74 200 68" fill="none" stroke="#b38153"/><circle cx="250" cy="175" r="9" fill="#d99e68"/><path d="M243 158L220 106M250 185V220" stroke="#548b85" strokeWidth="2" markerEnd={`url(#arrow-${kind})`}/><text x="206" y="87">θ</text><text x="185" y="171">r</text><text x="224" y="112">T</text><text x="268" y="209">mg</text><text x="224" y="68">L</text></>:<><circle cx="165" cy="115" r="78" fill="none" stroke="#b6b5c9" strokeWidth="1.5" strokeDasharray="5 5"/><circle cx="165" cy="115" r="3" fill="#8b829d"/><text x="121" y="129" className="small-label">center</text>{top||bottom?<><path d={`M165 ${top?37:193}V115`} stroke="#b9b2c6" strokeDasharray="3 4"/><circle cx="165" cy={top?37:193} r="9" fill="#d99e68"/><path d={top?'M154 49V96':'M165 181V131'} stroke="#548b85" strokeWidth="2" markerEnd={`url(#arrow-${kind})`}/><path d={top?'M176 49V86':'M179 199V222'} stroke="#b38153" strokeWidth="2" markerEnd={`url(#amber-${kind})`}/><text x="119" y={top?75:157}>{top?'N':'T'}</text><text x="190" y={top?76:219}>mg</text><text x="202" y="117">r</text><path d={top?'M178 37H237':'M153 193H92'} stroke="#548b85" strokeWidth="2" markerEnd={`url(#arrow-${kind})`}/><text x={top?215:105} y={top?26:182}>v</text></>:<><path d="M243 115H170" stroke="#548b85" strokeWidth="2" markerEnd={`url(#arrow-${kind})`}/><path d="M243 107V44" stroke="#b38153" strokeWidth="2" markerEnd={`url(#amber-${kind})`}/><circle cx="243" cy="115" r="9" fill="#d99e68"/><text x="201" y="103">{kind==='road'?'fₛ':'a꜀'}</text><text x="258" y="61">v</text><text x="184" y="146">r</text>{kind==='road'&&<text x="80" y="219" className="small-label">Vertical: N = mg</text>}</>}</>}
 </svg><figcaption>{caption}</figcaption></figure>;
}
function MotionDiagram({kind,caption,large}:{kind:string;caption:string;large:boolean}){
 const points=Array.from({length:61},(_,i)=>{const t=i/20,x=27+10*t-2*t**3;return `${50+t*90},${190-x*4}`;}).join(' ');
 return <figure className={`diagram motion-diagram ${large?'large':''}`}><svg viewBox="0 0 360 230" role="img" aria-label={caption}>
 {kind==='position'?<><path d="M50 20V190H330" fill="none" stroke="#748b96"/>{[0,1,2,3].map(t=><g key={t}><path d={`M${50+t*90} 30V190`} stroke="#8ba5a533"/><text x={46+t*90} y="208">{t}</text></g>)}{[0,10,20,30,40].map(x=><g key={x}><path d={`M50 ${190-x*4}H320`} stroke="#8ba5a533"/><text x="22" y={195-x*4}>{x}</text></g>)}<polyline points={points} stroke="#648e89" strokeWidth="3" fill="none"/><text x="302" y="227">t (s)</text><text x="12" y="20">x (m)</text></>:kind==='vertical'||kind==='cliff'?<><path d="M185 30V200" stroke="#9fb3b5" strokeDasharray="4 5"/><path d={kind==='cliff'?'M158 155Q125 30 180 35Q233 40 210 211':'M158 155Q125 30 180 35Q233 40 210 155'} fill="none" stroke="#648e89" strokeWidth="3"/><circle cx="158" cy="155" r="7" fill="#bd8d73"/><path d="M120 156H250" stroke="#899fac"/><text x="250" y="161">y = 0</text><text x="215" y="41">apex</text>{kind==='cliff'&&<><path d="M85 156V211H285" fill="none" stroke="#899fac"/><text x="247" y="208">−75 m</text></>}</>:kind==='trains'?<><path d="M35 145H325M35 155H325" stroke="#9db1b5"/><rect x="40" y="100" width="85" height="35" rx="9" fill="#b5a4ca"/><rect x="240" y="100" width="85" height="35" rx="9" fill="#83bcb2"/><text x="139" y="83">9.5 km</text><text x="43" y="185">155 km/h →</text><text x="227" y="185">← 155 km/h</text></>:<><path d="M38 145H325" stroke="#9db1b5"/><circle cx="50" cy="145" r="6" fill="#648e89"/><circle cx="185" cy="145" r="6" fill="#b5a4ca"/><circle cx="310" cy="145" r="6" fill="#bd8d73"/><path d="M55 115H150M200 115H305" stroke="#648e89" strokeWidth="2"/><text x="48" y="105">start →</text><text x="207" y="105">→ finish</text><text x="85" y="184">Track distance and elapsed time</text></>}
 </svg><figcaption>{caption}</figcaption></figure>;
}
