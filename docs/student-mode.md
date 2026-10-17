# Student mode

Sign in, choose **Be the student**, then select Rick Sanchez, Professor Frink, or Edna Mode. `/professors` selects the professor; `/learn?professor=<version>` opens or resumes that professor’s classroom. Both routes require an account and preserve their destination through sign-in.

Rick uses skeptical thought experiments, Frink uses experiments and sketches, and Edna uses precise diagrams and purposeful steps. These are teaching adaptations of their personalities. All three aim to teach correct physics. A learner can ask questions, attach a drawing, request a small hint, continue one step, or explicitly request the full solution. Explanations, equations, worked sections, and diagrams appear in the existing chat.

Professor versions are separate from simulated student versions. They use their own trusted prompts and do not receive the deliberate-error instructions used for Bart, SpongeBob, or Stewie. The teacher-instinct reviewer and bulb remain in teacher mode. Student mode does not add a review-model call to each reply.

Existing account ownership, revision checks, idempotency, limits, server-only AI credentials, export, and individual conversation deletion also apply to professor conversations. My space resumes each conversation in its correct mode. Selection and mode preferences are stored locally; conversation history stays tied to the signed-in account.

No schema migration is required. The normal seed adds the three `PersonaVersion` records before deployment. Existing sessions and student versions are preserved. If professor selection or classroom recovery fails after release, roll back to the preceding compatible deployment without removing account or conversation data.

Provider and database tests use stubbed model transport. Browser checks cover all three professors, Enter/Shift+Enter, drawings, help controls, failed-send recovery, saved history, navigation, phone layout, and switching back to teacher mode, without paid AI calls.
