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
1. **E2 Usul — owner preview pending.** Branch `wave/e2-usul` (bea3c0b = 3fda275 + space-bunny fix b6b35de + lessons L24/L25 +
   main merged; tsc 0). Screens: `docs/redesign/awwwards/screens/e2-usul-*.png` in that worktree. Preview:
   https://master-2-git-wave-e2-usul-muhammadmirzos-projects.vercel.app (Vercel login). Ask ONE question: "E2 ni ko'rdingizmi, chiqaraymi?"
   On "zo'r" → merge (no-ff) → `skillkit release e2-usul --notes ...` → verify alias. Open item: BuildStory (below HomeLoom) overlaps
   Usul's method content; decide in E3 whether BuildStory is removed/merged.
2. **Wave E continues E3 → E6** (Dastur, Natijalar (real projects only), Narx+savollar, Boshlash), one section per slice, owner checks each.
   Pattern: add `<Section/>` inside `<HomeLoom>` + `{ id, strand }` in `src/features/lab-naqsh/domain/homeLoom.ts`. Build with muse-spark
   or space-bunny; review screenshots yourself (L24/L25: verify token classes exist in built CSS).
3. **F2 portability kit** — branch `wave/f2-portability` (worktree ../vibecoding-uz-wt/f2-portability). Status: see `docs/ops/F2-STATUS.md`
   in that branch (if missing, the agent was cut off: read `git log`/`git status` there and finish with space-bunny). Goal: Dockerfile +
   compose, `npm run move -- db --to <ENV_NAME>` (preflight → maintenance → pg_dump/pg_restore → per-table counts+checksums → switch →
   rollback path), GitHub workflows move-db / db-backup (age-encrypted, repo is PUBLIC) / restore-drill using the skillkit template
   `~/.skillkit/templates/project/scripts/restore-drill.mjs`, owner doc `docs/ops/KOCHIRISH.md`. Review, gate, release. Owner then
   creates an `age` key pair and sets the GitHub secrets listed in the doc.
4. **F3 data foundations** (after the owner creates the `naqsh-dev` Supabase project and puts its URL into Vercel Preview + Development
   `DATABASE_URL`; agents then stop using prod): 68 `timestamp` → `timestamptz` + `lib/time.ts` (Asia/Tashkent), money canonical in
   `bigint` tiyin + currency (expand/contract), `org_id`, stored `users.referral_code`, unique tg_user_id/lower(email), one `toE164()`,
   `can()` permissions (48 role literals), parity manifest web↔v1↔MCP test, 426 min-app-version, v1 cursor pagination, Sentry.
   Full audit with evidence: this session's foundations audit (summary in STATE.md handoff 2026-09-26 "foundations").
5. After F1+F2 merge: ping session vibecoding-uz-87 (skillkit) — it will run `skillkit init-project` on Naqsh (db-check gate).
   `skillkit improve` is being built by the skillkit session, not here.
6. Debt: 121 Tailwind opacity classes on var() colours produce no CSS; `src/features/**` tests not in vitest include; true 404 for unknown
   kurs/blog slugs; split `chat.service.ts` (263 lines); /kabinet LCP 3.5 s; uptime monitor on /api/health (owner, free UptimeRobot).

## 6. Settled owner decisions (don't re-ask)
- Telegram reply → site chat works. `ANTHROPIC_API_KEY` is deferred. Supabase stays in Sydney for now.
- The redesign has no Samarkand/historic-city theme; the girih logo stays. Concept = A + C.
- 2026-09-26: free nightly encrypted backups (no Supabase Pro) · a separate dev DB project · B2B is possible → `org_id` early ·
  one-command portability.

## Hard rules
Never `pkill -f` (stop servers by PID from `ss -ltnp | grep :<port>`). Never print secrets. Deploy = push main + main:master (release agent). After changing Vercel env vars, deploy the latest main (`vercel deploy --prod --yes` from a clean main), never `vercel redeploy <alias>`.
