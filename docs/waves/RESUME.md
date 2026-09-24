# RESUME — what a new session does when the owner says "boshla" (or "davom et")

Owner speaks Uzbek → reply in Uzbek, short and step by step. You are the ORCHESTRATOR (Opus, high effort): plan, dispatch free opencode agents, review, merge, deploy. Do not hand-write large features yourself.

## 1. Get the live state (2 min)
```bash
cd /home/mirzo/.zcode/workspace/vibecoding-uz
git log --oneline -5 && git worktree list
for w in w6a-design-home w6b-portfolio; do echo "== $w"; tail -n 3 .orchestra/logs/$w.log; git -C ../vibecoding-uz-wt/$w log --oneline -3 main..HEAD; git -C ../vibecoding-uz-wt/$w status --short | wc -l; done
free -h | sed -n 2p
```
Then read `docs/waves/STATE.md` → "Phase 2" table (source of truth).

## 2. For each Phase-2 row marked 🏃
- Log ends with `exit=0` and a report exists → REVIEW (step 3).
- Log has no `exit=` line and no opencode process is running for it, or `exit≠0`, or "Rate limit" → the agent died (closing the old terminal kills its background jobs). Re-dispatch in the background — the agent continues from its report + git state in the same worktree:
  `scripts/waves/dispatch.sh <wave> space-bunny-free` (or `muse-spark-1.3-contributor-free` if not rate-limited). Max 2 agents at once.
- After a reboot first run `opencode service restart` (the daemon auto-resumes old sessions in parallel).

## 3. Review before merge (never skip — agents have shipped broken code 3 times)
- Read the diff of risky parts, not just the report. Check: correctness, security, antifragility (DB/Redis/Telegram down must degrade, not throw), files ≤ 250 lines (`wc -l`), honest copy, theme tokens.
- Gate in the worktree: `npx tsc --noEmit && npx vitest run && scripts/waves/locked.sh npm run build`.
- UI waves: screenshots scrolled through the page at 390/1440, light + dark; `scripts/waves/locked.sh npx playwright test e2e/responsive.spec.ts e2e/visibility.spec.ts` with `E2E_PORT`; Lighthouse mobile with `--throttling-method=devtools` (CLS 0, LCP ≤ 2.5 s).
- Merge: `git merge --no-ff wave/<wave>`; on main `npm install && npx vitest run && npm run build`; update STATE row to ✅ with notes; remove the worktree.
- New migration (W6B adds one): apply to the live DB via the pooler URL in `.env` (`vercel env pull .env --environment=production --yes`), `npx drizzle-kit migrate`. Never run `scripts/portfolio/mark-unverified.ts --apply` until the owner confirms which projects are theirs.
- Deploy: `git push origin main && git push origin main:master`, then smoke-test https://master-2-jade.vercel.app (routes 200, 0 console errors).

## 4. Next waves (prompts to write in docs/waves/prompts/, same style as w6a/w6b)
- W6C design rollout to every page — after the owner sees and likes the W6A home page.
- W7 chat centre, W8 analytics + MCP, W9 mobile API — ONLY after owner approval (see STATE "Waiting on the owner").

## 5. Open questions to ask the owner (if still unanswered)
1. ~~Which portfolio projects are theirs~~ — answered: only Clash Nexus for now (Bozor bot later).
2. Approve W7 / W8 / W9?
3. Approve cuts: /ekspertlar, /testimoniyalar, /ish, SpinWheel, unbuilt feature flags?
4. Admin password reset ("parolni yangila") — reset via `scripts/create-admin.ts` with a generated password; never read or print existing secrets.

## Hard rules
Never `pkill -f` (stop servers by PID from `ss -ltnp | grep :<port>`). Heavy commands via `scripts/waves/locked.sh`. Never nemotron. Machine has 7.6 GB RAM.
