# Verification record

This record starts with local verification on October 6, 2026, on macOS with Node 22.22.3 and a running PostgreSQL installation. Later dated sections record subsequent changes, authorized character trials, and the October 7 Vercel production release. The initial baseline made no external deployment or paid OpenAI calls.

| Check | Actual result |
| --- | --- |
| `npm run typecheck` | Passed, strict TypeScript |
| `npm run lint` | Passed |
| `TEST_DATABASE_URL=… npm run test` | **99/99 tests passed**, six test files, including isolated database, owner authorization, and saved-conversation/provider and correction-discussion fixtures |
| `npm run eval:mock` | **18/18 initial attempts, 36/36 labeled corrections**, zero paid calls; individual results in `evaluation-mock.json` |
| `npm run test:e2e` | **15/15 desktop/mobile scenarios passed** (1.5 minutes), including the direct classroom chat, separate Library route, Chapter 2 problem switching, chronological earlier-step replies, refresh persistence without duplicate sessions, and all character portraits. |
| `npm run build` | Passed: generated Prisma client, optimized Next.js Webpack production build, TypeScript, and route generation |
| Production browser smoke | The preceding baseline passed through a temporary local HTTPS proxy: library, mock session creation, Secure/HttpOnly guest ownership, refresh recovery, confirmed early reveal, verified review, own-history deletion |
| Client production bundle inspection | No matches for private correction schema keys, private prompt text, or selected private reference strings in the final production static JavaScript chunks |
| Runtime dependency audit | **Zero reported vulnerabilities**; see `runtime-audit.json` |
| Full dependency audit | **Five high reports** in the developer-tool chain, described below; see `dependency-audit.json` |

The database suite used the separate `chalklight_test` database. Browser tests used fresh signed guest identities in the local app database and deleted only their own history when testing deletion. The app database has both migrations applied and six published demo problems and nine Chapter 2 exercises seeded in separate chapters. Seeds preserve existing published versions.

The browser scenarios cover the full Teacher correction/review flow, refresh persistence, public DTO/export leakage checks, guest ownership and CSRF, owner denial, idempotency and simultaneous writes, confirmed reveal/deletion, injection feedback, provisional disputes, downstream invalidation and score replacement, mobile teaching, keyboard focus, reduced motion, high contrast, and unavailable audio. Original/revised/reference comparisons were exercised. The shared classroom checks cover a single composer, explicit guide/correction modes, correction via Ctrl+Enter, accepted board revisions, saved actual student reactions, original history preservation, and read-only finished sessions. Guide messages remain ungraded and cannot expose unrevealed work. The entry flow checks separate welcome/role/student/library pages, saved and changed student selection, optional session settings, and earlier-step refresh recovery. Self-hosted Manrope loads successfully, no horizontal overflow was observed at 390 px, and the final manual capture reported no browser errors. The visible-board assertion checks the current paragraph independently from preserved original text in collapsed revision history. The same scenario exercises original/current comparison and finished-session closure.

The two new isolated database fixtures verify an ordered correction/message/check discussion, idempotent correction replay without duplicate timeline entries, refresh persistence, public field whitelisting, exclusion of disputes and malformed events, and visible-step filtering. Live SDK transport remains stubbed; no paid calls were made.

Inspected screenshots of the delivered palette-derived theme: `palette-welcome.png`, `palette-welcome-mobile.png`, `palette-board.png`, and `palette-board-mobile.png`. The reference image is not rendered or requested. The theme uses only native color tokens, CSS gradients, rounded controls, and small CSS orbital details. Before character profiles were introduced, a manual browser check visited welcome, roles, students, library, setup, settings, resources, progress, owner, and a mock teaching session: **zero raster-image requests, zero browser errors, and no mobile horizontal overflow**. The current version intentionally loads locally served student pictures; the theme continues to use no wallpaper or embedded reference image. Browser coverage checks that the computed background contains no image URL and that smooth Manrope typography and saved conversations remain intact. Earlier `cosmos-…` and `study-room-…` screenshots are historical concepts.
Production always uses Secure guest cookies. A plain HTTP production smoke initially could not recover the guest identity because the cookie was not sent; repeating it over local HTTPS passed. Deployment requires HTTPS and the exact configured `APP_ORIGIN`. The temporary certificate/proxy was only a local verification aid and is not part of deployment.

## Remaining limits and unverified integrations

