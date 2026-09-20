# PROJEKT: Duolingo-style aplikace pro přípravu na Cambridge C1 Advanced

> Tento soubor je vstupní zadání pro Claude Code. Ulož ho do repozitáře jako `SPEC.md`
> a v Claude Code začni promptem: "Přečti si SPEC.md a postupuj podle sekce 17."

---

## 0. JAK S TÍMTO DOKUMENTEM PRACOVAT

Jsi senior full-stack architekt a vývojář. Stavíš produkt, ne demo.

Pravidla práce:

1. **Nejdřív plán, pak kód.** Než napíšeš první řádek, vytvoř `PLAN.md` s rozpadem na fáze a úkoly. Ukaž mi ho a počkej na schválení.
2. **Stavíš po fázích** (sekce 15). Jedna fáze = funkční, spustitelný, otestovaný stav aplikace. Nikdy nerozdělaná polovina.
3. **Ptej se, když je zadání nejednoznačné.** Nevymýšlej si tiché předpoklady u věcí, které mění architekturu.
4. **Žádný mock, který vypadá jako hotová funkce.** Pokud něco stubuješ, dej to do `TODO.md` a označ v kódu `// STUB:`.
5. Píšeš v TypeScriptu se `strict: true`. Žádné `any` bez komentáře proč.
6. Po každé fázi: `pnpm typecheck && pnpm lint && pnpm test` musí projít. Pak commit s popisnou zprávou.
7. Udržuj `ARCHITECTURE.md` aktuální (co kde leží, proč tak).
8. UI texty jsou anglicky, aplikace má i českou lokalizaci (i18n od začátku, ne dodatečně).

---

## 1. PRODUKT

**Co to je:** mobile-first webová aplikace (PWA), která uživatele s úrovní B2+ systematicky dotáhne na složení Cambridge C1 Advanced (CAE). Duolingo-style: krátké denní lekce, XP, série, adaptivní opakování. Ale obsahově je to opravdová příprava na konkrétní zkoušku, ne obecná výuka angličtiny.

**Proč to existuje:** existující příprava na CAE je buď nudná PDF sbírka testů, nebo drahý kurz. Chybí návyková denní smyčka, která studenta udrží 3 až 6 měsíců do termínu zkoušky.

**Cílový uživatel:** 18 až 35 let, má B2/C1, potřebuje certifikát kvůli univerzitě nebo práci, má termín zkoušky za 2 až 6 měsíců, studuje na mobilu v útržcích 10 až 15 minut denně.

**Hlavní metrika:** D30 retence a poměr uživatelů, kteří dosáhnou "exam ready" skóre v mock testech.

**Pozicování (důležité právně):** produkt je neoficiální přípravný nástroj. Nikde netvrdíme spojení s Cambridge Assessment English. V patičce a v onboardingu je disclaimer: "Not affiliated with or endorsed by Cambridge Assessment English." Nepoužíváme oficiální loga ani oficiální texty zkoušek.

---

## 2. DOMÉNA: STRUKTURA ZKOUŠKY C1 ADVANCED

Tohle je pevný základ datového modelu. Aplikace musí přesně sedět na tuto strukturu.

Zkouška má 4 papers, celkem cca 3 h 55 min plus Speaking. Výsledek je průměr pěti dílčích skóre: Reading, Use of English, Writing, Listening, Speaking (každé 20 %). Paper 1 tedy generuje dvě skóre.

### Paper 1: Reading and Use of English (1 h 30 min, 8 částí, 56 otázek)

| Part | Typ | Otázek | Body | Co testuje |
|---|---|---|---|---|
| 1 | Multiple-choice cloze | 8 | 1 | kolokace, slovní zásoba, phrasal verbs |
| 2 | Open cloze | 8 | 1 | gramatika, funkční slova |
| 3 | Word formation | 8 | 1 | prefixy, sufixy, slovní rodiny |
| 4 | Key word transformation | 6 | 0 až 2 | komplexní struktury, parafráze |
| 5 | Multiple choice (dlouhý text) | 6 | 2 | detail, názor, postoj, implikace |
| 6 | Cross-text multiple matching | 4 | 2 | porovnání názorů napříč 4 texty |
| 7 | Gapped text | 6 | 2 | koheze, struktura textu |
| 8 | Multiple matching | 10 | 1 | vyhledání konkrétní informace |

