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

⚠️ **Machine has 7.6 GB RAM: run ONE agent at a time** (two agents + builds got killed by memory pressure on 2026-09-24).
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