- **Real OpenAI integration was not called.** SDK/provider tests use a stub transport. The live provider and paid opt-in evaluation harness exist, but real model availability, latency, response compliance, provider costs, and judgments remain unverified until an authorized live evaluation. The initial live simulation intentionally accepts only reviewed approved renderings, with one bounded repair; it does not admit unrestricted model prose as verified physics.
- **Real GitHub OAuth was not configured.** Owner authorization, immutable versions, draft/review/publish, and textbook labeling passed tests with authentication fixtures. Test the actual allowlisted GitHub account and callback after setting credentials.
- The transparent mock checker recognizes reviewed explanations and numeric/unit/convention cases; unfamiliar derivations can remain uncertain. It is not a general symbolic physics proof system. Reviewed demo references were checked against independently calculated numbers and the required bucket regression; external instructor review has not occurred.
- Chromium desktop and emulated mobile were tested. Safari, Firefox, physical devices, screen-reader behavior, independent accessibility certification, large-scale load, and an external deployment were not tested. Docker was unavailable, so the optional Compose setup was not run.
- Cleanup is implemented and configurable; no recurring cleanup job or backup service was installed. Configure both before deployment and disclose backup retention separately.
- Prisma's pinned PostgreSQL adapter emits a nonfatal `pg` deprecation warning about overlapping queries during tests. All database checks pass with the pinned `pg` 8 runtime. Recheck adapter compatibility before a future upgrade to `pg` 9.

## Developer-tool advisory

The full audit reports the [braces stack-exhaustion advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) for `braces` ≤3.0.3, propagated through the ESLint/Next ESLint plugin, `fast-glob`, and `micromatch` chain. The five reports describe this developer-tool dependency chain, rather than five independently observed application vulnerabilities. The audit snapshot did not provide a patched `braces` version. Do not claim a clean full dependency audit. The production dependency audit is clean; review and update the development chain when a compatible fix becomes available.

## Local filesystem recovery

macOS cloud storage evicted dependency files from this Desktop directory during implementation. The complete pinned dependency installation is now in `~/.cache/chalklight-physics-runtime/node_modules`, linked from the workspace. The application uses Next.js's supported Webpack mode. Source, lockfile, migrations, and seed data remain in the workspace. The ignored `.chalklight-build-cache` parent link now keeps dedicated Next.js output and TypeScript incremental data in the nonsynced local runtime cache. The config uses it only if the local link exists; ordinary fresh checkouts use `.next`. Continuing source-file eviction and cloud-induced development reloads still interrupted API requests. The final preview runs a disposable source snapshot outside iCloud via `npm run dev:local`; originals stay editable here. Restart after edits to refresh that snapshot. Its guarded directory marker and busy-port check prevent overwriting an unrelated directory or a running preview. A fresh installation can use `npm ci` in a directory whose files remain locally available. Earlier browser runs were interrupted by manifest/type-file changes and development reloads. One build was also interrupted by stale generated type paths during the cache relocation; correcting those paths and serializing builds resolved it. Final browser verification uses the nonsynced snapshot with no simultaneous build or source edits.

The first entry-flow browser run was interrupted by a development hot reload before the Next.js router initialized. A subsequent run exposed hover movement that made the final review button unstable near the viewport edge. Button hover/press feedback now changes color and shadow without moving the target. The final run compiled routes before attaching a browser, used no simultaneous browser capture or build, and passed all twelve baseline scenarios without browser errors in the full teaching flow. The continuous-board baseline passed all thirteen scenarios in one uninterrupted run. The final palette-only revision compiled routes first and passed its five affected desktop/mobile scenarios as recorded above.

## Character student update

Build, strict TypeScript, lint, all 85 unit/database checks, and all 14 browser scenarios passed after introducing SpongeBob SquarePants, Bart Simpson, and Stewie Griffin. The new browser case verifies all three profile pictures load, only three students appear, mobile width stays within the viewport, and a legacy saved preference reaches the current Bart classroom. Existing cases now use the current character IDs and exercise selection persistence, mock guidance, accepted correction, saved student reactions, and review. Main and isolated test databases were seeded with the new versions without overwriting historical persona records. Image sources are documented in `character-profiles.md`.

## Chapter 2 conversation classroom

The final classroom/Library behavior passed all 15 browser scenarios. All 99 unit/database checks passed, including independently calculated targets for nine Chapter 2 exercises, approved error counts and independent roots across all characters/difficulties, signed arithmetic with acceleration units, and multipart assumptions. Build, strict TypeScript, and lint passed. New private Chapter 2 reference/template strings were absent from production static client JavaScript. Problem 17 remains unavailable pending the user-supplied Fig. 2–40; no graph or answer was invented. Course notes were updated afterward to reflect the available shelf.

