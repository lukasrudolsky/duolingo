# ARCHITECTURE.md

Živý dokument. Aktualizuje se na konci každé fáze (SPEC.md sekce 16, Definition of Done).

## Přehled

Next.js 16 (App Router) monolit. Business logika v `/core` je čistý TypeScript bez závislosti na
Reactu nebo na síti, testovatelný samostatně. `/app` je jen tenká UI a routing vrstva nad `/core`.

SPEC.md sekce 8 navrhuje Next.js 15; ve Fázi 0 už byl aktuální stabilní Next.js 16, použit
místo toho (jde jen o verzi frameworku, ne o architektonické rozhodnutí).

Zásada, kterou drž při každé změně: **`core` nikdy neimportuje z `app`.** Import jde jen jedním
směrem: `app -> core -> lib`. Pokud potřebuješ v `core` něco z frameworku (např. `cookies()`),
je to špatně navržené rozhraní, přenes tu hodnotu jako parametr.

## Struktura složek

```
/app
  /(marketing)         landing, sign-in (email magic link + Google), disclaimer footer
  /(app)               autentizovaná část (guard v layout.tsx přes auth())
    /learn             skill tree (Fáze 0: seedované Tracky, prázdné Units)
    /lesson/[id]       běh lekce                          [Fáze 1]
    /practice          daily mix, mistakes bank            [Fáze 2]
    /exam              mock testy                          [Fáze 8]
    /writing           writing hub + feedback              [Fáze 7]
    /speaking                                              [Fáze 9]
    /profile
  /(admin)              content review queue, item editor  [Fáze 4]
  /api/auth/[...nextauth] Auth.js route handler
/core                  prázdné, první moduly přijdou ve Fázi 1 (exercise-engine)
/components            sdílené UI komponenty (zatím jen LocaleSwitcher, PostHogProvider)
/db                    prisma schema, migrace (db/migrations), seed (db/seed.ts)
/lib
  env.server.ts        validované server-only env vars (Zod), "server-only" guard
  env.public.ts        validované NEXT_PUBLIC_* env vars
  db.ts                PrismaClient singleton (přes @prisma/adapter-pg)
  auth.ts / auth.config.ts  Auth.js v5 (split kvůli edge-safe configu, viz rozhodnutí níže)
  i18n/                next-intl bez URL routingu (config, request, actions, messages/)
  analytics/           PostHog provider (no-op bez klíče)
/e2e                   Playwright specs
/content, /prompts     vzniknou ve Fázi 4 (content pipeline)
```

## Klíčová architektonická rozhodnutí

### 1. LLM provider: Anthropic Claude
Jednotný provider pro content generation, Writing/Speaking scoring i KEY_WORD_TRANSFORMATION
fallback. Volání jde vždy přes `/core/llm`, nikdy přímo ze Server Actions nebo API routes.
Rozhraní je navržené tak, aby šlo přidat druhého providera (STT/TTS vendor) bez zásahu do
volajícího kódu.

### 2. Dev infrastruktura: lokální stand-iny
`docker-compose.yml` v rootu spouští Postgres a Redis pro lokální vývoj. MinIO simuluje S3 pro
audio a obrázky. Stripe běží v test mode s testovacími klíči. Přechod na produkční služby (Neon/
Supabase, Upstash, reálný S3, Stripe live) je jen změna `.env`, ne kódu, protože klienti čtou
connection stringy z `lib/env.ts`, který je jediné místo validující env vars (Zod).

### 3. Obsah se negeneruje za běhu
Content pipeline (generátor -> self-check -> validátory -> human review -> publikace) běží
offline/dávkově, nikdy v request handleru odpovídajícím uživateli. Uživatel vždy čte z `Item`
tabulky se `status: published`.

### 4. Exercise engine je plugin registr
Každý typ cvičení implementuje jedno rozhraní (`schema`, `validate`, `score`, `explain`). Přidání
nového typu neznamená zásah do lesson runneru, jen registraci nového pluginu.

### 5. SRS a adaptivita jsou oddělené vrstvy
`/core/srs` (FSRS, per item i per skill) rozhoduje **kdy** se item vrátí. `/core/adaptive` (IRT)
rozhoduje **jak těžký** další item má být. Daily Mix kombinuje oba výstupy podle poměru 60/30/10
(SPEC.md sekce 3.3). Tohle rozdělení drží FSRS testovatelné bez IRT a naopak.

