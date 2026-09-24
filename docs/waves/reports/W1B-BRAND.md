# W1B — Rebrand to Naqsh: report

Branch: `wave/w1b-brand`. Scope: brand/identity only (no motion system, no auth logic, no Playwright).

Gates: `npx tsc --noEmit` clean · `npx vitest run` 58 files / 465 passed, 1 skipped · `npm run build` green (88 static pages, incl. `/icon.svg`, `/apple-icon`, `/opengraph-image`, `/twitter-image`).

## 1. Logo (core deliverable)

- `src/components/brand/Logo.tsx` — exports `LogoMark` (mark only) and `Logo` (mark + lowercase `naqsh` wordmark, font-display, tracking −0.045em). Props: `size` (default 32), `variant: "color" | "mono"`, `className`, `animated`, `title`.
- Geometry on a 32-unit grid: axis-aligned 16×16 square (inset 8) in brand/lapis underneath; 45° diamond with vertices at distance 11 from centre in gold on top; `>` caret + cursor bar in accent at the centre. Mono uses `currentColor` throughout.
- Interlace is a genuine over/under weave: the diamond carries a dash gap at every other crossing (real path units — edge = 11√2 ≈ 15.556, dasharray `12.756 2.8`, offset `9.913`), so it needs no background-colour knockout and works on any surface, in browsers and SVG rasterizers. Verified by rasterizing and sampling all 8 crossings: blue at c1/c3/c5/c7 (square over), gold at c2/c4/c6/c8 (diamond over).
- Bug found by visual inspection and fixed: first attempt used `pathLength=100` + offset −4.568, which placed gaps at the diamond vertices (and `pathLength` is ignored by some rasterizers). Reworked to real units, no `pathLength`.
- `animated` = subtle first-paint stroke-draw (square) + fade (diamond, caret), pure CSS in `globals.css`, gated by `prefers-reduced-motion: no-preference` AND `html:not([data-motion="off"])` so the W3 motion system can kill it.
- Static exports: `public/brand/naqsh-mark.svg`, `naqsh-logo.svg` (mark + Unbounded wordmark w/ system fallback), `naqsh-mark-mono.svg` (`currentColor`).
- Rationale: girih star = Samarkand craft + code patterns; `>` caret = prompt-first building; three tokens keep it in the Samarkand Modern palette and legible on ivory and lapis-night. Pixel-aligned integers throughout; crisp at 16px.

## 2. Icons / manifest / PWA / OG

- Favicon: `src/app/icon.svg` (ivory rounded-square + mark) served at `/icon.svg`; Apple icon: `src/app/apple-icon.tsx` (edge `ImageResponse`, 180×180).
- `public/icons/icon-192.png` + `icon-512.png` generated from the mark via sharp (maskable-safe full-bleed ivory).
- `public/manifest.json`: name `Naqsh — AI bilan mahsulot yaratish maktabi`, short_name `Naqsh`, description = BRAND.tagline, theme_color lapis `#1440A0`, background ivory.
- `public/sw.js`: cache `naqsh-v1`, precache swaps `/favicon.ico` → `/icon.svg`.
- `src/app/opengraph-image.tsx` + `twitter-image.tsx` (re-export): 1200×630 edge image, ivory/lapis, logo geometry inline, tagline + descriptor from BRAND, girih watermark tiles, Unbounded loaded from Google Fonts with try/catch fallback to system font. Root layout no longer pins `/images/hero-banner.jpg`, so the file-based OG wins.

## 3. String decisions (per-string)

Used `BRAND` (`@/config/brand`) everywhere below. Rule applied: **Naqsh = the school; "vibe coding" (lowercase, discipline) and "Vibe Coding Express" (course display name) stay; code identifiers, package name, env vars, DB names, URLs/slugs stay.**