The final visual cleanup removes the outer conversation card and fills the available chat width. Its affected classroom/Library browser scenario passed again (10.4 seconds). Final desktop/mobile captures are `chapter-two-classroom.png` and `chapter-two-classroom-mobile.png`; the Chapter 2 shelf is `chapter-two-library.png`. Manual captures reported zero browser errors and no mobile horizontal overflow.


## Quiet chat and folding sidebar

Removed the repeated conversation heading, canned student greeting, automatic worked-step blocks, and step-advance row from the conversation-first classroom. Saved exchanges and the composer remain; step selection, progression, and checking live in the expandable board. The sidebar folds into a 72px desktop icon rail and hides on mobile, with an always-available header toggle and locally saved preference. Build (including TypeScript) and lint passed. All six affected browser scenarios passed (1.1 minutes), covering entry flows, saved conversations, board progression, separate Library navigation, keyboard folding/restoration, preference persistence, and mobile overflow. No browser errors were recorded in the exercised flows. Updated desktop/mobile captures include `classroom-sidebar-folded.png`, `chapter-two-classroom.png`, and `chapter-two-classroom-mobile.png`.


## Blended conversation and personal live connection

Build (including strict TypeScript), lint, all 103 unit/isolated PostgreSQL checks, and all 17 browser scenarios passed. The personal-connection migration was deployed to the local application and isolated test databases. Unit/database tests use stubbed OpenAI transport and verify numeric conversational calculations, strict current-step rewrites, bounded output repair, atomically saved work/history/discussion, refresh, duplicate replay, credential encryption, owner-bound decryption, isolation, and disconnect. The browser case saves a fake fixture key without making an OpenAI call, verifies the cleared password field, status persistence and absence from browser storage/exports, switches the same classroom to Live and back without losing its conversation, removes the key, and checks mobile overflow. Live key/model access and actual generated physics have not been tested with a real API key. No paid call was made.

Visual captures are `blended-classroom.png` and `blended-classroom-mobile.png`. Messages and input share a subdued panel with a transparent composer; the expanded work board sits above it. Defaults remain available as Starting guide. Live conversation work is a draft, not an independently certified answer; formal corrections still use the original question’s reviewed reference.

## Bart conversation and keyboard follow-up

Enter submits the classroom composer; Shift+Enter inserts a newline, and Cmd/Ctrl+Enter continues to work. A new browser scenario passed whitespace rejection, multiline input, IME composition, the legacy composition key code, held-key repeats, one saved ungraded message, and mobile width. The existing correction-keyboard and connection/panel scenarios passed as well (three targeted browser checks). Twelve provider tests passed, including separation of Bart’s trusted voice instructions from other students and the independent evaluator. Lint, strict TypeScript, and production build passed; after the final prompt, role-history and equation-validation changes, all 106 unit/database checks, lint, TypeScript and production build passed again.

The connected owner’s Bart classroom was switched from Demo guide to Live OpenAI without changing the saved key. Five small live guide messages tested Enter submission, character voice and work revisions. The first greeting unexpectedly generated a draft, which remains preserved in revision history with the Starting guide; this prompted stronger instructions separating social chat from work requests. The initial two greetings still drifted toward problem-solving. Separate user/assistant history turns corrected that behavior: a casual prompt received an in-character skating/Skinner reply without a board rewrite, and explicit recalculation requests updated the board. The later equation-format check repairs incomplete LaTeX before saving. The final conversation is recorded in `bart-live-conversation.jpg`. These were conversation calls, not paid grading evaluations.

The final saved live draft was inspected after refresh: the short equation rendered successfully, explanatory display math rendered without literal LaTeX wrappers, the Starting guide and three revision entries remained available, and the classroom stayed in Live OpenAI. The board was folded back to leave the conversation frontmost. Lint, TypeScript and production build passed after the text-rendering update.

## Compact classroom and Manual shelf

The live classroom now removes the response selector, message modes, shortcut hint, recalculate instruction and save footer. Its compact heading shows the student/problem once; generated work appears above chat while unchanged authored steps and manual checking controls remain outside the live board. Library has a separate Manual section with independently saved authored practice. A configured key connects an active classroom on opening without a generated completion during the provider switch. The visible sidebar button folds/restores navigation and retains the preference.

