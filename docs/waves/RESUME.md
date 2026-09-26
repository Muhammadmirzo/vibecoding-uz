# RESUME: what a new session does when the owner says "boshlang" / "boshla" / "davom et"

Do NOT ask questions first: read this file + the newest STATE.md handoff, report the state in 5 short Uzbek lines, then start §5 step 0
and continue down the list. Only stop to ask when a step says "owner".

The owner speaks Uzbek, so reply in Uzbek, short and step by step. You are the ORCHESTRATOR: plan, route tasks to agents, review, decide.
### 0. Who is the orchestrator? (owner rule 2026-09-26: the owner only picks the model; you configure yourself)
Whichever model the owner opened this session with IS the orchestrator. Source of truth for ALL projects: `~/.skillkit/roster.json`
(skill `orchestrator-roster`; the owner changes it there). The table below is a snapshot; if they differ, roster.json wins. Find your row, then act on it without asking:
| Rank | Orchestrator model | Where it runs | Your agents (route per §2) | Extra duty |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Claude Opus 5.5 (medium) | Claude Code | muse-spark, space-bunny (opencode) + gemini-3.8-flash-high (agy) | first audit unchecked `GEMINI-LEDGER.md` rows (§5 step 1) |
| 2 | Gemini 3.1 Pro (High) | Antigravity (`agy`) | same three agents | log EVERY merge/deploy in `docs/waves/GEMINI-LEDGER.md` |
| 3 | Gemini 3.8 Flash (High) | Antigravity (`agy`) | same three agents | same ledger duty; also re-run gates yourself before each merge (flash misses more) |
| — | muse-spark 1.3, space-bunny | opencode | NOT orchestrators: builder agents only | if opened as orchestrator anyway: tell the owner to use rank 2 or 3, do only single safe tasks |
- If you are rank 2 or 3: don't route agents to your own model family for REVIEW of your own merges (use the other family when possible),
  and never run live-DB migrations or security changes without writing the exact SQL + result in the ledger.
- The Gemini overclaim rule applies to you as orchestrator too: a merge counts only after the gates were re-run on the committed state.

- Orchestrator does only the important parts: decisions, reviewing risky diffs, live-DB/security steps, owner communication.
  Everything else (building, fixing, screenshots, gates, release, handoff) goes to agents. Agents' token use does not need saving.
- Don't hand-write features, and don't do mechanical work (push, handoff, screenshots, gates) yourself.

## 1. Live state (1 min)
```bash
cd /home/mirzo/.zcode/workspace/vibecoding-uz
git log --oneline -5 && git status --short && free -h | sed -n 2p
ps -eo pid,etimes,args | grep "opencode run" | grep -v grep   # agents still running?
skillkit doctor
```
Then read `docs/waves/STATE.md` → "Phase 2" → the newest `### ▶ HANDOFF` section (source of truth).

## 2. Agents: which model for which job (owner rule 2026-09-26)
Agents run ONLY on these free models; pick per task yourself:
| Job | Model | How |
| :--- | :--- | :--- |
| New feature/section, deeper build, multi-file refactor | `muse-spark-1.3-contributor-free` (opencode) | `skillkit dispatch <task> muse-spark-1.3-contributor-free <prompt> <worktree>` |
| Concrete defect list, UI fix, screenshots, gates, release (`skillkit release`) | `space-bunny-free` (opencode) | same, model `space-bunny-free` |
| Review/audit of a diff, docs, research, second opinion, parallel extra builder | `gemini-3.8-flash-high` (Antigravity `agy`) | same, model `gemini-3.8-flash-high` (dispatch calls `agy -p ... --model ... --dangerously-skip-permissions`) |
- Fallback chain (in `~/.skillkit/config.json`): muse-spark → space-bunny → gemini-3.8-flash-high → claude:haiku (last resort only).
  Never nemotron. `skillkit dispatch` health-probes and falls back automatically, adds the LESSON footer, logs metrics.
