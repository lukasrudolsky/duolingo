# ARCHITECTURE.md

Živý dokument. Aktualizuje se na konci každé fáze (SPEC.md sekce 16, Definition of Done).
Tohle je kostra založená před Fází 0: popisuje rozhodnutí a strukturu, kód zatím neexistuje.

## Přehled

Next.js 15 (App Router) monolit. Business logika v `/core` je čistý TypeScript bez závislosti na
Reactu nebo na síti, testovatelný samostatně. `/app` je jen tenká UI a routing vrstva nad `/core`.

Zásada, kterou drž při každé změně: **`core` nikdy neimportuje z `app`.** Import jde jen jedním
směrem: `app -> core -> lib`. Pokud potřebuješ v `core` něco z frameworku (např. `cookies()`),
je to špatně navržené rozhraní, přenes tu hodnotu jako parametr.

## Struktura složek

```
/app
  /(marketing)         landing, ceník, blog. Bez auth.
  /(app)               autentizovaná část
    /learn             skill tree
    /lesson/[id]       běh lekce
    /practice          daily mix, mistakes bank
    /exam              mock testy
    /writing           writing hub + feedback
    /speaking
    /profile
  /(admin)              content review queue, item editor, eval dashboard
  /api                 route handlers pro non-UI klienty (sync, webhooky)
/core
  /exercise-engine     registr typů cvičení, renderery, validátory, scorery
  /srs                 FSRS wrapper, plánovač opakování
  /adaptive            IRT, výběr itemů, theta update
  /scoring             raw skóre -> Cambridge English Scale, readiness score
  /gamification        xp, streaky, ligy, questy
  /llm                 provider abstrakce (Anthropic), prompty, evaly
  /audio               STT/TTS provider abstrakce (vendor TBD, viz PLAN.md rizika)
/content               seed obsah, generátory, validátory obsahu
/db                    prisma schema, migrace, seedy
/lib                   utils, i18n, auth, analytics, env validace
/prompts               verzované LLM prompty (mimo /core, aby šly reviewovat samostatně)
/tests                 sdílené test utility a fixtures; testy jinak leží vedle kódu
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

## Bezpečnostní pravidla

- `Item.solution` se nikdy neposílá na klienta před odpovědí uživatele (SPEC.md sekce 9).
- Validace vstupu Zod na hranici API/Server Actions.
- Rate limiting per uživatel na mutačních endpointech.
- Žádné PII v LLM promptech nad rámec nutného (SPEC.md sekce 12).

## Stav (aktualizuje se po každé fázi)

- **Fáze 0:** neprovedeno.
- Zbytek: neprovedeno.

## Otevřené otázky pro budoucí fáze

- STT/TTS vendor (Fáze 5, 9).
- Zdroj kalibrační sady 50 až 100 esejí pro Writing eval (Fáze 7).
- Kdy a s jakým rozpočtem se pustí bulk generování 600+ Use of English itemů (Fáze 4).
