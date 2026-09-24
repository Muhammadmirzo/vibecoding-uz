# Wave STATE — single source of truth for resuming

> **"davom et" / "continue" protocol (for any new Claude session):**
> 1. Read this file + [PLAN.md](PLAN.md). Do not re-plan; continue from the first row that is not ✅.
> 2. For a row marked 🏃 running: check `tail .orchestra/logs/<wave>.log` (last line `exit=<n>` means finished) and `git -C ../vibecoding-uz-wt/<wave> log --oneline -3`.
>    - Finished + report exists + gate green → review, merge (`git merge --no-ff wave/<wave>`), mark ✅.
>    - Died/incomplete → re-run the same command; the prompt tells the agent to continue from its report + git state.
> 3. Dispatch: `scripts/waves/dispatch.sh <wave> <model>` (run in background). Models: `muse-spark-1.3-contributor-free`, `space-bunny-free` (fallback `muse-spark-1.2-contributor-free`). Never nemotron.
> 4. After each merge: `npm install && npm run build && npx vitest run` on main (worktrees share node_modules; an agent can prune deps), update this table, commit `docs(waves): state`.
> 5. Deploy only in W5: `git push origin main && git push origin main:master`.

| Wave | Model | Status | Branch / commit | Report | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| W0 Plan | orchestrator | ✅ | main | PLAN.md | brand = Naqsh, contracts fixed |
| W1A Audit | space-bunny-free | ✅ | wave/w1a-audit (32edce9) | reports/W1A-AUDIT.md | read-only, port 3201 |
| W1B Brand | muse-spark-1.3-contributor-free | ✅ | wave/w1b-brand (f8f8052) | reports/W1B-BRAND.md | logo redrawn by orchestrator; geometry in src/components/brand/logoGeometry.ts; migration 0004 = blog author default |
| W2 Telegram | space-bunny-free | ✅ | wave/w2-telegram (3 rounds: 0458ca2 rejected → 53ba867 → aebcd4b) | reports/W2-TELEGRAM.md | migration 0005 = telegram_login_requests; bot confirm step (anti-phishing) |
| W3A Motion | muse-spark-1.3 → space-bunny | ✅ | wave/w3a-motion (ccfa473) | reports/W3A-MOTION.md | +2 kB home JS; `/` dynamic because root layout reads cookies() → W4A |
| W3B Motion admin | space-bunny-free | ✅ | wave/w3b-motion-admin (c97a880) | reports/W3B-MOTION-ADMIN.md | site_settings key "motion", cached 300s, fail-safe defaults; admin tab "Animatsiyalar" |
| W4A Perf | space-bunny-free | ✅ | wave/w4a-perf (9b08e92 + orchestrator fixes) | reports/W4A-PERF.md | JS −11…23 kB on funnel pages; mobile (devtools throttling) LCP 2.1 s, CLS 0 after orchestrator fixed font-swap + loading-skeleton shifts |
| W4B Audit fixes | space-bunny-free | ✅ | wave/w4b-fixes (auto-resumed by opencode service after reboot) | reports/W4B-FIXES.md | orchestrator rejected fail-closed rate limit (no Upstash on Vercel) + added theme-script nonce |
| W5 Final QA + deploy | space-bunny-free + orchestrator | ✅ DEPLOYED 2026-09-24 | main = master | reports/W5-FINAL.md | live smoke: all key routes 200, CSP nonce OK, 0 console errors (light/dark, 390/1440); /api/auth/telegram/start → 503 Uzbek message while DB is down |

## Phase 2 (started 2026-09-24) — design overhaul, portfolio, chat, MCP, mobile-ready

Parallel agents allowed (max 3 since 2026-09-24 — ~4.5 GB free with 3 running; all agents read docs/waves/PHASE2-RULES.md + API-CONTRACT.md) — heavy commands serialized with `scripts/waves/locked.sh` (flock). Owner rule: every source file ≤ 250 lines.

