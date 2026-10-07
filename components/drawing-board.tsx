'use client';
import {useId,useRef,useState} from 'react';
import {Pencil,MoveUpRight,Type,Undo2,Trash2,Plus} from 'lucide-react';
import {drawingColors,type BoardDrawing,type DrawingElement} from '@/lib/drawing';
import {layoutDrawing,type LabelLayout} from '@/lib/drawing-layout';
import {plainMath} from '@/lib/math-text';
const emptyDrawing=():BoardDrawing=>({title:'Teacher annotations',description:'Annotations shared by the teacher.',elements:[]});
function Marks({elements,prefix}:{elements:DrawingElement[];prefix:string}){
 return elements.map((mark,i)=>{
  const color=drawingColors[mark.color];
  if(mark.kind==='region')return <polygon key={i} points={mark.points.map(p=>`${p.x},${p.y}`).join(' ')} fill={color} fillOpacity=".18" stroke={color} strokeOpacity=".35" strokeWidth="2"/>;
  if(mark.kind==='text')return <text key={i} x={mark.x} y={mark.y} fill={color} fontSize="25" fontFamily="inherit">{plainMath(mark.text)}</text>;
  if(mark.kind==='circle')return <circle key={i} cx={mark.cx} cy={mark.cy} r={mark.r} stroke={color} fill="none" strokeWidth="3"/>;
  if(mark.kind==='path')return <path key={i} d={mark.points.map((point,j)=>`${j?'L':'M'}${point.x},${point.y}`).join(' ')} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>;
  return <line key={i} x1={mark.x1} y1={mark.y1} x2={mark.x2} y2={mark.y2} stroke={color} strokeWidth="3" strokeLinecap="round" markerEnd={mark.kind==='arrow'?`url(#${prefix}-${mark.color})`:undefined}/>;
 });
}
function StudentMarks({drawing,prefix}:{drawing:BoardDrawing;prefix:string}){
 const {labels}=layoutDrawing(drawing);
 return <><Marks elements={drawing.elements.filter(mark=>mark.kind!=='text')} prefix={prefix}/>{labels.map(label=><g key={label.index}>
  {Math.hypot(label.x-label.anchor.x,label.y+28-label.anchor.y)>42&&<line x1={label.anchor.x} y1={label.anchor.y} x2={label.x+label.width/2} y2={label.y+label.height/2} stroke={drawingColors[label.color]} strokeWidth="1.5" strokeDasharray="4 5" opacity=".6"/>}
  <g className={label.callout?'diagram-label callout':'diagram-label'}><rect x={label.x-6} y={label.y-4} width={label.width+12} height={label.height+8} rx="8" fill="#f2f4ed"/><text x={label.x} y={label.y+27} fill={drawingColors[label.color]} fontSize="28" fontFamily="inherit">{label.lines.map((line,i)=><tspan key={i} x={label.x} dy={i?36:0}>{line}</tspan>)}</text></g>
  <g className={label.callout?'diagram-mobile-number is-callout':'diagram-mobile-number'}><circle cx={label.x+20} cy={label.y+20} r="30" fill="#f2f4ed" stroke={drawingColors[label.color]} strokeWidth="2"/><text x={label.x+20} y={label.y+36} textAnchor="middle" fontSize="48" fill={drawingColors[label.color]}>{label.number}</text></g>
 </g>)}</>;
}
function LabelLegend({labels}:{labels:LabelLayout[]}){return <ol className="diagram-legend">{labels.map(label=><li key={label.index} className={label.callout?'is-callout':''}><span className="diagram-legend-number">{label.number}</span>{label.text}</li>)}</ol>;}
function PaperDefs({prefix}:{prefix:string}){return <defs><pattern id={`${prefix}-grid`} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#81939e" strokeOpacity=".14" strokeWidth="1"/></pattern>{Object.entries(drawingColors).map(([color,fill])=><marker key={color} id={`${prefix}-${color}`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0L8 4.5L0 9" fill={fill}/></marker>)}</defs>;}
export function DrawingView({drawing,preservePositions=false}:{drawing:BoardDrawing;preservePositions?:boolean}){
 const prefix=useId().replace(/:/g,''),layout=layoutDrawing(drawing);
 return <figure className="student-drawing"><svg viewBox={preservePositions?'0 0 1000 600':layout.viewBox} role="img" aria-label={`${plainMath(drawing.title)}. ${plainMath(drawing.description)}`}><desc>{plainMath(drawing.description)}</desc><PaperDefs prefix={prefix}/><rect width="1000" height="600" fill={`url(#${prefix}-grid)`}/>{preservePositions?<Marks elements={drawing.elements} prefix={prefix}/>:<StudentMarks drawing={drawing} prefix={prefix}/>}</svg><figcaption><strong>{plainMath(drawing.title)}</strong>{drawing.description&&<p>{plainMath(drawing.description)}</p>}{!preservePositions&&<LabelLegend labels={layout.labels}/>}</figcaption></figure>;
}
export function DrawingBoard({drawing,annotations,onChange,disabled=false}:{drawing?:BoardDrawing|null;annotations:BoardDrawing|null;onChange:(drawing:BoardDrawing)=>void;disabled?:boolean}){
 const prefix=useId().replace(/:/g,''),svg=useRef<SVGSVGElement>(null),labelInput=useRef<HTMLInputElement>(null);
 const [tool,setTool]=useState<'pen'|'arrow'|'text'>('pen'),[label,setLabel]=useState(''),[preview,setPreview]=useState<DrawingElement|null>(null);
 const gesture=useRef<DrawingElement|null>(null),[notice,setNotice]=useState('');
 const marks=annotations?.elements??[];
 function point(e:React.PointerEvent<SVGSVGElement>){const matrix=e.currentTarget.getScreenCTM();const p=matrix?new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse()):new DOMPoint(0,0);return {x:Math.round(Math.max(0,Math.min(1000,p.x))*10)/10,y:Math.round(Math.max(0,Math.min(600,p.y))*10)/10};}
 function add(mark:DrawingElement){if(marks.length>=30){setNotice('The paper has 30 marks. Undo or clear an annotation to add another.');return;}setNotice('');onChange({...annotations??emptyDrawing(),elements:[...marks,mark]});}
 function start(e:React.PointerEvent<SVGSVGElement>){if(disabled||e.button!==0)return;const p=point(e);if(tool==='text'){if(label.trim()){add({kind:'text',...p,text:label.trim(),color:'coral'});setLabel('');}else labelInput.current?.focus();return;}e.currentTarget.setPointerCapture(e.pointerId);gesture.current=tool==='arrow'?{kind:'arrow',x1:p.x,y1:p.y,x2:p.x,y2:p.y,color:'coral'}:{kind:'path',points:[p],color:'coral'};setPreview(gesture.current);}
 function move(e:React.PointerEvent<SVGSVGElement>){const draft=gesture.current;if(!draft)return;const p=point(e);if(draft.kind==='arrow')gesture.current={...draft,x2:p.x,y2:p.y};else if(draft.kind==='path'){const last=draft.points.at(-1)!;if(Math.hypot(last.x-p.x,last.y-p.y)<3)return;gesture.current={...draft,points:draft.points.length<80?[...draft.points,p]:[...draft.points.slice(0,-1),p]};}setPreview(gesture.current);}
 function end(e:React.PointerEvent<SVGSVGElement>){move(e);const draft=gesture.current;gesture.current=null;setPreview(null);if(!draft)return;if(draft.kind==='path'&&draft.points.length>=2)add(draft);if(draft.kind==='arrow'&&Math.hypot(draft.x2-draft.x1,draft.y2-draft.y1)>=4)add(draft);}
 return <div className="drawing-board">
  {!disabled&&<div className="drawing-tools" role="group" aria-label="Diagram tools">{([{id:'pen',name:'Pen',icon:Pencil},{id:'arrow',name:'Arrow',icon:MoveUpRight},{id:'text',name:'Label',icon:Type}] as const).map(t=><button key={t.id} type="button" title={t.name} aria-label={t.name} aria-pressed={tool===t.id} onClick={()=>setTool(t.id)}><t.icon size={16}/></button>)}<span className="drawing-tool-spacer"/><button type="button" title="Undo annotation" aria-label="Undo annotation" disabled={!marks.length} onClick={()=>{setNotice('');onChange({...annotations??emptyDrawing(),elements:marks.slice(0,-1)});}}><Undo2 size={16}/></button><button type="button" title="Clear annotations" aria-label="Clear annotations" disabled={!marks.length} onClick={()=>{setNotice('');onChange(emptyDrawing());}}><Trash2 size={16}/></button></div>}
  {!disabled&&tool==='text'&&<div className="drawing-label-input"><input ref={labelInput} aria-label="Diagram label" placeholder="Write a label…" maxLength={140} value={label} onChange={e=>setLabel(e.target.value)}/><button type="button" aria-label="Add label to paper" title="Add label to paper" disabled={!label.trim()} onClick={()=>{add({kind:'text',x:400,y:300,text:label.trim(),color:'coral'});setLabel('');}}><Plus size={16}/></button></div>}
  <svg ref={svg} className={`drawing-paper${disabled?'':' editable'}`} viewBox="0 0 1000 600" role="img" aria-label={drawing?`${drawing.title}. ${drawing.description}`:'Shared drawing paper'} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={()=>{gesture.current=null;setPreview(null);}}><PaperDefs prefix={prefix}/><rect width="1000" height="600" fill={`url(#${prefix}-grid)`}/>{drawing&&<StudentMarks drawing={drawing} prefix={prefix}/>}<Marks elements={marks} prefix={prefix}/>{preview&&<Marks elements={[preview]} prefix={prefix}/>}</svg>
  {notice&&<p className="tiny" role="status">{notice}</p>}
 </div>;
}
