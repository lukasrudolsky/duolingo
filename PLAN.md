# PLAN.md

Rozpad práce podle `SPEC.md` sekce 15 (roadmapa) a sekce 17 (první úkol). Aktualizuje se na začátku
každé fáze upřesněním úkolů na další fázi, dokud neproběhne review předchozí fáze.

## Rozhodnutí z úvodních otázek (2026-09-20)

| Téma | Rozhodnutí |
|---|---|
| LLM provider | Anthropic Claude, jednotně pro generování obsahu i hodnocení Writing/Speaking |
| Tempo práce | Fáze po fázi, review a schválení po každé fázi podle Definition of Done (sekce 16) |
| Dev infrastruktura | Lokální stand-iny: Docker Postgres, Docker Redis, MinIO jako S3 mock, Stripe test mode. Produkční credentials (Neon/Supabase, Upstash, reálný S3, Stripe live) doplní uživatel přes env vars později, beze změny kódu |
| STT/TTS vendor | Odloženo, řeší se až ve Fázi 5 (Listening) a Fázi 9 (Speaking). Do té doby jen abstrakce v `/core/llm` a `/core/audio` |
| Objem generovaného obsahu | Content pipeline (Fáze 4) se postaví celá, ale prožene se jen malá ukázková sada (řádově desítky itemů) jako proof-of-concept. Bulk generování 600+ itemů spustí uživatel později s vlastním rozpočtem |
| Email a platby | Resend pro magic link (dobrá DX s Auth.js), Stripe test mode. Produkční klíče doplní uživatel přes env vars, až bude mít účty |

Důsledek pro architekturu: každá integrace se schovává za rozhraní v `/core` nebo `/lib`, které čte
konfiguraci z env vars a má bezpečný dev fallback (lokální DB, MinIO, stub LLM odpovědi tam, kde
by real volání stálo peníze bez užitku). Přepnutí z dev na produkční službu je jen otázka env vars,
ne kódu.

Referenční materiály (přiložený ZIP s oficiálními Cambridge podklady: handbook, vzorové testy,
hodnocené písemky) se používají výhradně jako soukromá reference pro formát, délku a úroveň obsahu.
Nikdy se necommitují do repozitáře a nikdy se z nich doslovně nekopíruje text do generovaného
obsahu (SPEC.md sekce 6.1).

---

## Fáze 0: Základy (odhad 0,5 dne) — HOTOVO

Cíl: přihlášení funguje, uživatel vidí prázdný skill tree, CI je zelené.

Stav: splněno a ověřeno end-to-end (viz ARCHITECTURE.md, sekce "Stav" a rozhodnutí 8 až 10 pro
odchylky od původního plánu: Next.js 16 místo 15, Prisma 7 driver adapter místo `url` ve schématu,
i18n bez URL routingu). Skutečný seznam souborů se v drobnostech liší od odhadu níže (např.
`lib/env.ts` je rozdělené na `lib/env.server.ts` a `lib/env.public.ts`, sign-in stránky žijí pod
`app/(marketing)/sign-in/`), odhad zůstává jako orientační záznam plánu před implementací.

Úkoly:
1. Inicializace Next.js 15 (App Router) + React 19 + TypeScript strict, pnpm workspace.
2. Tailwind CSS v4 + shadcn/ui base + vlastní design tokeny (barvy, typografie, font-weight ≥ 500).
3. Prisma setup, `docker-compose.yml` s Postgres a Redis pro lokální dev, `.env.example`.
4. Auth.js v5: email magic link (Resend adapter, dev fallback loguje odkaz do konzole místo
   reálného mailu) + Google OAuth (vyžaduje client ID/secret v env, bez nich je Google tlačítko
   skryté, ne rozbité).
5. Základní i18n (CS/EN) přes `next-intl` nebo ekvivalent, UI texty anglicky, přepínač jazyka.
6. Sentry + PostHog inicializace (no-op v dev bez klíčů).
7. Prázdný `(app)/learn` dashboard: layout, prázdný skill tree placeholder (žádná data zatím).
8. CI: GitHub Actions workflow `typecheck + lint + test`.
9. `ARCHITECTURE.md`, `TODO.md`, `CONTRIBUTING.md` (dev setup: docker-compose up, env, seed).

