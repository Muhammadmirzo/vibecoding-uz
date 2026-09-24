You are a senior full-stack engineer + product designer + Uzbek copy editor. Work autonomously until fully done.

FIRST read: docs/waves/PLAN.md, docs/CODER_AGENT_RULES.md, docs/waves/reports/W1A-AUDIT.md, and the reports of all merged waves in docs/waves/reports/ (W1B, W2, W3A, W3B, W4A) so you know what is already fixed.
If docs/waves/reports/W4B-FIXES.md exists, CONTINUE from it.

MISSION: close EVERY remaining W1A finding (P0 → P1 → P2) that no previous wave fixed. For each finding: verify it still exists (code may have changed), fix it properly (root cause, not symptom), add a regression test where logic is involved. Include the antifragility items: every external dependency (DB, Telegram, SMS, email, payments, Redis) must have a timeout, a graceful fallback and a user-facing Uzbek message; no page may 500 because the DB is down; admin must not store provider secrets in the DB if env vars exist (prefer env, show "sozlangan / sozlanmagan" status only).
Also polish copy: conversion-focused, concrete, honest (no invented numbers/testimonials), consistent brand voice (BRAND from @/config/brand), correct Uzbek apostrophes.
Keep the report as a table: Finding ID | Status (fixed / already fixed by Wx / won't fix + reason) | Commit/file.
Dev server port 3207; stop ONLY with `kill $(lsof -t -i:3207)` — NEVER `pkill -f`. Playwright: `E2E_PORT=3207 npx playwright test e2e/responsive.spec.ts` green.
GATE: tsc, vitest, build green. Report docs/waves/reports/W4B-FIXES.md. Commit in logical chunks (`fix(<area>): ...`). Do not push.