All 107 unit/database checks passed, including persisted Manual/classroom separation with no model call. All 20 browser scenarios passed across the full run and a focused rerun after correcting a test that read storage before classroom initialization finished. New checks cover removed controls, header height, Manual entry/next/refresh recovery, preserved live-session selection, generated-only board content, absence of authored guide/check controls in the live board, automatic connection after key setup, sidebar persistence and mobile width. Existing correction/review, ownership/privacy, keyboard, saved chat and original demos also passed. Build, strict TypeScript and lint passed. No live model messages or paid evaluations were needed for this UI change.

## Rename and initial GitHub publication — October 7, 2026

The app is now **Professor Shalva’s Physic Classroom**. Sidebar/onboarding branding, welcome text, browser metadata, favicon, history-export filename, and package/README naming are updated. Cookie/storage/database/encryption identifiers remain stable to preserve existing classrooms and personal-key access. Production build (including strict TypeScript), lint, all 107 isolated database/unit tests, and two desktop/mobile entry-flow browser tests passed. The renamed welcome page was visually inspected at a 900 px width; `professor-shalva-welcome.png` records the current branding. Git excludes `.env`, real keys, generated code, dependency/build cache symlinks, local databases, and browser traces.

## Unified read-only Problems shelf

The sidebar now contains Classroom, Problems, and Settings. Demos, Progress, and Course notes are removed from navigation. Problems combines the published question, diagram, and all authored worked steps; it has no session-start action and makes no session mutations. Old Manual URLs redirect to the matching reference, while old Progress/Course notes URLs redirect to the shelf. Existing live chats and saved data remain independent.

Production build, TypeScript, lint, and 107 unit/database checks passed. All 22 browser scenarios passed across the full run and a focused rerun after adjusting a test to wait for the streamed legacy-route redirect. Checks cover reference content and diagrams, no session creation during browsing, live-chat recovery, three-item navigation, folded/mobile layout, music output/controls, and existing API settings and ownership. No paid model calls were used. Final reference captures include `reference-overview.png`, `problem-reference.png`, and `problem-reference-mobile.png`.


## Step-by-step reference slides

Reference solutions now show one authored step at a time, with a short explanation, the applicable equation, and a plain-language companion note for each of the nine Chapter 2 problems. Previous/Next navigation keeps the question and diagram available; a step count and slim progress indicator show the current position. The last slide offers Start again. Navigation is keyboard accessible and focuses the updated heading. Reference browsing remains read-only and independent of live chats.

TypeScript and lint passed. All four affected browser scenarios passed across a focused run and a rerun after the cold-route run exhausted its total test timeout. Checks include one visible step, back/next boundaries, the last slide and restart, heading focus, equations and mobile overflow, changing problems, no session mutations, old-route redirects, and saved classroom recovery.

## Bottom input and shared drawing paper

The classroom now fills the viewport with independently scrolling conversation and one transparent input at the bottom. The board accepts student-generated vector diagrams and equations, with pen, arrow, label, undo, and clear tools for teacher annotations. Submitted marks and student diagrams persist alongside conversation and work revisions. The board opens when work changes, and toggling it keeps the latest conversation visible. Existing authored reference steps remain outside the live board.

All **110 unit/database checks** and **24 browser scenarios** passed. Production build, strict TypeScript, and lint passed. After the final board-toggle scroll adjustment, its focused drawing scenario, production build, and lint passed again. New checks cover strict live-output geometry and rejection of arbitrary markup, teacher drawing context, atomic diagram/annotation snapshots, original-work preservation, invalid coordinate rejection, duplicate replay, refresh, pen and arrow gestures, keyboard labels, undo/clear separation, full desktop paper visibility, slim composer placement, mobile width, and conversation scroll position. Existing music, ownership, saved chats, keyboard input, references, and correction flows also passed.

No paid API calls were made by these verification runs. Live provider tests use stubbed transport; browser drawing tests use the explicitly labeled offline demo. A read-only browser inspection of the owner's existing live SpongeBob conversation showed its generated two-train diagram and corrected inward arrows saved in the timeline, with the latest drawing on the work board. No new message was sent during that inspection. Visually inspected captures: `drawing-classroom.png`, `drawing-classroom-mobile.png`, and `live-drawing-classroom.png`.

## One chat workspace

The separate live board and its Show/Hide buttons are removed. Explanations, calculations, equations, and diagrams render inside each student reply; a small pencil control provides inline teacher annotations. Complete work snapshots are saved with each response, so later revisions cannot overwrite earlier displayed calculations. Legacy calculations are recovered only from an exactly matching step revision sequence. The palette, folding sidebar, reference shelf, and bottom input remain.