Části 1 až 4 = skóre **Use of English**. Části 5 až 8 = skóre **Reading**.

### Paper 2: Writing (1 h 30 min, 2 úkoly, každý 220 až 260 slov)
- Part 1: povinná esej na základě zadání a dvou až tří bodů k diskusi.
- Part 2: výběr jednoho ze tří úkolů: letter/email, proposal, report, review.
- Hodnotí se ve 4 škálách, každá 0 až 5: **Content, Communicative Achievement, Organisation, Language**.

### Paper 3: Listening (cca 40 min, 4 části, 30 otázek)
| Part | Typ | Otázek | Audio |
|---|---|---|---|
| 1 | Multiple choice | 6 | 3 krátké úryvky, 2 otázky na každý |
| 2 | Sentence completion | 8 | monolog cca 3 min |
| 3 | Multiple choice | 6 | konverzace cca 4 min |
| 4 | Multiple matching (dvojí úkol) | 10 | 5 mluvčích po cca 30 s |

Každá nahrávka se pouští dvakrát.

### Paper 4: Speaking (cca 15 min na dvojici, 4 části)
- Part 1: krátký rozhovor s examinátorem (cca 2 min).
- Part 2: long turn, 1 minuta samostatně ke dvěma ze tří fotografií, plus 30 s reakce na partnera.
- Part 3: kolaborativní úkol s partnerem (15 s na přečtení, 2 min diskuse, 1 min rozhodnutí).
- Part 4: hlubší diskuse s examinátorem.

### Skóre
Cambridge English Scale, C1 Advanced pásmo 160 až 210. Grade A od 200, B od 193, C od 180, úroveň B2 se uděluje v pásmu 160 až 179. Aplikace musí umět převádět surové body na odhad na této škále (viz sekce 6.4).

---

## 3. UČEBNÍ MODEL (jádro produktu)

Tohle je to, co odlišuje dobrý produkt od sbírky kvízů. Naimplementuj poctivě.

### 3.1 Struktura obsahu
```
Track (Use of English | Reading | Listening | Writing | Speaking)
 └── Unit (tematický blok, např. "Phrasal verbs: business & work")
      └── Skill (atomická dovednost, např. "carry out / carry off / carry on")
           └── Lesson (5 až 12 exercise items, 3 až 6 minut)
                └── Item (jedna otázka)
```
Plus napříč: **Exam Simulation** (celé papery v reálném čase) a **Daily Mix** (adaptivní mix z opakování).

### 3.2 Skill tree a odemykání
- Strom po jednotkách, ne lineární had. Uživatel vidí, co je odemčené a co ne.
- Skill má 5 úrovní zvládnutí (0 až 5 korun, jako Duolingo). Úroveň 5 = "mastered".
- Odemčení další jednotky: průměrná mastery předchozí ≥ 3 NEBO složení "test out" checkpointu.
- **Placement test** na začátku (cca 20 min, adaptivní) odemkne strom na odhadnuté úrovni. Nikdo s C1 nezačíná od nuly.

### 3.3 Spaced repetition
- Algoritmus **FSRS v5** (ne SM-2, je výrazně lepší a existuje open-source implementace `ts-fsrs`).
- SRS stav se drží na úrovni **item** i na úrovni **skill** (dva různé plánovače: připomínka konkrétního slova vs. připomínka dovednosti).
- Každý den se sestavuje `Daily Mix`: 60 % due opakování, 30 % nový obsah, 10 % slabé oblasti z diagnostiky.
- Chybné odpovědi jdou do `Mistakes Bank` a vrací se v kratším intervalu, s přeformulovanou variantou otázky (ne identická, aby se uživatel neučil odpověď nazpaměť).

### 3.4 Adaptivní obtížnost
- Každý item má parametry **IRT 2PL**: `difficulty (b)` a `discrimination (a)`.
- Uživatel má latentní schopnost `theta` per track, aktualizovanou po každé odpovědi (online Bayesian update nebo Elo aproximace).
- Výběr dalšího itemu cílí na pravděpodobnost úspěchu **0,75 až 0,85** (zóna nejbližšího vývoje: dost těžké, aby to učilo, ne tak těžké, aby to demotivovalo).
- Parametry itemů se kalibrují dávkově z produkčních dat (noční job), ne per-request.
- Cold start: počáteční `b` odhadne LLM při generování obsahu, pak se kalibruje realitou.

