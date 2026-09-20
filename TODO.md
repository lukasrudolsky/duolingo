# TODO.md

Otevřené položky, které vyžadují rozhodnutí uživatele nebo se řeší v pozdější fázi
(SPEC.md sekce 0, bod 4: "Pokud něco stubuješ, dej to do TODO.md").

## Čeká na rozhodnutí

- **STT/TTS vendor** (SPEC.md sekce 6.3, 6.5). Nerozhodnuto, řeší se před Fází 5 (Listening)
  a Fází 9 (Speaking). Kandidáti: OpenAI Whisper + OpenAI TTS, nebo Whisper + ElevenLabs
  (kvůli kvalitě přízvuků BrE/AmE/AuS/ScE).
- **Kalibrační sada pro Writing eval** (SPEC.md sekce 6.2, Fáze 7). Potřeba 50 až 100
  referenčních esejí s expertním hodnocením. Kandidát: přiložené PDF "Writing - hodnocené
  práce" (Examiner-comments-*.pdf), ale je potřeba je nejdřív strukturovaně převést a ověřit,
  že jde jen o 3 vzorky, ne 50 až 100. Chybí zdroj pro zbytek sady.
- **Bulk generování obsahu.** Content pipeline se ve Fázi 4 jen ověří na malé ukázkové sadě.
  Kdy a s jakým rozpočtem se spustí `pnpm content:generate` na plný objem (600+ UoE itemů,
  40 Reading textů, 40 Listening nahrávek, 60 Writing zadání, 40 Speaking sad, 4 mock testy)
  je otevřené.
- **Produkční cloud účty.** Neon/Supabase, Upstash Redis, S3-kompatibilní storage, Stripe
  live, Resend, Google OAuth client, Sentry, PostHog. V dev se používají lokální stand-iny
  (docker-compose) nebo no-op fallbacky, produkční klíče doplní uživatel do `.env` bez
  zásahu do kódu.

## STUB (bude v kódu označeno `// STUB:`)

- `KEY_WORD_TRANSFORMATION` LLM fallback (SPEC.md sekce 4.3): validace přes akceptované
  varianty implementována ve Fázi 1, LLM posouzení nejednoznačných odpovědí přijde až s
  `/core/llm` (Fáze 4 a dál).
- Google OAuth tlačítko: skryté v dev, dokud nejsou v `.env` vyplněné
  `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`.
- Magic link email: v dev se odkaz loguje do konzole místo reálného odeslání přes Resend,
  dokud není vyplněný `RESEND_API_KEY`.
- Stripe: běží v test mode, dokud nejsou doplněné live klíče.

## Testovací mezery

- ~~E2E pokrytí přihlášení je částečné~~ Vyřešeno ve Fázi 1: `e2e/lesson.spec.ts` prochází
  celým magic-link flow (odeslání -> parsování odkazu z dev server logu -> otevření -> session)
  přes `e2e/helpers/magic-link.ts`. Funguje, protože dev fallback loguje odkaz do stdoutu, které
  Playwright přesměruje do souboru; s reálným Resend v produkci by tohle nešlo stejně, ale to
  není cíl (e2e běží proti dev fallbacku záměrně).

## Drobnosti k prozkoumání (nekritické)

- **pnpm nainstaloval `next-auth`/`@auth/core` ve více fyzických kopiích** (různé
  peer-dependency hashe v `node_modules/.pnpm`). Zjištěno ve Fázi 1 při pokusu o TS module
  augmentation `session.user.id` (ARCHITECTURE.md rozhodnutí 13) - augmentace na jedné kopii se
  neprojevila v typu, který vrací `auth()`. Obešlo se to bez augmentace, ale stálo by za to
  jednou zjistit, jestli jde duplicitu odstranit (`pnpm dedupe` nebo explicitní `overrides` v
  `package.json`), než to způsobí problém i jinde.