All **111 unit/database tests**, TypeScript, lint, and production build passed. Five affected browser scenarios passed for inline calculations, Enter/Shift+Enter/IME behavior, classroom/reference recovery, personal connection persistence, and inline drawing tools. New checks exercise saved full work, distinct chronological reply calculations, safe legacy recovery and ambiguous-history rejection, annotation gestures and keyboard labels, refresh, absence of board controls, and mobile overflow/composer placement. UI/provider verification made no paid calls. A read-only inspection of the existing live SpongeBob session confirmed older calculations and revised train diagrams appear inline in their original replies. Final captures are `chat-calculations.png`, `chat-drawing-classroom.png`, and `chat-drawing-classroom-mobile.png`.

## Embedded welcome GIF

The user-supplied Two Dots GIF is embedded on the welcome page with screen blending and a radial edge mask. Its copied animation matches the original SHA-256 hash; the source is unchanged. A native picture source selects a still first frame when reduced motion is enabled. Desktop checks confirm the GIF loads at its native 480 × 360 size; mobile checks confirm the still source loads, there is no horizontal overflow, and the onboarding flow remains functional.

Production build, TypeScript, lint without warnings, and both affected desktop/mobile onboarding browser scenarios passed. The first cold development run left the welcome page after an attempted navigation during compilation; the warm rerun passed both complete flows. Final desktop and mobile views were visually inspected. Captures: `welcome-space-preview.png`, `welcome-space-gif.png`, and `welcome-space-mobile.png`. No paid API calls or remote media requests were needed.

## Two welcome animations in opposite corners

Added the unchanged Tomas Brunsdon astronaut GIF alongside the Two Dots animation. The upper-right and lower-left grid slots frame centered welcome copy without intersecting each other or the text. The welcome gradient covers the full document, retaining smooth screen blending below the initial viewport. Both GIFs have reduced-motion still sources. The two affected desktop/mobile onboarding checks passed, including image loading, non-overlap bounds, mobile overflow, and saved-student navigation. Targeted ESLint passed. Visually inspected `welcome-two-gifs.png` and `welcome-two-gifs-mobile.png`.

## Full-page welcome and role scenes

Replaced the two corner decorations with one full-page animation per route: Two Dots on welcome, Tomas Brunsdon on role selection. Tests check that each scene covers its onboarding shell and that the other animation is absent, both on desktop and with mobile reduced-motion still sources. Responsive role cards remain readable over the animation. The welcome action uses a native link so it works before hydration; the persistence check now waits for the chosen student to appear selected before refreshing. Targeted ESLint passes without warnings. Visually inspected the desktop welcome and roles captures plus mobile role selection.

The entry verification exposed a click before hydration on the student chooser. Interactive role/student buttons now remain disabled until client event handlers are ready, so the first selection cannot silently disappear.

Final verification: both affected onboarding browser checks passed (desktop and mobile); targeted ESLint passed with no warnings. The running local preview includes all changes.

## Compact student selection with evite animation

Added the unchanged evite GIF at its native 480 × 296 size with a reduced-motion PNG source, using the same full-page scene layer as welcome and roles. Tightened the header, title, character choices, and classroom action. Desktop uses three columns; mobile uses compact rows; short viewports show personality labels in place of longer descriptions. The mobile entry flow passes and targeted ESLint reports no errors or warnings. The portrait check now verifies GIF loading, reduced-motion source selection, all three profiles, the visible classroom button, and no document scrolling at desktop, phone, and landscape sizes.

Final result: no horizontal or vertical document scrolling at 1280 × 720, 1093 × 874, 390 × 844, 375 × 667, and 844 × 390; all three profiles and Enter classroom stay accessible. Portrait/persistence and mobile entry checks pass. Visually reviewed desktop, regular phone, short phone, and landscape captures.

## Original palette restored around the GIFs

Unified the entry scenes with the existing slate/teal/lavender canvas and shared choice-state variables. GIFs remain full-page, but screen blending, 46% opacity, and reduced saturation soften their colors. Removed separate plum/burgundy backgrounds and restored shared text, mint navigation/actions, and peach student labels. All three affected browser checks pass: portrait/loading and persistence, desktop onboarding, and mobile onboarding. The five student-selection viewport checks still confirm no scrolling. Visually inspected the welcome, role, and student screenshots with the restored theme.


## Final verification before GitHub push — October 7, 2026

