# Professor Shalva’s Physic Classroom

The human teaches an original simulated student. Teacher/Student mode is a learning preference. Only Auth.js GitHub authentication plus the immutable configured GitHub account ID grants content ownership. Guests never gain owner privileges.

## Server boundaries

- `lib/content.ts`: six original demo problems, reviewed references, rubrics, constrained diagram specifications, and 30 approved templates. No client import.
- `lib/domain.ts`: safe DTO types, scoring weights, and public persona descriptions. No private content or runtime content schemas.
- `lib/schemas.ts`: server-owned strict Zod content and model-output schemas. Client code imports its types only.
- `lib/planner.ts`: persona-weighted eligible root selection; one major root maximum; difficulty requests one/two/three independent roots and caps to eligible templates. Prevents roots overlapping downstream consequences.
- `lib/providers.ts`: interchangeable mock/live generation and independent evaluation. No tools, browsing, arbitrary execution, retrieval, or student self-grading.
- `lib/physics.ts`: independent numeric regression calculations in SI units. No expression evaluator.
- `lib/evaluator.ts`: conservative, limited mock correction checker. It recognizes supported explanations, numeric corrections, and consistent sign conventions. Unrecognized alternate approaches stay uncertain. It is a teaching aid, not a general symbolic verifier.
- `lib/sessions.ts`: ownership, pinned versions, state transitions, operation reservations, revision checks, correction history, hint tracking, root assessments, and explicit reveal.
- `lib/api.ts`: App Router Route Handler dispatch, strict validation, exact-origin mutation protection, request IDs, safe errors, no-store session responses, own-history export/deletion, owner content routes.

Live generation is deliberately constrained to canonical, pre-reviewed step payloads and persona greetings. Structured Outputs validate shape; an independent exact comparison also validates narrative, stable IDs, equation, numeric field, units, and diagram against the approved error plan. One repair is allowed. Off-plan text is rejected, even if plausible. This provides a working safe boundary, not unrestricted AI improvisation. Revisions copy reviewed target/dependent step payloads and retain the original plus revision history. Final solutions always come from pinned reviewed references.

The evaluator receives the public statement/givens/assumptions/rubric, the current step, its reviewed counterpart, the expected correction for that issue, and bounded user feedback. It returns strict verdict, criterion fractions, and a next-action enum. Public evidence comes from reviewed current-step material assembled on the server; free model text cannot leak later references. This is independent from the student simulator. Suspicious embedded reveal/score instructions are rejected before a model call. No pattern filter alone is treated as a security boundary: references and ledgers also stay server-side, and response DTOs expose only visible steps.

The prompts in `lib/prompts.ts` are versioned. Sessions pin the prompt, content, persona, rubric, provider, and model. Keep old prompt definitions when adding a new version and route old sessions to their pinned implementation. This MVP ships only prompt v1, persona v1, and rubric v1.

## Transactions and idempotency

A signed cookie identifies a PostgreSQL GuestIdentity. Every session has exactly one guest or user owner, enforced by a database CHECK. A PostgreSQL trigger prevents changes or deletion of a published ProblemVersion. Draft edits create a new version rather than modifying an existing one.

Session mutation reservation acquires a transaction-scoped PostgreSQL advisory lock, verifies ownership and revision, checks an operation key/request hash, inserts the operation, and increments the revision. Model calls happen outside that transaction. Commit reacquires the lock and requires the reserved revision. Step changes, scores, events, revision increment, and the cached public operation result commit atomically. Reusing a key returns the committed result; changing its payload is a conflict. Concurrent pending mutations are rejected. A failed operation requires reloading and a new key. A reserved operation older than 35 seconds is marked failed on owner GET; a crashed generation becomes a recoverable failed session. There is no silent mock fallback.

Earlier-step corrections invalidate downstream validity checks and mark later independent scores provisional. They retain independent resolved corrections. Rechecking a later resolved root clears its provisional flag unless disputed. Original attempts never change. Repeat explanations replace a root assessment; they never accumulate points.

## Formative scoring

Identify 25; physics 30; correction 25; check 10; clarity 10. Each applicable criterion gets 0, 0.5, or 1 of its weight, normalized to 100. Independent root assessments are averaged with minor/major/critical severity weights 1/2/3. Unresolved roots contribute zero. Downstream consequences do not add penalties. Assistance is reported separately. Uncertain or disputed results stay provisional. Open disputes require an instructor note and can be resolved explicitly; no dispute silently forces a grade change.

## Quotas and retention

Guest/user hourly starts and UTC daily spending reservations use locked PostgreSQL Quota rows. Live calls also reserve per-session count and cost before execution. Failed calls retain their conservative reservation. OpenAI retries are disabled; schema/physics repair is bounded to one, under a shared 30-second deadline per AI operation. No raw provider errors or secrets appear in public errors. ModelCall stores status, model, reservation, and token-usage metadata, not raw prompts or provider reasoning.

