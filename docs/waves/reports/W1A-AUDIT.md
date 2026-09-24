# W1A — Adversarial audit (enemy-eyes review)

- **Date:** 2026-09-24
- **Scope:** read-only source review; only this report was created. No `src/` changes.
- **Known environment constraint:** Supabase `DATABASE_URL` host is unreachable. I treated a graceful degraded state as a requirement and did not attempt a DB repair.
- **Evidence:** source inspection, local `next dev` on port 3201, `npm run build`, curl smoke tests, and the responsive Playwright run. The Playwright command reached test 54/132 before the 120s tool timeout; no test failure was reported in the captured portion, but the run is **not a complete pass**.

## Summary — top 10 most damaging issues

1. **P0 — Telegram signup is impossible for a new user.** The widget verifies the Telegram identity, then `loginWithTelegram` returns `phone_link_required`; the UI only displays an error and offers no registration path. `src/features/auth/server/telegram-auth.service.ts:74-77`, `src/app/api/auth/telegram/route.ts:36-46`, `src/features/auth/components/TelegramLoginButton.tsx:56-65`.
2. **P0 — Telegram account linking is a dead end for an unregistered phone.** The bot validates ownership, calls `linkTelegramAccount`, and explicitly tells an unknown phone to “register on the website”; no supported registration page/flow is present. `src/lib/telegram/handlers/contact.ts:48-64`.
3. **P0 — money/admin integrations are configured as plaintext DB settings and returned to the admin client.** Payme, Click, Telegram bot and SMS secrets are accepted by Zod, persisted in `site_settings`, and returned by `GET /api/admin/settings`. This creates an unnecessary DB exfiltration/backup risk and makes secret rotation and least-privilege difficult. `src/features/crm/components/settings/IntegrationsTab.tsx:17-26`, `src/lib/validations/admin.ts:35-40`, `src/features/crm/server/admin.service.ts:47-50`, `src/app/api/admin/settings/route.ts:9-27`.
4. **P0 — DB outage makes most authenticated product surfaces non-functional, with weak user-facing recovery.** `/api/me` and `/api/me/payments` both throw into generic 500 responses; cabinet then shows the raw API message and no offline/read-only fallback. `src/app/api/me/route.ts:43-53`, `src/app/api/me/payments/route.ts:29-56`, `src/app/kabinet/page.tsx:21-38`, `src/app/kabinet/to-lovlar/page.tsx:41-57`.
5. **P0 — security headers allow script injection execution primitives.** CSP uses both `unsafe-inline` and `unsafe-eval`; this is a material XSS blast-radius amplifier, especially with CMS/admin content and third-party Telegram script. `next.config.mjs:39-47`.
6. **P1 — the primary product promise is internally contradictory and potentially misleading.** The homepage says “7 kunlik 100% pul qaytarish kafolati”, while the course card/marketing also says a guarantee exists, but the legal page describes a 14-day guarantee and the configured default says 14 days. `src/components/sections/home/HeroSection.tsx:7`, `src/features/crm/server/admin.service.ts:19-20`, `src/app/pul-qaytarish/page.tsx:10`.
7. **P1 — course purchase is a dead end for anonymous users.** Checkout requires auth, while the course CTA is only “Kursga o'tish uchun kirish”; a visitor has no visible registration/signup affordance at the point of purchase. `src/app/api/payments/checkout/route.ts:20-26`, `src/app/kurs/[slug]/CourseCheckoutCard.tsx:45-62`.
8. **P1 — the public funnel promises Telegram/lead follow-up that the DB outage disables without a useful alternative.** Lead forms optimistically reveal a Telegram link only after `/api/quiz` succeeds, but the API fails when the DB is down. `src/features/leads/ui/LeadCaptureForm.tsx:94-114`, `src/app/api/quiz/route.ts:57-79`.
9. **P1 — mobile purchase UX is visibly obstructed.** At 390px, the sticky course buy bar overlaps the course content/price card (screenshot `e2e/screenshots/kurs-vibe-coding-express-390.png`, crop `/tmp/kurs-vibe-coding-express-390-0.png`). There is no bottom padding reservation for the fixed bar. `src/app/kurs/[slug]/StickyBuyBar.tsx:1-120` (class usage), `src/app/kurs/[slug]/CourseCheckoutCard.tsx:1-90`.
10. **P1 — the product is still publicly branded as VibeCoding/Mirzo Academy everywhere, creating a confusing pre-W1B state and SEO split.** This is visible in header, footer, modal, metadata, course and Telegram copy. W1B is scheduled, but this is a conversion/SEO defect in the audited baseline. `src/components/layout/Brand.tsx:1-4`, `src/components/layout/Footer.tsx:14`, `src/features/auth/components/AuthModal.tsx:26-36`, `src/app/layout.tsx:40-87`.

