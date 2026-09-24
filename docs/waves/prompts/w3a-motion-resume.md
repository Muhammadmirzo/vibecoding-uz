You are continuing wave W3A (motion system) on branch wave/w3a-motion. The previous agent was cut off by a provider rate limit AFTER doing most of the work; it is saved in commit "wip(motion): W3A partial" (see `git show --stat HEAD`).

Do NOT restart. Steps:
1. Read docs/waves/prompts/w3a-motion.md (the full original spec) and docs/waves/PLAN.md §3/§5, then review the WIP diff (`git show HEAD`) against the spec and list what is done vs missing.
2. Finish the missing parts and fix anything in the WIP that violates the spec (SSR-visible content without JS, reduced-motion, data-motion levels/flags, transform/opacity only, pause offscreen, ≤ 3 kB gz First Load JS increase vs the baseline in docs/waves/reports/W1A-AUDIT.md). Also fix W1A findings owned by W3A (A-009 sticky buy bar overlap on mobile, A-022 focus/escape/reduced-motion on sticky/drawer).
3. Check that the home page `/` did not become dynamic (ƒ) because of motion code — motion settings must not force dynamic rendering in this wave (defaults only; W3B adds storage).
4. Playwright: `E2E_PORT=3204 npx playwright test e2e/responsive.spec.ts` must pass; look at a few screenshots (home 375 + 1440, light + dark).
5. Write docs/waves/reports/W3A-MOTION.md (animation inventory table: where, trigger, duration, controlling flag; perf before/after).
Port 3204; stop ONLY with `kill $(lsof -t -i:3204)` — NEVER `pkill -f`.
GATE: `npx tsc --noEmit`, `npx vitest run`, `npm run build` green.
Commit: `git add -A && git commit -m "feat(motion): Naqsh motion system and signature animations"`. Do not push.
