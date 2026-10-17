import {useId,type CSSProperties} from 'react';

export function ProfessorPortrait({id,name,size,color}:{id:string;name:string;size:number;color:string}){
 const rick=id==='rick-v1',frink=id==='frink-v1';
 const clipId=useId();
 return <svg className={`student-avatar professor-avatar avatar-${id}`} width={size} height={size} viewBox="0 0 96 96" role="img" aria-label={`${name} illustrated portrait`} style={{'--avatar-size':`${size}px`} as CSSProperties}>
  <defs><clipPath id={clipId}><circle cx="48" cy="48" r="48"/></clipPath></defs>
  <g clipPath={`url(#${clipId})`}><circle cx="48" cy="48" r="48" fill={color}/>
   {rick?<>
    <path d="M13 96q3-27 35-27t35 27" fill="#eff2ed"/><path d="M35 70l13 17 13-17v26H35" fill="#81b9ae"/>
    <path d="M24 49L12 37l15-2-8-18 18 9L40 5l11 18 18-13-2 20 17-1-12 18" fill="#84b5c8"/>
    <path d="M29 35q19-12 37 0l-2 26q-4 13-16 13T31 61Z" fill="#e8cbb2"/>
    <path d="M33 41h28" stroke="#749fae" strokeWidth="5" strokeLinecap="round"/><ellipse cx="39" cy="48" rx="8" ry="9" fill="#fbfcf7"/><ellipse cx="56" cy="48" rx="8" ry="9" fill="#fbfcf7"/>
    <circle cx="40" cy="49" r="2" fill="#344458"/><circle cx="55" cy="49" r="2" fill="#344458"/><path d="M48 50l-3 9h6M39 65q10-4 18-1" fill="none" stroke="#59626b" strokeWidth="2" strokeLinecap="round"/>
    <path d="M30 72l-6 10 13 1-3 13M66 72l6 10-13 1 3 13" fill="none" stroke="#acb7b6" strokeWidth="2"/>
   </>:frink?<>
    <path d="M13 96q2-24 35-24t35 24" fill="#f1eee5"/><path d="M40 75l8 9 8-9v21H40" fill="#b2b5c7"/><path d="M43 80l5 4 5-4-2 16h-6Z" fill="#b290bb"/>
    <path d="M29 36q-4-17 11-21 18-6 28 10l-8-2 3 11" fill="#59634f"/>
    <path d="M31 28q17-8 30 2l3 31q-1 17-16 17T31 62Z" fill="#e9ca76"/>
    <path d="M58 49l14 8-12 4" fill="#e9ca76" stroke="#89765e" strokeWidth="1.5"/>
    <g fill="#faf7e9" stroke="#4b5a62" strokeWidth="2.5"><circle cx="36" cy="46" r="11"/><circle cx="58" cy="46" r="11"/></g><circle cx="38" cy="47" r="2" fill="#344458"/><circle cx="59" cy="47" r="2" fill="#344458"/>
    <path d="M40 65q8 6 16-1" fill="none" stroke="#89765e" strokeWidth="2" strokeLinecap="round"/><path d="M32 76l5 20M63 76l-5 20" stroke="#a9b7b5" strokeWidth="2"/>
   </>:<>
    <path d="M12 96q4-23 36-23t36 23" fill="#343448"/><path d="M25 63V37q0-25 23-25t24 25v34H25Z" fill="#343448"/>
    <path d="M33 34q15-4 30 0v26q-2 15-15 15T33 60Z" fill="#e5bdac"/><path d="M26 35q19-4 43 0l-6-16H34Z" fill="#343448"/>
    <g fill="#a7bbc2" stroke="#292b3c" strokeWidth="4"><circle cx="35" cy="47" r="13"/><circle cx="61" cy="47" r="13"/></g><path d="M45 46h5" stroke="#292b3c" strokeWidth="4"/>
    <circle cx="37" cy="47" r="2" fill="#303449"/><circle cx="59" cy="47" r="2" fill="#303449"/><path d="M48 50l-2 8h5M42 65h12" fill="none" stroke="#9b726a" strokeWidth="2" strokeLinecap="round"/>
    <path d="M38 77l10 8 10-8" fill="none" stroke="#9e94b5" strokeWidth="2"/>
   </>}
  </g>
 </svg>;
}
