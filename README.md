# Professor Shalva’s Physic Classroom

![Professor Shalva’s Physic Classroom welcome page](docs/welcome-full-scene.png)

A Next.js application for PHY215H: learn physics by teaching SpongeBob SquarePants, Bart Simpson, or Stewie Griffin. The whole app derives its colors, rounded forms, and soft lo-fi mood from the supplied cosmic reference. Twilight gradients, mint controls, lavender glass, peach accents, pale work paper, and native CSS orbital details form the interface. The earlier palette-reference photo, wallpaper, and generated illustration remain inactive. The user-supplied Two Dots space GIF fills the welcome page, the Tomas Brunsdon astronaut GIF fills role selection, and the evite rocket GIF fills student selection. The scenes blend softly into the shared slate/lavender canvas with consistent mint controls and translucent choice cards; still frames support reduced-motion settings. Locally served character pictures appear only as student profiles ([sources](docs/character-profiles.md)). Text uses readable self-hosted Manrope. The entry flow is **Welcome → Choose your role → Choose a student → Classroom conversation**, on separate pages. Classroom starts with an empty conversation for the chosen student and resumes that student’s saved chat. The teacher supplies any question; no chapter or reference problem is assigned. **Problems** is a separate reference page containing Chapter 2 questions and diagrams, with worked solutions presented one step at a time using Previous and Next. Browsing references creates no session and never replaces the live classroom. The sidebar contains only Classroom, Problems, and Settings. A small notebook icon at the top of Problems opens Professor Shalva’s nine-step problem-solving guide on its own page, with the supplied Pi-Slices animation blended into the shared palette.

The chat is the classroom workspace, with one slim input at the bottom. Students show explanations, equations, calculations, and their own drawn diagrams directly in their replies, revising their work when you guide them. There is no separate Show work board control. A small pencil button opens inline paper with pen, arrow, and label tools for teacher annotations; submitting a message saves and shares those marks with the student. Questions, diagrams, and authored worked solutions are available in **Problems**. Existing saved session review tools remain available on their session routes. Refresh restores your saved conversation, diagrams, and work. The open classroom uses live AI and requires a configured key to send messages. Earlier saved mock sessions remain available on their session routes; their sketches are labeled deterministic demos. Student mode has an informative future screen. Artwork and its generation prompt are documented in `docs/art-direction.md`.
Nine Chapter 2 exercises are available as references in Problems. Six original demo problems remain in the seed data for legacy sessions and regression checks, outside the shelf. They cover centripetal acceleration, flat-road friction, minimum top contact speed, bottom tension, a conical pendulum, and rpm/unit conversions. These are original problems, not textbook excerpts. The bucket regression uses inward downward, `mg + N = mv²/r`, `N ≥ 0`, and `v_min = sqrt(9.81 × 0.80) = 2.80 m/s`; an outward-positive convention is also valid.

## Run locally

Requires Node **22.12+** (verified on 22.22.3), npm, and PostgreSQL. Exact package versions are pinned in `package.json` and `package-lock.json`. This project deliberately uses stable **Prisma 7.10.0**, its `prisma-client` generator and PostgreSQL driver adapter; do not mix in Prisma 6 URL configuration or Prisma 8 release-candidate migration commands.

```sh
npm ci
cp .env.example .env
```

Edit `.env`: set your direct PostgreSQL `DATABASE_URL`, `APP_ORIGIN=http://127.0.0.1:3000`, and two different random secrets for `GUEST_COOKIE_SECRET` and `AUTH_SECRET`. Generate each with `openssl rand -hex 32`. Leave `ALLOW_LIVE_AI=false` and the API key empty for mock use. Secrets stay on the server. Existing personal OpenAI connections are encrypted before database storage and never saved in browser storage or exposed through `NEXT_PUBLIC_` variables. Settings contains history and sound controls; API-key and focus-mode controls have been removed.

With a running local PostgreSQL installation, create a database owned by your local role:

```sh
createdb chalklight
# Example connection: postgresql://YOUR_LOCAL_ROLE@localhost:5432/chalklight
npm run db:migrate
npm run db:seed
npm run dev
```