| Wave | Model | Status | Branch | Report | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| W6A Design + motion: HOME | space-bunny-free + orchestrator | ✅ merged + deployed 2026-09-24 | wave/w6a-design-home (324c1de + orchestrator fix) | reports/W6A-DESIGN-HOME.md | 2 review rounds; orchestrator fixed rail overlap, sequential step lighting (shorthand reset animation-timeline), caret. Home 2.42 kB / 125 kB; LCP 2.3 s, CLS 0 |
| W6B Portfolio management | space-bunny-free + orchestrator | ✅ merged + deployed 2026-09-24 | wave/w6b-portfolio (ef9f9cf + b3fe788 fixes) | reports/W6B-PORTFOLIO.md | migration 0006 applied live; live table was EMPTY → 0006 now seeds Clash Nexus (published/owner/rank1). Orchestrator fixed: admin reorder no-op, audit failure → 500, unverified-data flash in admin, /kurs used static list. `mark-unverified.ts --apply` NOT run (nothing to hide: only Clash Nexus in DB) |
| W10 Cuts + fixes | muse-spark-1.3-contributor-free | ✅ merged + deployed 2026-09-24 | wave/w10-cuts-fixes (80b1f02) | reports/W10-CUTS-FIXES.md | registry src/lib/features/closed.ts (flip flag to reopen); middleware real 404; migration 0007 rate_limit_buckets applied live; 500 messages masked; admin 'Funksiyalar' tab closed (flags never read). Owner: rotate credentials listed in report §5 |
| W6C Design rollout: all pages + cabinet | muse-spark-1.3-contributor-free | 🏃 round 2 re-dispatched 2026-09-24 (r1 died mid-work; r1 log .r1.log) | wave/w6c-design-pages | reports/W6C-DESIGN-PAGES.md | prompt prompts/w6c-design-pages.md; port 3306 |
| W7 Chat centre (visitor ↔ admin ↔ AI agent, Telegram bridge) | space-bunny-free | 🏃 round 2 dispatched 2026-09-24 (r1 left 16 uncommitted files) | wave/w7-chat | reports/W7-CHAT.md | prompts w7-chat.md + w7-chat-r2.md; port 3305; re-dispatch: `PROMPT=w7-chat-r2 scripts/waves/dispatch.sh w7-chat space-bunny-free` |
| W8A First-party analytics | space-bunny-free + orchestrator | ✅ merged + deployed 2026-09-24 | wave/w8a-analytics (703bd7c) | reports/W8A-ANALYTICS.md | ALL 10 reports were broken on the real DB (raw Date params + camelCase columns) — agent only tested mocks. Orchestrator: global Date serializer in src/db/index.ts, SQL column fixes, after() for server events, dashboard envelope parse fix; migration 0008 APPLIED live; gate 555/555 |
| W8B World-class MCP (remote HTTP + OAuth + visual charts) | — | ⏳ QUEUED — after W8A merged (+ W7 for chat tools) | wave/w8b-mcp | reports/W8B-MCP.md | prompt prompts/w8b-mcp.md; port 3307 |
| W9 Mobile-ready API (/api/v1, bearer tokens, OpenAPI, deep links) | space-bunny-free + orchestrator | ✅ merged + deployed 2026-09-24 | wave/w9-mobile-api (f7e7597 + orchestrator fixes) | reports/W9-MOBILE-API.md | migration renumbered 0009 and APPLIED live; refresh SQL verified live. Orchestrator fixed: parallel refresh killed the device family (now atomic claim + 30 s grace), refresh ignored dead web session, logout left access tokens alive 15 min (now deletes session rows), W8A routes missing from OpenAPI. Owner env (optional): API_JWT_SECRET (falls back to SESSION_SECRET), IOS_*/ANDROID_* for deep links |

2026-09-24 perf: Vercel functions pinned to syd1 (vercel.json) next to Supabase ap-southeast-2 — login 3.5–5.4 s → ~1 s; PG rate limiter fixed (Date param) and verified writing buckets live. LESSON: agents' mock-only DB tests hide real SQL bugs — always run new SQL against the live DB before merge. Owner 2026-09-24: admin password reset done (superadmin admin@vibecoding.uz, login verified live; password given to owner in chat only — owner must change it). Owner REQUESTED W7 chat (visitor↔admin↔AI agent), W8 analytics+world-class MCP with visuals, W9 mobile-ready API — orchestrator sent issues/ideas/cuts list first; owner's go-ahead pending. Owner decided 2026-09-24: portfolio = ONLY Clash Nexus for now (Bozor bot not ready yet — add later via /admin/portfolio; other static entries stay hidden/demo). Owner 2026-09-24: 'fix all errors with parallel agents; close SpinWheel, /ish, testimonials, unbuilt features (keep /ekspertlar); run W7/W8/W9 in parallel; maximal creative, user-friendly'. Queue order when a slot frees: W7 → W6C (after W6A ✅) → W8B (after W8A ✅) → W9. Migrations from parallel waves may collide in numbering — at merge drop the wave's migration commit and re-run `npm run db:generate` on main. Still unanswered: AI provider key (ANTHROPIC_API_KEY), main domain. admin password reset (say "parolni yangila").
Done outside waves 2026-09-24: DB restored + migrations 0000–0005 recorded/applied; reveal-blur/Times-font fix + e2e/visibility.spec.ts (0366972).

⚠️ **Machine has 7.6 GB RAM: run heavy commands one at a time** — Phase 2 runs 2 agents but every build/playwright/lighthouse goes through `scripts/waves/locked.sh`.
⚠️ Stop dev servers by PID from `ss -ltnp | grep :<port>` — `lsof -t -i:<port>` misses next-server.
⚠️ After a reboot the `opencode serve --service` daemon auto-resumes old agent sessions in parallel — run `opencode service restart` first, then dispatch one wave.

Legend: ⏸ paused/killed (work kept in worktree) · ✅ merged · 🏃 running · ⏳ waiting · ❌ failed (see notes)

## ✅ All waves done — what is left is the owner's
1. Restore Supabase → update `DATABASE_URL` in Vercel if it changed → `vercel env pull .env --environment=production --yes && npm run db:migrate` (applies 0001–0005; 0004 = blog author default, 0005 = telegram_login_requests) → redeploy.
2. Test Telegram signup live: site → "Telegram orqali davom etish" → bot → share phone → "✅ Ha, bu men".
3. Rotate both bot tokens in @BotFather (they were pasted in chat) → update `TELEGRAM_BOT_TOKEN` in Vercel.
4. Optional: Upstash Redis env vars for shared rate limiting (site works without it).

## Blockers outside the code
- Supabase DB down (see docs/HANDOFF_2026-09-24.md §2.1). Signup/login can only be tested end-to-end after the owner restores it.
- After W2 deploys: in @BotFather run `/setdomain` for the production domain (only needed for the optional Login Widget).