### 3.5 Zpětná vazba
- Okamžitá po každé otázce: správně/špatně + **vysvětlení proč**, ne jen "correct answer is C".
- U Use of English part 4 (transformations) se ukazuje i akceptovaná varianta odpovědi a pravidlo, které se testuje.
- Po lekci: shrnutí, co se zlepšilo, co si zopakovat.

---

## 4. TYPY CVIČENÍ (exercise engine)

Engine je plugin architektura: jeden registr typů, každý typ má schema odpovědi, renderer, validátor a scorer.

### 4.1 Exam-native typy (přímé zrcadlo zkoušky)
`MCQ_CLOZE`, `OPEN_CLOZE`, `WORD_FORMATION`, `KEY_WORD_TRANSFORMATION`, `MCQ_READING`, `CROSS_TEXT_MATCHING`, `GAPPED_TEXT`, `MULTIPLE_MATCHING`, `LISTENING_MCQ`, `SENTENCE_COMPLETION`, `LISTENING_MATCHING`, `WRITING_TASK`, `SPEAKING_TASK`.

### 4.2 Drill typy (Duolingo-like, pro budování základů)
`FLASHCARD`, `TYPE_THE_WORD`, `COLLOCATION_MATCH`, `ODD_ONE_OUT`, `SENTENCE_BUILD` (skládání z bloků slov), `LISTEN_AND_TYPE`, `SPOT_THE_ERROR`, `REGISTER_SWAP` (přepiš neformální na formální), `PHRASAL_VERB_SORT`, `PREFIX_SUFFIX_DRILL`.

Drill typy jsou krátké (5 až 15 sekund na otázku) a tvoří návykovou smyčku. Exam-native typy jsou delší a zařazují se postupně.

### 4.3 Validace odpovědí
Netriviální část, věnuj jí pozornost:
- `OPEN_CLOZE` a `WORD_FORMATION`: seznam akceptovaných odpovědí, case-insensitive, tolerance překlepu 0 (u zkoušky se pravopis počítá), ale hláška "správné slovo, špatný pravopis".
- `KEY_WORD_TRANSFORMATION`: bodování 0 / 1 / 2 podle dvou částí odpovědi. Validace přes množinu akceptovaných variant + normalizaci (whitespace, kontrakce). Pokud odpověď nesedí na žádnou variantu, fallback na LLM posouzení s cache výsledku.
- `WRITING_TASK` a `SPEAKING_TASK`: LLM hodnocení, viz sekce 6.

---

## 5. GAMIFIKACE

Neopisuj Duolingo slepě, ale použij, co prokazatelně funguje:

- **XP** za každou dokončenou lekci, bonus za perfect run a za splnění denního cíle.
- **Streak** s denním cílem (uživatel si volí 10 / 20 / 30 / 60 min nebo 1 / 2 / 3 / 5 lekcí). Streak freeze (2 zdarma měsíčně, další za měnu). Streak se počítá podle časového pásma uživatele.
- **Hearts / energie:** doporučuji **nepoužívat hearts** (frustrují dospělé studenty s termínem) a místo toho použít **Focus Meter**: chyby neblokují postup, ale snižují mastery a plní Mistakes Bank.
- **League / žebříček** týdenní, 30 lidí v divizi, postup a sestup. Volitelně vypnutelný (část uživatelů ho nesnáší).
- **Quests:** denní (3) a týdenní (1 větší).
- **Exam Countdown:** uživatel zadá datum zkoušky, aplikace ukazuje odpočet a **Readiness Score** (viz 6.4). Tohle je pro tuhle cílovku silnější motivátor než liga.
- **Achievements:** milníky za mastery, za mock testy, za streak.

Anti-pattern, kterému se vyhni: nutit uživatele prokliknout 5 obrazovek po lekci. Max 1 shrnutí, 1 tap zpět do stromu.

---

## 6. AI VRSTVA

### 6.1 Generování obsahu (content pipeline)
Nikdy negenerujeme obsah za běhu uživateli. Vše se generuje dávkově, validuje a ukládá.