## Findings table

| ID | Priority | Area | file:line | Problem | Suggested owner of fix | Fix |
|---|---|---|---|---|---|---|
| A-001 | P0 | Auth / conversion | `src/features/auth/server/telegram-auth.service.ts:74-77`; `src/app/api/auth/telegram/route.ts:36-46` | New Telegram identities always produce 422 `phone_link_required`; the widget has no signup branch. | W2 (telegram auth) | Replace widget-only flow with W2 deep-link start/status polling; on unknown identity request owned contact, create a student, then set a single-use session. |
| A-002 | P0 | Auth | `src/lib/telegram/handlers/contact.ts:48-64` | Unknown phone is told to register on the website, but no registration page or path is wired from this failure state. | W2 (telegram auth) | On owned contact, create user or link an existing user; provide explicit site fallback only after the new-user path fails. |
| A-003 | P0 | Security | `src/features/crm/components/settings/IntegrationsTab.tsx:17-26`; `src/app/api/admin/settings/route.ts:9-27`; `src/features/crm/server/admin.service.ts:47-50` | Provider secrets are editable and returned as ordinary site settings. A compromised admin session, DB read, backup, or log can expose payment/bot/SMS credentials. | W4B (everything else) | Keep secrets in server env/KMS; only store a reference/encrypted value. Never return secret values in settings GET. Audit access and rotate exposed credentials. |
| A-004 | P0 | Antifragility | `src/app/api/me/route.ts:43-53`; `src/app/api/me/payments/route.ts:29-56` | DB down turns cabinet reads into 500; `errorResponse` logs and returns generic internal errors. | W4B (everything else) | Return a typed 503 envelope with stable `retryable: true`; show an explicit “vaqtincha texnik xizmat” state with retry, not raw internal failure. |
| A-005 | P0 | Security | `next.config.mjs:39-47` | CSP grants `unsafe-inline` and `unsafe-eval`; injected markup/scripts can execute in the origin context. | W4B (everything else) | Remove eval; move to nonce-based CSP and narrowly allow the Telegram script/frame origins. Add CSP tests. |
| A-006 | P1 | Copy / trust | `src/components/sections/home/HeroSection.tsx:7`; `src/app/pul-qaytarish/page.tsx:8-10`; `src/features/crm/server/admin.service.ts:19-20` | Homepage advertises 7-day/100% refund while legal/config says 14 days. Trust is damaged at the exact purchase decision. | W4B (everything else) | Centralize guarantee days/text in one config and render the same value everywhere; legal copy must match checkout. |
| A-007 | P1 | Conversion | `src/app/api/payments/checkout/route.ts:20-26`; `src/app/kurs/[slug]/CourseCheckoutCard.tsx:45-62` | Checkout requires auth; anonymous course visitors are not given a direct “register and continue” path. | W4B (everything else) | On 401, open the auth modal with a safe internal redirect, or provide a hosted checkout registration flow. Preserve course/plan in the redirect state. |
| A-008 | P1 | Antifragility | `src/app/api/quiz/route.ts:57-79`; `src/features/leads/ui/LeadCaptureForm.tsx:94-114` | Public quiz/free-lesson lead capture is DB-dependent and shows no retry/offline/manual-Telegram fallback. | W4B (everything else) | Add bounded request timeout and explicit 503 state; retain entered values, offer retry, and avoid claiming the request was accepted. |
| A-009 | P1 | Mobile UX | `src/app/kurs/[slug]/StickyBuyBar.tsx:1-120`; screenshot `e2e/screenshots/kurs-vibe-coding-express-390.png` | Fixed sticky bar overlays course content/price card on 390px. | W3A (motion/visual) | Add `padding-bottom` equal to bar height, safe-area inset, and verify 375/390/768 screenshots. |
| A-010 | P1 | Brand / SEO | `src/components/layout/Brand.tsx:1-4`; `src/app/layout.tsx:40-87`; `src/app/page.tsx:19-22` | Public brand is VibeCoding while metadata/siteName is Mirzo Academy; title template and OG conflict. | W1B (rebrand) | Complete the W1B brand pass atomically: one brand config, one canonical URL/name, all metadata/OG/footer/Telegram copy. |
| A-011 | P1 | SEO | `src/app/layout.tsx:40-87`; `src/app/page.tsx:19-22` | Default canonical is `/` inherited by pages unless overridden; many pages have no per-page canonical/OG image. | W4B (everything else) | Generate canonical from `metadataBase` per route; add page-specific descriptions/OG and verify no self-canonical mismatch. |
| A-012 | P1 | SEO | `src/app/sitemap.ts:5-46` | Sitemap uses `new Date()` for every entry on every request, making all pages appear perpetually modified; DB/dynamic courses/blog posts are omitted. | W4B (everything else) | Use real lastModified values, include dynamic published routes, and keep dynamic/admin URLs out. |
| A-013 | P1 | Auth UX | `src/features/auth/components/AuthModal.tsx:26-36` | New users see “Tizimga kirish” and a phone-only description; there is no explicit “kirish yoki ro‘yxatdan o‘tish” flow. | W2 (telegram auth) | Use one registration-aware modal copy and make Telegram/OTP paths clearly create or login as appropriate. |
| A-014 | P1 | UX / correctness | `src/features/lms/components/LessonPlayerView.tsx:75` | Homework submission is explicitly a disabled “Tez orada” button; this is a dead conversion/retention dead end for a paid student. | W4B (everything else) | Either ship a validated submission endpoint or remove the promise and show a working mentor/Telegram handoff with tracking. |
| A-015 | P1 | UX / correctness | `src/features/crm/components/StudentActivityTracker.tsx:11-13` | Admin “Eslatma” action only creates a local toast and explicitly sends nothing, but the UI presents it as an operational reminder. | W4B (everything else) | Label as draft/preview or implement queued notification with delivery status; never imply an unperformed action succeeded. |
| A-016 | P1 | Security | `src/lib/security/rateLimit/index.ts:27-28`; `src/lib/security/rateLimit/index.ts:31-45` | Rate limiting falls back to per-instance memory, and IP is trusted from `x-forwarded-for` without platform-header normalization. Horizontal scaling/proxy spoofing weakens auth/lead abuse controls. | W4B (everything else) | Require shared Upstash in production; use trusted platform client-IP extraction; fail closed or document a safe fallback for sensitive endpoints. |
| A-017 | P1 | Security | `next.config.mjs:26-51` | `img-src https:` and `frame-src telegram.org` are broad; external image content and Telegram framing increase supply-chain/UI abuse surface. | W4B (everything else) | Narrow image hosts to the actual CDN list; use exact Telegram OAuth frame origin; add report-only CSP rollout before enforcement. |
| A-018 | P1 | Antifragility | `src/lib/telegram/handlers/contact.ts:49-53`; `src/app/api/og-image/route.ts:28-40` | Third-party/provider calls are not uniformly bounded; Telegram bot path has no explicit fetch timeout, and DB/provider failures bubble into 500/handler errors. | W4B (everything else) | Add AbortController timeouts, classify provider outage as retryable, and return Telegram-safe user messages while logging only server-side. |
| A-019 | P1 | Conversion / copy | `src/app/bepul-dars/page.tsx:13-18`; `src/app/bepul-dars/LeadSection.tsx:13-18` | Lead magnet says the link will be sent in 24h, but a lead cannot be verified as successfully stored when DB is down; “free” CTA is not a low-friction alternative. | W4B (everything else) | Show SLA only when delivery integration is healthy; provide direct Telegram/contact fallback and explain the actual processing state. |
| A-020 | P1 | Copy / honesty | `src/app/ekspertlar/page.tsx:8`; `src/features/testimonials/testimonialsData.ts` (static testimonials consumed by `src/app/testimoniyalar/TestimonialsExplorer.tsx:12`) | Static named experts/testimonials and quantitative-looking portfolio content can read as real social proof without verifiable provenance; the page itself says examples are not independently audited. | W4B (everything else) | Mark all examples as “namuna/placeholder” until consent/evidence exists; remove invented-looking names, ratings, or claims from conversion surfaces. |
| A-021 | P2 | Copy | `src/components/layout/Footer.tsx:14`; `src/features/auth/components/AuthModal.tsx:28`; `src/lib/telegram/handlers/commands.ts:10-60` | Inconsistent apostrophes/brand terms: `g'oya`, `o'zbek`, `bo‘lib`, `Vibecoding`, `VibeCoding`, `Vibe Coding` coexist. This reduces polish and search consistency. | W1B (rebrand) | Apply a single Uzbek Latin copy guide, normalize apostrophes to `o'`/`g'`, and run a user-facing string lint. |
| A-022 | P2 | UX / accessibility | `src/app/kurs/[slug]/StickyBuyBar.tsx:1-120`; `src/components/layout/MobileDrawer.tsx:14` | Sticky/drawer surfaces need explicit keyboard/focus/reduced-motion checks; test only checks overflow/console/tap targets, not focus order or screen-reader names. | W3A (motion/visual) | Add focus-visible, Escape/close, reduced-motion, and automated keyboard smoke tests. |
| A-023 | P2 | Performance | `src/app/layout.tsx:13-38` | Four Google font families are loaded globally, including unused `Instrument_Serif`; every public route pays font/network cost even when not needed. | W4A (perf) | Remove unused font, subset/weight-limit Unbounded, self-host or use a single variable font strategy; measure LCP on 3G. |
| A-024 | P2 | Performance | `src/components/layout/Header.tsx:1-19`; `src/components/layout/MobileDrawer.tsx:1-14`; `src/components/layout/ThemeProvider.tsx:1-1`; `src/components/layout/PwaRegister.tsx:1-1` | Global layout ships a large client island for header, drawer, theme, auth, modals, and PWA registration. | W4A (perf) | Keep server-rendered header shell; isolate drawer/theme/auth islands; defer PWA registration and modals. |
| A-025 | P2 | Performance | `src/features/quiz/ui/DiagnosticQuiz.tsx:1-1`; `src/components/sections/home/Roadmap.tsx:1-1`; `src/components/ui/SpinWheel.tsx:1-1` | Interactive components are client-heavy, and Roadmap/SpinWheel are likely below-the-fold islands loaded on initial home route. | W4A (perf) | Dynamically import below-fold interactions or keep state in small islands; verify that SSR final content remains visible without JS. |
| A-026 | P2 | Performance | `src/features/blog/ActiveToc.tsx:1-1`; `src/app/blog/page.tsx` (blog card image-heavy page) | Blog cards display large remote images; crop shows a long mobile list with image-heavy cards and no evidence of optimized responsive `sizes`/modern formats. | W4A (perf) | Audit `next/image` usage, set explicit dimensions/sizes, prefer local AVIF/WebP, and lazy-load below-fold media. |
| A-027 | P2 | SEO / trust | `src/app/layout.tsx:40`; `src/app/sitemap.ts:5`; `src/app/robots.ts:3` | Default host is `academy.mirzo.uz`, while production URL is `master-2-jade.vercel.app`; if env is absent, canonical/robots/sitemap point to a different host. | W4B (everything else) | Use a validated production host constant, fail build if `NEXT_PUBLIC_APP_URL` is missing in production, and keep canonical/OG/robots aligned. |
| A-028 | P2 | SEO | `src/app/page.tsx:22`; `src/app/kurs/[slug]/page.tsx:57`; `src/app/blog/[slug]/page.tsx:67` | JSON-LD is manually injected; course page lacks visible course offer/review schema while blog uses raw JSON-LD. | W4B (everything else) | Centralize schema builders, validate output, add Organization/Course/Offer/Breadcrumb data only where factual, and escape consistently. |
| A-029 | P2 | Antifragility | `src/app/kabinet/page.tsx:21-38`; `src/app/kabinet/to-lovlar/page.tsx:41-61` | No fetch timeout/AbortController means a hung network request leaves the cabinet skeleton indefinitely. | W4A (perf) | Add bounded fetch timeout, cancel on unmount, and render retry state. |
| A-030 | P2 | UX / forms | `src/features/jobs/components/apply/ApplyJobModal.tsx:37`; `src/app/ish/[slug]/JobApplySection.tsx:17-28` | Confirmation promises contact “within 24 hours” without showing whether the application is queued versus merely received; DB failure is presented as generic retry. | W4B (everything else) | Return a real receipt/status ID, show delivery state, and only promise an SLA when provider/workflow is configured. |