- Launch in parallel, each in its own worktree `../vibecoding-uz-wt/<wave>` with a prompt file in `.orchestra/prompts/<task>.md`:
  `nohup skillkit dispatch <task> <model> .orchestra/prompts/<task>.md ../vibecoding-uz-wt/<wave> > .orchestra/logs/<task>.out 2>&1 &`
  then wait in the background: `while kill -0 <pid>; do sleep 20; done; tail -30 .orchestra/logs/<task>.out` (never a foreground sleep).
- Parallelism: up to ~4 agents (7.6 GB RAM, check `free -h`); build/vitest/playwright always via `scripts/waves/locked.sh`.
  Other sessions on this machine (skillkit work) may be running: `ListAgents` + `ps -eo pid,etimes,args | grep "opencode run"`.
- Agent reports overclaim (Gemini especially): re-run gates on the COMMITTED state before merging. No LESSON line → record it yourself.
- Skills: `skillkit` (`~/.skillkit`). `naqsh-lessons` before any code; `foundations-first` + `database-safety` for data/infra work.
- Production URL: **https://master-2-jade.vercel.app** (not `master-2.vercel.app`, L20). Smoke-test the alias only (L22).
- Quality gate: `npm run lessons:check` (pre-commit too), CI (lessons + tsc + vitest), `npm run db:lockdown-check` after any migration.

## 3. Review before merge (never skip; agents have shipped broken code several times)
- Read the risky diffs, not just the report. Check correctness, security, degraded modes, files ≤ 250 lines, honest copy, tokens only.
- New raw SQL → run it once on the live DB (`verify-sql-live`). UI → screenshots at 390/768/1280/1440 plus a video.

## 4. Release after every big wave (owner rule): an AGENT does it, not the orchestrator
`skillkit release <wave> --notes "shipped | next | risks | owner decisions"`. Settings live in `.skillkit.json`. The agent runs the gates,
writes the handoff and pushes. Code then verifies the push, CI and the live URL, and tags `wave/<date>-<name>`. Rollback: `skillkit wave rollback <tag>`.
If the free agent stalls for more than ~10 min, stop it by PID and hand the same job to a Claude subagent (Haiku for mechanical work).
Skill: `wave-handoff`.

## 5. Next work, in order (updated 2026-09-26 night by Claude after the Gemini-orchestrated waves)
Done and live on main (tags `wave/2026-09-26-*`): `/lab/naqsh`, W8B MCP, the whole Awwwards home E0–E6 (6-strand loom),
F1 foundations (migration 0014 live, lockdown, /api/health, crons, idempotency), F2 portability kit, D1 debt (0 known debt),
D2 color-mix alpha tokens, C1 real certificate verification, P1 /kabinet LCP (~0.9 s). Owner rotated the leaked DB password and the
Telegram bot token on 2026-09-26. Full per-wave detail: STATE.md "Phase 2" RELEASE/HANDOFF sections (newest first).
0. ~~**Verify**~~ **DONE 2026-09-26 (release-a1-fixes):** gates green on main — `lessons:check` 0 failures / 0 debt, `build` exit 0,
   `vitest` **122 files / 826 tests**. Audit of the Gemini merges **DONE** (verdicts in `GEMINI-LEDGER.md`, fixes merged as `fbc04de`:
   cert PII leak L30, cert DB-down + real 404 L31/L37, CSPRNG codes L34, /kabinet 401 loop L32, `listPayments` UUID guard L33,
   `vercel redeploy` in docs, live-test timeout L35). New lessons L30–L38, 4 enforced in `scripts/lessons-check.mjs`.
   Still open from that audit: the D2 light/dark visual check, and the prod smoke of this wave's certificate/401 behaviour.