Pipeline:
```
1. Generator (LLM, strukturovaný output podle Zod schématu pro daný typ)
2. Self-check (druhý průchod: má úloha právě jedno správné řešení? sedí level?)
3. Automatické validátory (délka textu, počet gapů, unikátnost, zakázaná slova, CEFR profiler)
4. Human review queue (admin UI: approve / edit / reject)
5. Publikace do content DB s verzí
```
- Obsah je verzovaný, publikovaný přes `status: draft | in_review | published | retired`.
- Každý item má `sourceHash`, aby se nedělaly duplicity.
- **Nikdy negeneruj ani neukládej obsah opsaný z oficiálních Cambridge past papers.** Vše je originální, jen respektuje formát. Tohle napiš i do promptů generátoru.
- Texty pro Reading generuj tak, aby odpovídaly délkám zkoušky (Paper 1 celkem 3 000 až 3 500 slov ke čtení).

### 6.2 Hodnocení Writing
- LLM hodnotí ve 4 oficiálních škálách (Content, Communicative Achievement, Organisation, Language), každá 0 až 5, s odůvodněním k jednotlivým škálám.
- Prompt obsahuje: zadání úkolu, popisné deskriptory pro každý bod škály na C1, text kandidáta, požadovaný žánr a registr.
- Výstup strukturovaný (Zod): skóre per škála, 3 konkrétní silné stránky, 3 konkrétní věci ke zlepšení, inline anotace (offset, typ chyby, návrh), přepsaná ukázková věta.
- **Kalibrace:** drž sadu 50 až 100 referenčních esejí s expertním hodnocením. Před každou změnou promptu nebo modelu proběhne eval a porovná se shoda (exact agreement a adjacent agreement). Bez proběhlého evalu se změna promptu nenasazuje.
- Ukaž uživateli, že hodnocení je odhad, ne oficiální známka.

### 6.3 Speaking
- Fáze 1: nahrávání odpovědí, STT (Whisper nebo ekvivalent), hodnocení transkriptu ve škálách Grammatical Resource, Lexical Resource, Discourse Management, Pronunciation (omezeně z audia), Interactive Communication.
- Part 2 (long turn): časovač 1 minuta, uživatel dostane dvě fotografie a zadání.
- Part 3 (kolaborativní): fáze 1 simuluje partnera jako AI hlas (TTS) s reálnými pauzami. Fáze 2 (pozdější) může zkusit pairing dvou živých uživatelů.
- Metriky navíc z audia: tempo řeči, poměr pauz, hesitation markers, lexikální diverzita (MTLD).

### 6.4 Readiness Score
Model, který z výkonu v aplikaci odhadne skóre na Cambridge English Scale (160 až 210) per skill.
- Vstupy: theta per track, mastery distribuce, výsledky mock testů (nejvyšší váha), recency.
- Výstup: odhad + interval spolehlivosti + "co udělat, aby se zvedl".
- Prezentace: nikdy jako jistota. "Odhadujeme 182 až 191" místo "budeš mít 186".
- Kalibrace: sbírej od uživatelů skutečné výsledky zkoušky (opt-in) a model postupně přelaďuj.

### 6.5 Provoz LLM
- Abstrahuj poskytovatele za vlastní `llm` modul. Žádné přímé volání SDK z business logiky.
- Všechny prompty ve verzovaných souborech (`/prompts/*.ts`), ne inline v kódu.
- Logování vstupů, výstupů, tokenů a latence. Rozpočtové limity per uživatel a den.
- Cache na úrovni hashe vstupu tam, kde to dává smysl (validace transformací).

---

## 7. DATOVÝ MODEL

Návrh v Prisma syntaxi, uprav podle potřeby, ale tyhle entity musí existovat:

