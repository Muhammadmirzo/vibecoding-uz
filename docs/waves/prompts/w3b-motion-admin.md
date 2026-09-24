You are a senior full-stack engineer. Work autonomously until fully done.

FIRST read: docs/waves/PLAN.md (§3 Motion contract), docs/CODER_AGENT_RULES.md, docs/waves/reports/W3A-MOTION.md, src/features/motion/**, src/db/schema/content.ts (site_settings), src/app/api/admin/settings/**, src/features/crm/components/settings/**, src/app/layout.tsx.
If docs/waves/reports/W3B-MOTION-ADMIN.md exists, CONTINUE from it.

MISSION: owner controls animations from the admin panel.
1. Server: `src/features/motion/server/motion-settings.service.ts` + repository: read `site_settings` key "motion" (Zod-validated, unknown keys dropped, invalid → DEFAULT_MOTION), cached (Next `unstable_cache` with tag "motion-settings", revalidate 300 s) and FAIL-SAFE: any DB error/timeout (≤ 800 ms) → DEFAULT_MOTION, never throws, never blocks render. Write: upsert + `revalidateTag("motion-settings")` + audit log entry.
2. API: `GET/PUT /api/admin/settings/motion` — admin auth inside the handler (same pattern as other admin routes), Zod body, rate limit, CSRF-safe (same-origin check like other mutating admin routes).
3. layout.tsx: pass settings into MotionRoot (from W3A). Must not make every page dynamic if avoidable — prefer cached read; if the root layout would become dynamic, explain the trade-off in the report and pick the faster option.
4. Admin UI: new "Animatsiyalar" tab in CRM settings: segmented control for level (O'chiq / Yengil / To'liq) with one-line explanations, toggles for each flag (hero, scroll reveal, pointer effects, ambient, page transitions) disabled when level = off, a live preview card that plays a sample animation reflecting the current choice, "Standartga qaytarish" button, save with optimistic UI + Uzbek success/error toasts. Theme tokens only, accessible (labels, keyboard, focus).
5. Tests: service (valid, invalid json, DB throws → defaults, cache tag), route (unauthorized 401/403, invalid body 400, success).
SCOPE: motion settings storage + admin tab + layout wiring. No new animations.
Dev server: port 3205; stop ONLY with `kill $(lsof -t -i:3205)` — NEVER `pkill -f`. No Playwright.
GATE: tsc, vitest, build green. Report docs/waves/reports/W3B-MOTION-ADMIN.md. Commit: `git add -A && git commit -m "feat(admin): animation controls"`. Do not push.
