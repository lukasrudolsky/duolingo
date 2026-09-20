# CONTRIBUTING.md

Local dev setup and day-to-day commands. See `ARCHITECTURE.md` for how the codebase is laid
out and `PLAN.md` for what's being built and in what order.

## Prerequisites

- Node.js 22+, pnpm (`corepack enable` picks up the version pinned in `package.json`).
- A local PostgreSQL and Redis. Either:
  - `docker compose up -d` (uses `docker-compose.yml`), or
  - native Postgres 16 + Redis, with a `duolingo` role/database matching `.env.example`.

## First-time setup

```bash
cp .env.example .env.local
# Generate a real value for AUTH_SECRET:
npx auth secret
# paste the output into .env.local

pnpm install
pnpm db:generate
pnpm db:migrate   # creates db/migrations/*, applies them, then runs the seed
```

The seed inserts the 5 fixed exam tracks (Reading, Use of English, Listening, Writing,
Speaking) plus, from Phase 1, a small hand-authored demo lesson (`content/seed/lesson-demo.ts`)
so there's something to run through the lesson runner. It never inserts LLM-generated content,
that comes from the content pipeline (Phase 4, see `PLAN.md`).

## Running the app

```bash
pnpm dev
```

Open http://localhost:3000. Sign in with any email: without a `RESEND_API_KEY`, the magic
link is logged to the terminal instead of emailed (look for `[dev] Magic link for ...`) and
you open it directly in your browser.

## Checks (run before every commit, see SPEC.md section 16)

```bash
pnpm typecheck
pnpm lint
pnpm test        # unit tests (Vitest), lives next to the code it tests
pnpm test:e2e     # Playwright, e2e/*.spec.ts, starts its own dev server on :3100
```

## Environment variables

See `.env.example` for the full list with comments. Everything needed for local dev has a
safe default or a documented dev fallback (Google sign-in hidden, magic link logged to
console, Stripe test mode, Sentry/PostHog no-op) except `DATABASE_URL`, `REDIS_URL` and
`AUTH_SECRET`. Production credentials (Neon/Supabase, Upstash, S3, Stripe live, Resend,
Google OAuth, Sentry, PostHog) are listed as open items in `TODO.md`.

## Database

- Schema: `db/schema.prisma`. Prisma 7 reads the connection URL from `prisma.config.ts`
  (`DATABASE_URL`), not from the schema file, and `lib/db.ts` connects `PrismaClient` at
  runtime through `@prisma/adapter-pg`. See the comment at the top of `db/schema.prisma`.
- New migration: `pnpm db:migrate` (interactive, prompts for a name).
- Inspect data: `pnpm db:studio`.
