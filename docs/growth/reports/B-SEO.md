# SEO / AI-SEO Audit — Naqsh (vibecoding-uz)

Live URL: `BRAND.url` = `NEXT_PUBLIC_APP_URL` env, fallback `https://master-2-jade.vercel.app` (src/config/brand.ts:14). Locale `uz_UZ`.

## Top 10 findings (ranked impact/effort)

1. **Soft-404 on unknown `/kurs/<slug>` and `/blog/<slug>`** — High impact / Med effort.
   `src/app/loading.tsx` (root Suspense boundary) streams a 200 skeleton before `notFound()` resolves in `src/app/kurs/[slug]/page.tsx:40` and `src/app/blog/[slug]/page.tsx:35`. Crawlers/agents fetching a bad slug see HTTP 200 with placeholder content → wastes crawl budget, risks "soft 404" flags in Search Console, breaks agent trust in status codes (agent-readiness Access pillar).
   **Fix:** give these two dynamic segments their own `loading.tsx` (or none) so the root skeleton doesn't mask the eventual 404, and confirm `notFound()` actually resolves before first byte is flushed — e.g. move the "does this slug exist" check into `generateMetadata` (which runs before render) and rely on Next's `unstable_rethrow`/redirect pattern, or add a segment-level `not-found.tsx` under `kurs/[slug]/` and `blog/[slug]/` so streaming doesn't precede the 404 status.

2. **No canonical tag on 11 of 20 public pages** — High impact / Low effort.
   `xizmatlar`, `diagnostika`, `bepul-dars`, `meetlar`, `maxfiylik`, `portfolio`, `resurslar`, `pul-qaytarish`, `testimoniyalar`, `ekspertlar`, `offerta` all set `metadata` as a plain literal instead of calling `routeMetadata()` from `src/lib/seo.ts:12` (which is the only place `alternates.canonical` gets set). Only `/`, `/kurs/[slug]`, `/blog/[slug]` are canonicalized.
   **Fix:** replace each literal `export const metadata = {...}` with `routeMetadata({ title, description, path: "/xizmatlar" })` (same pattern already used in `kurs/[slug]/page.tsx:34`).

3. **`/atamalar` (glossary, targets "vibe coding", "prompt engineering" definitions) and `/blog` (index) have zero metadata export** — High impact / Low effort.
   `src/app/atamalar/page.tsx` and `src/app/blog/page.tsx` have no `export const metadata`, so both fall back to the root layout default title/description (`"AI bilan mahsulot qurishni o'rganing — Naqsh"`), losing the keyword targeting these two pages exist for.
   **Fix:** add `routeMetadata({ title: "Atamalar lug'ati — AI va vibe coding", description: "...", path: "/atamalar" })` and similarly for `/blog`.

4. **No FAQPage JSON-LD despite structured FAQ content existing** — Med-High impact / Low effort.
   Course FAQs live in `src/features/courses/content.ts` (`faqs: CourseFaq[]`, lines 86 and 129) and render via `<FaqDisclosure items={course.faqs} />` in `src/app/kurs/[slug]/page.tsx:204`. No `FAQPage` schema is emitted for either course page, so this eligible rich-result / AI-answer-extraction opportunity is unused.
   **Fix:** add a `faqJsonLd()` helper in `src/lib/seo.ts` and emit it alongside `courseJsonLd` in `kurs/[slug]/page.tsx`.

5. **No BreadcrumbList JSON-LD anywhere** — Medium impact / Low effort.
   A visual breadcrumb exists on blog posts (`src/features/blog/ArticleHeader.tsx:7`, `ArticleBreadcrumb`) but is not paired with `BreadcrumbList` structured data. Course pages have no breadcrumb UI at all.
   **Fix:** add breadcrumb JSON-LD to blog posts (Home → Blog → Post) and course pages (Home → Kurslar → Course).

6. **No `noindex` defense-in-depth on private routes** — Medium impact / Low effort.
   `src/app/robots.ts:11` disallows `/admin`, `/api/`, `/kabinet`, `/design-system` via crawl directive only. No page under `src/app/admin/*` or `src/app/kabinet/*` sets `metadata.robots = { index: false }`. If any of these URLs is ever linked externally (shared link, backlink, referrer leak) before robots.txt is consulted, or a crawler ignores robots.txt, they can still be indexed — `Disallow` prevents crawling, not indexing of an already-known URL.
   **Fix:** add `robots: { index: false, follow: false }` in a shared `admin/layout.tsx` and `kabinet/layout.tsx` metadata export.

7. **No `llms.txt` (or `llms-full.txt`) at domain root** — Medium impact / Low effort.
   Confirmed absent: no `src/app/llms.txt`, no `public/llms*.txt`. Per `.claude/skills/ai-seo`, this is the primary machine-readable context file non-Google AI engines (ChatGPT, Claude, Perplexity) look for.
   **Fix:** ship `public/llms.txt` (draft below) as a static Next.js public asset — zero server logic, served at `/llms.txt`.

8. **`robots.txt` gives no explicit AI-crawler stance** — Medium impact / Low effort.
   `src/app/robots.ts` has a single `userAgent: "*"` rule with `allow: "/"`. It doesn't explicitly name `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, etc. They're implicitly allowed via the wildcard, but per the ai-seo skill, an *explicit* per-bot stance is the recommended pattern (and protects against a future blanket-block accident going unnoticed).
   **Fix:** add explicit rule blocks for `GPTBot`, `ChatGPT-User`, `ClaudeBot`, `anthropic-ai`, `PerplexityBot`, `Google-Extended`, `Bingbot` mirroring the `*` allow, and consider a `Disallow` for `CCBot` only (training-only, per skill guidance) if desired.

