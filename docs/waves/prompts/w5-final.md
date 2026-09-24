You are the same hostile competitor-hired reviewer as in W1A, now doing the final pass before launch. Work autonomously until fully done.

FIRST read: docs/waves/PLAN.md, all docs/waves/reports/*.md.
If docs/waves/reports/W5-FINAL.md exists, CONTINUE from it.

1. Re-audit the whole site with enemy eyes (same 8 dimensions as W1A). Every page at 375/768/1440, light + dark, motion off/subtle/full (toggle `data-motion` on <html> via devtools or a Playwright script), keyboard-only navigation, JS disabled (curl the HTML: key content present?).
2. Verify the brand: `grep -rniE "vibe ?coding|vibecoding|mirzo academy" src public` → only allowed discipline/slug uses remain.
3. Verify Telegram signup flow logic via tests + code reading (DB is down, so no live test).
3b. KNOWN VISUAL DEFECTS found by the orchestrator on the home hero (fix them, verify with screenshots): (a) in dark mode the TerminalWindow turns light/inverted — a terminal must stay dark in both themes; (b) the terminal body has a large empty bottom area and no final line — show the complete transcript incl. a final `✓ deployed → <fictional url>` line (no real third-party domains) and size the window to its content; (c) stray diagonal gold/grey lines render to the right of the terminal (girih weave artefact bleeding outside its container) — clip or reposition; (d) the preview card title is truncated to "Nonvoyxa" — must read "Nonvoyxona" without truncation at all widths; (e) the top announcement bar in dark mode is a harsh bright blue — use a dark-theme-appropriate token; (f) the preview card's tiny "4.9 · 320+ buyurtma" text is unreadable and looks like a fake claim — remove or make it clearly part of a fictional mock at a legible size.
4. Fix anything P0/P1 you find directly (small, safe fixes). List P2 leftovers.
4b. Performance guard: run Lighthouse mobile on `next start` for / and /kurs/vibe-coding-express with `--throttling-method=devtools` (the default simulated mode over-reports LCP here). Must stay CLS 0 and LCP ≤ 2.5 s; any regression you introduce must be fixed.
5. Run: `npx tsc --noEmit`, `npx vitest run`, `npm run build`, `E2E_PORT=3208 npx playwright test e2e/responsive.spec.ts`. Record results.
6. Write docs/waves/reports/W5-FINAL.md: launch checklist, remaining risks, owner action items (DB restore → `npm run db:migrate` incl. 0004 + 0005, BotFather steps, token rotation), and a short Uzbek summary for the owner.
Port 3208; stop ONLY with `ss -ltnp | grep ':3208 ' | grep -o 'pid=[0-9]*' | cut -d= -f2 | xargs -r kill` (lsof misses next-server; a leftover server eats RAM and makes later tests hit a stale build) — NEVER `pkill -f`.
Commit: `git add -A && git commit -m "chore: W5 final QA"`. Do not push, do not deploy (the orchestrator deploys).
