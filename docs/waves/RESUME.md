# RESUME: what a new session does when the owner says "boshlang" / "boshla" / "davom et"

Do NOT ask questions first: read this file + the newest STATE.md handoff, report the state in 5 short Uzbek lines, then start step 5.1.

The owner speaks Uzbek, so reply in Uzbek, short and step by step. You are the ORCHESTRATOR (Claude Opus 5.5, **medium** effort):
plan, dispatch agents, review, decide. **Owner rule (2026-09-26): Claude limits run out, so use free agents MAXIMALLY and in PARALLEL**
(space-bunny, muse-spark, Gemini via agy). Keep Claude subagents for review/security-critical work only. Don't hand-write features,
and don't do mechanical work (push, handoff, screenshots, gates) yourself.

## 1. Live state (1 min)
```bash
cd /home/mirzo/.zcode/workspace/vibecoding-uz
git log --oneline -5 && git status --short && free -h | sed -n 2p
ps -eo pid,etimes,args | grep "opencode run" | grep -v grep   # agents still running?
skillkit doctor
```
Then read `docs/waves/STATE.md` → "Phase 2" → the newest `### ▶ HANDOFF` section (source of truth).

## 2. Tools and agents (updated 2026-09-26)
- Skills: `skillkit` (`~/.skillkit`). Load `naqsh-lessons` before any code in this repo; `foundations-first` + `database-safety` for data/infra work.
- **Dispatch free agents in parallel** (each in its own worktree `../vibecoding-uz-wt/<wave>`, prompt file in `.orchestra/prompts/`):
  `nohup skillkit dispatch <task> <model> .orchestra/prompts/<task>.md ../vibecoding-uz-wt/<wave> > .orchestra/logs/<task>.out 2>&1 &`
  then wait with a background loop `while kill -0 <pid>; do sleep 20; done` (you get notified; never foreground `sleep`).
  - `space-bunny-free`: fast, precise fixes from a concrete defect list, UI fixes, screenshots, gates. Worked well on E2 (2026-09-26).
  - `muse-spark-1.3-contributor-free`: deeper builds (new sections, features).
  - Gemini via Antigravity: `agy -p "<prompt>" --model gemini-3.1-pro-high|gemini-3.8-flash-high --dangerously-skip-permissions`
    (or `skillkit dispatch <task> gemini-3.1-pro-high ...`). Reports overclaim: always re-run gates on the COMMITTED state.
  - Never nemotron. `skillkit dispatch` health-probes models and falls back to `claude:haiku` if free models are down.
- Parallelism: as many agents as RAM allows (7.6 GB machine: check `free -h`; ~4 agents is safe). Heavy commands
  (build, vitest, playwright) always go through `scripts/waves/locked.sh`. Other Claude sessions on this machine may run evals:
  `ListAgents` + `ps -eo pid,etimes,args | grep "opencode run"` before merging.
- Production URL: **https://master-2-jade.vercel.app** (`master-2.vercel.app` is NOT ours, lesson L20). Smoke-test the alias only (L22).
- The agent's report has no LESSON line → review its diff yourself and record the lesson (`self-improve` skill).
- Quality gate: `npm run lessons:check` (also runs as pre-commit), CI on GitHub (lessons + tsc + vitest). `npm run db:lockdown-check` after any migration.

## 3. Review before merge (never skip; agents have shipped broken code several times)
- Read the risky diffs, not just the report. Check correctness, security, degraded modes, files ≤ 250 lines, honest copy, tokens only.
- New raw SQL → run it once on the live DB (`verify-sql-live`). UI → screenshots at 390/768/1280/1440 plus a video.

## 4. Release after every big wave (owner rule): an AGENT does it, not the orchestrator
`skillkit release <wave> --notes "shipped | next | risks | owner decisions"`. Settings live in `.skillkit.json`. The agent runs the gates,
writes the handoff and pushes. Code then verifies the push, CI and the live URL, and tags `wave/<date>-<name>`. Rollback: `skillkit wave rollback <tag>`.
If the free agent stalls for more than ~10 min, stop it by PID and hand the same job to a Claude subagent (Haiku for mechanical work).
Skill: `wave-handoff`.

## 5. Next work, in order (updated 2026-09-26 evening, session vibecoding-uz-1e → new terminal)
Done and live: slice 1+2 (`/lab/naqsh`), W8B MCP (tag wave/2026-09-26-w8b-mcp), E0 hero (wave/2026-09-26-e0-hero),
E1 Muammo (wave/2026-09-26-e1-muammo), F1 foundations (wave/2026-09-26-f1-foundations; migration 0014 applied live;
live DB: 15 migrations, anon/authenticated revoked, RLS on all tables). **Owner rotated the leaked Supabase DB password
(rotate-db-password.sh said TAYYOR) and the Telegram bot token (set in Vercel) on 2026-09-26.**
0. **Verify prod first:** `curl https://master-2-jade.vercel.app/api/health` must be 200 `{"status":"ok"}` and responses must carry
   `x-request-id`. If 404, production is on pre-F1 code: from a clean main run `vercel deploy --prod --yes` (NOT `vercel redeploy <alias>`,
   which rebuilt old code on 2026-09-26). Then ask the owner to send `/start` to the bot and confirm it answers (new token).
