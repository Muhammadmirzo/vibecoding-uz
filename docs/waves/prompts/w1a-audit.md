You are a hostile, world-class reviewer (senior staff engineer + conversion-focused product designer + security researcher + Uzbek copy editor) hired by a competitor to find EVERYTHING wrong with this website. Work autonomously until fully done.

FIRST read: docs/waves/PLAN.md, docs/CODER_AGENT_RULES.md, docs/HANDOFF_2026-09-24.md, docs/design-system.md.
If docs/waves/reports/W1A-AUDIT.md already exists, a previous run of you was interrupted: read it and CONTINUE, do not restart.

THIS WAVE IS READ-ONLY FOR SOURCE CODE. Only create/modify files under docs/waves/reports/ and e2e/ screenshots output. Do not change src/.
Dev server: `npx next dev -p 3201` in background if needed; Playwright: `E2E_PORT=3201 npx playwright test e2e/responsive.spec.ts`. Stop servers ONLY with `kill $(lsof -t -i:3201)` — NEVER `pkill -f`. Note: the database is DOWN (DATABASE_URL host does not resolve) — that is known; audit how gracefully the site degrades, do not try to fix the DB.

Audit dimensions (be concrete, file:line for every finding, with a proposed fix):
1. Correctness bugs: broken links, dead buttons, forms that can't succeed, hydration errors, console errors, 404s, wrong redirects, pages that 500 when the DB is down.
2. Auth: login/OTP/Telegram flows end-to-end from a NEW user's perspective (Telegram currently can't register new users — document exact failure points in src/features/auth, src/app/api/auth/telegram, src/lib/telegram).
3. Security (enemy eyes): authz gaps in src/app/api/**, admin settings storing provider secrets in DB (src/features/crm/components/settings), injection, open redirects, rate-limit holes, info leaks in error messages, CSP.
4. Antifragility: single points of failure (DB down, Telegram down, third-party script blocked, JS disabled, slow 3G), missing fallbacks, missing timeouts, unbounded retries.
5. Performance baseline: run `npm run build` and record per-route First Load JS from the output; list heavy client components ("use client" that could be server), large deps, font loading, images without sizes, third-party scripts, anything blocking LCP. Record numbers in a table — later waves compare against it.
6. UX/UI: generic/template-looking sections, weak hierarchy, inconsistent spacing, empty states, mobile issues (read screenshots in e2e/screenshots/, crop tall PNGs with python PIL into /tmp pieces), dark mode, focus states, tap targets.
7. Conversion & copy: unclear value prop, weak CTAs, trust gaps, Uzbek spelling/apostrophes (o', g'), invented claims (honesty rule: no fake numbers/testimonials).
8. SEO: metadata, OG, sitemap, robots, structured data, canonical.

Output docs/waves/reports/W1A-AUDIT.md:
- Summary (top 10 most damaging issues).
- Findings table: ID | Priority (P0 breaks money/auth/security, P1 visibly bad, P2 polish) | Area | file:line | Problem | Fix.
- Performance baseline table.
- "Suggested owner of fix" column: W2 (telegram auth), W3A (motion/visual), W4A (perf), W4B (everything else).
Save progress to the report frequently (append as you go) so an interruption loses nothing.
Finally: `git add docs/waves/reports && git commit -m "docs(audit): W1A adversarial audit"`. Do not push.
