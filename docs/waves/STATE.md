# Wave STATE — single source of truth for resuming

> **"davom et" / "continue" protocol (for any new Claude session):**
> 1. Read this file + [PLAN.md](PLAN.md). Do not re-plan; continue from the first row that is not ✅.
> 2. For a row marked 🏃 running: check `tail .orchestra/logs/<wave>.log` (last line `exit=<n>` means finished) and `git -C ../vibecoding-uz-wt/<wave> log --oneline -3`.
>    - Finished + report exists + gate green → review, merge (`git merge --no-ff wave/<wave>`), mark ✅.
>    - Died/incomplete → re-run the same command; the prompt tells the agent to continue from its report + git state.
> 3. Dispatch: `scripts/waves/dispatch.sh <wave> <model>` (run in background). Models: `muse-spark-1.3-contributor-free`, `space-bunny-free` (fallback `muse-spark-1.2-contributor-free`). Never nemotron.
> 4. After each merge: `npm run build && npx vitest run` on main, update this table, commit `docs(waves): state`.
> 5. Deploy only in W5: `git push origin main && git push origin main:master`.

| Wave | Model | Status | Branch / commit | Report | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| W0 Plan | orchestrator | ✅ | main | PLAN.md | brand = Naqsh, contracts fixed |
| W1A Audit | space-bunny-free | ✅ | wave/w1a-audit (32edce9) | reports/W1A-AUDIT.md | read-only, port 3201 |
| W1B Brand | muse-spark-1.3-contributor-free | ✅ | wave/w1b-brand (f8f8052) | reports/W1B-BRAND.md | logo redrawn by orchestrator; geometry in src/components/brand/logoGeometry.ts; migration 0004 = blog author default |
| W2 Telegram | space-bunny-free | ✅ | wave/w2-telegram (3 rounds: 0458ca2 rejected → 53ba867 → aebcd4b) | reports/W2-TELEGRAM.md | migration 0005 = telegram_login_requests; bot confirm step (anti-phishing) |
| W3A Motion | muse-spark-1.3 | 🏃 resumed after reboot (continues from 21 uncommitted files) | wave/w3a-motion | reports/W3A-MOTION.md | |
| W3B Motion admin | space-bunny | ⏳ | — | reports/W3B-MOTION-ADMIN.md | |
| W4A Perf | space-bunny | ⏳ | — | reports/W4A-PERF.md | |
| W4B Audit fixes | space-bunny-free | ⏸ killed (low RAM) — 43 uncommitted files in worktree, no report yet; resume after W3A: `scripts/waves/dispatch.sh w4b-fixes space-bunny-free` | wave/w4b-fixes | reports/W4B-FIXES.md | |
| W5 Final QA + deploy | space-bunny + orchestrator | ⏳ | main | reports/W5-FINAL.md | |

⚠️ **Machine has 7.6 GB RAM: run ONE agent at a time** (two agents + builds got killed by memory pressure on 2026-09-24).
⚠️ After a reboot the `opencode serve --service` daemon auto-resumes old agent sessions in parallel — run `opencode service restart` first, then dispatch one wave.

Legend: ⏸ paused/killed (work kept in worktree) · ✅ merged · 🏃 running · ⏳ waiting · ❌ failed (see notes)

## Blockers outside the code
- Supabase DB down (see docs/HANDOFF_2026-09-24.md §2.1). Signup/login can only be tested end-to-end after the owner restores it.
- After W2 deploys: in @BotFather run `/setdomain` for the production domain (only needed for the optional Login Widget).
