export const problemSolvingGuide=[
 {title:'Read carefully',detail:'Read the whole problem until you understand it. Then read it again.'},
 {title:'Define the motion',detail:'Identify the objects under study and the time interval.'},
 {title:'Sketch and choose axes',detail:'Draw a diagram. Choose coordinate axes and positive directions.'},
 {title:'List knowns and unknowns',detail:'Write the given quantities with their units, then the quantities you need to find.'},
 {title:'Plan the physics',detail:'Decide which physics applies and plan an approach to the solution.'},
 {title:'Solve with symbols first',detail:'Choose equations that connect the knowns and unknowns. Check that they apply, solve algebraically, and check the dimensions.'},
 {title:'Calculate and round',detail:'Substitute values and round the final result to an appropriate number of significant figures.'},
 {title:'Check reasonableness',detail:'Does the result make sense? Compare it with a rough estimate.'},
 {title:'Check units again',detail:'Check the units of your final answer again.'},
] as const;

export const rotationalDynamicsGuide=[
 {title:'Sketch the situation',detail:'Draw the objects, their motion, and the geometry. Label distances and angles.'},
 {title:'Define the system',detail:'Decide which objects belong to your system and which interactions are external.'},
 {title:'Draw each free-body diagram',detail:'Show every external force on each object, including its direction and point of application. Torque comes from forces; do not add it as another force.'},
 {title:'Choose the rotation axis',detail:'Mark the pivot or axis and choose a positive rotation direction. Calculate signed torques using perpendicular lever arms: τ = rF sin θ.'},
 {title:'Apply the rotational law',detail:'Find the moment of inertia about that same axis. For fixed-axis rotation with constant inertia, use Στ = Iα. Use a more general angular-momentum balance if that model does not apply.'},
 {title:'Connect translation and rotation',detail:'Use ΣF = ma for any translating object. Add the appropriate constraint, such as a = Rα or v = Rω for rolling without slipping, only when it applies.'},
 {title:'Solve the equations',detail:'Solve symbolically first, then substitute consistent SI units. Convert rpm to rad/s and use radians in rotational kinematics, work, and energy equations.'},
 {title:'Check the result',detail:'Check units, signs, and order of magnitude. Test a simple limit: a force through the pivot gives zero torque, and zero net torque gives zero angular acceleration when inertia is constant.'},
] as const;

export function guideForChapter(chapterId?:string){
 return chapterId==='chapter-10'?{
  steps:rotationalDynamicsGuide,subtitle:'Chapter 10 · Solving problems in rotational dynamics',
  source:'Adapted from the two Chapter 10 lecture slides supplied by the user. Pearson Education, 2009.',
 }: {
  steps:problemSolvingGuide,subtitle:'Take a moment to plan, solve, and check.',
  source:'From the Chapter 2 problem-solving guide.',
 };
}

export const problemSolvingGuideInstructions=`Professor Shalva’s problem-solving guide is a learning scaffold:\n${problemSolvingGuide.map((step,i)=>`${i+1}. ${step.title}: ${step.detail}`).join('\n')}\nUse this approach as the teacher guides you. Show the relevant attempted sketch, givens, assumptions, equation, or check when asked; do not recite the checklist in conversation. You are still a student with the supplied personality and imperfect habits: do not automatically complete every checklist item or produce a polished correct answer on the first attempt. A skipped step or unchecked assumption should remain visible for the teacher to investigate. After specific guidance, revisit the relevant checklist item, redo your work, and carry the lesson forward.`;
