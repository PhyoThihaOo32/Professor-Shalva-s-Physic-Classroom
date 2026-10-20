# Professor Shalva’s Physic Classroom

*Little steps. Big discoveries.*

A physics classroom where characters make learning a conversation.

[Open the classroom](https://professor-shalvas-physic-classroom.vercel.app) · [Setup guide](docs/development.md) · [Documentation](docs/README.md)

---

## Two ways to learn

| Be the teacher | Be the student |
| --- | --- |
| Guide **Bart Simpson**, **SpongeBob SquarePants**, or **Stewie Griffin** through their shortcuts, mistakes, and discoveries. | Learn with **Rick Sanchez**, **Dr. Nefario**, or **Edna Mode**, each with a distinct teaching style. |

Draw diagrams, work through equations, and explain ideas directly in chat. A teacher-instinct lightbulb flags work worth checking. Save conversations in **My space**, explore worked problems, and settle in with radio or an original offline lo-fi track.

## Run locally

Requires **Node.js 22.12+**, npm, and PostgreSQL.

```sh
npm ci
cp .env.example .env
```

Set `DATABASE_URL`, `GUEST_COOKIE_SECRET`, and `AUTH_SECRET` in `.env`, then:

```sh
npm run db:migrate
npm run db:seed
npm run dev
```

Open [127.0.0.1:3000](http://127.0.0.1:3000) and create an account. For live replies, configure the server’s `OPENAI_API_KEY` and set `ALLOW_LIVE_AI=true`. API usage is billed to the key’s owner; keep credentials private. See the [setup guide](docs/development.md) for Docker, Google sign-in, and testing.

## Inside the project

```text
app/          Pages, API routes, and styles
components/   Classroom and shared interface
lib/          Physics, AI, accounts, and session logic
prisma/       Database schema, migrations, and seed
public/       Fonts, character portraits, and animations
tests/        Unit and database checks
e2e/          Browser tests
scripts/      Development and maintenance tools
docs/         Guides, screenshots, and reports
```

**Built with** Next.js · React · TypeScript · PostgreSQL · Prisma · Auth.js · OpenAI · KaTeX

## Contributing

Keep changes focused and run the [relevant checks](docs/development.md#checks) before opening a pull request. Character artwork belongs to its respective rights holders; [sources and credits](docs/character-profiles.md) are documented separately.