## Auth end-to-end: new Telegram user failure map

1. User opens the auth modal. The only Telegram UI is the Telegram Login Widget; copy says “Tizimga kirish” and “Telegram orqali kirish”. `src/features/auth/components/AuthModal.tsx:26-36,70-78`.
2. Widget loads `https://telegram.org/js/telegram-widget.js` and calls `window.onTelegramAuth`. This is dependent on a third-party script and BotFather domain configuration; no local fallback exists. `src/features/auth/components/TelegramLoginButton.tsx:81-103`.
3. `/api/auth/telegram` rate-limits, validates the payload, verifies Telegram HMAC and freshness. `src/app/api/auth/telegram/route.ts:16-34`.
4. `loginWithTelegram` looks up `users.tgUserId`; a new identity returns `phone_link_required`. `src/features/auth/server/telegram-auth.service.ts:69-77`.
5. The route returns 422 with the identity data, but the client only displays the error and a close button. `src/app/api/auth/telegram/route.ts:36-46`; `src/features/auth/components/TelegramLoginButton.tsx:56-65,122-127`.
6. The separate bot contact path can verify phone ownership, but unknown phone numbers are not created and the user is sent to a non-specific “register on the website” URL. `src/lib/telegram/handlers/contact.ts:34-64`.
7. With the known DB outage, even the phone lookup/session write cannot complete; the product currently offers no safe registration/status/polling path.