The complete current application passed **111 unit/database tests** against the isolated PostgreSQL test database and **24 browser scenarios** in one uninterrupted run. The mock evaluation passed **18 generated attempts and 36 corrections**. Production build, strict TypeScript, ESLint, and Git whitespace checks passed. These verification runs made no paid OpenAI calls.

Browser coverage includes original audio playback and controls; read-only problem slides and redirects; chronological inline calculations and drawings; Enter/Shift+Enter and composition handling; saved conversations, ownership and credential isolation; folding navigation; GIF loading and reduced-motion sources; and compact student selection at five desktop/mobile viewport sizes. The browser harness now waits for legacy redirects to finish, polls for the reduced-motion image source to load, and retries a read-only progress request once on a connection reset. Product assertions remain unchanged.


## Live character learning and conversation continuity — October 7, 2026

All **115 unit/database tests**, strict TypeScript, ESLint, and Git whitespace checks passed. The 18 provider checks use stubbed transport and verify trusted character routing for Bart, SpongeBob, and Stewie; isolation from the independent evaluator; separation from teacher instructions; omission of the repeated authored greeting template; preservation of original and corrected work snapshots and teacher drawings; bounded history; stable step IDs; output validation; and compatibility with older message-only history.

The running local preview was updated with the new server-side prompts and history payload. Existing classrooms receive the new behavior on their next live message. No database reset, API key change, or paid model call was made. These checks validate prompt selection, context, and output boundaries; generated character quality has not been measured with a live model in this change.


## Repeated replies traced to Chrome's offline connection — October 7, 2026

Matched the supplied hello/hey screenshot to Chrome's saved mock sessions; that guest identity had no personal connection, while the Codex browser did. Reconnected the identified Chrome identity once using the existing saved app connection, without logging keys, creating a shared default, or changing general owner isolation. Chrome's Bart, SpongeBob, and Stewie sessions now persist live provider state. Earlier demo messages remain historical records.

**118 unit/database tests**, **25 browser scenarios**, strict TypeScript, ESLint, production build, and Git whitespace checks passed. A focused rerun also covers the final brief-guess instruction. Regression checks exercise missing-key failures without saved fake replies for all three students, retained draft text, same-session promotion after key setup, current model selection after replacement, one bounded repetition/assistant-boilerplate repair, and no live-to-mock substitution. Offline UI fixtures now deliberately open saved-session routes; the main classroom always requests live AI.

Actual live conversation trials used the existing personal connection: three greetings/banter exchanges for each character, followed by provisional average-speed attempts and guided recalculation for each. A further Stewie greeting confirmed an in-character response after rejecting assistant-style wording, and Bart received a specific arithmetic correction. All greeting replies were distinct and returned no unsolicited work. The provisional calculations included arithmetic and rounding errors; these are student drafts, not independently certified answers. The specific Bart correction changed the multiplication/setup, while its final rounding still needed checking. No paid grading evaluation was run. Read-only screenshots of the Chrome identity's live classrooms are `live-personality-bart-v1.png`, `live-personality-spongebob-v1.png`, and `live-personality-stewie-v1.png`.

## Readable live calculations and descriptive diagrams — October 7, 2026

Saved chat work now renders unwrapped LaTeX, inline/display delimiters, and math fences as typeset notation. Each calculation gets its own explanatory line; long relations wrap between complete expressions, and invalid notation falls back to readable text. Student numbers and saved work are preserved rather than silently corrected. New live replies must keep prose free of LaTeX commands, with a single bounded repair if needed.

Generated vector diagrams now wrap short labels, separate overlapping labels from geometry, use subtle connectors when relocating a label, crop excess vertical whitespace, and visibly explain the drawing below it. Long labels become numbered callouts; phone screens use a readable numbered key. Geometry stays unchanged. Teacher annotations retain their clicked positions. The hidden native SVG title tooltip is removed. Drawing instructions now ask for distinct physical stages, short labels, units, generous spacing, and explanatory descriptions. No simulator was added.

All 125 unit and isolated PostgreSQL tests passed, using stubbed transport. Production build, lint, and strict TypeScript passed. Browser checks exercise legacy prose and the supplied overlapping trip sketch, actual SVG text bounds, desktop/phone rendering, saved calculations, inline drawing/annotation persistence, and existing reference slides. The saved Chrome Bart diagram and calculation were also reopened and captured without making model calls. Captures: `readable-diagram-desktop.png`, `readable-diagram-mobile.png`, `clear-live-diagram.png`, and `readable-live-calculation.png`. Layout improvements apply to existing saved diagrams; future model drawing quality still depends on the generated geometry.

