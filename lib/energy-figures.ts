// Public diagram selection and givens only; no reference solutions.
const energyFigures={
 'ch7-pile-driver':'fall',
 'ch7-rough-crate':'crate',
 'ch7-accelerating-box':'acceleration',
 'ch7-book-stack':'books',
 'ch7-original-gondola':'gondola',
 'ch7-ramp-cart':'ramp',
 'ch7-dot-variable':'variable',
 'ch7-original-dot-combinations':'components',
 'ch7-vector-axis-angles':'axes',
 'ch7-spring-work':'spring',
 'ch7-kinetic-factors':'ratios',
 'ch7-car-stop-restart':'car',
 'ch7-friction-stop':'stop'
} as const;
export type EnergyFigureKind=typeof energyFigures[keyof typeof energyFigures];
export function energyFigure(id?:string):EnergyFigureKind|undefined{
 return id&&Object.hasOwn(energyFigures,id)?energyFigures[id as keyof typeof energyFigures]:undefined;
}