1. **E2 Usul — MERGED into main.** Diamond strand active on `/`.
2. **E3 Dastur (Curriculum) — MERGED into main by Gemini (Antigravity).** Weave strand active on `/`. Replaces legacy `Roadmap`.
3. **E4 Natijalar (Portfolio) — MERGED into main by Gemini (Antigravity).** Ring strand active on `/`. Replaces legacy `Projects`. Honest showcase of verified student projects (Clash Nexus), octagonal ring motif, all 748 vitest tests pass, responsive 12/12 pass. Added lesson L26.
4. **E5 Narx + savollar (Pricing + FAQ) — MERGED into main by Gemini (Antigravity).** Fill strand (`fill`) active on `/`. Replaces legacy `Pricing` and `Faq`. Tag: `wave/2026-09-26-e5-narx`. Added lesson L27 (deep-link anchor check).
5. **E6 Boshlash (Final CTA) — MERGED into main by Gemini (Antigravity).** Glow strand (`glow`) active on `/`. Culmination of all 6 Girih star strands! Replaces legacy `NextStepCTA` on `/`. Tag: `wave/2026-09-26-e6-boshlash`. 757 tests pass, responsive 12/12 pass.
6. **F2 portability kit: MERGED by Gemini (Antigravity).** Merged to main with all pre-merge checklist items completed:
   (a) replaced `vercel redeploy` with `vercel deploy --prod --yes` in `move.ts` and `move-db.yml`; (b) resolved `package.json` conflict with F1;
   (c) reviewed and verified freeze SQL; (d) all gates on main passed: tsc 0, vitest 736/736, lessons:check 0 failures, build exit 0.
   Owner setup remaining: create 2 `age` key pairs and set GitHub secrets/vars listed in `docs/ops/KOCHIRISH.md`.
7. **D1 Debt Cleanup: MERGED into main.** Eliminated all 3 known debts in `scripts/lessons-baseline.json` (0 failures, 0 known debt on `npm run lessons:check`). Split `chat.service.ts` (224 lines <= 240) + `chat-helpers.ts`, added dynamic 404 validation for lesson player and certificate code routes with regression test suite (770/770 vitest pass, tsc 0, build 0).
8. **D2 CSS Alpha Tokens & Test Harness: MERGED into main.** (a) Added `src/features/**/*.test.ts` to `vitest.config.ts` (all 115 test files / 780 tests now covered); (b) Added modern `color-mix` alpha helper to `tailwind.config.js` resolving all 121 opacity classes (58 `color-mix()` rules emitted in production CSS, verified with Playwright 12/12 responsive pass, tsc 0, lessons-check 0, build 0).
9. **C1 Real Certificate Verification: MERGED into main.** Public verification wired to live DB + L14 honesty, nonexistent codes soft-404, demo label explicit.
10. **P1 /kabinet LCP Optimization: MERGED into main.** Server prefetch + instant hydration (118 test files / 798 tests pass, LCP dropped from 2816ms to 900ms, CLS 0).
11. **F3 data foundations** (after the owner creates the `naqsh-dev` Supabase project and puts its URL into Vercel Preview + Development
   `DATABASE_URL`; agents then stop using prod): 68 `timestamp` → `timestamptz` + `lib/time.ts` (Asia/Tashkent), money canonical in
   `bigint` tiyin + currency (expand/contract), `org_id`, stored `users.referral_code`, unique tg_user_id/lower(email), one `toE164()`,
   `can()` permissions (48 role literals), parity manifest web↔v1↔MCP test, 426 min-app-version, v1 cursor pagination, Sentry.
   Full audit with evidence: this session's foundations audit (summary in STATE.md handoff 2026-09-26 "foundations").
12. After F1+F2 merge: ping session vibecoding-uz-87 (skillkit) — it will run `skillkit init-project` on Naqsh (db-check gate).
   `skillkit improve` is being built by the skillkit session, not here.
13. Remaining debt: uptime monitor on /api/health (owner, free UptimeRobot). (/kabinet LCP 3.5s resolved in P1).


## 6. Settled owner decisions (don't re-ask)
- Telegram reply → site chat works. `ANTHROPIC_API_KEY` is deferred. Supabase stays in Sydney for now.
- The redesign has no Samarkand/historic-city theme; the girih logo stays. Concept = A + C.
- 2026-09-26: free nightly encrypted backups (no Supabase Pro) · a separate dev DB project · B2B is possible → `org_id` early ·
  one-command portability.

## Hard rules
Never `pkill -f` (stop servers by PID from `ss -ltnp | grep :<port>`). Never print secrets. Deploy = push main + main:master (release agent). After changing Vercel env vars, deploy the latest main (`vercel deploy --prod --yes` from a clean main), never `vercel redeploy <alias>`.
