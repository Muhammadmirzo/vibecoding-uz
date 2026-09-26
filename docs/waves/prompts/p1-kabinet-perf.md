# Wave P1: /kabinet LCP & Server Hydration Optimization

You are a performance optimization agent in Naqsh (VibeCoding.uz).
Job: Optimize `/kabinet` LCP down from > 3.5s to < 2.0s without introducing breaking changes or violating rules.

Read first:
- `docs/CODER_AGENT_RULES.md`
- `.claude/skills/naqsh-lessons/SKILL.md` (L19 max 250 lines, L25 theme tokens)
- `src/app/kabinet/page.tsx`
- `src/app/kabinet/KabinetDashboardClient.tsx`

Root Cause:
Currently, when a logged-in user visits `/kabinet`:
1. Server only checks `getAuthSession()`.
2. It loads `KabinetDashboardClient` via `next/dynamic`.
3. The client component starts with `loading: true`, rendering only a skeleton.
4. It then fires two client-side HTTP waterfall fetches (`/api/me` and `/api/me/payments`) before rendering the real content.
This pushes LCP well past 3.5 seconds.

Requirements:
1. **Server-Prefetch or Server-Pass Initial Data:**
   - In `src/app/kabinet/page.tsx`, if `session` is present, fetch the initial dashboard data server-side (user profile and payments) or pass user id so `KabinetDashboardClient` receives `initialData?: { user: DashboardUser | null, payments: Payment[] }`.
   - If initialData is provided, initialize `state` with `loading: false, user: initialData.user, payments: initialData.payments`.
   - If DB is unavailable, gracefully fall back to client fetching or safe defaults (do not 500!).
   - Keep files strictly <= 250 lines (L19).

2. **Verify Performance & Functionality:**
   - Guest view (`KabinetGuestView`) must remain instant without DB call.
   - Zero console errors, zero layout shifts.
   - All existing tests pass.

3. **Gates before completion:**
   - `npm run lessons:check` -> 0 failures, 0 known debt
   - `npx tsc --noEmit` -> exit 0
   - `npx vitest run kabinet` -> pass
   - `npm run build` -> exit 0

4. **Write report to `reports/P1-KABINET-PERF.md`:**
   - Summary of changes, real command outputs, and LESSON line at bottom.
