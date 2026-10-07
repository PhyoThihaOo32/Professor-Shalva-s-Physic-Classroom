// Independent deterministic reference calculations; no generated expressions are executed.
export const physics={
 centripetal:(v:number,r:number)=>v*v/r,
 flatRoad:(mu:number,g:number,r:number)=>Math.sqrt(mu*g*r),
 topMinimum:(g:number,r:number)=>Math.sqrt(g*r),
 topNormal:(m:number,v:number,r:number,g:number)=>m*(v*v/r-g),
 bottomTension:(m:number,v:number,r:number,g:number)=>m*(v*v/r+g),
 conicalSpeed:(length:number,degrees:number,g:number)=>{const angle=degrees*Math.PI/180;return Math.sqrt(length*Math.sin(angle)*g*Math.tan(angle));},
 rpmToRadians:(rpm:number)=>rpm*2*Math.PI/60,
 cmToMetres:(cm:number)=>cm/100,
};
export function circleTargets(){return [physics.centripetal(6,3),physics.flatRoad(.4,9.81,50),physics.topMinimum(9.81,.8),physics.bottomTension(.5,4,1,9.81),physics.conicalSpeed(1.2,30,9.81),physics.rpmToRadians(120)**2*physics.cmToMetres(20)];}
export function radialBalanceResidual({weight,normal,mass,speed,radius,outwardPositive=false}:{weight:number;normal:number;mass:number;speed:number;radius:number;outwardPositive?:boolean}){const sign=outwardPositive?-1:1;return sign*(weight+normal)-sign*mass*speed**2/radius;}