**Required W2 acceptance test:** new Telegram user → deep-link start → contact ownership → created student → single-use approval → session cookie → cabinet. Existing Telegram user must be idempotently logged in. Test DB outage and Telegram timeout separately.

## Antifragility observations

- Public home is mostly static and returned HTTP 200 locally despite the DB outage.
- Protected `/kabinet` correctly redirects unauthenticated users (307 locally), and admin settings API returns 401 without a session.
- DB-backed APIs do not consistently degrade: `errorResponse` maps unknown failures to 500 and does not provide a typed retryable envelope.
- The public funnel is not resilient because lead capture is the only path to the promised Telegram follow-up.
- Telegram widget is a single third-party dependency; bot deep-link is not wired into the site.
- No broad fetch timeouts are present in the inspected cabinet/auth/client call sites; the OG route’s 5s timeout is an exception.
- Rate limiting is only distributed if Upstash is configured; the default in-memory limiter is per instance.

## Performance baseline (`npm run build`)

Build result: **PASS**, 86 static pages generated, shared First Load JS **102 kB**, shared chunk total includes `225` 46.1 kB and `575d5d0b` 54.2 kB. The following is the exact route output captured from the build.

| Route | Size | First Load JS |
|---|---:|---:|
| `/` | 3.9 kB | 126 kB |
| `/_not-found` | 246 B | 103 kB |
| `/admin` | 167 B | 106 kB |
| `/admin/analytics` | 3.76 kB | 106 kB |
| `/admin/blog` | 6.51 kB | 109 kB |
| `/admin/cohorts` | 6.08 kB | 133 kB |
| `/admin/homework` | 5.73 kB | 120 kB |
| `/admin/leads` | 6.96 kB | 121 kB |
| `/admin/login` | 3.53 kB | 118 kB |
| `/admin/notifications` | 4.96 kB | 107 kB |
| `/admin/portfolio` | 9.99 kB | 143 kB |
| `/admin/profile` | 127 B | 123 kB |
| `/admin/settings` | 127 B | 123 kB |
| `/admin/students` | 5.98 kB | 108 kB |
| `/admin/users` | 6.67 kB | 109 kB |
| `/api/**` routes | 246 B each | 103 kB |
| `/atamalar` | 4.46 kB | 127 kB |
| `/bepul-dars` | 1.31 kB | 140 kB |
| `/blog` | 11.5 kB | 139 kB |
| `/blog/[slug]` | 2.08 kB | 113 kB |
| `/design-system` | 2.64 kB | 125 kB |
| `/diagnostika` | 4.5 kB | 135 kB |
| `/ekspertlar` | 784 B | 123 kB |
| `/ish` | 11.9 kB | 152 kB |
| `/ish/[slug]` | 4.75 kB | 123 kB |
| `/kabinet` | 1.87 kB | 139 kB |
| `/kabinet/baholar` | 3.12 kB | 135 kB |
| `/kabinet/kurs/[id]/dars/[lessonId]` | 11.1 kB | 143 kB |
| `/kabinet/referral` | 5.33 kB | 152 kB |
| `/kabinet/sertifikat` | 4.32 kB | 123 kB |
| `/kabinet/sozlamalar` | 6.6 kB | 158 kB |
| `/kabinet/to-lovlar` | 6.65 kB | 157 kB |
| `/kurs/[slug]` | 5.34 kB | 141 kB |
| `/maxfiylik` | 784 B | 123 kB |
| `/meetlar` | 696 B | 140 kB |
| `/offerta` | 784 B | 123 kB |
| `/portfolio` | 6.18 kB | 134 kB |
| `/pul-qaytarish` | 776 B | 123 kB |
| `/ref/[code]` | 246 B | 103 kB |
| `/resurslar` | 696 B | 140 kB |
| `/robots.txt` | 246 B | 103 kB |
| `/shahodatnoma/[code]` | 167 B | 106 kB |
| `/sitemap.xml` | 246 B | 103 kB |
| `/testimoniyalar` | 7.25 kB | 130 kB |
| `/xizmatlar` | 695 B | 140 kB |