## Clear worked-answer sections and explanatory graphs — October 7, 2026

Live work can now contain ordered solution sections with a short title, explanation, formula, substituted values, and result. These render directly in chat with numbered headings and typeset equations. Old saved replies continue using their existing presentation. The live prompt asks for this structure for full worked answers, with an appropriate diagram; validation gives one bounded repair to non-null worked drafts missing requested sections or geometry. Explicit requests to omit diagrams are honored, and missing source figures must not be invented. Character voice stays in the conversational introduction.

The bounded diagram schema adds shaded polygon regions for areas under curves. The supplied constant-acceleration example was exercised as a browser fixture: acceleration 2.5 m/s², distance 80 m, and a labeled velocity–time graph with the triangular area shaded. This is a layout/example test, not a paid generated reply. All 130 unit and isolated PostgreSQL tests passed, including persistence of structured steps and shaded regions across refresh and later revisions. Three affected desktop/mobile browser tests passed, including legacy calculations and drawing annotations. Captures are `worked-motion-answer.png` and `worked-motion-answer-mobile.png`. No new model calls were made for this change.


## Free-question classroom and Teacher instinct — October 7, 2026

The live classroom now creates or resumes an independent room for each student with no assigned problem, chapter, authored guide, initial greeting, or graded answer key. The teacher can introduce or change questions in chat. Problems remains a read-only reference shelf. Earlier problem sessions and saved work are preserved on their existing routes. The compact header contains only student identity and navigation/connection controls.

Trusted instructions now require believable provisional first attempts rather than immediate polished answers. Bart favors shortcuts; SpongeBob can rush or confuse related concepts; Stewie can overlook an assumption. Specific guidance should lead to substantive recalculation or redrawing without resetting learned corrections. Prompt behavior is not a deterministic guarantee of errors on every new question.

A separate bounded review produces only a generic signal and focus. Teacher instinct can suggest checking reasoning, formula, arithmetic, units, assumptions, or a diagram without exposing a correction. Substantive exchanges and generated work are reviewed; simple social greetings without work skip the review. A clear signal is not certification. Review failures retain the student reply with a Not checked cue. Model usage is recorded under the existing spending controls.

The nullable-problem/open-room migration was applied to the local app and dedicated test PostgreSQL databases. All **136 unit/database tests** and **28 browser scenarios** passed in complete runs. Production build, strict TypeScript, ESLint, targeted Git whitespace checks, and whitespace checks for the new source/migration files passed. The running local preview was compared against every changed classroom source file and matches.

New verification covers arbitrary questions and topic changes, independent student rooms, no default problem or premature generation, corrections and historical cues, missing-key draft retention, reviewer failure, ownership, CSRF, stale/concurrent writes, replay, spending limits, student/reviewer prompt separation, mobile layout, refresh/library recovery, and annotation tools. Existing regression coverage includes legacy sessions, math/diagrams, reference slides, onboarding, sidebar folding, credential isolation, and music playback. No paid model calls were made for this change: provider behavior uses stubbed transport and the browser mistake/correction sequence is a fixture. Visually inspected captures: `open-classroom-empty.png`, `open-classroom-instinct.png`, and `open-classroom-instinct-mobile.png`.


## Professor Shalva’s guide and deployment preparation — October 7, 2026

Added one small notebook icon at the top right of the Problems shelf. It opens a separate `/library/guide` page with all nine reminders from the supplied lecture screenshots. Individual problem titles have no added icon. The user’s Pi-Slices GIF is copied unchanged and blended into the full-height shared palette; a still frame supports reduced motion. Responsive open numbered rows keep the guidance readable without extra cards. The same checklist is included as a trusted learning scaffold for all three live students, explicitly preserving their imperfect first attempts and specific responses to guidance.

All **136 unit/database tests** and **29 browser scenarios** passed. Strict TypeScript, warning-free lint, production build, and whitespace checks passed. The guide test verifies the single icon, keyboard navigation, student-preserving return link, nine reminders, desktop GIF loading, phone still-image loading, stable palette, refresh, no horizontal overflow, and no classroom mutations. Provider tests verify that each distinct character receives the guide without being instructed to automatically complete it. Captures: `problems-guide-icon.png`, `problem-solving-guide.png`, and `problem-solving-guide-mobile.png`. No paid model calls were made.

Connected the user’s Vercel workspace, created a separate project and a Neon Free database, configured fresh protected production secrets, and applied all four migrations and the reference seed. `vercel.json` declares the Next.js build, migrations and idempotent seed; Prisma uses the unpooled connection for migrations and the pooled runtime connection for queries.

