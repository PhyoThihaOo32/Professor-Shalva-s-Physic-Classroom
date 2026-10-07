// Plain-language companion notes for the read-only Chapter 2 walkthroughs.
// These do not change the reviewed solutions or live classroom behavior.
const notes:Record<string,string[]>={
 'ch2-driving-home':[
  'Think of the trip as two separate journeys. The total time includes both, even though the speeds are different.',
  'Hours match km/h, so no unit conversion is needed. The rainy distance is unknown, but its travel time can be found.',
  'Dividing kilometres by kilometres per hour leaves hours. This tells us how much of the 4.5-hour trip has already passed.',
  'Only the time left after the first leg belongs to the rainy leg. Multiply that remaining time by the rainy speed to get its distance.',
  'Add the distances because both legs are part of the same route home. Then divide that combined distance by the full trip time.',
  'Average speed describes the entire journey as if it happened at one steady speed. Keep extra digits until the final answer.',
  'The two speeds do not necessarily last the same amount of time, so they cannot be given equal weight in a simple average.',
  'Report the distance and the average speed separately, with kilometres for distance and kilometres per hour for speed.'
 ],
 'ch2-two-trains':[
  'We need the time until the gap disappears. Each speed is measured relative to the ground, and both trains help close the gap.',
  'Choose right as positive. The left train moves right and the right train moves left; both motions reduce their separation.',
  'Each train reduces the gap at 155 km/h. Together the gap shrinks at 310 km/h, which is why we add the speeds.',
  'Imagine replacing the two trains with one object closing the whole gap. Its speed is the closing speed, so time is gap divided by speed.',
  'The distance is in kilometres and the speed is in km/h, so the division gives hours. Multiply by 3600 to express the same time in seconds.',
  'This is the elapsed time from the initial positions until the trains are alongside each other. Keep the unrounded value for a check.',
  'Equal speeds mean equal distances traveled before meeting. Each train covers half the original gap; their distances must add to 9.5 km.',
  'Seconds and minutes describe the same meeting time. About 110 seconds is a little less than two minutes.'
 ],
 'ch2-position-function':[
  'The formula tells us position at any time. Position is a location; it is different from the distance traveled along the path.',
  'Calculate several positions and place time on the horizontal axis. Connect the points with a smooth curve because the position changes continuously.',
  'Instantaneous velocity is the slope of the position graph. Differentiate each term: a constant gives zero, 10t gives 10, and −2t³ gives −6t².',
  'Subtract the initial position from the final position, then divide by the three-second interval. The sign tells us the direction of the net motion.',
  'At a turning point the position curve has a horizontal tangent. Set the velocity expression equal to zero before solving for time.',
  'Solving for time gives a positive and a negative root. Keep the positive root because the requested interval starts at t = 0.',
  'A positive slope means increasing position; a negative slope means decreasing position. The object can reverse direction even if its average velocity is negative.',
  'The graph, average velocity, and zero-velocity time answer three different questions. Keep the velocity unit m/s separate from the time unit s.'
 ],
 'ch2-bowling-ball':[
  'The measured delay contains two events: the ball rolls to the pins, then the sound travels back to the bowler.',
  'The ball and the sound each travel the lane length, but at different speeds. Their travel times must add to the measured delay.',
  'For constant speed, travel time is distance divided by speed. Divide the lane length by the known sound speed to find the sound’s return time.',
  'Subtract the sound return time from the total delay. The remaining time belongs only to the rolling ball.',
  'The ball’s speed is the lane length divided by its own travel time. Using the full delay would incorrectly include time after it reaches the pins.',
  'Keep the sound-return time unrounded while calculating the ball’s travel time. Round the final speed after dividing distance by that time.',
  'The ball takes less than 2.75 seconds to reach the pins. Its speed must therefore be slightly higher than lane length divided by 2.75 seconds.',
  'Report the ball’s speed in m/s. The sound travels much faster, but its small return delay still affects the result.'
 ],
 'ch2-sprinter':[
  'Starting from rest means the initial velocity is zero. The given elapsed time covers the change from rest to the final velocity.',
  'Choose the running direction as positive. Both the final velocity and the change in velocity are then positive.',
  'Average acceleration measures the change in velocity per unit time. It does not require acceleration to be constant throughout the sprint.',
  'Subtract the initial velocity from the final velocity. Because the sprinter starts at rest, the change equals the final velocity.',
  'Divide the velocity change by the full elapsed time. Do not divide by the final velocity or by an assumed distance.',
  'The result says how much the velocity increases each second on average during this interval.',
  'Dividing m/s by seconds gives m/s². A positive result matches a sprinter gaining speed in the chosen positive direction.',
  'Include the acceleration unit and direction. The result is an average over 1.48 seconds, rather than a value at one instant.'
 ],
 'ch2-stopping-car':[
  'The final velocity is zero because the car stops. We know the displacement but not the stopping time.',
  'Velocity and acceleration can point in different directions. With forward positive, slowing down requires a negative acceleration.',
  'Choose an equation containing the known velocities and displacement. This avoids introducing a time that the problem does not provide.',
  'Rearrange the equation before inserting numbers. Keeping the subtraction in the right order preserves the sign of the acceleration.',
  'Zero squared is zero. Subtracting the positive initial speed squared makes the numerator negative.',
  'The negative sign describes direction, not a negative speed. The acceleration acts opposite to the car’s forward motion.',
  'Put the result back into the original equation. The braking term should cancel the initial velocity squared at the stopping point.',
  'State the sign convention with the answer so the negative sign has a clear physical meaning.'
 ],
 'ch2-coasting-car':[
  'The acceleration uses seconds and metres, so convert the initial speed to m/s before using the motion equations.',
  '“During the fifth second” means from t = 4 s to t = 5 s. It does not mean the whole distance traveled in five seconds.',
  'Use the velocity equation for stopping time and the time-free equation for stopping distance. Position at the interval endpoints gives each one-second distance.',
  'The final velocity is zero. A negative acceleration and a positive initial velocity give a positive stopping time.',
  'A distance during an interval is the difference between two positions. Calculate both endpoints before subtracting.',
  'Both the initial velocity squared and stopping distance are positive. The minus sign in the rearranged equation cancels the negative acceleration.',
  'With constant braking, the speed falls steadily from its initial value to zero. Later one-second intervals should cover less distance.',
  'Keep the three requested results distinct: total stopping distance, stopping time, and the two individual interval distances.'
 ],
 'ch2-toss-and-catch':[
  'The 2.6 seconds includes the rise and the fall. The ball is caught at the same height from which it was released.',
  'Without air resistance, the return trip mirrors the upward trip. This equal-time argument depends on the equal release and catch heights.',
  'Only half the total flight time is spent rising. At the end of that upward interval, the ball’s velocity is momentarily zero.',
  'Gravity reduces the upward velocity by g each second. The initial speed must be just enough to reach zero after the upward travel time.',
  'At the highest point, use v = 0 in the time-free equation. The resulting height is measured above the release point.',
  'Square the launch speed, then divide by twice g. Keep the more precise launch speed until this calculation is complete.',
  'The ball should return to zero displacement after the full flight time. This checks that the launch speed and gravity agree with the observed catch.',
  'Give the launch speed with its upward direction and the maximum rise relative to the starting height.'
 ],
 'ch2-cliff-stone':[
  'Using the release point as zero keeps the signs clear: the initial velocity is upward, while gravity and the final displacement point downward.',
  'The stone does not fall immediately. It first rises, stops momentarily, and then falls past its starting point to the ground.',
  'Use the ground’s signed position, −75 m. The positive initial-velocity term accounts for the upward part of the flight.',
  'A quadratic can have two mathematical roots. Only the positive time describes an impact after the stone is released.',
  'Impact velocity points downward, so it is negative. Speed is its magnitude; the rise above the cliff is a separate positive distance.',
  'The stone travels up by h and then down by h + 75 m. Add both path lengths, so the upward rise is counted twice.',
  'Displacement records only the change between endpoints. Total distance also includes the initial rise, so it must exceed the cliff height.',
  'Report a positive impact time, a positive speed with downward direction, and a positive total path length.'
 ]
};
export function referenceExplanation(problemId:string,index:number){return notes[problemId]?.[index];}