| String / file | Decision |
|---|---|
| Header `Brand.tsx`, Footer, `layout.tsx` metadata (`%s — Naqsh` template, description, `applicationName`, `siteName`, keywords, apple title) | → Naqsh via BRAND; `siteUrl` now `BRAND.url` (canonical per AGENTS.md) |
| `AuthModal` badge "Vibecoding platformasi" | → "Naqsh platformasi" |
| Comparison tables (`Comparison.tsx`, `kurs/[slug]`) school column | → Naqsh (caption/sr text updated) |
| Home JSON-LD Organization, course provider, blog Article publisher | → Naqsh |
| Emails (`resend.ts`): brand link, kabinet URL, subject, from-name | → BRAND.name + BRAND.url (from-address domain `academy.mirzo.uz` kept — infra, see §4) |
| SMS OTP (`sms/eskiz/service.ts`): `academy.mirzo.uz — …` | → `Naqsh — Tasdiqlash kodingiz: …` |
| Telegram bot (`handlers/start.ts`, `commands.ts`): welcome + link-success messages, "Vibecoding usuli" | → Naqsh ("VIBE CODING BILAN…" header kept — discipline) |
| Reminders service + cron route (TG nudge, SMS nudge, drip `lessonUrl`) | → BRAND.name / BRAND.url |
| Certificates PDF: header `MIRZO ACADEMY` → `NAQSH`; signature → `Naqsh jamoasi`; also fixed `Rahiari` typo → `rahbari`; code prefix `VIBE-` → `NAQSH-` (test updated) |
| Payme receipt item "Vibecoding kurs to'lovi" | → "Naqsh kurs to'lovi" |
| Portfolio placeholder default domain | → `naqsh` (param still overridable) |
| Referral: SSR fallback URL → `BRAND.url`; share text → "Naqsh kursi…" | course slug untouched |
| Admin: `DEFAULT_SETTINGS.siteTitle`, `useSettings` default, `AdminNav`, login badge, all `| Vibecoding Admin` titles → `| Naqsh`, portfolio settings desc | admin is staff-facing but still brand |
| Blog: author roles → "Naqsh asoschisi (va bosh mentor)"; article CTA line → Naqsh school; publisher JSON-LD → Naqsh | author person "Mirzo" kept (founder, cf. BRAND.founder) |
| Jobs posts: school refs → Naqsh | role title "Senior Vibe Coding Mentor" kept (discipline) |
| Broadcast composer default body + placeholder | → Naqsh (this text is sent to users) |
| `og-image` route User-Agent `VibeCodingBot` | → `NaqshBot` |
| MCP server name + README | → `naqsh-mcp-server` / "Naqsh MCP Server" |
| Page metadata titles `| Mirzo Academy` → `| Naqsh`; descriptions rewritten (ekspertlar, testimoniyalar, maxfiylik, offerta, meetlar, blog, admin layout, ish, kabinet) | |
| `authorName` defaults (`validations/admin.ts`, `db/schema/content.ts` → migration `drizzle/0004_huge_ares.sql` via `db:generate` only, no migrate), `BlogManager` blank, seed bio, crm-blog test fixtures | → "Naqsh jamoasi" |
| Hero eyebrow → "Naqsh — AI bilan mahsulot yaratish maktabi" (names the school once); footer adds the meaning line once: "Naqsh — ustalar qoldiradigan iz. O'z mahsulotingizni yarating, iz qoldiring." Mentor section untouched (about Mirzo, discipline "vibe coding mentori" kept) | no invented numbers anywhere |

Kept deliberately (not user-facing brand): package name `vibecoding-platform`, `DATABASE_URL` fallback db `vibecoding_db`, env var names, `tgUsername: jasur_vibecoding` + `admin@academy.mirzo.uz` seed fixtures, test fixture emails/URLs (`test@vibecoding.uz`, `lessonUrl`), `hello@academy.mirzo.uz` + `academy.mirzo.uz` links (live contact/domain infra — needs owner decision, §4), `supportTelegram: @mirzo_academy_support_bot` default (live handle), Telegram bot deep URLs `master-2-jade.vercel.app` (== BRAND.url), `BRAND.telegramBot` untouched, course slug `vibe-coding-express`, glossary/atamalar discipline definitions, search fixtures, one code comment in `brand.ts` mentioning the old name.

## 4. Left / risks / owner decisions

1. **Domain & contact email**: `academy.mirzo.uz` links + `hello@academy.mirzo.uz` (footer) + `no-reply@academy.mirzo.uz` (email default) + `@mirzo_academy_support_bot` predate the rebrand and still work — changing them needs DNS/mailbox/TG admin work. Recommend a follow-up once `naqsh.uz` (or chosen domain) is live.
2. **Old `VIBE-` certificate codes** already issued keep verifying (lookup is by stored code, prefix-agnostic) — only new codes use `NAQSH-`.
3. **DB migration `drizzle/0004_huge_ares.sql`** generated, NOT applied (per rules). Apply with the normal migrate flow when DB is up.
4. **OG font**: Unbounded fetch happens at render; offline build → system-font fallback (by design).
5. **`/images/hero-banner.jpg`** still exists and is used by page bodies; only metadata OG pointers were removed. Deleting/retouching the JPG is out of scope.
6. No Playwright run (per mission — another wave owns it). No dev server left running.

## 5. How verified

- `npx tsc --noEmit` clean; `npx vitest run` 58/58 files, 465 passed / 1 skipped (updated `infrastructure.test.ts` manifest + sw-cache assertions, `telegram-drip-certificates.test.ts` `NAQSH-` regex/fixture, `crm-blog.test.ts` fixtures); `npm run build` green — `/icon.svg`, `/apple-icon`, `/opengraph-image`, `/twitter-image` routes emitted.
- Logo: rasterized via sharp, pixel-sampled all 8 crossings (alternation confirmed), viewed mark + lockup renders; SVGs XML-validated; PNG icons dimension-checked (192/512 RGBA).
- Final grep: zero user-facing `VibeCoding|vibecoding.uz|Mirzo Academy` outside the §3 keep-list.

## Orchestrator review (2026-09-24)
- Logo geometry redrawn: the first version's diamond gaps landed off the crossings and the square was never broken, so the weave didn't read; the `›|` centre read as a media "skip" icon. New mark: two equal squares (true 8-point girih), square drawn as 4 corner strokes with gaps at alternating crossings (real over/under), centre `>_` prompt.
- Single source of truth: `src/components/brand/logoGeometry.ts`. `Logo.tsx`, `apple-icon.tsx`, `opengraph-image.tsx` render from it; static SVGs (`public/brand/*`, `src/app/icon.svg`) are generated by `npx tsx scripts/brand/build-logo-svgs.ts`.
- Satori fix: `LogoMarkShapes` returns one intrinsic `<g>` and is called as a function in icon/OG routes.
- `twitter-image` declares `runtime` literally (re-exported segment config is ignored by Next).