```prisma
User            id, email, name, locale, timezone, createdAt, examDate?, dailyGoal, plan
Profile         userId, thetaReading, thetaUoE, thetaListening, thetaWriting, thetaSpeaking
Track           id, code (READING|USE_OF_ENGLISH|LISTENING|WRITING|SPEAKING)
Unit            id, trackId, order, title, description, cefrFocus
Skill           id, unitId, order, title, tags[]
Lesson          id, skillId, order, type (LEARN|PRACTICE|CHECKPOINT)
Item            id, skillId?, type, payload (Json), solution (Json), explanation,
                difficultyB, discriminationA, status, version, sourceHash, createdBy
ItemVariant     id, itemId, payload           // přeformulované varianty téže úlohy
UserSkillState  userId, skillId, masteryLevel(0-5), lastPracticedAt
UserItemState   userId, itemId, fsrsStability, fsrsDifficulty, due, reps, lapses, lastGrade
Attempt         id, userId, itemId, response(Json), isCorrect, score, timeMs, createdAt
Session         id, userId, kind (DAILY_MIX|LESSON|MOCK|PLACEMENT), startedAt, endedAt, xpEarned
MockExam        id, userId, paper, startedAt, submittedAt, rawScore, scaledScore, sectionScores(Json)
WritingSubmission id, userId, taskId, text, wordCount, scores(Json), feedback(Json), model, createdAt
SpeakingSubmission id, userId, taskId, audioUrl, transcript, scores(Json), feedback(Json)
Streak          userId, current, longest, lastActiveDate, freezesAvailable
XpEvent         id, userId, amount, reason, createdAt
LeagueMembership userId, leagueId, weekStart, xp
MistakeEntry    id, userId, itemId, resolvedAt?
Subscription    userId, status, plan, provider, currentPeriodEnd
AuditLog        id, actorId, action, entity, entityId, diff(Json), createdAt
```

Indexy, na které nezapomeň: `UserItemState(userId, due)`, `Attempt(userId, createdAt)`, `Item(skillId, status, difficultyB)`.

---

## 8. TECH STACK A ARCHITEKTURA

Pokud nemáš silný důvod jinak, použij tohle:

- **Framework:** Next.js 15 (App Router), React 19, TypeScript strict.
- **Styl:** Tailwind CSS v4, shadcn/ui jako základ komponent, vlastní design systém nad tím.
- **Animace:** Framer Motion. Herní smyčka potřebuje odezvu, ale animace nesmí zdržovat: max 200 ms na přechod mezi otázkami.
- **DB:** PostgreSQL (Neon nebo Supabase), Prisma ORM.
- **Cache / fronty:** Upstash Redis, fronty přes QStash nebo Inngest (generování obsahu, hodnocení writing, noční kalibrace).
- **Auth:** Auth.js v5, email magic link + Google.
- **Platby:** Stripe (předplatné), pro ČR přidej i možnost přes Stripe s CZK.
- **Storage:** S3 kompatibilní (audio nahrávky, obrázky pro Speaking part 2).
- **Audio:** Web Audio API + MediaRecorder na klientu, převod na `audio/webm`.
- **State:** server state přes React Query, klientský ephemeral state lekce přes Zustand.
- **Testy:** Vitest (unit), Playwright (e2e na kritické cesty: onboarding, lekce, mock test, platba).
- **Analytika:** PostHog (events + feature flags + A/B).
- **Chyby:** Sentry.
- **Deployment:** Vercel.

### Struktura složek
```
/app
  /(marketing)         # landing, ceník, blog
  /(app)               # autentizovaná část
    /learn             # skill tree
    /lesson/[id]       # běh lekce
    /practice          # daily mix, mistakes bank
    /exam              # mock testy
    /writing           # writing hub + feedback
    /speaking
    /profile
  /(admin)             # content review queue, item editor, eval dashboard
  /api
/core
  /exercise-engine     # registr typů, renderery, validátory, scorery
  /srs                 # FSRS wrapper, plánovač
  /adaptive            # IRT, výběr itemů, theta update
  /scoring             # raw -> scaled, readiness score
  /gamification        # xp, streaky, ligy, questy
  /llm                 # provider abstrakce, prompty, evaly
/content               # seed obsah, generátory, validátory
/db                    # prisma schema, migrace, seedy
/lib                   # utils, i18n, auth, analytics
/tests
```

**Zásada:** `core` neimportuje z `app`. Business logika je testovatelná bez Reactu a bez sítě.

### Offline a PWA
- Service worker, instalovatelnost, offline režim pro drill lekce (předstažená dávka 50 itemů).
- Odpovědi se ve offline ukládají do IndexedDB a synchronizují při připojení (idempotentní API s client-generated `attemptId`).
- Listening offline: předstažené audio pro aktuální jednotku.

### Přístupnost a UI detaily
- Kontrast WCAG AA, plná klávesová ovladatelnost lekce (enter = pokračovat, 1 až 4 = volba).
- **Váhy fontu 500 a výš pro UI text, žádné `-webkit-font-smoothing: antialiased`.** Tenké fonty na některých monitorech rozmazávají.
- Dark mode od začátku.
- Timery u mock testů musí přežít refresh stránky (server-side start time).

