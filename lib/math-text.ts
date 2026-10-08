// Presentation only: preserve the student's arithmetic while making notation readable.
export type MathPart={kind:'text';value:string}|{kind:'math';value:string;block:boolean};
const rawNotation=/\\[a-zA-Z]+|\\?[_^](?:\{|[a-zA-Z0-9])/;
const mathWords=new Set('sin cos tan cot sec csc arcsin arccos arctan sinh cosh tanh log exp lim max min sup inf det gcd mod lcm grad div curl deg rad mol min rpm kg km hz khz mhz pa kpa mpa atm ev kev mev gev'.split(' '));
export function isProseMath(source:string):boolean {
 // English outside math labels would be typeset as individual, unspaced variables.
 // Protect units, named subscripts, and text labels before looking for prose.
 const bare=source.replace(/\\(?:text|mathrm|operatorname|mathbf|mathit|mathsf|mathtt|begin|end)\s*\{(?:[^{}]|\{[^{}]*\})*\}|[_^]\s*\{(?:[^{}]|\{[^{}]*\})*\}/g,' ')
  .replace(/\\[A-Za-z]+|[_^][A-Za-z]+/g,' ');
 return (bare.match(/\b[A-Za-z]{3,}\b/g)??[]).some(word=>!mathWords.has(word.toLowerCase()));
}
export function plainMath(text:string):string {
 const symbols:Record<string,string>={times:'×',cdot:'·',div:'÷',approx:'≈',leq:'≤',geq:'≥',neq:'≠',pm:'±',Delta:'Δ',theta:'θ',pi:'π',alpha:'α',beta:'β',omega:'ω',infty:'∞'};
 const group=(source:string,start:number):[string,number]=>{if(source[start]!=='{')return ['',start];let depth=1,i=start+1;for(;i<source.length&&depth;i++){if(source[i]==='{')depth++;else if(source[i]==='}')depth--;}return [source.slice(start+1,depth?i:i-1),i];};
 function convert(source:string,depth=0):string {
  if(depth>10)return source.replace(/[{}\\]/g,'');
  let out='';
  for(let i=0;i<source.length;){
   if(source[i]==='\\'){
    const match=/^\\([A-Za-z]+|.)/.exec(source.slice(i));if(!match){i++;continue;}const command=match[1];i+=match[0].length;
    if(command==='frac'||command==='dfrac'||command==='tfrac'){const [a,next]=group(source,i);const [b,end]=group(source,next);if(next!==i&&end!==next){out+=`(${convert(a,depth+1)}) ÷ (${convert(b,depth+1)})`;i=end;continue;}}
    if(['text','mathrm','operatorname','mathbf','mathit','sqrt','begin','end'].includes(command)){const [value,end]=group(source,i);if(end!==i){if(command==='sqrt')out+=`√(${convert(value,depth+1)})`;else if(!['begin','end'].includes(command))out+=convert(value,depth+1);i=end;continue;}}
    if(symbols[command])out+=symbols[command];else if(['quad','qquad',',',';','!',' ','\\'].includes(command))out+=' ';else if(['left','right','displaystyle','[',']','(',')'].includes(command)){}else if(command==='_'||command==='^')out+=command;else out+=command;
   }else if(source[i]==='_'||source[i]==='^'){
    const op=source[i++],hasGroup=source[i]==='{';const [value,end]=group(source,i);const sub=hasGroup?value:(source[i++]??'');if(hasGroup)i=end;
    const digits:Record<string,string>=op==='_'?{'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','-':'₋'}:{'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
    out+=/^-?\d+$/.test(sub)?[...sub].map(c=>digits[c]).join(''):`${op==='_'?'(':'^('}${convert(sub,depth+1)})`;
   }else{out+=source[i++];}
  }
  return out.replace(/[{}]/g,'');
 }
 return convert(text.replace(/\\_/g,'_')).replace(/[ \t]+/g,' ').trim();
}
function rawParts(text:string):MathPart[]{
 // A decimal point is not a sentence boundary. Existing prose stays prose.
 const sentences=text.split(/((?<=[.!?])\s+(?=[A-Z])|\r?\n+)/);
 return sentences.flatMap((sentence):MathPart[]=>{
  if(!rawNotation.test(sentence))return [{kind:'text',value:sentence}];
  const match=/(?:[A-Za-z][A-Za-z0-9]*(?:\\?[_^](?:\{[^{}]+\}|[A-Za-z0-9]+))*\s*(?:=|\\approx)|\\(?:frac|dfrac|tfrac|sqrt)\b)/.exec(sentence);
  if(!match)return [{kind:'text',value:plainMath(sentence)}];
  const start=match.index;let end=sentence.length,depth=0;
  // Stop before ordinary prose, but keep units and words inside \text{...}.
  for(let i=start;i<sentence.length;i++){
   if(sentence[i]==='{')depth++;else if(sentence[i]==='}')depth--;
   if(depth===0&&/\s/.test(sentence[i])){const word=/^\s+([A-Za-z]{3,})\b/.exec(sentence.slice(i));if(word&&!['rad','mol','Hz'].includes(word[1])){end=i;break;}}
  }
  const suffix=sentence.slice(end);let math=sentence.slice(start,end).trim().replace(/\\_/g,'_');let punctuation='';
  if(/[.!?]$/.test(math)){punctuation=math.at(-1)!;math=math.slice(0,-1);}
  return [{kind:'text',value:sentence.slice(0,start)},{kind:'math',value:math,block:false},{kind:'text',value:punctuation+suffix}];
 });
}
export function mathParts(text:string):MathPart[]{
 const pattern=/```(?:math|latex|tex)\s*\n?([\s\S]*?)```|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g;
 const parts:MathPart[]=[];let cursor=0;
 for(const match of text.matchAll(pattern)){
  const index=match.index!;parts.push(...rawParts(text.slice(cursor,index)));
  const value=match[1]??match[2]??match[3]??match[4]??match[5];
  if(match[5]&&/^\d+(?:[.,]\d+)?\s+(?:and|or|to)\b/.test(value))parts.push({kind:'text',value:match[0]});
  else if(isProseMath(value))parts.push(...rawParts(value.trim()));
  else if(match[5]&&!/[=+*/_^\\]|^[A-Za-z]$/.test(value))parts.push({kind:'text',value:match[0]});
  else parts.push({kind:'math',value:value.trim().replace(/\\_/g,'_'),block:match[1]!==undefined||match[2]!==undefined||match[4]!==undefined});
  cursor=index+match[0].length;
 }
 parts.push(...rawParts(text.slice(cursor)));return parts.filter(p=>p.value.length).reduce<MathPart[]>((result,part)=>{const last=result.at(-1);if(last?.kind==='text'&&part.kind==='text')last.value+=part.value;else result.push(part);return result;},[]);
}
export function explanationLines(text:string):string[]{
 return text.split(/\r?\n+|(?<=[.!?])\s+(?=[A-Z][a-z]+\s+(?:leg|distance|speed|time):)|\s+(?=(?:First leg time|Second leg time|Remaining time|Second leg distance|Total distance|Average speed):)/).map(line=>line.trim().replace(/^[-•]\s*/, '')).filter(Boolean);
}
export function equationLines(math:string):string[]{
 if(/\\begin\{/.test(math))return [math];
 const lines:string[]=[];let start=0,depth=0;
 for(let i=0;i<math.length;i++){
  if(math[i]==='{')depth++;else if(math[i]==='}')depth--;
  if(depth!==0)continue;
  const separator=/^(?:,?\s*\\(?:qquad|quad)\s*|[,;]\s*(?=[A-Za-z][A-Za-z0-9_{}\\]*\s*=))/.exec(math.slice(i));
  if(separator){const value=math.slice(start,i).trim().replace(/[,;]$/,'');if(value)lines.push(value);i+=separator[0].length-1;start=i+1;}
 }
 const last=math.slice(start).trim();if(last)lines.push(last);return lines.length>8?[math]:lines;
}
export function equationFragments(math:string):string[]{
 if(math.length<70||/\\begin\{/.test(math))return [math];
 const fragments:string[]=[];let start=0,depth=0,seenRelation=false;
 for(let i=0;i<math.length;i++){
  if(math[i]==='{')depth++;else if(math[i]==='}')depth--;
  if(depth!==0)continue;
  const relation=/^(?:=|\\approx\b)/.exec(math.slice(i));
  if(!relation)continue;
  if(seenRelation){const fragment=math.slice(start,i).trim();if(fragment)fragments.push(fragment);start=i;}
  seenRelation=true;i+=relation[0].length-1;
 }
 const last=math.slice(start).trim();if(last)fragments.push(last);return fragments;
}
