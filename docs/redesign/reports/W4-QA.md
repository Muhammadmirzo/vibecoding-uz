# W4-QA — Responsive UI, accessibility, and token sweep

## What changed

- Added `e2e/responsive.spec.ts` covering every requested public route at 375, 390, 768, 1024, 1280, and 1440px. `/` and `/kurs/vibe-coding-express` also run in dark mode.
- Playwright now uses `http://localhost:3100`, stores full-page screenshots in ignored `e2e/screenshots/`, and keeps the dev server memory watcher disabled during the long responsive matrix so Next does not restart mid-run.
- Fixed responsive defects found during screenshot review: `Section` now correctly merges custom backgrounds; iPad service cards use a 2-column intermediate grid; nested `main` landmarks were removed; portfolio, service, and design-system pages now have one `h1`; blog article and legal link targets were enlarged; shared buttons/icons/footer links meet touch sizing.
- Added a skip-to-content link, global keyboard-visible focus treatment, mobile button sizing, safe-area padding for the course sticky buy bar, and a matching content spacer.
- Converted the remaining blog related-post image to `next/image` with `sizes`; verified the remaining public images use `next/image`.
- Removed all legacy aliases and old usages from `src/**`: `cream`, `cream-warm`, `cream-deep`, `--color-*`, `likely`, `btn-primary`, `btn-secondary`, raw hex color utilities, and related old class styles. Removed the `cream` Tailwind scale and legacy CSS variables from `globals.css`/`tailwind.config.js`.
- The responsive test ignores only the known unauthenticated `/api/me` probe, intentional 404 document response, and transient Next dev HMR parse messages. Page errors and all other console errors still fail the test.

## Per-route / per-width checklist

All cells below mean: no horizontal overflow, one `h1`, one `main`, no unexpected console/page errors, and full-page screenshot saved. For widths 375/390/768, the test also verifies visible buttons and non-inline links have a minimum 40px target.

| Route | 375 | 390 | 768 | 1024 | 1280 | 1440 | Dark |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ all widths |
| `/diagnostika` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/bepul-dars` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/kurs/vibe-coding-express` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ all widths |
| `/kurs/ai-asoslari` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/xizmatlar` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/blog` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/blog/vibe-coding-nima-va-u-qanday-ishlaydi` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/portfolio` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/testimoniyalar` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/ekspertlar` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/meetlar` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/resurslar` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/atamalar` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/ish` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/pul-qaytarish` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/maxfiylik` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/offerta` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/404-qa-check` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/design-system` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |

## Verification

- `npx tsc --noEmit` — passed with no errors.
- `npx playwright test e2e/responsive.spec.ts` — **132 passed** (including all light/dark variants).
- Screenshots were manually reviewed at representative phone, iPad, and desktop widths, including `/`, `/xizmatlar`, `/blog`, the first blog post, `/portfolio`, `/ish`, course dark mode, `/resurslar`, `/meetlar`, `/atamalar`, and `/design-system`.
- No API, database, server/domain feature, or secret files were edited.

## Remaining risks / notes

- The unauthenticated global auth provider still probes `/api/me` and receives the expected 401; the auth context is outside the assigned W4 UI scope.
- Next dev can emit transient HMR parse errors during a long cold-start matrix. The test explicitly ignores only those two known dev-server messages; application page errors remain fatal.
- Generated screenshots are intentionally ignored and are not part of the source change.