0b. **Verify THIS wave on the prod alias** (agents do it, you read the result): `https://master-2-jade.vercel.app` —
   `/api/health` = 200 `{"status:"ok"}` with `x-request-id`; an unknown `/shahodatnoma/<code>` shows the not-found body (the HTTP
   status is still 200 because root `loading.tsx` streams first — L21, accepted); an expired session in `/kabinet` shows the login
   link, not a reload button. If `/api/health` is 404, prod is on old code → deploy the latest main (`vercel deploy --prod --yes`
   from a clean main; never `vercel redeploy <alias>`).
0c. **Growth audit synthesis → `docs/roadmap/07`** (the `m1`–`m4` audit reports are not in `reports/` yet: collect them, then write
   the synthesis in the same shape as 06), then **R0 foundations** in the roadmap order.
2. **Parity web ↔ /api/v1 ↔ MCP (no DB schema change, can start now, muse-spark):** a `docs/features.json` manifest + a test that fails when
   a feature lacks its v1 endpoint (in OpenAPI) or MCP tool (or `n/a` + reason); enforce min app version (426 `update_required`);
   `meta.nextCursor` on v1 lists. Then the missing v1 endpoints: lead signup (bepul-dars/meetlar), diagnostika, portfolio, referral claim,
   certificate verify. Owner goal: mobile app and MCP keep pace with the site.
3. **Owner actions (ask once, in one message) — the FIRST one blocks F3 and the parity work:** (a) **create the `naqsh-dev` Supabase
   project** for preview/dev (blocked earlier by the free-project limit; steps in the STATE 2026-09-26 evening handoff) and point
   Vercel Preview/Development `DATABASE_URL` at it; (b) buy the domain **naqsh.uz**; (c) create 2 `age` key pairs + GitHub
   secrets/vars from `docs/ops/KOCHIRISH.md` so nightly backups start; (d) free uptime monitor on `/api/health`; (e) send `/start`
   to the Telegram bot to confirm the new token works.
4. **F3 data foundations** (ONLY after `naqsh-dev` exists and Vercel Preview/Development `DATABASE_URL` point to it): 68 `timestamp` →
   `timestamptz` + `lib/time.ts` (Asia/Tashkent), money canonical in `bigint` tiyin + currency (expand/contract), `org_id` (B2B possible),
   stored `users.referral_code`, unique tg_user_id / lower(email), one `toE164()`, `can()` permissions (48 role literals), Sentry.
   Every new SQL runs once on a real DB before merge (L2); migrations applied live BEFORE the deploy that needs them.
5. **Roadmap (owner request 2026-09-26): [docs/roadmap/README.md](../roadmap/README.md)** — lesson media (YouTube + stream + live),
   MCP for every role (superadmin/accountant/manager/mentor/student, all AI clients), quality control, subdomain triggers,
   mobile/desktop/Telegram Mini App, growth, and pricing (**Start / Pro / Premium**, 1–3 plans per course → 08). Order
   R0 → F3 → R1…R7. Each session: check the growth triggers (roadmap 06 §3) and tell the owner in one message if one is reached.
6. After this: tell the skillkit session (vibecoding-uz-87, if alive) that F1+F2 are merged; it runs `skillkit init-project` (db-check gate).

## 6. Settled owner decisions (don't re-ask)
- Telegram reply → site chat works. `ANTHROPIC_API_KEY` is deferred. Supabase stays in Sydney for now.
- The redesign has no Samarkand/historic-city theme; the girih logo stays. Concept = A + C.
- 2026-09-26: free nightly encrypted backups (no Supabase Pro) · a separate dev DB project · B2B is possible → `org_id` early ·
  one-command portability.
- 2026-09-26 (wave a1-fixes): the domain **naqsh.uz** is to be bought · pricing = **Start / Pro / Premium**, 1–3 plans per course.

## Hard rules
Never `pkill -f` (stop servers by PID from `ss -ltnp | grep :<port>`). Never print secrets. Deploy = push main + main:master (release agent). After changing Vercel env vars, deploy the latest main (`vercel deploy --prod --yes` from a clean main), never `vercel redeploy <alias>`.
