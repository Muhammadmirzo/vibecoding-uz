You are a world-class brand designer + senior frontend engineer (Pentagram identity craft, Linear/Vercel/Stripe execution quality). Work autonomously until fully done.

FIRST read: docs/waves/PLAN.md (esp. §2 Brand decision and §5 Non-negotiables), docs/CODER_AGENT_RULES.md, docs/design-system.md, src/config/brand.ts.
If docs/waves/reports/W1B-BRAND.md already exists, a previous run was interrupted: read it + `git log`/`git status` and CONTINUE from where it stopped.

MISSION: rebrand the whole site from "VibeCoding.uz" / "Mirzo Academy" to **Naqsh** (see PLAN §2).

1. LOGO (the most important deliverable — craft it carefully):
   - `src/components/brand/Logo.tsx`: exports `LogoMark` (8-point interlaced girih star: two squares rotated 45°, drawn as an over-under interlaced stroke; centre holds a `>` prompt caret with a short cursor bar) and `Logo` (mark + lowercase `naqsh` wordmark in font-display, tight tracking). Props: size, variant ("color" | "mono"), className, optional `animated` (only a subtle stroke-draw on first paint, gated by `prefers-reduced-motion` and the `data-motion` attribute on <html> if present). Uses theme tokens (brand/accent/gold) and `currentColor` for mono. Pixel-align the geometry on a 32-unit grid so it is crisp at 16px.
   - Export static SVGs: public/brand/naqsh-mark.svg, naqsh-logo.svg, naqsh-mark-mono.svg.
   - Icons: replace favicon (src/app/icon.svg or icon.tsx), apple-icon, public manifest.json icons + name/short_name/theme colour. Check public/sw.js cache names referencing old brand.
   - Dynamic OG image: src/app/opengraph-image.tsx (and twitter-image) — ivory/lapis, logo, tagline from BRAND, girih pattern, 1200x630, Unbounded font if loadable else system.
2. Replace every user-facing brand mention: `grep -rniE "vibe ?coding|vibecoding|mirzo academy" src public` → use `BRAND` from `@/config/brand`. Includes: src/components/layout/Brand.tsx (use Logo), Header, Footer, layout.tsx metadata (title template `%s — Naqsh`, description, openGraph siteName, applicationName), AuthModal badge, emails (src/lib/email), SMS texts, Telegram bot messages (src/lib/telegram/messages.ts), certificates PDF (src/lib/certificates, src/features/certificates), MCP server name strings, sitemap/robots, structured data JSON-LD. Keep code identifiers, package name, env var names and the course slug `vibe-coding-express` (URLs must not break) — but the course DISPLAY name may stay "Vibe Coding" as the name of the *discipline* (vibe coding is the skill, Naqsh is the school). Decide carefully per string; list decisions in the report.
3. Brand voice pass on the hero + footer + about/mentor areas: introduce the name meaning once (BRAND.meaning), subtly. No invented numbers.
4. Update docs/design-system.md with a "Brand" section (logo usage, clear space, min sizes, don'ts) and the /design-system showcase page with logo variants.

SCOPE: brand/identity only. Do NOT build the motion system, do NOT touch auth logic.
Do NOT run Playwright (another wave uses it). Dev server if needed: `npx next dev -p 3202`; stop ONLY with `kill $(lsof -t -i:3202)` — NEVER `pkill -f`.
GATE: `npx tsc --noEmit` clean, `npx vitest run` green (update tests that assert old brand strings), `npm run build` green.
Report: docs/waves/reports/W1B-BRAND.md (what changed, string decisions, logo rationale, anything left). Write it incrementally.
Commit: `git add -A && git commit -m "feat(brand): rebrand to Naqsh — logo, icons, OG, copy"`. Do not push.
