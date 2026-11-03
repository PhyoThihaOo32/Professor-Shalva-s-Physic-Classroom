# Chapter 10 · Rotational Motion

Choose **10 Rotational motion** in the Problems sidebar. Twenty-five entries connect angular motion with linear motion, torque, inertia, rotational energy, and rolling. Each opens in place with a descriptive SVG diagram and eight worked steps. The guide icon opens a separate eight-step rotational-dynamics guide for this chapter, with the user's two lecture slides available beneath it. Other chapters retain the general nine-step guide.

## Content and numbering

Bank positions 1–25 are local navigation numbers. Subtitles retain the supplied labels such as **Example 10–1**, **Supplied problem 7**, and **Supplied problem 25**, avoiding collisions between example and exercise numbers.

The supplied cases cover bird resolution, carousel speeds and accelerations, hard-drive bit rate, angular-velocity and angular-position functions, two centrifuge startups, the grinding wheel, Earth's rotation, bicycle torque, and door torque. Thirteen **Original practice** entries either add missing geometry/values to an example or turn a supplied lesson into a complete question:

- The compound wheel explicitly places force A downward on the left inner rim and force B at the top outer rim, 60° clockwise from the upward radius. Their torques are +15 N·m and −21.6506 N·m.
- The hollow cylinder uses M = 6.0 kg, R₁ = 0.10 m, R₂ = 0.20 m; its central inertia is 0.15 kg·m².
- The tangent-axis solid cylinder uses M = 4.0 kg and R = 0.30 m; its inertia is 0.54 kg·m².
- Additional questions cover the right-hand rule, two point masses, the perpendicular-axis theorem, an ideal rolling comparison, ground-frame wheel velocities, work by torque, real rolling resistance, angular displacement, fixed-axis dynamics, and rotational kinetic energy. Each states its givens and model.

## Physics clarifications

- Use radians in arc length, rotational work, and rotational kinematics. A small flat object's width is approximately Rθ, whereas an arc's length is exactly Rθ.
- Average angular acceleration is Δω/Δt. It need not equal instantaneous dω/dt at either endpoint. Keep unwrapped angles when counting turns.
- Use unrounded π during rate conversions. The grinding-wheel rim speed is 43.9823 m/s, or 44 m/s to two significant figures; the pasted 43.9 m/s used a prematurely rounded angular speed.
- Signed torque is the cross product about the stated axis. A component along the radius produces zero central torque. N·m describes torque; J describes work.
- The fixed-axis relation Στ = Iα assumes constant inertia about that axis. The planar perpendicular-axis theorem requires a thin, flat mass distribution and intersecting axes.
- The rolling comparison has a frictionless block and separate, otherwise identical tracks for the round objects with enough static friction to prevent slipping. It ignores rolling resistance. Speeds depend on I/(MR²), not on absolute I alone. A thin-walled hollow cylinder ties a hoop; a thick-walled one lies between the solid-cylinder and hoop limits.
- Contact-point velocity is instantaneously zero only in the stationary-ground frame for rolling without slipping. Real deformation and rolling resistance explain energy loss; ideal static friction alone does not.

## Implementation

`lib/chapter-ten.ts` owns reviewed answers and reference steps. Only public diagram labels and givens appear in `lib/rotation-figures.ts`; `components/rotation-diagrams.tsx` renders them. `guideForChapter` selects the rotational guide only for Chapter 10. The two supplied slide images are stored under `public/images/chapter-10-guide-*.png`, with the original source credit on the guide page.

The idempotent seed adds stable new IDs without altering any published Chapter 2, 3, or 7 version or saved conversation. No database schema change is required. Static figures implement the current question-bank request; the pasted document's suggested sliders and simulation roadmap are not treated as requirements for this release.

Checks independently cover rate conversion, derivatives, cross-product signs, a numerical shell integral, axis theorems, rolling energy, answer privacy, mathematical rendering, chapter-specific guide routing, sign-in destinations, and phone diagram bounds.
