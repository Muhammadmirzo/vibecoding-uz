# RESUME: what a new session does when the owner says "boshlang" / "boshla" / "davom et"

Do NOT ask questions first: read this file + the newest STATE.md handoff, report the state in 5 short Uzbek lines, then start step 5.1.

The owner speaks Uzbek, so reply in Uzbek, short and step by step. You are the ORCHESTRATOR (Claude Opus): plan, dispatch free
opencode agents, review, decide. Don't hand-write large features, and don't do mechanical work (push, handoff) yourself.

## 1. Live state (1 min)
```bash
cd /home/mirzo/.zcode/workspace/vibecoding-uz
git log --oneline -5 && git status --short && free -h | sed -n 2p
ps -eo pid,etimes,args | grep "opencode run" | grep -v grep   # agents still running?
skillkit doctor
```
Then read `docs/waves/STATE.md` → "Phase 2" → the newest `### ▶ HANDOFF` section (source of truth).

## 2. Tools (since 2026-09-25)
- Skills: `skillkit` (`~/.skillkit`). The skill `naqsh-lessons` is loaded before any code in this repo.
- Free opencode models (muse-spark, space-bunny) were DOWN on 2026-09-25/26. Use Claude subagents (Sonnet = UI/creative,
  Haiku = release/mechanical, Opus = security review) or Gemini via Antigravity: `agy -p "<prompt>" --model gemini-3.1-pro-high|gemini-3.8-flash-high --dangerously-skip-permissions`
  (skillkit dispatch supports `gemini-*`). Gemini reports overclaim: always re-run gates on the COMMITTED state yourself.
- Production URL: **https://master-2-jade.vercel.app** (`master-2.vercel.app` is NOT ours, lesson L20).
- Dispatch an agent: `skillkit dispatch <task> <model> <prompt-file> [dir]`. It adds the LESSON footer, falls back to another model on
  a stall, runs `--standalone`, and records metrics. Models: `muse-spark-1.3-contributor-free` (deep), `space-bunny-free`
  (fast/mechanical). Never use nemotron. Max 3 agents; heavy commands go through `scripts/waves/locked.sh`.
- The agent's report has no LESSON line → review its diff yourself and record the lesson (`self-improve` skill).
- Quality gate: `npm run lessons:check` (also runs as pre-commit), CI on GitHub (lessons + tsc + vitest).

## 3. Review before merge (never skip; agents have shipped broken code several times)
- Read the risky diffs, not just the report. Check correctness, security, degraded modes, files ≤ 250 lines, honest copy, tokens only.
- New raw SQL → run it once on the live DB (`verify-sql-live`). UI → screenshots at 390/768/1280/1440 plus a video.

## 4. Release after every big wave (owner rule): an AGENT does it, not the orchestrator
`skillkit release <wave> --notes "shipped | next | risks | owner decisions"`. Settings live in `.skillkit.json`. The agent runs the gates,
writes the handoff and pushes. Code then verifies the push, CI and the live URL, and tags `wave/<date>-<name>`. Rollback: `skillkit wave rollback <tag>`.
If the free agent stalls for more than ~10 min, stop it by PID and hand the same job to a Claude subagent (Haiku for mechanical work).
Skill: `wave-handoff`.

## 5. Next work, in order (updated 2026-09-26)
Done and live: Awwwards slice 1 (`/lab/naqsh` loom star, owner approved), /kabinet guest LCP (tag wave/2026-09-26-release-a).
1. **Awwwards slice 2 (hero live demo) is BUILT, gated, NOT deployed.** Branch `wave/release-b` (worktree ../vibecoding-uz-wt/release-b) =
   origin/main + wave/awwwards-slice2; tsc 0, vitest 648/648, build OK, `/lab/naqsh` 189 kB. Owner said "Zo'r" about the demo but then
   **"Yo'q" to deploying it for now**: ask ONE question first: "2-bosqichni saytga chiqaraymi?" If yes → release agent pushes
   `wave/release-b:main` and `:master`, smoke-test on master-2-jade, tag `wave/<date>-release-b`.
   Preview: https://master-2-git-wave-awwwards-slice2-muhammadmirzos-projects.vercel.app/lab/naqsh (Vercel login needed).
2. **W8B MCP + per-manager access** on `wave/w8b-mcp` (934a702): reviewed + gated (tsc 0, vitest 623/623, build OK). Owner decision:
   managers may use MCP (incl. lead status writes) only when an admin enables it; PII stays admin-only. Waiting for the owner's
   "W8B deploy qil". Order: run the new OAuth/PAT/manager SQL on the live DB → `npx drizzle-kit migrate` (0012 + 0013) → merge → deploy.
   **0013 adds users.mcp_access which every login reads: deploying before migrating breaks ALL logins.**
3. Wave E: rebuild the home page sections 0→6 in the approved lab style (art direction §9 step 3), one section per slice, owner checks each.
4. Skillkit: build `skillkit improve` (auto actions per verdict; design in wave/a-fixes STATE handoff "session B"). Measurement
   (`skillkit eval outcome`, `skillkit stats skills`) already exists.
5. Debt: 121 Tailwind opacity classes on var() colours produce no CSS (fix tailwind.config.js with <alpha-value> + visual review);
   `src/features/**` tests are not in vitest include (one CountUp test fails to parse); true 404 status for unknown kurs/blog slugs
   (noindex already, low priority); split `chat.service.ts`; /kabinet simulated LCP 3.5 s.

## 6. Settled owner decisions (don't re-ask)
- Telegram reply → site chat works. `ANTHROPIC_API_KEY` is deferred. Supabase stays in Sydney for now.
- The redesign has no Samarkand/historic-city theme; the girih logo stays. Concept = A + C.

## Hard rules
Never `pkill -f` (stop servers by PID from `ss -ltnp | grep :<port>`). Never print secrets. Deploy = push main + main:master (release agent).
