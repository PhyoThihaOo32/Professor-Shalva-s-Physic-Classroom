# Reviewed original demo physics

Server-owned source: `lib/content.ts`. This repository document is for content review; it is never served to the learner by an API before allowed reveal. Numeric targets are checked by independently implemented SI calculations in `lib/physics.ts`.

## Around the bend

Original demo ID: `around-the-bend`. Centripetal acceleration.

A small robot travels at a constant speed of 6.0 m/s around a circular track of radius 3.0 m. Find its centripetal acceleration and state its direction.

Assumptions: Uniform circular motion; Robot treated as a point mass.

Requested: Centripetal acceleration, a_c. Numeric target: 12.000000 m/s²; absolute tolerance 0.05.

Diagram: Circular track: velocity is tangent; acceleration points toward the center.

1. **Read the givens** — The speed is 6.0 m/s and the radius is 3.0 m.

2. **Draw the motion** — Velocity is tangent to the circle. Acceleration points inward.

3. **Choose the relationship** — For circular motion, acceleration magnitude is speed squared divided by radius.

   \(a_c=\frac{v^2}{r}\)

4. **Keep the speed squared** — Use v², not v; this gives acceleration dimensions.

   \(a_c=\frac{v^2}{r}\)

5. **Substitute in SI units** — Square the speed before dividing by the radius.

   \(a_c=\frac{(6.0)^2}{3.0}\)

6. **Calculate the magnitude** — The centripetal acceleration is 12 m/s².

   \(a_c=12\;\mathrm{m/s^2}\)

7. **Check the interpretation** — The speed stays constant, but velocity changes direction. Doubling speed would quadruple acceleration.

8. **State the result** — The robot accelerates at 12 m/s² toward the center.

   \(a_c=12\;\mathrm{m/s^2}\)

Rubric: Identify inward acceleration; Use speed squared divided by radius; Report acceleration units and direction.

Approved templates: around-the-bend-law-v1 (FORMULA, major, root s3; consequences s5, s6, s8); around-the-bend-arithmetic-v1 (ARITHMETIC, minor, root s6; consequences s8); around-the-bend-units-v1 (UNITS, minor, root s6; consequences s8); around-the-bend-justification-v1 (JUSTIFICATION, minor, root s7; consequences none); around-the-bend-diagram-v1 (DIAGRAM, minor, root s2; consequences none).

Original educational content; permission granted for this application. No textbook chapter numbers.

## A road without a bank

Original demo ID: `flat-road`. Static friction on a circular road.

A 1,000 kg car follows a flat circular road of radius 50 m. The coefficient of static friction is 0.40. With g = 9.81 m/s², find the maximum speed before slipping.

Assumptions: Flat road; No aerodynamic forces; Static friction supplies the inward force.

Requested: Maximum safe speed, v_max. Numeric target: 14.007141 m/s; absolute tolerance 0.03.

Diagram: On the flat road, N and mg balance vertically; friction points horizontally inward.

1. **Read the givens** — Use r = 50 m, μ_s = 0.40, and g = 9.81 m/s².

2. **Draw the forces** — Normal force points up, weight down, and static friction inward.

3. **Balance and limit the forces** — Vertical equilibrium gives N = mg. Static friction provides centripetal force.

   \(\frac{mv^2}{r}=f_s\leq\mu_s mg\)

4. **Solve at the limit** — Mass cancels. At maximum speed, static friction reaches its limit.

   \(v_{max}=\sqrt{\mu_s gr}\)

5. **Substitute** — All inputs are in SI units.

   \(v_{max}=\sqrt{0.40(9.81)(50)}\)

6. **Calculate** — The maximum speed is approximately 14.01 m/s.

   \(v_{max}=14.01\;\mathrm{m/s}\)

7. **Check the condition** — This is an upper bound: v ≤ v_max. Static friction need not equal its maximum below this speed.

8. **State the result** — The maximum safe speed in this ideal model is 14.01 m/s.

   \(v_{max}=14.01\;\mathrm{m/s}\)

Rubric: Use N = mg vertically; Use f_s ≤ μ_s N; Explain mass cancellation and the maximum speed.

Approved templates: flat-road-law-v1 (FORMULA, major, root s3; consequences s5, s6, s8); flat-road-arithmetic-v1 (ARITHMETIC, minor, root s6; consequences s8); flat-road-units-v1 (UNITS, minor, root s6; consequences s8); flat-road-justification-v1 (JUSTIFICATION, minor, root s7; consequences none); flat-road-diagram-v1 (DIAGRAM, minor, root s2; consequences none).

Original educational content; permission granted for this application. No textbook chapter numbers.

## Keep the water in