Open [Professor Shalva’s Physic Classroom](http://127.0.0.1:3000). Use the exact configured origin; `localhost` and `127.0.0.1` are different origins for CSRF checks. PostgreSQL is required in mock mode too; there is no browser-only or volatile-storage fallback.

This workspace is already installed, migrated, and seeded against the local `chalklight` database. Its ignored `.env` contains fresh local cookie/auth secrets and **no OpenAI credentials**. A development preview is running at the link above. For **this iCloud-synced Desktop workspace**, use `npm run dev:local` when restarting: it copies the editable source and local `.env` into a disposable nonsynced preview under `~/.cache/chalklight-physics-runtime/preview-…`, then starts Next.js there. Stop the current preview first; restart the command after source or `.env` edits. The original source files remain here. The copy is local to this machine, its `.env` is restricted to your user, and it makes no paid API calls by itself. A fresh nonsynced checkout can use ordinary `npm run dev`.

A container alternative is available if you have Docker:

```sh
docker compose up -d db
# Set DATABASE_URL=postgresql://chalklight:chalklight_local@localhost:5433/chalklight
npm run db:migrate
npm run db:seed
npm run dev
```

For a production build: `npm run build`, then `npm start`. Production sets secure guest cookies; serve behind HTTPS and set `APP_ORIGIN`, `AUTH_URL`, and `COOKIE_SECURE=true` for the actual trusted origin. The Vercel deployment configuration uses the Next.js runtime, applies migrations through a direct database connection, seeds the reference content idempotently, and builds the app. See [deployment notes](docs/deployment.md) for production configuration and verification.

## Teacher flow

Welcome → Teacher mode → choose a student → classroom conversation. Problems opens the question, diagram, and authored solution together as a reference. Use the separate Problems page to read references; live calculations and diagrams appear directly inside the chat. The open classroom has no reference grades or prescribed steps. Students begin with believable provisional attempts, shortcuts, or unchecked assumptions, and learn through the teacher’s guidance. A subtle Teacher instinct cue identifies a possible arithmetic, units, formula, reasoning, diagram, or assumption concern without supplying the corrected answer. It is a separate, fallible check; an unavailable check never discards a student reply. Earlier session routes retain their reference-based correction, hint, and assessment tools.

The classroom has one unobtrusive input. Press Enter to send or Shift+Enter for a new line; the send button and Cmd/Ctrl+Enter also work. IME composition and held-key repeats do not submit. There are no message-mode buttons, provider selector, keyboard hint, or instructional footer in the live classroom. Opening a classroom makes no generation call. Sending a substantive message uses the configured live model for the student and a separate bounded review for the instinct cue; brief greetings without work skip review. AI settings remain accessible through Settings and the small connection indicator.

**Problems** holds read-only authored solutions. The live classroom resumes independently. Older Manual URLs redirect to the corresponding reference. Progress and Course notes routes redirect to Problems; their navigation sections are removed. Existing saved sessions and source records are preserved. Open conversations use the teacher’s first question, recent exchanges, and the student’s latest saved attempt, without an assigned reference problem. Legacy problem sessions retain their separate public problem context. Generated revisions preserve history, stay provisional and never assign their own grades. The original authored work stays out of the live chat. Ownership, revision/idempotency, deadlines and spending controls continue to protect messages and revisions.

## Add your textbook problems

1. Set up an owner GitHub OAuth app. Set `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_URL`, `AUTH_SECRET`, and **`AUTH_OWNER_GITHUB_ID` to the immutable numeric GitHub account ID**, not the display name. Register `http://127.0.0.1:3000/api/auth/callback/github` as the local callback URL. Restart the server. Sign in from `/owner`. Only that authenticated ID is allowed; Teacher mode grants no editor permission.
2. Select a demo in Content studio to inspect the complete JSON schema. Use **Copy as a new problem**, then replace the content. Set `kind` to `textbook`, include precise `source` and `permission` notes, and use new versioned IDs for its approved error templates. Obtain permission before entering copyrighted textbook excerpts. The UI labels textbook content separately.
3. Supply the statement, objectives, givens, requested quantity, assumptions, numeric target/unit/tolerance, problem-specific rubric, reviewed 6–10-step reference (stable IDs `s1` … `sN`), and approved root mistakes with downstream dependencies. Diagram kinds are `orbit`, `road`, `top`, `bottom`, `pendulum`, and `conversion`; they render only constrained authored SVG primitives. Extend the renderer and tests before adding another diagram kind.
4. Save a draft, independently check algebra/numbers/units/directions/conditions, then save a **review** version. Add a review note and explicit permission/physics confirmation before publishing. The publish route validates numeric final targets and structural references; it cannot replace expert physics review.
5. Publishing creates an immutable version. Each edit saves a new version. Existing sessions retain the version they started with. The current content studio adds problems to the initial circular-motion chapter; adding another chapter requires extending its chapter selector and chapter creation API.

Reference/template/schema files: `lib/content.ts`, `lib/schemas.ts`, `lib/domain.ts`; SQL migration: `prisma/migrations/20261006000000_initial/migration.sql`; seed: `prisma/seed.ts`. Seed runs are idempotent and do not overwrite published versions. Changing demo source does not change already-seeded versions: create/publish a new version. Add independent regression cases for new problems.

## Enable live AI deliberately

Existing personal connections continue to provide live replies after removal of the Settings key/model panel. The server encrypts each key with AES-256-GCM and binds it to its signed guest/authenticated identity. It stores only ciphertext in PostgreSQL and never returns the key in config/history or browser storage. Private connection APIs remain available for authorized administration; a server-managed connection can also be configured through the environment below. The classroom shows a read-only connection status. An unavailable connection keeps the draft and saved chat without substituting a mock response. [Connection and work behavior](docs/live-conversations.md).

A shared server connection still supports `OPENAI_API_KEY`, `OPENAI_MODEL`, and `ALLOW_LIVE_AI=true` in server `.env`. Existing model-call and conservative spending limits apply to both connections. Optional `AI_KEY_ENCRYPTION_SECRET` overrides the derivation from `GUEST_COOKIE_SECRET`; rotating it requires reconnecting saved keys. Guest cleanup cascades to stored credentials.

The official SDK uses server-side `responses.parse`, strict `zodTextFormat`, `store:false`, no tools, no external retrieval, and `maxRetries:0`. The initial student attempt must exactly match reviewed approved renderings; one bounded repair is allowed. Its evaluator is separate. Corrections, relevant physics, and conversation messages are sent to OpenAI. **`store:false` does not guarantee zero provider retention.** Avoid personal data. API-key usage is separate from ChatGPT subscription usage; see [official pricing guidance](https://learn.chatgpt.com/docs/pricing). Never paste API keys into chat or commit them to the repository. The shared connection key stays in server `.env`. Initial implementation used stubbed transports. After the owner connected a key, five live guide-message smoke checks exercised Enter submission, Bart’s character voice and work-board recalculation; no paid grading evaluation was run.

Live evaluation is opt-in and refuses to run without both credentials and an explicit paid flag:

```sh
# This command can spend money; run only when you choose to authorize it.
EVAL_MAX_CALLS=66 EVAL_BUDGET_CENTS=3300 npm run eval:live -- --confirm-paid
```

The harness runs **18 initial attempts** and **36 labeled corrections**, with configurable call/budget caps, recording actual verdicts, failures, usage, and counts to `docs/evaluation-live.json`. Budget exhaustion is reported as failure, not fabricated passes. The model prompt/version and conservative reserve should be reviewed before running. Repairs can make the call cap stop the run early.

## Verify

```sh
npm run typecheck
npm run lint
npm run test
npm run eval:mock
npx playwright install chromium
npm run test:e2e
npm run build
```

`npm run test` runs pure physics/scoring/security/provider tests. Database tests are skipped unless `TEST_DATABASE_URL` points to a dedicated seeded test database. The live SDK transport is stubbed in tests, so those tests never spend money.

```sh
createdb chalklight_test
DATABASE_URL="postgresql://YOUR_LOCAL_ROLE@localhost:5432/chalklight_test" npm run db:migrate
DATABASE_URL="postgresql://YOUR_LOCAL_ROLE@localhost:5432/chalklight_test" npm run db:seed
TEST_DATABASE_URL="postgresql://YOUR_LOCAL_ROLE@localhost:5432/chalklight_test" npm run test
```

Playwright uses isolated guest identities against the locally configured app database and a server at port 3000. Its test deletion acts only on its own guest history. For deployment CI, run Playwright with a dedicated app/test database. See `docs/verification.md` for actual results, limitations, and remaining dependency advisories, and `docs/evaluation-mock.json` for every mock case.

## Supplied course resources

`/resources` organizes the supplied 49-slide Chapter 2 lecture (one-dimensional kinematics), the four-page Week 1 measurement module (Chapter 1), and six-page Chapter 3 handwritten homework (vectors and motion in multiple dimensions). These are topic summaries, not redistributed source files or automatically verified answer keys. The original files were inspected read-only and remain in their original locations. Source instructions were treated as course content; no homework assignment was executed. Nine user-provided Chapter 2 exercises now have worked steps and approved teaching mistakes; problem 17 awaits its graph. See `docs/course-resources.md` for the source/edition distinctions and authoring scope.

## Data, audio, and future mode

Settings supports own-history JSON export and explicitly confirmed deletion. Only visible active-session steps are exported before reveal. `npm run db:cleanup` removes guest identities inactive for the configurable default of 30 days, cascading dependent history. Schedule it in your environment; no cron job was installed. Active database deletion and backup retention are separate: the local app creates no backups; set and disclose a backup-retention policy before deployment.

Audio defaults off. Radio opens lofi.cafe in one small, visible, sandboxed station window that survives client navigation. Its native controls handle station choice, playback, and volume; closing the window stops the station. The Offline option keeps Moonlit Desk, our original 74 BPM browser-synthesized track. Losing connectivity closes the radio and selects the offline track, which starts only when Play is pressed. Switching sources stops the other player. Shared controls and source/volume preferences stay in sync; refresh never starts playback. Only lofi.cafe is allowed by the frame source policy, and the embed receives no classroom data or page referrer. Character-profile sources are documented in `docs/character-profiles.md`; physics diagrams are authored SVG. Equations include KaTeX MathML, keyboard focus is visible, and reduced motion is respected.

Student mode currently explains what is coming. Continue by building a separate learner attempt/tutor flow around the same reviewed content and independent evaluation; see `docs/architecture.md` for implementation boundaries and the continuation plan.

## Official documentation used

- [Next.js App Router setup](https://nextjs.org/docs/app/getting-started/installation), plus the installed Next.js 16.4 route/cookie/component/testing guides.
- [Prisma 7 configuration and driver adapters](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7) and [Prisma client generation](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/generating-prisma-client).
- [OpenAI Structured Outputs / Responses SDK](https://developers.openai.com/api/docs/guides/structured-outputs).
- [Auth.js Next.js installation](https://authjs.dev/getting-started/installation).
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs).

Local environment note: macOS cloud storage evicted installed files during verification. To keep this Desktop workspace usable, it uses Next.js’s supported Webpack mode, and its `node_modules` is a symlink to the complete dependency installation at `~/.cache/chalklight-physics-runtime/node_modules`. The ignored `.chalklight-build-cache` parent symlink keeps Next.js build output in a dedicated `~/.cache/chalklight-physics-runtime/build/next` directory, so cloud eviction cannot truncate generated manifests. The config uses this cache only when that local link exists; a fresh checkout uses ordinary `.next` output. The source, migrations, lockfile, and configuration remain here. For a fresh checkout, a normal `npm ci` works; keep dependency installations in a nonsynced local folder if your filesystem evicts them. `docs/physics-reference.md` contains the original references for source review and is not served as a public asset.

## Repository and branding

Source repository: [Professor-Shalva-s-Physic-Classroom](https://github.com/PhyoThihaOo32/Professor-Shalva-s-Physic-Classroom). The current application name is **Professor Shalva’s Physic Classroom**. Earlier design screenshots show the original working title. Existing `chalklight` database names, browser preferences, guest cookie, and credential-encryption identifiers are intentionally retained so the rename preserves saved sessions and connected keys. API keys, `.env`, generated dependencies/build output, database files, and browser test traces are excluded from Git. A fresh clone must configure its own `.env`, migrate and seed its own PostgreSQL database.