### Performance observations

- The highest user-facing First Load JS values are `/ish` (152 kB), `/kabinet/referral` (152 kB), `/kabinet/sozlamalar` (158 kB), and `/kabinet/to-lovlar` (157 kB).
- Public conversion pages are still heavy: `/bepul-dars` 140 kB, `/diagnostika` 135 kB, `/kurs/[slug]` 141 kB, `/xizmatlar` 140 kB.
- `next/font/google` loads four families globally; `Instrument_Serif` appears unused in the visible layout. `src/app/layout.tsx:13-38`.
- Header, theme provider, mobile drawer, PWA registration, auth context, and client modals form a broad client layer around every public route. `src/app/layout.tsx:7-10,118+`; `src/components/layout/Header.tsx:1-19`; `src/components/layout/ThemeProvider.tsx:1-1`; `src/components/layout/PwaRegister.tsx:1-1`.
- Blog is image-heavy and `/blog` ships 139 kB. The mobile screenshot shows multiple large remote images; explicit image dimensions/sizes and modern formats need verification. `src/app/blog/page.tsx`; `src/features/blog/ActiveToc.tsx:1-1`.
- No obvious third-party script is in the initial server bundle except the client-injected Telegram widget; that script is a runtime dependency and can block the auth interaction. `src/features/auth/components/TelegramLoginButton.tsx:87-94`.