Original demo ID: `water-in-the-bucket`. Minimum contact speed at the top.

A small water sample is carried in a bucket moving in a vertical circle of radius 0.80 m. Take g = 9.81 m/s². What is the minimum speed at the top for the sample to remain in contact with the bucket?

Assumptions: Small sample treated as a point mass; Bucket only pushes the water; Only gravity and normal force act at the top; Top speed need not be constant around the circle.

Requested: Minimum contact speed at the top, v_min. Numeric target: 2.801428 m/s; absolute tolerance 0.02.

Diagram: At the top, the center is below the sample. Both mg and N point downward, inward.

1. **Read the givens** — The radius is 0.80 m and gravitational acceleration is 9.81 m/s².

2. **Draw the top of the circle** — Inward points downward. Gravity and normal force both point inward.

3. **Apply Newton’s second law** — Centripetal force is the net inward force, not an additional force.

   \(mg+N=\frac{mv^2}{r}\)

4. **Apply the contact threshold** — Contact requires N ≥ 0. The minimum speed occurs when N = 0.

   \(N=0\quad\Rightarrow\quad v_{min}=\sqrt{gr}\)

5. **Substitute** — Use the radius in metres.

   \(v_{min}=\sqrt{(9.81)(0.80)}\)

6. **Calculate** — The minimum contact speed is 2.80 m/s.

   \(v_{min}=2.80\;\mathrm{m/s}\)

7. **Check below the threshold** — Below this speed, the circular trajectory would require N < 0. The bucket cannot pull the water, so contact fails. An outward-positive equation, −mg − N = −mv²/r, is equivalent.

8. **State the result** — At the top, the speed must be at least 2.80 m/s. Do not assume the speed is constant around the whole circle.

   \(v_{top}\geq 2.80\;\mathrm{m/s}\)

Rubric: Use mg + N = mv²/r with inward downward; Apply N ≥ 0 and N = 0 at threshold; Explain why negative N means loss of contact; Do not add a separate centripetal force.

Approved templates: water-in-the-bucket-law-v1 (SIGN, major, root s3; consequences s4, s5, s6, s8); water-in-the-bucket-arithmetic-v1 (ARITHMETIC, minor, root s6; consequences s8); water-in-the-bucket-units-v1 (UNITS, minor, root s6; consequences s8); water-in-the-bucket-justification-v1 (ASSUMPTION, minor, root s7; consequences none); water-in-the-bucket-diagram-v1 (DIAGRAM, minor, root s2; consequences none).

Original educational content; permission granted for this application. No textbook chapter numbers.

## At the bottom of the loop

Original demo ID: `bottom-of-the-loop`. Tension in a vertical circle.

A 0.50 kg ball on a light string moves at 4.0 m/s at the bottom of a vertical circle of radius 1.0 m. With g = 9.81 m/s², find the string tension at that instant.

Assumptions: Light inextensible string; Point-mass ball; Instantaneous bottom speed given.

Requested: String tension at the bottom, T. Numeric target: 12.905000 N; absolute tolerance 0.03.

Diagram: At the bottom, inward is upward: tension points up and gravity points down.

1. **Read the givens** — Use m = 0.50 kg, v = 4.0 m/s, r = 1.0 m.

2. **Draw the forces** — Tension is upward, toward the center. Gravity is downward.

3. **Write the radial force balance** — Take upward as positive at the bottom.

   \(T-mg=\frac{mv^2}{r}\)

4. **Solve for tension** — Add weight to the required net inward force.

   \(T=\frac{mv^2}{r}+mg\)

5. **Substitute** — Calculate radial force and weight separately.

   \(T=\frac{0.50(4.0)^2}{1.0}+0.50(9.81)\)

6. **Calculate** — The string tension is 12.91 N.

   \(T=12.91\;\mathrm{N}\)

7. **Check the result** — The tension exceeds the 4.905 N weight because the net force must point upward.

8. **State the result** — The instantaneous string tension at the bottom is 12.91 N.

   \(T=12.91\;\mathrm{N}\)

Rubric: Use inward upward; Use T − mg = mv²/r; Explain why tension exceeds weight.

Approved templates: bottom-of-the-loop-law-v1 (SIGN, major, root s3; consequences s4, s5, s6, s8); bottom-of-the-loop-arithmetic-v1 (ARITHMETIC, minor, root s6; consequences s8); bottom-of-the-loop-units-v1 (UNITS, minor, root s6; consequences s8); bottom-of-the-loop-justification-v1 (JUSTIFICATION, minor, root s7; consequences none); bottom-of-the-loop-diagram-v1 (DIAGRAM, minor, root s2; consequences none).

