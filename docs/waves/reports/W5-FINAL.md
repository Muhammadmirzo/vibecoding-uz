# W5 — Final enemy-eyes QA

- **Date:** 2026-09-24
- **Branch/worktree:** `w5-final`
- **Scope:** launch re-audit, final home-hero defect fixes, Telegram code/test review, brand sweep, performance guard, release gates, and owner handoff.
- **Deployment:** not pushed and not deployed, per instruction.

## Launch checklist

| Area | Result | Evidence / notes |
|---|---|---|
| 8-dimension enemy audit | **PASS with P2 risks recorded** | Correctness, security, UX/conversion, accessibility, responsive, visual/brand, performance, and antifragility reviewed against the public site. DB was unavailable, so authenticated live flows were not exercised. |
| Responsive suite | **PASS** | `E2E_PORT=3208 npx playwright test e2e/responsive.spec.ts`: **132 passed** across 375/390/768/1024/1280/1440; light/dark coverage is present for home/course where configured. No horizontal overflow or tap-target failures. |
| Motion modes | **PASS** | `data-motion=off`, `subtle`, and `full` were set on `<html>` in a Playwright smoke check; all three values remained applied. SSR/no-JS final-state design is retained. Keyboard smoke reached the skip link as the first tab stop. |
| JS-disabled content | **PASS via HTML/curl** | `curl` of `/` contains the Naqsh home content, including `G'oyangizni`, `Bepul diagnostika`, `Nonvoyxona`, and the final transcript. A Playwright JS-disabled DOM check confirmed the home `<h1>` exists; browser `innerText` is unreliable for the hydrated accessibility spans, so curl/raw HTML is the acceptance evidence. |
| Brand grep | **PASS with allowed exceptions** | `grep -rniE "vibe ?coding|vibecoding|mirzo academy" src public` returned 103 hits. Remaining hits are the allowed discipline/course display name, slug, code identifiers, tests, seed/fixture values, infra email/domain, and historical certificate prefixes. `mirzo academy` returned no matches. No old school-brand user-facing string remains. |
| Telegram signup/login logic | **PASS by code + tests** | W2 deep-link flow is covered by the 501-test suite: start/status routes, bot binding and callback confirmation, owned contact, new-user creation, existing-user link, conflict handling, expiry, rejection, replay, single-use session transaction, and DB-outage 503 behavior. No live DB/Telegram test was possible. |
| TypeScript | **PASS** | `npx tsc --noEmit` — zero errors. |
| Unit/integration tests | **PASS** | `npx vitest run` — 66 files, **501 passed, 1 skipped**. |
| Production build | **PASS** | `npm run build` — 90 generated pages; `/` First Load JS 128 kB, course 123 kB. |
| Lighthouse mobile guard | **PASS on isolated rerun** | `next start -p 3208`; devtools throttling: home **LCP 2.192 s, CLS 0**; course **LCP 2.486 s, CLS 0**. The first parallel run was noisy (home 2.651 s) and was rerun alone; the isolated result is the guard result. |

## Final fixes made

1. **Terminal stays dark in both themes.** Added terminal-specific theme tokens and changed `TerminalWindow` to use them rather than theme-inverted `bg-ink text-bg`; header border/text also use terminal tokens.
2. **Terminal is content-sized and complete.** Removed the oversized/unfinished tail, added a clear fictional deployment line: `✓ deployed → https://demo.invalid/nonvoyxona`. The final line is present in SSR HTML and is not a real third-party domain.
3. **Girih artifact contained/repositioned.** Moved the hero weave inside the right edge and reduced it to 360px; the hero already clips the section, preventing the former diagonal bleed.
4. **Preview title corrected.** `Nonvoyxa` → `Nonvoyxona`.
5. **Dark announcement bar corrected.** The banner now uses brand-soft in light mode and a subdued brand/20 surface with readable ink in dark mode instead of bright blue.
6. **Unverified social proof removed.** The tiny `4.9 · 320+ buyurtma` claim is gone; the mock card now says `Demo interfeys · real buyurtma emas` at a readable size.

Files changed: `src/app/globals.css`, `tailwind.config.js`, `src/components/ui/TerminalWindow.tsx`, `src/components/sections/home/HeroSection.tsx`, `src/components/layout/SiteBanner.tsx`, plus this report.

## Remaining risks / P2 items

- **P2 — DB is down:** live Telegram signup, sessions, payment, cabinet, and admin data paths cannot be tested until Supabase is restored. Public pages degrade, but authenticated product flows require a real DB smoke test.
- **P2 — Telegram provider/config drift:** web and bot must share the restored DB and bot settings. Bot process must be restarted after deployment.
- **P2 — Unverified testimonial/example content:** placeholders/examples remain explicitly labelled where required; obtain consent/provenance before presenting them as real social proof.
- **P2 — Lighthouse variance:** parallel Lighthouse runs can contend for CPU and overstate LCP; retain the isolated run as the release guard and re-run on production-like infrastructure.
- **P2 — External infrastructure/contact identity:** `academy.mirzo.uz`, support handle, and any historical certificate codes remain until the owner decides whether to migrate domains/contact points.

## Owner action items before launch

1. Restore the Supabase/PostgreSQL connection, then run the normal migration flow and apply **both** W2 migrations: `0004_glorious_ozymandias.sql` and `0005_flashy_rachel_grey.sql` (the latter includes the composite Telegram lookup index). Confirm the bot and web use the same `DATABASE_URL`.
2. In **@BotFather**, set the production bot token/handle, run `/setdomain` only if the legacy widget is intentionally enabled, and verify the bot can receive `/start login_<opaque-token>` and callback confirmations. Prefer the deep-link flow; do not enable `NEXT_PUBLIC_TELEGRAM_WIDGET` unless testing the fallback.
3. Rotate/revoke historical Telegram bot, Payme, Click, SMS, email, and any credentials previously exposed through the old admin settings surface. Store replacements only in deployment environment/secrets; never commit them.
4. Set `NEXT_PUBLIC_TELEGRAM_BOT_NAME`, `TELEGRAM_BOT_TOKEN`, and `NEXT_PUBLIC_APP_URL` to the production values; confirm `BRAND.url`/canonical/OG/robots agree.
5. After DB restore, run the manual Telegram matrix in `W2-TELEGRAM.md`: new user, existing user, wrong/expired/replayed request, phone conflict, DB outage, and concurrent status poll.
6. Run one final production smoke: home/course at mobile and desktop, light/dark, auth modal, diagnostic lead form, checkout-after-login, and admin motion settings.

## Short Uzbek owner summary

Naqsh final QA yakunlandi: barcha asosiy topshiriqlar, 132 ta responsive test, TypeScript, 501 ta test va production build o‘tdi. Home hero terminali endi har ikki temada ham to‘q, to‘liq transcript va `demo.invalid`’dagi aniq demo URL bilan ko‘rinadi; `Nonvoyxona` nomi tuzatildi, yolg‘on reyting olib tashlandi, banner dark mode’da yumshoqroq. DB hozir ishlamayotgani sababli Telegram signup va to‘lovlarni real hayotda tekshirib bo‘lmaydi. Launch oldidan Supabase’ni tiklang, `0004` va `0005` migrationlarini qo‘llang, BotFather sozlamalarini tekshiring va barcha eskirgan token/parollarni aylantiring. Bu ish push yoki deploy qilinmadi.