---

## 9. API DESIGN

Server Actions pro mutace vázané na UI, REST route handlers tam, kde je potřeba volat z jiného kontextu (mobil, sync, webhooky).

Klíčové endpointy:
```
POST /api/session/start      { kind } -> session + první dávka itemů
POST /api/attempt            { attemptId, itemId, response, timeMs } -> výsledek + vysvětlení
POST /api/session/complete   -> XP, mastery změny, shrnutí
GET  /api/daily-mix          -> naplánovaná dávka na dnešek
POST /api/writing/submit     -> fronta -> hodnocení
POST /api/speaking/submit    -> upload -> STT -> hodnocení
POST /api/mock/start | /submit
GET  /api/readiness
POST /api/sync/attempts      -> dávková offline synchronizace
```
Validace vstupů Zod na hranici. Rate limiting per uživatel. Nikdy neposílej na klienta `solution` u itemů dřív, než uživatel odpoví.

---

## 10. OBSAH: KOLIK HO POTŘEBUJEME

Minimum pro použitelný produkt (MVP):
- Use of English: 600 itemů (150 na každou část 1 až 4)
- Reading: 40 textů se sadami otázek
- Listening: 40 nahrávek (TTS s různými přízvuky: BrE, AmE, AuS, ScE) plus transkripty
- Writing: 60 zadání (30 esejí, 30 z ostatních žánrů)
- Speaking: 40 sad úkolů pro části 1 až 4
- 4 kompletní mock testy

Plán, jak toho dosáhnout: generátor + review queue, cíl 200 schválených itemů denně při jednom reviewerovi. Napiš CLI příkaz `pnpm content:generate --type=OPEN_CLOZE --count=50 --level=C1`.

---

## 11. MONETIZACE

- **Free:** 3 lekce denně, 1 mock test celkem, writing feedback 2x měsíčně.
- **Pro (měsíčně nebo ročně):** neomezené lekce, neomezené mock testy, neomezené hodnocení writing a speaking, Readiness Score, offline režim.
- **Exam Bundle:** jednorázově, přístup do data zkoušky + 30 dní.
- Paywall se ukazuje až po prožitku hodnoty: nejdřív placement test a 2 lekce, pak nabídka.

---

## 12. GDPR A BEZPEČNOST

- Audio nahrávky a texty esejí jsou osobní data. Retence max 12 měsíců, možnost smazat účet a data (skutečný delete, ne soft).
- Data processing agreement s LLM providerem, opt-out z trénování.
- Souhlas s nahráváním mikrofonu explicitně.
- Cookie banner, který reálně respektuje odmítnutí.
- Žádné PII v logách a v promptech víc, než je nutné.

---

## 13. ANALYTIKA A EXPERIMENTY

Trackuj: `lesson_started`, `lesson_completed`, `item_answered` (s typem, správností, časem), `streak_extended`, `streak_lost`, `paywall_viewed`, `mock_started`, `mock_completed`, `writing_submitted`, `day_1/7/30_retained`.

Dashboard, který chci vidět: denní aktivní, D1/D7/D30, průměrná délka session, dokončenost lekcí per typ cvičení (odhalí nudné nebo rozbité typy), přesnost per item (odhalí vadné položky: pokud item má úspěšnost pod 15 % nebo nad 95 %, automaticky ho označ k revizi).

---

## 14. CO NEDĚLAT

- Negeneruj obsah za běhu při lekci (latence, cena, nekonzistentní kvalita).
- Nestavěj vlastní ASR ani TTS.
- Nedělej nativní aplikace v první verzi. PWA stačí.
- Nepřidávej sociální feed, chat ani AI konverzačního tutora do MVP.
- Nezaváděj hearts, které blokují studium.
- Nepoužívej em dash v UI textech a v obsahu generovaném pro české rozhraní.

---

## 15. ROADMAPA PO FÁZÍCH

Každá fáze končí funkční aplikací, zeleným CI a commitem.

**Fáze 0: Základy (0,5 dne)**
Repo, Next.js, TS strict, Tailwind, shadcn, Prisma, Auth.js, Sentry, PostHog, CI. Přihlášení funguje, prázdný dashboard.
*Acceptance:* uživatel se přihlásí, uvidí prázdný skill tree, typecheck a lint projdou.

