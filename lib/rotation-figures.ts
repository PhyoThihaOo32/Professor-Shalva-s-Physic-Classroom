// Public givens and figure labels only. Worked answers stay in chapter-ten.ts.
type Kind='angle'|'carousel'|'acceleration'|'rim'|'rate'|'earth'|'polynomial'|'compound'|'pedal'|'door'|'cylinder'|'tangent'|'hand'|'masses'|'axes'|'race'|'velocities'|'work'|'resistance'|'dynamics'|'energy';
export type RotationFigure={kind:Kind;heading:string;labels:string[]};
const figures:Record<string,RotationFigure>={
 'ch10-bird-resolution':{kind:'angle',heading:'Angular resolution · angle exaggerated',labels:['R = 100 m','θ = 3.0 × 10⁻⁴ rad','Detail width ℓ = ?']},
 'ch10-carousel-speeds':{kind:'carousel',heading:'One rigid carousel · one shared ω',labels:['Lion: R/2','Horse: R','Compare tangential speeds']},
 'ch10-carousel-acceleration':{kind:'acceleration',heading:'Carousel · starts from rest',labels:['R = 2.5 m','α = 0.060 rad/s² · t = 8.0 s','Tangential and radial components are perpendicular']},
 'ch10-hard-drive':{kind:'rim',heading:'Hard-drive track · 7200 rpm',labels:['R = 3.00 cm','Bit length = 0.50 μm','Reader samples one circular track']},
 'ch10-angular-speed-function':{kind:'acceleration',heading:'ω(t) = 1.6 + 1.2t rad/s',labels:['R = 3.0 m','Evaluate at t = 2.0 s','Velocity is tangent; radial acceleration points inward']},
 'ch10-centrifuge-startup':{kind:'rate',heading:'Uniform startup · angular speed vs. time',labels:['20,000 rpm','30 s','Area counts turns after time conversion']},
 'ch10-grinding-wheel':{kind:'rim',heading:'Grinding wheel · 2400 rpm',labels:['Diameter = 0.35 m','Use half the diameter as R','Rim speed is tangent to the circular path']},
 'ch10-earth-angular-velocity':{kind:'earth',heading:'Two rotations · not to scale',labels:['Orbit: 365 days','Spin: 24 h','One full turn corresponds to 2π rad']},
 'ch10-centrifuge-revolutions':{kind:'rate',heading:'Uniform startup · angular speed vs. time',labels:['15,000 rpm','220 s','Use the average rate during startup']},
 'ch10-angular-position-function':{kind:'polynomial',heading:'θ(t) = 9.5t − 13.0t² + 1.6t⁴',labels:['Interval: 2.0–3.0 s','Secant → average rate','Tangent → instantaneous rate']},
 'ch10-original-compound-wheel':{kind:'compound',heading:'Counterclockwise positive · central axis',labels:['Rₐ = 0.30 m','Rᵦ = 0.50 m','Fₐ = Fᵦ = 50 N']},
 'ch10-bicycle-pedal':{kind:'pedal',heading:'Maximum pedal torque · horizontal crank',labels:['r = 0.17 m','Downward F = mg','m = 58 kg']},
 'ch10-door-torque':{kind:'door',heading:'Door seen from above · two force directions',labels:['r = 0.96 m','F = 37 N in each case','Angle is measured from hinge-to-handle radius']},
 'ch10-original-hollow-cylinder':{kind:'cylinder',heading:'Uniform hollow cylinder · central axis',labels:['R₁ = 0.10 m','R₂ = 0.20 m','M = 6.0 kg']},
 'ch10-original-tangent-cylinder':{kind:'tangent',heading:'Solid cylinder · two parallel axes',labels:['R = 0.30 m','h = R','M = 4.0 kg']},
 'ch10-original-right-hand-rule':{kind:'hand',heading:'Counterclockwise disk slowing to rest',labels:['ωᵢ = 6.0 rad/s','Final ω = 0 · Δt = 3.0 s','Viewed from above: +z is out of the page']},
 'ch10-original-point-masses':{kind:'masses',heading:'Same two masses · different radii',labels:['Each mass: 2.0 kg','Initial radius: 1.0 m','Final radius: 2.0 m']},
 'ch10-original-perpendicular-axes':{kind:'axes',heading:'Thin disk · axes meet at the center',labels:['M = 2.0 kg · R = 0.40 m','x and y lie in the disk','z is perpendicular to the disk']},
 'ch10-original-rolling-race':{kind:'race',heading:'Equal starting height · h = 1.20 m',labels:['Block: frictionless sliding','Sphere, cylinder, hoop: no slipping','Compare I/(MR²), not I alone']},
 'ch10-original-rolling-velocities':{kind:'velocities',heading:'Rolling to the right · ground frame',labels:['R = 0.50 m','vCM = 3.0 m/s','Add translation and rotation at each point']},
 'ch10-original-torque-work':{kind:'work',heading:'Constant torque · area gives work',labels:['τ = +12 N·m','Δθ = +3.0 rad','Reverse the displacement to reverse the work']},
 'ch10-original-rolling-resistance':{kind:'resistance',heading:'Real rolling contact · deformation',labels:['M = 2.0 kg · R = 0.10 m','Initial vCM = 1.0 m/s','Normal resultant shifted ahead of the center']},
 'ch10-original-angular-displacement':{kind:'angle',heading:'Spoke motion · counterclockwise positive',labels:['R = 1.5 m','30° → 150°','Δt = 4.0 s · no extra turns']},
 'ch10-original-rotational-dynamics':{kind:'dynamics',heading:'Uniform disk · fixed central axle',labels:['M = 4.0 kg · R = 0.50 m','Tangential F = 6.0 N','Counterclockwise torque is positive']},
 'ch10-original-rotational-energy':{kind:'energy',heading:'Rigid rotor · fixed rotation axis',labels:['I = 0.20 kg·m²','ω = 6.0 rad/s','Mass farther from the axis moves faster']}
};
export function rotationFigure(id?:string):RotationFigure|undefined{
 return id&&Object.hasOwn(figures,id)?figures[id]:undefined;
}
