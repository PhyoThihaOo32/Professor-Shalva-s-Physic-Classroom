# Vercel deployment

Project: `professor-shalvas-physic-classroom` in the user’s `phyothihaoopto-9821s-projects` workspace. Production domain: [Professor Shalva’s Physic Classroom](https://professor-shalvas-physic-classroom.vercel.app).

The separate Neon Free project is `divine-salad-90921214`, with production branch `br-twilight-river-b8juhqjb`, in AWS US East 1. The app uses its pooled connection; Prisma migrations use its direct connection. No local conversations or personal API credentials are copied to production.

## Configuration

Production environment variables are configured in Vercel. `DATABASE_URL`, `DIRECT_DATABASE_URL`, `GUEST_COOKIE_SECRET`, `AUTH_SECRET`, and `AI_KEY_ENCRYPTION_SECRET` are sensitive values. `APP_ORIGIN` and `AUTH_URL` match the production HTTPS domain. `COOKIE_SECURE=true`; `ALLOW_LIVE_AI=false` means each teacher connects a personal API key in Settings. No shared OpenAI key is deployed. Production guest sessions and keys belong to the deployed origin.

`vercel.json` selects Next.js and the `iad1` function region. Its build applies committed migrations, seeds published reference content idempotently, and builds the app. The Node API route has a 60-second platform limit, covering the shorter application deadlines. `.vercelignore` excludes local configuration, generated dependencies, caches, tests, the evaluation script that imports those test fixtures, and documentation from CLI uploads. Secrets and the local Vercel link are also excluded from Git.

## Release checks

Before the first production publish, strict TypeScript, warning-free ESLint, all 136 unit/database tests, all 29 browser scenarios, and the production build passed. All four migrations were applied to the fresh hosted database, and its nine Chapter 2 references and student records were seeded successfully. UI/provider tests use stubbed transport and make no paid OpenAI calls.

After publishing, check the guide, onboarding, reference diagrams, settings, and creation/recovery of an empty classroom at the canonical domain. Confirm secure cookies, rejection of foreign-origin writes, and no canned reply when the teacher has no key. A broken database/API flow or failed classroom recovery should block release. If a later deployment regresses these flows, roll back to the previous compatible deployment while retaining database contents; do not reset the database to roll back code. Keep schema changes compatible with the chosen rollback version.

The initial production smoke-test outcome is recorded in [verification](verification.md).