Soubory (orientačně):
```
package.json, pnpm-workspace.yaml, tsconfig.json, next.config.ts, tailwind.config.ts
.env.example, docker-compose.yml
db/schema.prisma
lib/auth.ts, lib/auth.config.ts
lib/i18n/{config.ts, en.json, cs.json}
lib/env.ts                       # typovaný a validovaný přístup k env vars (Zod)
lib/sentry.ts, lib/analytics/posthog.ts
app/layout.tsx, app/(marketing)/page.tsx
app/(app)/layout.tsx, app/(app)/learn/page.tsx
app/api/auth/[...nextauth]/route.ts
.github/workflows/ci.yml
ARCHITECTURE.md, TODO.md, CONTRIBUTING.md
```

Acceptance (= SPEC.md sekce 15): uživatel se přihlásí, uvidí prázdný skill tree, typecheck a lint
projdou.

---

## Fáze 1: Exercise engine (odhad 2 dny) — HOTOVO

Cíl: běh lekce od začátku do konce s ručně seedovanými itemy.

Stav: splněno a ověřeno end-to-end (viz ARCHITECTURE.md sekce "Stav" a nová rozhodnutí 11 až
13). Dvě odchylky od plánu níže: (a) datový model dostal navíc `LessonItem` (chybějící vazba
Lesson↔Item z Fáze 0 schématu, viz rozhodnutí 11); (b) seed obsahu je 12 itemů (jeden až dva na
typ), ne 40 až 60 - bohatý obsahový bank je práce content pipeline (Fáze 4), Fáze 1 potřebovala
jen tolik obsahu, kolik ověří enginem a acceptance kritériem ("lekce o cca 10 otázkách").

Úkoly:
1. `/core/exercise-engine`: registr typů (interface `ExerciseType<Payload, Solution, Response>`
   se `schema` (Zod), `validate`, `score`, `explain`).
2. Implementace 4 exam-native typů: `MCQ_CLOZE`, `OPEN_CLOZE`, `WORD_FORMATION`,
   `KEY_WORD_TRANSFORMATION`.
3. Implementace 5 drill typů: `FLASHCARD`, `TYPE_THE_WORD`, `COLLOCATION_MATCH`, `ODD_ONE_OUT`,
   `SENTENCE_BUILD`.
4. Validátor `OPEN_CLOZE`/`WORD_FORMATION`: case-insensitive, přesný pravopis, rozliší "špatné
   slovo" od "správné slovo, špatný pravopis".
5. Validátor `KEY_WORD_TRANSFORMATION`: bodování 0/1/2, množina akceptovaných variant +
   normalizace (whitespace, kontrakce). LLM fallback zatím jako `// STUB:` s jasným
   rozhraním (implementace až v Fázi 6/7, kdy je `/core/llm` hotové).
6. Lesson runner (UI): sekvence itemů, okamžitá zpětná vazba s vysvětlením, shrnutí na konci,
   max 1 obrazovka mezi otázkami a shrnutím.
7. Server Actions: `startLesson`, `submitAttempt`, `completeLesson` nad ručně seedovanými daty
   (bez SRS, bez adaptivity, ta přijde ve Fázi 2/6).
8. Seed: cca 40 až 60 ručně napsaných itemů napříč 9 typy pro demo lekci.
9. Unit testy validátorů včetně edge cases transformací (kontrakce, velká/malá písmena,
   částečná shoda, prázdná odpověď).

Skutečné rozhraní se od návrhu mírně liší: `ExerciseDefinition<Payload, Solution, Response>` má
`payloadSchema`/`solutionSchema`/`responseSchema` (tři samostatná Zod schémata, ne jedno
`schema`), `validate()` vrací skóre i korektnost dohromady (žádná zvlášť `score()` metoda), a
místo `explain()` je `describeSolution()` - vrací jen terse "co byla správná odpověď", protože
skutečné pedagogické "proč" je `Item.explanation` z DB (SPEC.md sekce 3.5), ne věc exercise
enginu. Zdůvodnění je v komentářích `core/exercise-engine/types.ts`.

Skutečné soubory:
```
core/exercise-engine/{types,normalize,registry,index}.ts (+ .test.ts u normalize a registry)
core/exercise-engine/exercises/{mcq-cloze,open-cloze,word-formation,key-word-transformation,
  flashcard,type-the-word,collocation-match,odd-one-out,sentence-build}.ts (+ .test.ts u každého)
app/(app)/lesson/[id]/{page.tsx,actions.ts}
components/exercise/{text-answer-input,choice-list,item-renderer,
  mcq-cloze-renderer,open-cloze-renderer,word-formation-renderer,
  key-word-transformation-renderer,flashcard-renderer,type-the-word-renderer,
  collocation-match-renderer,odd-one-out-renderer,sentence-build-renderer}.tsx
components/lesson/{lesson-runner,feedback-panel,lesson-summary}.tsx
content/seed/lesson-demo.ts
e2e/lesson.spec.ts, e2e/helpers/{answer-item,magic-link}.ts
```

