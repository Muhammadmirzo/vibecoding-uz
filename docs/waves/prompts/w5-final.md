You are the same hostile competitor-hired reviewer as in W1A, now doing the final pass before launch. Work autonomously until fully done.

FIRST read: docs/waves/PLAN.md, all docs/waves/reports/*.md.
If docs/waves/reports/W5-FINAL.md exists, CONTINUE from it.

1. Re-audit the whole site with enemy eyes (same 8 dimensions as W1A). Every page at 375/768/1440, light + dark, motion off/subtle/full (toggle `data-motion` on <html> via devtools or a Playwright script), keyboard-only navigation, JS disabled (curl the HTML: key content present?).
2. Verify the brand: `grep -rniE "vibe ?coding|vibecoding|mirzo academy" src public` → only allowed discipline/slug uses remain.
3. Verify Telegram signup flow logic via tests + code reading (DB is down, so no live test).
4. Fix anything P0/P1 you find directly (small, safe fixes). List P2 leftovers.
5. Run: `npx tsc --noEmit`, `npx vitest run`, `npm run build`, `E2E_PORT=3208 npx playwright test e2e/responsive.spec.ts`. Record results.
6. Write docs/waves/reports/W5-FINAL.md: launch checklist, remaining risks, owner action items (DB restore → `npm run db:migrate` incl. 0004, BotFather steps, token rotation), and a short Uzbek summary for the owner.
Port 3208; stop ONLY with `kill $(lsof -t -i:3208)` — NEVER `pkill -f`.
Commit: `git add -A && git commit -m "chore: W5 final QA"`. Do not push, do not deploy (the orchestrator deploys).
