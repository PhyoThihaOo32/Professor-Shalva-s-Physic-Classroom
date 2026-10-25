// Public givens shared by original-practice statements and their figures.
export const practiceVectors={A:{x:4,y:3},B:{x:-2,y:5},C:{x:3,y:-4}} as const;
export const practicePositionPoints=[{t:0,x:0},{t:2,x:8},{t:4,x:8},{t:6,x:2},{t:8,x:2},{t:10,x:12}] as const;
export const practiceDrone={firstDistance:120,angle:30,westDistance:90} as const;
export const practiceProjectile={speed:20,angle:30,g:9.8} as const;
export const practiceBoat={width:200,northSpeed:4,current:1.5} as const;
export const originalPracticeFigures={
 'ch2-original-position-graph':'position-graph',
 'ch3-original-vector-differences':'vector-pair',
 'ch3-original-vector-combinations':'vector-set',
 'ch3-original-drone-route':'drone-route',
 'ch3-original-projectile':'projectile',
 'ch3-original-river-crossing':'river-crossing'
} as const;
export type PracticeFigureKind=typeof originalPracticeFigures[keyof typeof originalPracticeFigures];
export function originalPracticeFigure(id?:string):PracticeFigureKind|undefined{
 if(!id||!Object.hasOwn(originalPracticeFigures,id))return;
 return originalPracticeFigures[id as keyof typeof originalPracticeFigures];
}