Acceptance: projdu lekci o 12 otázkách (9 typů, 2 zdvojené u MCQ_CLOZE a
KEY_WORD_TRANSFORMATION), dostanu vysvětlení u každé, na konci shrnutí. Unit testy validátorů
zelené včetně edge cases u transformací (49 testů). E2E test dojede celou lekci automaticky
(`e2e/lesson.spec.ts`), včetně reálného přihlášení přes dev magic-link fallback.

---

## Fáze 2 až 11

Detailní rozpad na úkoly a soubory vznikne vždy na začátku dané fáze (jakmile je předchozí fáze
schválená), protože rozhodnutí z předchozích fází (např. tvar `UserItemState` po FSRS integraci)
ovlivňují konkrétní návrh. Rozsah a acceptance kritéria pro fáze 2 až 11 zůstávají podle
`SPEC.md` sekce 15 beze změny. Odhady dní jsou převzaté ze SPEC.md, celkem cca 18 až 20 dní práce.

---

## Rizika

1. **FSRS + IRT dohromady je hodně matematiky na jednu fázi (2 a 6).** Riziko podcenění složitosti
   výběru dalšího itemu (SRS due vs. IRT cílová obtížnost vs. Daily Mix poměry 60/30/10 zároveň).
   Zmírnění: Fáze 2 řeší jen SRS, adaptivní výběr obtížnosti (IRT) je vědomě odsunutý do Fáze 6,
   do té doby Daily Mix vybírá nová slova náhodně v rámci odemčeného stromu.
2. **LLM hodnocení Writing/Speaking bez kalibrační sady na začátku.** SPEC vyžaduje eval na 50 až
   100 referenčních esejích před nasazením promptu (sekce 6.2). Tuhle sadu nemám, musí ji buď
   dodat uživatel (ideálně z přiložených "Writing - hodnocené práce" PDF, po expertním review),
   nebo ji vytvořím synteticky a jasně označím jako low-confidence baseline. Řeší se ve Fázi 7.
3. **Content pipeline generuje jen malou ukázkovou sadu v této session** (viz rozhodnutí výše).
   Fáze 5, 8, 9 (Reading, mock testy, Speaking) potřebují dost obsahu na smysluplné otestování
   uživatelské cesty. Zmírnění: pro každou fázi seedneme jen tolik obsahu, kolik je pro danou
   acceptance kritérium potřeba, bulk generování je oddělený krok mimo fázový postup.
4. **STT/TTS vendor neurčen.** Fáze 5 (Listening audio) a Fáze 9 (Speaking) na tom přímo závisí.
   Riziko zpoždění, pokud se rozhodnutí neudělá včas. Zmírnění: `/core/llm` a nový `/core/audio`
   modul mají providera za rozhraním, takže výběr vendora se dá odložit až těsně před danou fází
   beze změny zbytku architektury.
5. **Auth.js v5 + Prisma adapter + magic link bez reálného mail provideru v dev.** V dev prostředí
   se magic link loguje do konzole/terminálu místo odesílání mailu, aby šlo přihlášení testovat
   bez Resend účtu. Nutné jasně UI odlišit dev mode (banner "dev: magic link v konzoli").
6. **Offline PWA sync (Fáze 10) je architektonicky náročná na idempotenci.** `client-generated
   attemptId` musí být unikátní a bezpečně re-doručitelné i po konfliktu (uživatel odpověděl
   offline na item, který mezitím server zneplatnil/aktualizoval). Řeší se explicitně v Fázi 10,
   zmiňuji už teď, aby `Attempt.id` od Fáze 1 bylo klientem generovaný UUID, ne DB serial.
7. **Rozsah celého projektu (18 až 20 dní) přesahuje jednu souvislou session.** Plán počítá s tím,
   že se bude pokračovat napříč více seděními/dny; každá fáze je navržená jako samostatně
   commitovatelná a spustitelná, aby přerušení mezi fázemi nebylo problém.