### 6. `Attempt.id` je klientem generovaný UUID
Kvůli offline sync (Fáze 10, idempotentní `POST /api/sync/attempts`). Rozhodnuto už ve Fázi 1,
aby se nemusela měnit schema/API kontrakt later.

### 7. i18n od začátku
UI texty anglicky jako zdrojový jazyk, čeština jako plný překlad, ne dodatečná lokalizace. Text
stringy nikdy nejsou natvrdo v komponentách.

**Implementační detail (Fáze 0):** next-intl běží bez URL-based routingu (žádné `app/[locale]`).
Jazyk je preference uživatele (cookie `NEXT_LOCALE`, později `User.locale`), ne součást URL,
protože se to lépe hodí k mobilní aplikaci s účtem než k SEO-driven webu. Přepínač jazyka je
`components/locale-switcher.tsx` (Server Action `setLocaleAction` nastaví cookie, `router.refresh()`
dotáhne nové messages).

### 8. Prisma 7: driver adapter, ne `url` ve schématu
Prisma 7 (nainstalováno místo staršího Prisma 5/6 ze SPEC.md, protože to bylo aktuální stabilní
v době Fáze 0) odstranilo `datasource.url` ze `schema.prisma`. `prisma.config.ts` v rootu dává
connection string Migrate/Studio CLI, `lib/db.ts` connectuje `PrismaClient` za běhu přes
`@prisma/adapter-pg` (node-postgres). Funguje to stejně proti lokálnímu Postgresu i proti Neon/
Supabase (obojí mluví standardní Postgres protokol). CLI navíc od verze 7 nenačítá `.env`
automaticky, `prisma.config.ts` a `db/seed.ts` si `.env.local` načítají samy přes `dotenv`.

### 9. Auth.js v5: JWT session strategy, ne database session
`db/schema.prisma` má doménový model `Session` (běh lekce/mocku, SPEC.md sekce 7), což koliduje
jménem s Auth.js session tabulkou. Řešení: Auth.js běží na `session: { strategy: "jwt" }`, takže
vlastní session tabulku vůbec nepotřebuje (na rozdíl od `Account` a `VerificationToken`, které
Auth.js potřebuje vždy pro Google OAuth linking a email magic link, a mají standardní jména).
Ověřeno end-to-end ve Fázi 0 (sign-in -> magic link v konzoli -> session cookie -> `/learn`).

### 10. `AGENTS.md` a `CLAUDE.md` v rootu
Next.js 16 je při `next dev`/`next build` sám generuje a udržuje (verzově specifická pravidla
pro agenty pracující s frameworkem). Necommitovat je zpátky by je jen donutilo se objevit znovu
jako neuložená změna při příštím spuštění, viz komentář uvnitř souboru.

## Bezpečnostní pravidla

- `Item.solution` se nikdy neposílá na klienta před odpovědí uživatele (SPEC.md sekce 9).
- Validace vstupu Zod na hranici API/Server Actions.
- Rate limiting per uživatel na mutačních endpointech.
- Žádné PII v LLM promptech nad rámec nutného (SPEC.md sekce 12).

## Stav (aktualizuje se po každé fázi)

- **Fáze 0: hotovo.** Next.js 16 + TS strict, Tailwind v4, Auth.js v5 (email magic link přes
  Resend s dev fallbackem na konzoli + volitelné Google OAuth), Prisma 7 (lokální Postgres),
  i18n CS/EN (next-intl, cookie-based), Sentry + PostHog (no-op bez klíčů), CI
  (`.github/workflows/ci.yml`: typecheck, lint, unit testy, build, e2e). Ověřeno end-to-end
  (viz rozhodnutí 9): přihlášení, prázdný skill tree se seedovanými Tracky, `pnpm typecheck`,
  `pnpm lint`, `pnpm test`, `pnpm test:e2e`, `pnpm build` všechny zelené.
- Zbytek: neprovedeno.

## Otevřené otázky pro budoucí fáze

- STT/TTS vendor (Fáze 5, 9).
- Zdroj kalibrační sady 50 až 100 esejí pro Writing eval (Fáze 7).
- Kdy a s jakým rozpočtem se pustí bulk generování 600+ Use of English itemů (Fáze 4).