## UX / visual findings from screenshots

- **Mobile home (`home-375-dark.png`):** hierarchy is strong, but the product demo is decorative rather than proof. The “N” floating circle is unexplained and looks like an accidental test/widget artifact in the terminal/hero area.
- **Course mobile (`kurs-vibe-coding-express-390.png`):** sticky buy bar overlaps the course card and price content; conversion controls are visually obstructed.
- **Diagnostic desktop (`diagnostika-1024.png`):** empty progress starts at 0% before the first answer, while the first question is already visible. This creates a weak sense of progress; initialize progress to the first step or use a clearer step state.
- **Blog mobile (`blog-375.png`):** the card stack is visually repetitive and image-heavy; the category/category badge overlays are small and low-contrast on dark images.
- **Dark mode:** the home dark treatment is visually coherent, but decorative pattern density behind long text and the repeated card stack increases cognitive load.
- **Brand mismatch:** screenshots show `vibecoding` in the header/footer while pages use “Mirzo Academy”; this is a visible trust/identity fracture.

## SEO findings

- Root layout and sitemap/robots use `https://academy.mirzo.uz` as fallback, while the documented production is `https://master-2-jade.vercel.app`. `src/app/layout.tsx:40`, `src/app/sitemap.ts:5`, `src/app/robots.ts:3`.
- Default root metadata and homepage metadata disagree on site name/OG: root says “Mirzo Academy”, homepage says “VibeCoding.uz”. `src/app/layout.tsx:45-87`, `src/app/page.tsx:19-22`.
- Per-page metadata is inconsistent and several pages do not explicitly set canonical/OG. `src/app/xizmatlar/page.tsx:4-8`, `src/app/resurslar/page.tsx:7-8`, `src/app/meetlar/page.tsx:8-10`.
- Sitemap uses current time for all static URLs, not content dates. `src/app/sitemap.ts:24-28`.
- Dynamic course/blog routes are statically generated from local data and do not represent DB-published content. `src/app/sitemap.ts:31-46`.
- Blog JSON-LD is hand-built; no visible FAQ/Organization consistency audit was found. `src/app/blog/[slug]/page.tsx:67`.
- `/design-system` is noindex in page metadata, but should also be disallowed in robots if it is a production route. `src/app/(dev)/design-system/page.tsx:5`, `src/app/robots.ts:7-11`.

## Verification notes

- `npm run build`: **PASS**.
- `E2E_PORT=3201 npx playwright test e2e/responsive.spec.ts`: command timed out after 120s at test 54/132; captured output had no failure before timeout. Treat as incomplete, not green.
- Local curl smoke: `/` returned 200; unauthenticated `/kabinet` returned 307; unauthenticated `/api/admin/settings` returned 401.
- Server was stopped with `kill $(lsof -t -i:3201)`.
- No source files were modified.
