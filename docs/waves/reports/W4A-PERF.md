# W4A — Performance

- **Date:** 2026-09-24
- **Scope:** public loading path, client boundaries, fonts, images, third-party loading, PWA caching, and DB-down rendering.
- **Constraint honored:** the W4B nonce CSP remains enabled. Public pages stay dynamic (`ƒ`) because the request nonce/auth shell is per-request; no `unsafe-inline`/`unsafe-eval` was added and the nonce was not removed.

## Measurements

`npm run build` was run before and after the changes on the same branch. Lighthouse 13.5 was run against `npx next start -p 3206`; values below are milliseconds, with TBT used as the INP proxy because Lighthouse CLI does not expose a reliable INP value for a one-shot navigation. The DB was unreachable throughout.

### First Load JS

| Route | Before | After | Change |
|---|---:|---:|---:|
| `/` | 128 kB | **128 kB** | 0 kB |
| `/diagnostika` | 137 kB | **120 kB** | **-17 kB** |
| `/kurs/vibe-coding-express` | 141 kB | **123 kB** | **-18 kB** |
| `/bepul-dars` | 141 kB | **118 kB** | **-23 kB** |
| `/blog` | 140 kB | **129 kB** | **-11 kB** |

The shared First Load JS remains 102 kB. All five requested public routes are now at or below the 130 kB target. Build output still reports them as dynamic by design; `/kurs/[slug]` and `/blog/[slug]` retain their pre-rendered static content while the root request shell remains dynamic for CSP/auth.

### Lighthouse navigation metrics

| Route | Desktop LCP | Desktop CLS | Desktop TBT | Mobile LCP | Mobile CLS | Mobile TBT |
|---|---:|---:|---:|---:|---:|---:|
| `/` | 817 ms | 0 | 8 ms | 3,656 ms | 0 | 264 ms |
| `/diagnostika` | 781 ms | 0 | 4 ms | 3,765 ms | 0 | 88 ms |
| `/kurs/vibe-coding-express` | 742 ms | 0 | 0 ms | 3,335 ms | 0 | 132 ms |
| `/bepul-dars` | 781 ms | 0 | 0 ms | 3,625 ms | 0 | 111 ms |
| `/blog` | 819 ms | 0 | 0 ms | 3,559 ms | 0 | 330 ms |

Desktop LCP is below 2.0 s and CLS is 0 on every route. Mobile LCP improved from the 3.76–4.89 s baseline, but the requested <2.5 s simulated-mobile target is **not yet met**; the remaining cost is the intentionally animated, hydrated home/blog client graph under Lighthouse's mobile throttling. TBT is reported as the INP proxy; INP itself is `n/a` in the CLI audit.

### TTFB with DB unreachable

| Route | Before | After |
|---|---:|---:|
| `/` | 292 ms | **261 ms** |
| `/diagnostika` | 39 ms | **55 ms** |
| `/kurs/vibe-coding-express` | 59 ms | **58 ms** |
| `/bepul-dars` | 26 ms | **23 ms** |
| `/blog` | 27 ms | **26 ms** |

The home first request is lower despite the layout remaining dynamic. Motion settings are now a last-known value with a post-response refresh; the root render no longer races a DB read and never adds the DB's 10-second connect timeout to TTFB.

## What changed

- `src/app/layout.tsx`: removed unused Instrument Serif, limited global fonts/subsets, kept display weights preloaded, and removed the separate PWA client entry.
- `src/components/layout/Header*.tsx`, `UserMenu.tsx`, `AuthenticatedUserMenu.tsx`: split static header content from small client leaves and deferred authenticated Radix/mobile drawer code.
- `src/components/layout/ClientModals.tsx`: auth/search modals now load only after a user interaction; service-worker registration is idle-time and merged into the existing client shell.
- `src/context/AuthContext.tsx`: anonymous pages no longer issue an unconditional `/api/me` request; checkout/mobile actions retain auth behavior through a small event bridge.
- `src/app/blog/*` and `src/features/blog/*`: server-rendered blog shell, lightweight post summaries, smaller filter island, correct image `sizes`, and no full article Markdown shipped to the listing browser.
- `src/features/quiz/*`: quiz schema was moved out of the client scoring module; result/lead phases are dynamic; progress no longer pulls the count-up island.
- `src/app/kurs/*`: checkout content is server-rendered, the CTA is a small leaf, and the mobile sticky bar is a tiny event-driven island. Native FAQ disclosures replace eager Radix accordions while retaining CSS reveal animation.
- `src/components/ui/FaqDisclosure.tsx`, `src/app/globals.css`: semantic FAQ disclosure with motion-safe CSS reveal.
- `src/features/leads/ui/LeadCaptureForm.tsx`: client form keeps immediate field validation; the server/API remains the Zod-validated boundary and the success animation remains intact.
- `src/features/auth/components/TelegramLoginButton.tsx`: widget is now a `next/script` with `afterInteractive`, mounted only inside the interaction-only auth modal.
- `next.config.mjs`: `lucide-react` package-import optimization and explicit long-lived PWA icon caching.
- `public/sw.js`: HTML and API requests are network-only; static assets are cache-first under a new cache version. No stale authenticated HTML or generic `/` fallback remains.
- `src/features/motion/server/motion-settings.service.ts`: immediate last-known/default settings with post-response cached refresh, fail-safe DB behavior, and updated unit coverage.

## Verification

- `npx tsc --noEmit` — pass.
- `npx vitest run` — **501 passed, 1 skipped across 66 files**.
- `npm run build` — pass; 90 pages generated; selected route First Load JS values are recorded above.
- `E2E_PORT=3206 npx playwright test e2e/responsive.spec.ts` — **132 passed**.
- Lighthouse desktop/mobile JSON runs completed for `/`, `/diagnostika`, `/kurs/vibe-coding-express`, `/bepul-dars`, and `/blog`.
- Server was stopped using the required port-specific `ss`/`kill` procedure before the final build; no push or deploy was performed.

## Remaining risks / next pass

- Mobile simulated LCP still needs a dedicated pass. The next highest-value work is reducing initial home/blog hydration (Roadmap, pointer effects, and global reveal observers) without removing their motion or SSR final state.
- The service worker intentionally does not provide offline HTML; this is the safe behavior for nonce CSP plus authenticated shell HTML.
- Public DB-backed reads should continue to use cached repositories and fail-safe fallbacks if future routes introduce them.

## Orchestrator review (2026-09-24)
- **Reverted per-instance motion settings.** Module-level state + `after()` refresh meant every cold serverless instance served DEFAULT_MOTION first, so an admin "O'chiq" was ignored by some visitors for up to 5 min. Back to the shared Data Cache read (`unstable_cache`, invalidated by `revalidateTag`) bounded by a 300 ms timeout — warm hits are ~1 ms.
- **Mobile LCP "3.6 s" was a Lantern simulation artefact.** With applied (devtools) throttling the real numbers exposed the actual problem instead: **CLS 0.451** on mobile.
  - Hero paragraph shift 0.184 — web-font swap (`display: swap`). Fix: Onest + Unbounded `display: "optional"` (next/font size-adjusted fallbacks).
  - Footer shift 0.267 — root `loading.tsx` skeleton was `min-h-[60vh]`, so the footer painted above the fold and jumped when the page streamed in. Fix: `min-h-[100dvh]`.
- **After (mobile, devtools throttling):** `/` FCP 1.7 s · LCP 2.1 s · TBT 230 ms · **CLS 0**; `/kurs/vibe-coding-express` FCP 1.7 s · LCP 2.1 s · TBT 210 ms · **CLS 0**. Responsive suite 132/132.
