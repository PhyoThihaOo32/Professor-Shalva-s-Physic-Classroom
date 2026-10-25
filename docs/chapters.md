# Problem chapters

The Problems page offers four chapter links in the existing lo-fi theme. The selected chapter lives in the URL, survives refresh and sign-in, and is retained when returning from a reference or Professor Shalva’s guide. References remain separate from live conversations.

| Chapter | Content |
| --- | --- |
| 2 · Describing Motion: Kinematics in One Dimension | Nine supplied references plus an original position–time graph exercise in slot 17 |
| 3 · Kinematics in Two or Three Dimensions; Vectors | Seven supplied problems plus five original practice versions, all with diagrams and eight-step solutions |
| 4 · Dynamics: Newton’s Laws of Motion | Chapter section ready for question text |
| 5 · Using Newton’s Laws: Friction, Circular Motion | Chapter section ready for question text |

## Chapter 3

Available exercises: **1, 3, 7, 9, 11, 13, 15, 27, 35, 41, 45, 55**. The user authorized author-chosen educational replacements for missing question text, figures, and values. Slots 11, 13, 15, 45, and 55 now contain clearly labeled **Original practice** versions. The same policy fills Chapter 2 slot 17 with an original position–time graph.

- Problem 1 uses east/north as positive axes and reports a displacement south of west, rather than total path length.
- Problem 3 places the vector in quadrant IV and reports both angle conventions.
- Problem 7 uses the supplied Fig. 3–39: A points right with magnitude 6.8, and B points left with magnitude 5.5. Its diagram is redrawn as native SVG.
- Problem 9 retains the exercise number as pasted. The y component is the constant **6.45 m**, so its y velocity and acceleration are zero.
- Problem 27 subtracts the supplied reference point **(2, 7) m**, which is different from the function’s position at t = 0.
- Problem 35 assumes horizontal launch, no drag, and g = 9.8 m/s².
- Problem 41 states equal launch/landing heights and unchanged launch speed, and includes **both** complementary launch angles.

The supplied questions are normalized for notation. Original practice versions state their own givens and assumptions, and use authored SVG figures with independently checked solutions. Source material remains credited to its respective owners.

## Original replacement data

- **3–11 and 3–13:** A = (4, 3), B = (−2, 5), and, where needed, C = (3, −4), in common units. The figures use perpendicular axes and a consistent scale.
- **3–15:** A drone travels 120 m at 30° north of east, then 90.0 m west.
- **3–45:** A ball launches at 20.0 m/s and 30°, returning to the launch height; g = 9.80 m/s².
- **3–55:** A boat points north at 4.00 m/s through a 200 m-wide river with a 1.50 m/s eastward current.
- **2–17:** Straight graph segments connect (t, x) = (0, 0), (2, 8), (4, 8), (6, 2), (8, 2), and (10, 12), in seconds and metres.

## Implementation and verification

`lib/course.ts` contains public chapter and pending-question metadata. `lib/chapter-three.ts` holds server-owned solutions and schema-validated content. Supplied-question diagrams are authored SVG in `components/chapter-three-diagrams.tsx`. Original practice givens live in `lib/practice-data.ts`, validated solutions in `lib/original-practice.ts`, and figures in `components/practice-diagrams.tsx`. Public figure data contains only givens. Original exercise IDs are stable; changing a figure’s values requires a new exercise ID to preserve existing references.

`npm run db:seed` adds chapters and immutable problem versions idempotently. It preserves existing published versions and conversations; no schema migration or history reset is needed. Teacher and professor conversation behavior is unchanged.

Checks cover independent numeric calculations, vector signs and quadrants, both projectile angles, renderable mathematics, safe public DTOs, missing-content handling, chapter navigation, sign-in return destinations, and diagram label bounds/overlap on a phone. AI transport remains stubbed in automated checks.
