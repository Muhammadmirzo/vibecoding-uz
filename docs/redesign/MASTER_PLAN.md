# VibeCoding.uz — Master Redesign Plan (Orchestrator decisions, 2026-09-24)

This document is the SINGLE SOURCE OF TRUTH for all agents. Do not deviate. Audits: `audit-frontend.md`, `audit-backend.md`, `audit-security.md` (same folder).

## 1. Positioning & message
- Brand promise (UZ): **"G'oyangizni 8 haftada ishlaydigan ilovaga aylantiring — AI bilan, kod yozishni bilmasangiz ham."**
- Audience: Uzbek non-programmers, founders, students, freelancers who want to build real products with AI (Claude Code).
- Tone: confident, warm, honest. **Honesty rule stays**: never invent student counts, revenues, reviews or logos. Where proof is missing, show process, curriculum, real demo projects, mentor, guarantee.
- Language: Uzbek Latin. Use correct apostrophes `o'` / `g'` consistently as the existing content does.

## 2. Visual identity — "Samarkand Modern"
Inspired by Uzbek tilework (lapis, turquoise domes, gold) fused with a developer/terminal aesthetic. NOT the generic purple-gradient AI look.

### Color tokens (CSS variables in `globals.css`, mapped in `tailwind.config.js`)
Light (default):
- `--bg` #FAF7F0 (ivory paper) · `--bg-elevated` #FFFFFF · `--bg-sunken` #F1ECE1
- `--ink` #0E1A2B (lapis-night text) · `--ink-muted` #4A5568 · `--ink-subtle` #7A8494
- `--brand` #1440A0 (lapis blue) · `--brand-hover` #0F3380 · `--brand-soft` #E6ECF8
- `--accent` #0FA3A3 (firuza/turquoise) · `--accent-soft` #DDF4F3
- `--gold` #E8A317 (saffron gold, CTA highlight & badges) · `--gold-soft` #FCF1D8
- `--border` #E4DDCF · `--border-strong` #CFC6B4
- `--success` #15803D · `--danger` #B42318 · `--telegram` #229ED9
Dark (`.dark`):
- `--bg` #07111F · `--bg-elevated` #0E1B2E · `--bg-sunken` #050C16 · `--ink` #EEF2F8 · `--ink-muted` #A9B4C6 · `--ink-subtle` #7C889C
- `--brand` #5B8CFF · `--accent` #2DD4BF · `--gold` #F5B83D · `--border` #1D2B42 · `--border-strong` #2A3B57
- Primary CTA = gold background + ink text (both themes) — the single most visible element on every page.
- Remove the old `likely` theme and old cream/accent tokens after migrating every usage (grep must return 0 hits for old token names).

### Typography
- Display: **Unbounded** (600/700) via `next/font/google` (subsets latin, latin-ext) — headings H1/H2 only.
- Body/UI: **Onest** (keep).
- Mono: **JetBrains Mono** — rename CSS var to `--font-mono`.
- Scale: H1 clamp(2.5rem, 5vw, 4.5rem) tight leading; H2 clamp(1.875rem, 3.5vw, 3rem); body 17px/1.65.

### Motifs
- Subtle girih (8-point star) SVG pattern as section background (opacity ≤ 6%), component `<GirihPattern/>`.
- "Terminal" cards: dark code window showing an AI prompt → app being built (animated typing, respects `prefers-reduced-motion`).
- Radii: 8/14/20/28. Soft shadows, 1px borders. Generous whitespace, max width 1200px.

## 3. Funnel spine (ONE path)
`Any page → /diagnostika (2-min quiz) → personalized result → /bepul-dars (free lesson signup, on-site lead capture: name + phone + telegram) → /kurs/[slug] → checkout`
- Header CTA everywhere: **"Bepul diagnostika"** → `/diagnostika` (gold button).
- Every page ends with the shared `<NextStepCTA/>` block (no dead ends).
- Lead magnets (`/resurslar`, `/meetlar`, `/atamalar`) capture the lead on-site (shared `<LeadCaptureForm source="…"/>` → existing leads API) BEFORE revealing the Telegram link.
- Course page must include: outcome hero, who-it's-for / not-for, 8-week roadmap timeline, real demo projects, mentor block, pricing card + installments + 7-day guarantee, FAQ, sticky mobile buy bar.

### Homepage section order
1. Hero: promise + subline + gold CTA "Bepul diagnostika (2 daqiqa)" + secondary "Bepul darsga yozilish" + animated Terminal card (prompt → app).
2. Tool strip: Claude Code · Next.js · Vercel · Supabase · Telegram (text/SVG, no fake partner claims).
3. Problem → shift: "Dasturchi yollash qimmat va sekin. Endi AI bilan o'zingiz qurasiz."
4. Transformation: Before/After (week 0 vs week 8).
5. 8-week roadmap (interactive timeline).
6. Real projects built (existing portfolio data).
7. Mentor block (honest).
8. Pricing (2 courses) + guarantee.
9. Comparison table: VibeCoding vs traditional bootcamp vs YouTube self-learning.
10. FAQ.
11. Final CTA (NextStepCTA).

## 4. Code architecture rules
Per feature: `src/features/<feature>/`
- `domain/` — types, Zod schemas, pure policies (no I/O)
- `server/` — `*.repository.ts` (Drizzle only here), `*.service.ts` (use cases, transactions), `server-only` import
- `actions.ts` — Server Actions (thin: validate with Zod → call service)
- `ui/` — React components (server by default; `"use client"` only for interactive islands)
Rules: route handlers are thin (parse → auth → service → map errors). No Drizzle in components/route handlers after migration. No `any`, no unchecked `as` casts at boundaries. Shared UI primitives live in `src/components/ui/`. Files ≤ 250 lines. Every business rule has a unit test.

## 5. Waves
- **W1 (parallel)**: SEC (security P0/P1 fixes) · DS (design system foundation + primitives).
- **W2 (parallel)**: HOME (homepage + header/footer) · FUNNEL (diagnostika, bepul-dars, kurs, lead capture) · BIZ (payments/refund/referral/certificate/quiz business logic → services + tests).
- **W3 (parallel)**: PAGES (all other public pages) · APP (kabinet + admin UI restyle) · ARCH (remaining route handlers → services, MCP cleanup).
- **W4**: QA (SEO, a11y, performance, e2e smoke, final token/lint sweep) + review.

## 6. Agent rules (all waves)
- Only edit files inside your assigned scope. If you must touch something outside, note it in your report instead.
- Do NOT run `npm run build` or `next dev` (shared `.next` dir). Verify with `npx tsc --noEmit` and `npx vitest run <your tests>`.
- Do NOT commit, push, or install/remove packages unless your task explicitly says so.
- Do NOT touch `.env*`, secrets, or deployment config.
- When done, append a short report to `docs/redesign/reports/<WAVE-NAME>.md`: what changed (file list), what's left, risks.
