# Problem chapters

The Problems page offers four chapter links in the existing lo-fi theme. The selected chapter lives in the URL, survives refresh and sign-in, and is retained when returning from a reference or Professor Shalva’s guide. References remain separate from live conversations.

| Chapter | Content |
| --- | --- |
| 2 · Describing Motion: Kinematics in One Dimension | Nine existing worked references; problem 17 still needs Fig. 2–40 |
| 3 · Kinematics in Two or Three Dimensions; Vectors | Seven supplied problems with diagrams and eight-step solutions |
| 4 · Dynamics: Newton’s Laws of Motion | Chapter section ready for question text |
| 5 · Using Newton’s Laws: Friction, Circular Motion | Chapter section ready for question text |

## Chapter 3

Available exercises: **1, 3, 7, 9, 27, 35, 41**. The user confirmed that the requested list **1, 3, 13, 15, 41, 45, 55** belongs to Chapter 3. Problems 11 and 13 require Fig. 3–41; 15, 45, and 55 require their question text. Pending rows cannot open invented references.

- Problem 1 uses east/north as positive axes and reports a displacement south of west, rather than total path length.
- Problem 3 places the vector in quadrant IV and reports both angle conventions.
- Problem 7 uses the supplied Fig. 3–39: A points right with magnitude 6.8, and B points left with magnitude 5.5. Its diagram is redrawn as native SVG.
- Problem 9 retains the exercise number as pasted. The y component is the constant **6.45 m**, so its y velocity and acceleration are zero.
- Problem 27 subtracts the supplied reference point **(2, 7) m**, which is different from the function’s position at t = 0.
- Problem 35 assumes horizontal launch, no drag, and g = 9.8 m/s².
- Problem 41 states equal launch/landing heights and unchanged launch speed, and includes **both** complementary launch angles.

The supplied questions are normalized for notation. Solutions, explanations, and SVG diagrams are authored in the app; incomplete source figures are not reconstructed from guesses. The source material’s rights remain with its respective owners.

## Implementation and verification

`lib/course.ts` contains public chapter and pending-question metadata. `lib/chapter-three.ts` holds server-owned solutions and schema-validated content. Diagrams are constrained, authored SVG in `components/chapter-three-diagrams.tsx`; they do not execute expressions or generated markup.

`npm run db:seed` adds chapters and immutable problem versions idempotently. It preserves existing published versions and conversations; no schema migration or history reset is needed. Teacher and professor conversation behavior is unchanged.

Checks cover independent numeric calculations, vector signs and quadrants, both projectile angles, renderable mathematics, safe public DTOs, missing-content handling, chapter navigation, sign-in return destinations, and diagram label bounds/overlap on a phone. AI transport remains stubbed in automated checks.
