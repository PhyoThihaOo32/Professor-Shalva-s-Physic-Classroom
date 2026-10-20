# Development

## Local setup

Use Node.js **22.12+**, npm, and PostgreSQL. Dependencies are pinned in `package-lock.json`; install them with `npm ci`.

```sh
npm ci
cp .env.example .env
```

Set these server variables in `.env`:

| Variable | Local value |
| --- | --- |
| `DATABASE_URL` | A PostgreSQL connection for your own development database |
| `APP_ORIGIN` | `http://127.0.0.1:3000` |
| `AUTH_URL` | `http://127.0.0.1:3000` |
| `GUEST_COOKIE_SECRET` | A fresh random secret, at least 32 characters |
| `AUTH_SECRET` | A different fresh random secret, at least 32 characters |
| `COOKIE_SECURE` | `false` for local HTTP; `true` for production HTTPS |

Generate each secret separately with `openssl rand -hex 32`. Use the exact configured origin in your browser; `localhost` and `127.0.0.1` are different origins for request protection.

Use an existing local PostgreSQL installation, or start the included Docker database:

```sh
docker compose up -d --wait db
```

For that container, set `DATABASE_URL="postgresql://chalklight:chalklight_local@localhost:5433/chalklight"` in `.env`. This password is for local development only. Keep the database volume to preserve local history.

```sh
npm run db:migrate
npm run db:seed
npm run dev
```

Open [the local classroom](http://127.0.0.1:3000) and create an email/password account. Google sign-in is optional; follow the [account guide](accounts.md) to configure a local OAuth client. PostgreSQL is required even when live AI is disabled.

## Live responses

Set `OPENAI_API_KEY`, `OPENAI_MODEL`, and `ALLOW_LIVE_AI=true` on the server, then restart it. The example model is `gpt-4.1-mini`. A shared server connection lets signed-in users chat without entering their own key; API usage is charged to that key’s account.

Credentials stay on the server. Never commit `.env` or put keys in `NEXT_PUBLIC_` variables. Keep the call and spending limits from [.env.example](../.env.example) appropriate to your model and budget. With live AI disabled, references and account features remain usable, but open classrooms cannot generate replies. Automated tests use mock transports.

See [live conversations](live-conversations.md) for connection handling and [deployment](deployment.md) for hosted database and production settings.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run eval:mock
npx playwright install chromium
npm run test:e2e
```

Unit tests stub the model transport. Database tests run only when `TEST_DATABASE_URL` points to a dedicated migrated and seeded test database. Browser tests build and start the production app on port 3100 with live AI disabled. Use a separate development/test database, never production, for these checks. Screenshots go to `docs/screenshots/`; mock evaluation results go to `docs/reports/evaluation-mock.json`.

To prepare a database test run with a local PostgreSQL role:

```sh
createdb chalklight_test
DATABASE_URL="postgresql://YOUR_LOCAL_ROLE@localhost:5432/chalklight_test" npm run db:migrate
DATABASE_URL="postgresql://YOUR_LOCAL_ROLE@localhost:5432/chalklight_test" npm run db:seed
TEST_DATABASE_URL="postgresql://YOUR_LOCAL_ROLE@localhost:5432/chalklight_test" npm test
```

For browser tests, also point `.env` at that disposable database. Account tests create and clean up their own test users. `E2E_BASE_URL` and `E2E_SERVER_COMMAND` can select another local test server. The [verification record](verification.md) distinguishes automated fixtures from live-provider checks.

## Build and maintenance

```sh
npm run build
npm start
```

Production requires HTTPS and the actual trusted `APP_ORIGIN` and `AUTH_URL`. The [deployment guide](deployment.md) covers Vercel migrations, idempotent seeds, and server configuration.

`npm run db:cleanup` removes guest identities inactive for `GUEST_RETENTION_DAYS` (default 30), with their dependent records. Schedule it only in an environment you intend to maintain. Settings supports owned-history export and deletion; database backups have their own retention policy.

### Cloud-synced workspaces

If macOS cloud storage evicts dependencies or build files, use a nonsynced checkout. This workspace also provides `npm run dev:local`: stop the current preview, then run it to copy source and local configuration into a disposable preview under `~/.cache/chalklight-physics-runtime/`. Restart it after source or environment edits. Original source files stay in the repository. A normal fresh checkout uses `npm run dev` and ordinary `.next` output.

## Contributing

Keep routing in `app/`, reusable UI in `components/`, domain/server logic in `lib/`, and browser assets in `public/`. Add database changes through committed Prisma migrations; preserve existing account and session data. Read the installed Next.js guides noted in [AGENTS.md](../AGENTS.md) before framework changes.

Run checks relevant to the change, update affected documentation, and keep secrets, generated code, dependencies, and local test traces out of commits. For new exercises, follow [content authoring](content-authoring.md) and independently review the physics before publishing.