Original educational content; permission granted for this application. No textbook chapter numbers.

## The tilted pendulum

Original demo ID: `conical-pendulum`. A conical pendulum.

A bob on a 1.20 m string moves as a conical pendulum. The string makes a 30° angle with the vertical. With g = 9.81 m/s², find the bob’s speed.

Assumptions: Uniform horizontal circular motion; Light string; Angle measured from vertical.

Requested: Bob speed, v. Numeric target: 1.843443 m/s; absolute tolerance 0.02.

Diagram: The circular radius is L sin θ. T cos θ balances mg, and T sin θ supplies inward acceleration.

1. **Read the givens** — The length is 1.20 m and the angle from vertical is 30°.

2. **Draw and resolve the forces** — Tension points along the string; weight points downward. The circular radius is 0.60 m.

   \(r=L\sin\theta=0.60\;\mathrm{m}\)

3. **Apply Newton’s law in two directions** — There is no vertical acceleration. Horizontal acceleration is inward.

   \(T\cos\theta=mg,\quad T\sin\theta=\frac{mv^2}{r}\)

4. **Eliminate tension** — Divide horizontal by vertical equations, then isolate speed.

   \(v=\sqrt{rg\tan\theta}\)

5. **Substitute** — Use the circular radius, not the string length.

   \(v=\sqrt{0.60(9.81)\tan30^\circ}\)

6. **Calculate** — The bob speed is 1.84 m/s.

   \(v=1.84\;\mathrm{m/s}\)

7. **Check the geometry** — The radius is L sin θ, not L. The angle is from vertical; the bob has zero vertical acceleration.

8. **State the result** — The bob moves at approximately 1.84 m/s.

   \(v=1.84\;\mathrm{m/s}\)

Rubric: Use r = L sin θ; Resolve tension with angle from vertical; Divide force equations to eliminate tension.

Approved templates: conical-pendulum-law-v1 (SIGN, major, root s3; consequences s4, s5, s6, s8); conical-pendulum-arithmetic-v1 (ARITHMETIC, minor, root s6; consequences s8); conical-pendulum-units-v1 (UNITS, minor, root s6; consequences s8); conical-pendulum-justification-v1 (JUSTIFICATION, minor, root s7; consequences none); conical-pendulum-diagram-v1 (DIAGRAM, minor, root s2; consequences none).

Original educational content; permission granted for this application. No textbook chapter numbers.

## From revolutions to acceleration

Original demo ID: `rpm-to-acceleration`. Circular motion with unit conversions.

A marker is 20 cm from the center of a turntable rotating at 120 revolutions per minute. Find the marker’s centripetal acceleration in m/s².

Assumptions: Uniform rotation; Marker fixed to turntable.

Requested: Centripetal acceleration, a_c. Numeric target: 31.582734 m/s²; absolute tolerance 0.04.

Diagram: The marker follows a circle of radius 0.20 m. Its acceleration points inward.

1. **Read and convert the radius** — Convert 20 cm to 0.20 m before calculating.

   \(r=0.20\;\mathrm{m}\)

2. **Draw the motion** — The acceleration points inward, toward the turntable’s center.

3. **Convert angular speed** — There are 60 seconds per minute and 2π radians per revolution.

   \(\omega=120\frac{2\pi}{60}=4\pi\;\mathrm{rad/s}\)

4. **Choose the relationship** — Use angular speed squared times radius.

   \(a_c=\omega^2 r\)

5. **Substitute** — Use SI units throughout.

   \(a_c=(4\pi)^2(0.20)\)

6. **Calculate** — The acceleration magnitude is 31.58 m/s².

   \(a_c=31.58\;\mathrm{m/s^2}\)

7. **Check units and direction** — Radians are dimensionless; ω²r has units m/s². The acceleration is inward.

8. **State the result** — The marker accelerates at 31.58 m/s² toward the center.

   \(a_c=31.58\;\mathrm{m/s^2}\)

Rubric: Convert 20 cm to 0.20 m; Convert 120 rpm to 4π rad/s; Square angular speed and report acceleration units.

Approved templates: rpm-to-acceleration-law-v1 (UNITS, major, root s3; consequences s4, s5, s6, s8); rpm-to-acceleration-arithmetic-v1 (ARITHMETIC, minor, root s6; consequences s8); rpm-to-acceleration-units-v1 (UNITS, minor, root s6; consequences s8); rpm-to-acceleration-justification-v1 (JUSTIFICATION, minor, root s7; consequences none); rpm-to-acceleration-diagram-v1 (DIAGRAM, minor, root s2; consequences none).

Original educational content; permission granted for this application. No textbook chapter numbers.
