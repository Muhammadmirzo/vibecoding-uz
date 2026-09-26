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

## 5. Next work, in order (updated 2026-09-26, after release-e)
Done and live: Awwwards slice 1 (`/lab/naqsh` loom star, owner approved), /kabinet guest LCP (tag wave/2026-09-26-release-a),
Awwwards slice 2 (hero live prompt→site demo) merged as 2d4057b and pushed to main + master on 2026-09-26 (release-b),
**W8B remote MCP (OAuth 2.1 + PKCE, PATs, visual chart tools) + per-manager access merged as 823796b and pushed on 2026-09-26** (release-c),
**Wave E slice E0 — the home hero IS the live prompt→site demo — merged as 10dd9ab and pushed on 2026-09-26** (release-d),
and **Wave E slice E1 — home "Muammo" section + pinned loom star — merged as d61ae00 and pushed on 2026-09-26** (release-e).
E1: replaces ProblemShift with HomeLoom + MuammoSection; only square strand scrubs with scroll; First Load JS unchanged at 129 kB on `/`.
0. **Wave E continues, one section per slice, and the owner checks each preview before the next slice starts:**
   1. **E2: the home "Yechim / Qadriyat" section**, then **E3 … E6**, one section each (art direction §9 step 3).
   2. After deploy: smoke-test `https://master-2-jade.vercel.app/` — use the prod **alias** from `vercel inspect` → Aliases,
      never the per-deployment URL (L20/L22). Check the hero demo hydrates (it lazy-loads after idle) and that CLS is still 0.
      Cosmetic debt: the BuildStory scroll section shows a blank track in full-page screenshots (pre-existing, rebuilt in a later slice).
   3. Still unverified from release-c: the first real MCP client connection end-to-end in production —
      smoke-test `https://master-2-jade.vercel.app/.well-known/oauth-authorization-server` and log in (login reads `users.mcp_access`).
2. Skillkit: build `skillkit improve` (auto actions per verdict; design in wave/a-fixes STATE handoff "session B"). Measurement
   (`skillkit eval outcome`, `skillkit stats skills`) already exists.
3. Debt: 121 Tailwind opacity classes on var() colours produce no CSS (fix tailwind.config.js with <alpha-value> + visual review);
   `src/features/**` tests are not in vitest include (one CountUp test fails to parse); true 404 status for unknown kurs/blog slugs
   (noindex already, low priority); split `chat.service.ts` (263 lines); /kabinet simulated LCP 3.5 s.

## 6. Settled owner decisions (don't re-ask)
- Telegram reply → site chat works. `ANTHROPIC_API_KEY` is deferred. Supabase stays in Sydney for now.
- The redesign has no Samarkand/historic-city theme; the girih logo stays. Concept = A + C.

## Hard rules
Never `pkill -f` (stop servers by PID from `ss -ltnp | grep :<port>`). Never print secrets. Deploy = push main + main:master (release agent).
