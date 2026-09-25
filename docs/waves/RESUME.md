# RESUME: what a new session does when the owner says "boshla" (or "davom et")

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
- Dispatch an agent: `skillkit dispatch <task> <model> <prompt-file> [dir]`. It adds the LESSON footer, falls back to another model on
  a stall, runs `--standalone`, and records metrics. Models: `muse-spark-1.3-contributor-free` (deep), `space-bunny-free`
  (fast/mechanical). Never use nemotron. Max 3 agents; heavy commands go through `scripts/waves/locked.sh`.
- The agent's report has no LESSON line → review its diff yourself and record the lesson (`self-improve` skill).
- Quality gate: `npm run lessons:check` (also runs as pre-commit), CI on GitHub (lessons + tsc + vitest).

## 3. Review before merge (never skip; agents have shipped broken code several times)
- Read the risky diffs, not just the report. Check correctness, security, degraded modes, files ≤ 250 lines, honest copy, tokens only.
- New raw SQL → run it once on the live DB (`verify-sql-live`). UI → screenshots at 390/768/1280/1440 plus a video.

## 4. Release after every big wave (owner rule): an AGENT does it, not the orchestrator
1. Write `.orchestra/wave-notes.md` (3-5 lines: what shipped, what's next, risks).
2. `skillkit dispatch release-<wave> space-bunny-free scripts/waves/release-prompt.md .`
3. Read only its `RELEASE:` / `LESSON:` lines, then verify with `gh run list --limit 2` and the live URL (200).

## 5. Next work, in order
1. **Awwwards slice 1:** prototype route `/lab/naqsh` (noindex, not linked). The loom star (logo girih) draws itself on scroll.
   Spec: `docs/redesign/awwwards/02-art-direction.md` §6 and §9. Skills: `awwwards-craft`, `motion-design`, `creative-hub` → gsap-scrolltrigger.
   The owner approves the feel on their phone before anything else changes.
2. Awwwards slice 2: the hero live demo (prompt → site, labelled "namuna"), in the same lab route.
3. W8B MCP review (see the older HANDOFF in STATE.md for the recipe; its migration becomes 0012).
4. Small debt: soft-404 (2 pages in `scripts/lessons-baseline.json`), `/kabinet` guest LCP, split `chat.service.ts` (262 lines).

## 6. Settled owner decisions (don't re-ask)
- Telegram reply → site chat works. `ANTHROPIC_API_KEY` is deferred. Supabase stays in Sydney for now.
- The redesign has no Samarkand/historic-city theme; the girih logo stays. Concept = A + C.

## Hard rules
Never `pkill -f` (stop servers by PID from `ss -ltnp | grep :<port>`). Never print secrets. Deploy = push main + main:master (release agent).