`MODEL_CALL_RESERVATION_CENTS` is a conservative cap per call, not measured billing. Set it to an upper bound for the selected model, bounded input size, and maximum output tokens (3,500 student; 650 evaluator). A reviewed problem can contribute several thousand tokens, so choose an appropriate reserve. Also configure a provider project spending limit. Quotas persist after history deletion to prevent resetting the spend cap.

Run `npm run db:cleanup` on your own schedule to delete guests inactive longer than `GUEST_RETENTION_DAYS` (default 30) and cascade their sessions. This is delivered as a maintenance command; no recurring job is installed. Session history export excludes private references until reveal. Confirmed deletion removes owned sessions with all dependent records from the active database. The local MVP creates no backups. For a deployment, document your PostgreSQL backup retention independently; a recommended explicit starting policy is encrypted backups retained 7 days, with deletion fully aging out after that retention. Choose and communicate the actual policy before operating publicly.

## Student mode next

The informative future-mode screen is implemented. Add Student mode as a separate learner flow with its own attempt/evaluation schemas, no intentionally wrong tutor grading, independent answer checking, and its own tests. Reuse reviewed versioned content, diagrams, authentication, ownership, events, hints, and history. Never use the learning-mode switch as an authorization mechanism.


## Saved student conversation

`POST /api/sessions/:id/messages` accepts the shared mutation envelope with a visible `stepId` and a nonempty message of at most 2,000 characters. It uses the same reserve/call/commit flow as corrections. Conversation does not mutate assessments, attempt steps, or reveal state. The operation and paired teacher/student `SessionEvent` commit atomically; replay returns the cached public DTO without a second model call. The DTO whitelists conversation IDs, visible step IDs, teacher/student text, and timestamps. History export includes the same public conversation; deletion cascades its events.

At most 100 conversation turns are admitted atomically per session. Queries retrieve the complete bounded conversation and the most recent general session event separately. Each conversation event pins `CHAT_PROMPT_VERSION`. The live student receives only the current visible step, public persona, user message, and last six public conversation turns. It receives no reference, expected correction, private error plan, later step, or grading rubric. It has no tools. `responses.parse` uses a strict message schema and `store:false`. Output checks reject numeric/equation/code/URL and selected grading/reveal content; one repair is allowed. These checks do not prove free-text physics correctness; replies are deliberately limited to acknowledgments and follow-up questions, with corrections handled by the independent evaluator. Known injection requests receive a local refusal to reveal, rather than a model call or provider switch.

Mock conversation is visibly labeled and uses authored persona-aware follow-up questions. No real OpenAI conversation was run during implementation. The UI uses a muted dark palette, flat rows and minimal surfaces; the message composer is available on every open teaching session and supports Cmd/Ctrl+Enter. The Course notes page summarizes the supplied Chapter 1/2/3 resources; no copyrighted lecture deck or scanned student homework is served publicly.

## Entry and classroom navigation

The public entry journey uses separate pages: `/` for welcome, `/roles` for role selection, `/students` for the simulated student, and `/classroom` for problems and saved sessions. Classroom navigation appears after entry. Student mode retains its clearly labeled future screen. The chosen public persona ID is stored as the browser preference `chalklight-student`; a validated `student` query parameter carries it from the classroom into problem setup. Selection does not change existing sessions or grant owner access. Problem setup previews the question with optional settings, so student selection is not repeated. Legacy `/library` bookmarks redirect to `/classroom`.

## Shared classroom board

The classroom has a continuous shared work board beside a single conversation composer. `/classroom` is the separate problem library; `/problems/:id` previews the question, keeps session settings in a details disclosure, and starts the selected student's board. Only revealed steps are navigable. The browser stores the selected step for refresh recovery; previous saved stage fields are ignored. Selecting a step changes its conversation context and clears unsent text. Guide and correction intents are explicit UI choices and use the existing `messages` and `corrections` mutations respectively. No keyword inference classifies a guide message as a scored correction.

Correction/check events now store a whitelisted teacher text alongside the existing actual student reaction. `discussion` exposes the most recent 200 message/correction/check events in chronological order. It excludes disputes, malformed events, nonvisible steps, and private event fields. The original 100-turn `conversation` field and live-provider history remain separate to preserve chat quotas and prompt context. No additional correction model call is introduced. Older cached operation results without `discussion` render their existing conversation safely. Evaluator evidence appears in a separate physics-check disclosure, never as a student reply.

## Reference-derived app theme

The root layout imports `app/cosmos.css` after base layout styles. Semantic colors and native CSS treatments translate the reference palette and mood into every route. The reference image is not loaded by the app. The background uses only subtle CSS gradients; small welcome orbit details use borders and shapes. Slate-teal navigation and conversations, turquoise primary actions, violet/coral details, and mint reading surfaces form the shared theme. Manrope remains self-hosted. Existing high-contrast and reduced-motion preferences apply. This presentation layer makes no provider, scoring, session, or authentication changes.
