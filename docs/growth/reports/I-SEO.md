# I-SEO — SEO/AI-SEO implementation report

Worktree: `/home/user/wt/seo`, branch `wave/seo`, commit `35fc7de14321948ae78205c1cdef08118e0834a6`.

## Files changed (23)

**Metadata → routeMetadata() (canonical), titles/descriptions unchanged:**
- src/app/xizmatlar/page.tsx
- src/app/diagnostika/page.tsx
- src/app/bepul-dars/page.tsx
- src/app/meetlar/page.tsx
- src/app/maxfiylik/page.tsx
- src/app/portfolio/page.tsx
- src/app/resurslar/page.tsx
- src/app/pul-qaytarish/page.tsx
- src/app/testimoniyalar/page.tsx (closed route — see caveat below)
- src/app/ekspertlar/page.tsx
- src/app/offerta/page.tsx

**New metadata (/atamalar, /blog index):**
- src/app/atamalar/layout.tsx (new — the page is `"use client"`, so metadata has to live in a layout)
- src/app/blog/page.tsx (metadata export added; page was already a server component)

**JSON-LD:**
- src/lib/seo.ts — added `faqPageJsonLd()` and `breadcrumbJsonLd()`
- src/__tests__/w5-arch/seo.test.ts (new) — unit tests for both helpers
- src/app/kurs/[slug]/page.tsx — emits FAQPage (from `course.faqs`) + BreadcrumbList (Home → course title); also added `dynamicParams = false` and moved the not-found check into `generateMetadata` (see soft-404 section — neither alone fixed the status code, kept anyway as more correct/defensive)
- src/app/blog/[slug]/page.tsx — emits BreadcrumbList (Home → Blog → post title); same `dynamicParams = false` + `generateMetadata` notFound() change

**noindex:**
- src/app/admin/layout.tsx — added `robots: { index: false, follow: false }` to the existing metadata object
- src/app/kabinet/layout.tsx (new — kabinet had no layout.tsx; its pages are all `"use client"`, so this is the only place a robots directive can live)

**robots.txt:**
- src/app/robots.ts — kept the `*` allow/disallow rule, added one explicit rule per AI crawler (GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Bingbot), same disallow list
- src/__tests__/w5-arch/robots.test.ts (new) — no prior robots test existed; added one since the rules shape changed from a single object to an array

**llms.txt:**
- public/llms.txt (new) — content re-verified against src/lib/siteConfig.ts, src/config/brand.ts, src/features/courses/content.ts; no cohort dates or student counts included

**Soft-404 fix:**
- src/middleware.ts — added a real 404 check for `/kurs/<slug>` and `/blog/<slug>` against the known static slug lists, mirroring the existing `isClosedRoute` 404 pattern already in this file

## Soft-404 investigation (item 7) — what actually worked

Root cause confirmed empirically: `src/app/loading.tsx` (root-level) wraps **every** route in a Suspense boundary. Next streams that skeleton with a 200 status the instant it starts rendering, before it can know whether the deeper page will call `notFound()`. This happens regardless of *where* `notFound()` is called.

Tried, in order, each verified with `curl -s -o /dev/null -w "%{http_code}"` against a real `next build` + standalone server on :3301:

1. **`dynamicParams = false`** on both `[slug]` pages (slugs are static lists via `generateStaticParams`) — still **200** for `/kurs/nope` and `/blog/nope`. Kept it anyway (harmless, more correct intent — every valid slug is already in the static list) but it did not fix the status.
2. **`notFound()` called inside `generateMetadata`** instead of returning a fallback title — content changed correctly (falls through to the global not-found page, no more fake "Kurs topilmadi" title), but status was still **200**. Kept this too, since it is strictly better than the old fallback metadata object even though it doesn't fix the status.
3. **Diagnostic-only**: removed `src/app/loading.tsx` entirely — `/kurs/nope` and `/blog/nope` correctly returned **404**, confirming the root Suspense boundary is the actual cause. Reverted immediately (removing it site-wide risks the CLS regression the file's own comment warns about, and is out of scope — other agents are editing page bodies in parallel).
4. **Diagnostic-only**: added an empty `loading.tsx` at `kurs/[slug]/loading.tsx` to see if a nested boundary shadows the root one — it does not; still **200**. Removed.
5. **What worked**: this codebase already has the identical problem solved for "closed" routes — `src/middleware.ts` has a comment ("Layout'dagi notFound() statik prerenderda 200 qaytargani uchun real 404 shu yerda kafolatlanadi") and returns a real `NextResponse(..., { status: 404 })` for closed routes, entirely bypassing the React render/Suspense pipeline. I extended the same pattern: middleware now checks `/kurs/<slug>` against `COURSE_SLUGS` and `/blog/<slug>` against `STATIC_BLOG_POSTS` slugs, and returns a genuine 404 (plain text, matching the existing closed-route response) before any rendering starts. Middleware bundle grew from 36.8 kB to 58.8 kB (blog post content is ~13 kB of text pulled in for the slug list) — well within edge middleware limits.

Final curl matrix (standalone server on :3301, `next build` + `node .next/standalone/server.js`, `DATABASE_URL` and a build-time-only `SESSION_SECRET` exported):

| URL | Status |
|---|---|
| `/kurs/vibe-coding-express` | 200 |
| `/kurs/ai-asoslari` | 200 |
| `/kurs/nope` | **404** |
| `/kurs/nope` (Googlebot UA) | **404** |
| `/blog/vibe-coding-nima-va-u-qanday-ishlaydi` | 200 |
| `/blog/nope` | **404** |
| `/blog/nope` (Googlebot UA) | **404** |
| `/` | 200 |
| `/xizmatlar`, `/diagnostika`, `/bepul-dars`, `/meetlar`, `/maxfiylik`, `/portfolio`, `/resurslar`, `/pul-qaytarish`, `/ekspertlar`, `/offerta`, `/atamalar`, `/blog` | 200 |
| `/testimoniyalar` | 404 (pre-existing — closed feature, W10 registry; unrelated to this task) |
| `/admin` (unauthenticated) | 307 (redirect to login, unchanged) |
| `/kabinet` (unauthenticated) | 307 (redirect, unchanged) |
| `/llms.txt` | 200 |
| `/robots.txt` | 200, lists all 8 AI-bot rules + wildcard |
| `/sitemap.xml` | 200 |

JSON-LD spot check: `/kurs/*` emits `Course`, `CourseInstance`, `Offer`, `Organization` (pre-existing) plus new `FAQPage`/`Question`/`Answer` and `BreadcrumbList`/`ListItem`. `/blog/[slug]` emits `Article`/`Person`/`Organization` (pre-existing) plus new `BreadcrumbList`/`ListItem`.

Server management: started via `node .next/standalone/server.js` (not `npx next start` — that command prints an explicit warning that it doesn't work correctly with `output: 'standalone'`, and in testing it genuinely didn't reflect the middleware/dynamicParams behavior correctly; switched to the standalone entrypoint the warning recommends and re-verified everything above with it). Found the PID via `/proc/net/tcp` + `/proc/<pid>/fd` (no `ss`/`netstat` available in this container) and stopped it with a direct `kill <pid>`, never `pkill -f`.

## Caveats / things worth a second look

- **`/testimoniyalar` is a closed route** (`src/lib/features/closed.ts`, W10 registry) — middleware already 404s every request to it. I still switched its `metadata` export to `routeMetadata()` per the audit/task instruction, but in practice that metadata is currently unreachable (middleware intercepts first). Harmless, and correct if the feature is ever reopened.
- **Title double-suffix (pre-existing, not introduced by this change)**: the root layout's title template is `%s — Naqsh`. Several of the *original* literal titles already ended in `| Naqsh` (e.g. "Xizmatlar — AI, Telegram bot va MVP | Naqsh"), so their final rendered `<title>` was always `"... | Naqsh — Naqsh"` even before my change — I preserved these titles exactly as instructed ("keep their existing titles/descriptions exactly"), so this cosmetic duplication is unchanged, just now also canonicalized. For the **new** titles I authored (`/atamalar`, `/blog` index) I deliberately left off the `| Naqsh` suffix to avoid adding a new instance of this duplication.
- Middleware bundle size grew ~22 kB from importing blog post data for the slug set; still fine, but worth knowing if middleware bundle size becomes a concern later.
- `next.config.mjs` already sets `htmlLimitedBots: /.*/` for a different reason (keeps `<title>`/`<meta>` in `<head>` for every UA); this is unrelated to the soft-404 fix and was left untouched.
- No `.env*` files were touched. Build/test required `DATABASE_URL` (given) and `SESSION_SECRET` — the latter isn't in `.env.example` as a real value, so I exported a throwaway build-time-only string via shell env var for `next build`/`next start`, never wrote it to any file.

## Gate results

```
npx tsc --noEmit     → 0 errors
npx vitest run       → 94 test files passed, 622 tests passed (all green; incl. 2 new files: seo.test.ts, robots.test.ts)
npx next build       → succeeded (/kurs/[slug] and /blog/[slug] show as ● SSG with both known slugs prerendered)
```

All files stay ≤ 250 lines (largest touched file: `src/app/kurs/[slug]/page.tsx` at 232 lines, `src/middleware.ts` at 185 lines).

## Not done / out of scope

- Did not touch `opengraph-image` for course pages (audit finding #9) or `/pricing.md` (finding #10) — not in this task's scope.
- Did not add `ItemList`/`CollectionPage` JSON-LD to `/blog` index — audit marked it optional, task didn't request it.
- Everything explicitly requested in the task (items 1–7) is implemented and verified.