**Fáze 1: Exercise engine (2 dny)**
Registr typů, 5 drill typů + `MCQ_CLOZE`, `OPEN_CLOZE`, `WORD_FORMATION`, `KEY_WORD_TRANSFORMATION`. Renderer, validátor, scorer. Běh lekce od začátku do konce s ručně seedovanými itemy.
*Acceptance:* projdu lekci o 10 otázkách, dostanu vysvětlení u každé, na konci shrnutí. Unit testy validátorů včetně edge cases u transformací.

**Fáze 2: Progrese a SRS (2 dny)**
FSRS, UserItemState, mastery levels, skill tree s odemykáním, Daily Mix, Mistakes Bank.
*Acceptance:* druhý den mi aplikace naservíruje správné due items. Testy plánovače na simulovaných datech 30 dnů.

**Fáze 3: Gamifikace (1 den)**
XP, streak, denní cíl, questy, achievementy, Exam Countdown. Liga za feature flagem.
*Acceptance:* streak se správně počítá přes půlnoc v uživatelově timezone (test s mockovaným časem).

**Fáze 4: Content pipeline (2 dny)**
Generátor, validátory, admin review queue, CLI. Vygenerovaných a schválených 600 Use of English itemů.
*Acceptance:* `pnpm content:generate` proběhne, položky projdou automatickou validací, v adminu je schválím a objeví se v lekci.

**Fáze 5: Reading a Listening (2 dny)**
Zbývající exam-native typy, audio přehrávač s omezením na dvě přehrání, transkripty po odpovědi.
*Acceptance:* projdu kompletní Reading part 6 a 7 a Listening part 2 a 4.

**Fáze 6: Adaptivita (1,5 dne)**
IRT, theta tracking, výběr itemů do cílového pásma úspěšnosti, placement test, noční kalibrační job.
*Acceptance:* simulace 1 000 virtuálních uživatelů ukáže, že se úspěšnost drží v pásmu 0,7 až 0,85.

**Fáze 7: Writing (1,5 dne)**
Editor s počítadlem slov a časovačem, submit, hodnocení ve 4 škálách, inline anotace, historie.
*Acceptance:* eval sada 50 referenčních esejí, adjacent agreement ≥ 85 %.

**Fáze 8: Mock testy a Readiness (1,5 dne)**
Celé papery v reálném čase, převod na Cambridge English Scale, Readiness Score s intervalem.
*Acceptance:* mock test přežije refresh i zavření prohlížeče, časovač sedí na server time.

**Fáze 9: Speaking (2 dny)**
Nahrávání, STT, hodnocení, AI partner pro part 3.
*Acceptance:* nahraju minutu, do 30 s dostanu transkript a hodnocení.

**Fáze 10: Monetizace a PWA (1,5 dne)**
Stripe, paywall, limity free plánu, service worker, offline drilly, push notifikace na streak.
*Acceptance:* zaplatím testovací kartou, limity se odemknou, v letadlovém režimu odehraju lekci a po připojení se synchronizuje.

**Fáze 11: Polish a launch (2 dny)**
Landing page, onboarding, i18n CS/EN, e2e testy kritických cest, Lighthouse ≥ 90 na mobilu, disclaimer o neafiliaci.

---

## 16. DEFINITION OF DONE (platí pro každou fázi)

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` zelené
- [ ] Nové business funkce mají unit testy v `/core`
- [ ] Kritická uživatelská cesta má e2e test
- [ ] Funguje na mobilním viewportu 375 px
- [ ] Žádné chyby v konzoli, žádné `any` bez komentáře
- [ ] `ARCHITECTURE.md` a `TODO.md` aktualizované
- [ ] Commit s popisnou zprávou, jeden commit na logickou změnu

---

## 17. TVŮJ PRVNÍ ÚKOL

1. Přečti si celý tento dokument.
2. Polož mi maximálně 8 otázek k věcem, které mění architekturu a nejsou zde rozhodnuté. Neptej se na věci, které tu jsou.
3. Vytvoř `PLAN.md`: rozpad fází na konkrétní úkoly s odhadem, seznam souborů, které vzniknou ve fázi 0 a 1, a rizika, která vidíš.
4. Navrhni `ARCHITECTURE.md` kostru a finální Prisma schema (vycházej ze sekce 7, ale oprav, co je podle tebe špatně, a zdůvodni to).
5. Počkej na moje schválení. Teprve pak začni fází 0.