9. **Course/blog pages have no page-specific `opengraph-image`** — Low-Med impact / Med effort.
   Only `src/app/opengraph-image.tsx` exists (root-level, generic "Naqsh" branding). `kurs/[slug]/page.tsx` sets no `openGraph.images` override, so shared course links show the generic brand OG card instead of course name/price. (Blog posts *do* override with `post.coverUrl` in `blog/[slug]/page.tsx:29` — good.)
   **Fix:** add `src/app/kurs/[slug]/opengraph-image.tsx` using `ImageResponse` with `course.title` + price, reusing the pattern already built at the root.

10. **`Vibe Coding Express` / `AI asoslari` pricing exists only in JS, no `/pricing.md`** — Low impact / Low effort.
    Prices (550 000 so'm, installment options) live in `src/features/courses/content.ts` / `getCoursePricing()` and render client-visible on `/kurs/[slug]`, so they are technically crawlable/SSR'd — but there's no single agent-readable pricing file, and an AI shopping agent has to parse two full course pages to compare offers.
    **Fix:** add `public/pricing.md` (or `.txt`) listing both course prices, currency (UZS), installment terms, and the 7-day guarantee, linked from the sitemap.

---

## Structured-data plan (only using data that exists in code)

| Page | Schema type | Source of truth in code | Status |
|---|---|---|---|
| `/` (homepage) | `Organization` + `ItemList` of `Course` | `src/app/page.tsx:27-28` (`organization`, `courseList`) | **Already implemented** |
| `/kurs/[slug]` | `Course` + `CourseInstance`/`Offer` (UZS) | `courseJsonLd()` in `src/lib/seo.ts:27`, called from `kurs/[slug]/page.tsx:44` using `COURSES[slug]`, `getCoursePricing(slug)`, `siteConfig.nextCohortDate` | **Already implemented** |
| `/kurs/[slug]` | `FAQPage` (new) | `course.faqs` array, `src/features/courses/content.ts` (`CourseFaq[]`, used at line 204 of the page) | **Add** — mainEntity = each `{question, answer}` from `course.faqs` |
| `/kurs/[slug]` | `BreadcrumbList` (new) | Static: Home (`/`) → course listing (no `/kurslar` index page exists — use `/` or `/xizmatlar`) → `course.title` | **Add** |
| `/blog/[slug]` | `Article` | `articleJsonLd()` in `src/lib/seo.ts:37`, called from `blog/[slug]/page.tsx:39` using `post.title`, `post.excerpt`, `post.coverUrl`, `post.publishedAt`, `post.authorName` | **Already implemented** |
| `/blog/[slug]` | `BreadcrumbList` (new) | `ArticleBreadcrumb` component already renders Home → Blog → Post visually (`src/features/blog/ArticleHeader.tsx:7`) — mirror it in JSON-LD | **Add** |
| `/blog` (index) | none currently justified — no `CollectionPage`/`ItemList` data assembled server-side beyond the static list already in `STATIC_BLOG_POSTS` | could add `ItemList` of posts if desired, but not required | Optional |
| `/xizmatlar` | none found — page has no structured offer/price data checked (services are "price on request" per `.agents/product-marketing.md`) | n/a — don't fabricate `Offer` without real price | Skip |
| `/admin`, `/kabinet/*` | none (private) | n/a | Skip — add `noindex` instead (finding #6) |

Do not add `AggregateRating`/`Review` schema — `.agents/product-marketing.md` explicitly states "None yet public" for testimonials/customers; fabricating review schema would violate the "accuracy first" rule in `.claude/skills/schema/SKILL.md`.

---

## `llms.txt` draft (facts only, from code/`.agents/product-marketing.md`)

```
# Naqsh

> Naqsh — AI bilan mahsulot yaratish maktabi. O'zbek tilida, dasturlash tajribasisiz odamlarga
> AI vositalari (Claude Code, prompt engineering) yordamida ilova, Telegram bot va MVP qurishni
> 8 haftalik jonli guruhlarda o'rgatadi. Mentor Mirzo tomonidan boshqariladi.

## Kurslar (Courses)
- Vibe Coding Express — 550 000 so'm (yoki 183 334 so'm/oy x 3 oy) — /kurs/vibe-coding-express
- AI asoslari — 550 000 so'm (yoki 275 000 so'm/oy x 2 oy) — /kurs/ai-asoslari
- Valyuta: UZS. 7 kunlik 100% pul qaytarish kafolati — /pul-qaytarish

## Lead magnets
- Bepul dars — /bepul-dars
- Diagnostika (mos kelish testi) — /diagnostika

## Content
- Blog — /blog
- Atamalar lug'ati (AI/vibe coding terms) — /atamalar
- Portfolio (real student/founder projects) — /portfolio

## Contact
- Telegram bot: @Boyakagabot
- Xizmatlar (agency services — AI automation, Telegram bots, MVP): /xizmatlar

---

# Naqsh (English)

> Naqsh is an Uzbek-language online school teaching non-programmers to build real apps,
> Telegram bots, and MVPs with AI tools (Claude Code, prompt engineering) through 8-week
> live cohorts with mentor review. Also offers done-for-you AI automation/build services.

- Courses: Vibe Coding Express, AI Asoslari — priced in UZS, see /kurs/<slug>
- Free lesson: /bepul-dars · Fit-check quiz: /diagnostika
- Blog: /blog · Glossary: /atamalar · Student projects: /portfolio
- Guarantee: 7-day full refund — /pul-qaytarish
- Telegram: @Boyakagabot
```

Note: do not add a first cohort start date or student-count claims to `llms.txt` — `.agents/product-marketing.md` flags these as time-sensitive/unverified ("Do NOT invent student counts or results"); keep the file to durable facts and let page content carry dated specifics.