## Public Vercel release — October 7, 2026

Published commit `f2d2d0285c390310ff6adc479bb1e8e4bb40d57f` at [Professor Shalva’s Physic Classroom](https://professor-shalvas-physic-classroom.vercel.app). Vercel deployment `dpl_5DMNp1FkzdeJ4KHNdXXwTRTi6hQn` reached **READY**. The first upload failed because `scripts/evaluate.ts` imported excluded test fixtures; the upload rules now exclude the evaluation harness too. A fresh build with the deployment file set passed before the successful retry. Build-time migrations and the idempotent seed passed remotely. The Vercel project is linked to the GitHub repository for future pushes.

The actual public-domain browser smoke passed onboarding, all three independent empty classrooms, ownership denial, foreign-origin write rejection, Secure/HttpOnly guest cookies, nine read-only references, diagram and next-step rendering, the single guide icon, all nine reminders, animated GIF loading, reduced-motion still loading, desktop/phone palette and overflow, refresh, navigation recovery, blank personal-key settings, music playback controls, and sidebar folding. Missing-key submissions preserve teacher input and create no canned student reply. **No browser errors and no paid OpenAI calls** occurred in this release check. The isolated smoke guest’s three rooms were deleted afterward; no user history or credentials were touched.

The successful local suite remains **136 unit/database tests and 29 browser scenarios**. The public smoke verifies deployed transport and storage without claiming paid model quality. New production visitors connect their own API key in Settings. Results: `production-smoke.json`. Visually reviewed captures: `production-problem-guide.png` and `production-problem-guide-mobile.png`.


## Simplified Settings — October 7, 2026

Removed the Live student conversations key/model panel and the Focus & accessibility panel, including the stored contrast preference and unused component/styles. Settings now contains history and sound controls. The classroom connection indicator is read-only, and missing-key errors no longer point to a removed form. Existing encrypted personal connections, live student behavior, keyboard focus, reduced motion, and audio remain available. Tightened the sound icon's layout so both remaining panels use their full content width on desktop and phone.

Production build, strict TypeScript, ESLint, all **136 unit/database tests**, and **six affected browser scenarios** passed. Coverage includes the guide, music, session recovery, mobile/keyboard/unavailable-audio behavior, missing-key draft retention, and independent open classrooms. Visual checks confirm both removed forms are absent, both remaining panels are present, and phone content has no horizontal overflow. No paid model calls or credential changes were made.


## Compact lofi.cafe radio with the original offline track — October 7, 2026

The default music source now opens the real lofi.cafe site in one small, visible station window. Its native controls choose stations and handle playback/volume. The frame is created only after a click, survives client navigation and sidebar folding, and is removed when stopped or when choosing the offline track. Moonlit Desk and its original synthesizer are unchanged. Source changes suspend the other player; a lost connection closes the station and selects Offline without unexpected autoplay. Restoring connectivity leaves the local track selected. Source and local volume/mute preferences persist; refresh does not start music.

The frame is sandboxed and receives no page referrer. CSP allows only https://www.lofi.cafe for frames; no third-party audio extraction, injected provider controls, or shared API key was added. The real embedded site was opened and started through its visible controls at a phone viewport, confirming the native station interface fits the window. Third-party station availability remains under lofi.cafe/YouTube control.

Production build, ESLint, and five affected browser scenarios passed: actual synthesized output with shared playback/mute/volume/navigation controls, browser-audio failure/retry, radio lifecycle and network-loss fallback, student selection across five viewports, and mobile/keyboard/unavailable audio. The radio lifecycle scenario stubs the external document to make frame creation and persistence deterministic; it is separate from the real-site visual check. No paid model calls or credential changes were made.

## Blended skate animation in Settings — October 7, 2026

Embedded the supplied Freddy Arenas GIF unchanged into the Settings background. Soft-light blending, feathered edges, and responsive positioning retain the slate, mint, and lavender palette without an extra image card. The decorative scene does not intercept controls. A representative still replaces the animation for reduced motion.

The production build and strict TypeScript passed. ESLint is warning-free after removing an unsupported ARIA attribute from the decorative picture. Browser smoke checks verified the animated asset, reduced-motion source, history dialog open/cancel, original offline playback/pause, and no horizontal overflow at desktop, tablet, and both tested phone widths. No browser errors or model calls occurred. Desktop and phone captures were visually inspected; the supplied GIF's SHA-256 matches the copied asset.
