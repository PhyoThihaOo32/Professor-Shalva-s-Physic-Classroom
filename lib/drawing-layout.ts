import type {BoardDrawing,DrawingElement} from './drawing';
import {plainMath} from './math-text';
export type LabelLayout={index:number;number:number;x:number;y:number;width:number;height:number;lines:string[];text:string;color:DrawingElement['color'];anchor:{x:number;y:number};callout:boolean};
type Box={x:number;y:number;width:number;height:number};
const overlaps=(a:Box,b:Box,gap=12)=>a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;
function segmentHits(box:Box,a:{x:number;y:number},b:{x:number;y:number}){
 // Liang–Barsky clipping against a padded label rectangle.
 const x=box.x-8,y=box.y-8,w=box.width+16,h=box.height+16,dx=b.x-a.x,dy=b.y-a.y;
 let low=0,high=1;
 for(const [p,q] of [[-dx,a.x-x],[dx,x+w-a.x],[-dy,a.y-y],[dy,y+h-a.y]]){
  if(p===0){if(q<0)return false;continue;}const t=q/p;if(p<0)low=Math.max(low,t);else high=Math.min(high,t);if(low>high)return false;
 }return true;
}
function hitsGeometry(box:Box,elements:DrawingElement[]){return elements.some(mark=>{
 if(mark.kind==='text')return false;
 if(mark.kind==='line'||mark.kind==='arrow')return segmentHits(box,{x:mark.x1,y:mark.y1},{x:mark.x2,y:mark.y2});
 if(mark.kind==='path'||mark.kind==='region'){const points=mark.kind==='region'?[...mark.points,mark.points[0]]:mark.points;return points.slice(1).some((point,i)=>segmentHits(box,points[i],point));}
 const nearest=Math.hypot(Math.max(box.x-mark.cx,0,mark.cx-box.x-box.width),Math.max(box.y-mark.cy,0,mark.cy-box.y-box.height));
 const farthest=Math.max(...[box.x,box.x+box.width].flatMap(x=>[box.y,box.y+box.height].map(y=>Math.hypot(x-mark.cx,y-mark.cy))));
 return nearest<=mark.r+8&&farthest>=mark.r-8;
 });}
function wrap(text:string){const lines:string[]=[];let line='';for(const word of text.split(/\s+/)){if((line+' '+word).trim().length>23&&line){lines.push(line);line='';}line+=(line?' ':'')+word;}if(line)lines.push(line);return lines;}
export function layoutDrawing(drawing:BoardDrawing){
 const labels:LabelLayout[]=[];
 for(const [index,mark] of drawing.elements.entries()){
  if(mark.kind!=='text')continue;
  const text=plainMath(mark.text),wrapped=wrap(text),number=labels.length+1;
  let callout=wrapped.length>3||wrapped.some(line=>line.length>30),lines=callout?[String(number)]:wrapped;
  let width=callout?40:Math.max(40,...lines.map(line=>line.length*17)),height=callout?40:lines.length*36;
  const find=()=>{
   const candidates=[0,-64,64,-128,128,-192,192,-256,256].flatMap(dy=>[0,-160,160,-320,320].map(dx=>({x:Math.max(30,Math.min(970-width,mark.x+dx)),y:Math.max(30,Math.min(570-height,mark.y-28+dy)),width,height})));
   return candidates.find(box=>!labels.some(label=>overlaps(box,label))&&!hitsGeometry(box,drawing.elements));
  };
  let box=find();
  if(!box&&!callout){callout=true;lines=[String(number)];width=40;height=40;box=find();}
  // A dense sketch can retain an anchor badge; its full label always remains in the legend.
  box??={x:Math.max(30,Math.min(930,mark.x)),y:Math.max(30,Math.min(530,mark.y-28)),width,height};
  labels.push({...box,index,number,lines,text,color:mark.color,anchor:{x:mark.x,y:mark.y},callout});
 }
 const ys=drawing.elements.flatMap(mark=>mark.kind==='text'?[]:mark.kind==='circle'?[mark.cy-mark.r,mark.cy+mark.r]:(mark.kind==='path'||mark.kind==='region')?mark.points.map(p=>p.y):[mark.y1,mark.y2]);
 ys.push(...labels.flatMap(label=>[label.y,label.y+label.height,label.anchor.y]));
 const min=ys.length?Math.max(0,Math.min(...ys)-45):0,max=ys.length?Math.min(600,Math.max(...ys)+45):600;
 const height=Math.min(600,Math.max(300,max-min)),top=Math.max(0,Math.min(600-height,(min+max-height)/2));
 return {labels,viewBox:`0 ${top} 1000 ${height}`};
}
