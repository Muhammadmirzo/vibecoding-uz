# W3B — Motion admin control

**Date:** 2026-09-24

## What changed

- Added `src/features/motion/server/motion-settings.service.ts` with a 300-second `unstable_cache`, tag `motion-settings`, an 800 ms read timeout, Zod parsing, and `DEFAULT_MOTION` fail-safe behavior.
- Added `src/features/motion/server/motion-settings.repository.ts` for the `site_settings` `motion` row. Writes are transactional, upsert the JSON value, and write `motion.settings.update` to `audit_logs`.
- Added authenticated, rate-limited `GET`/`PUT` handlers at `/api/admin/settings/motion`; mutation uses the existing `requireAdmin(request)` CSRF/origin check.
- Wired the cached reader into `src/app/layout.tsx` and passed the result to `MotionRoot`.
- Added the `Animatsiyalar` CRM settings tab with Off/Subtle/Full levels, per-feature toggles, live preview, reset action, optimistic save, and Uzbek success/error status messages.
- Kept the existing settings form and motion UI separate so motion saves cannot overwrite unrelated site settings.

## Performance trade-off

The root layout already reads cookies for initial user state, so it was already a dynamic route. The motion read is cached for 300 seconds and independently falls back after 800 ms; it does not add a request-time uncached DB query to every render. `unstable_cache` keeps the storage lookup out of normal page hot paths while the first miss may perform one bounded query.

## Verification

- `npx tsc --noEmit` — pass.
- `npx vitest run` — pass: 501 passed, 1 skipped across 66 files.
- `npm run build` — pass.
- No Playwright run (explicitly excluded for this wave).
- No dev server was started or stopped.

## Risks / notes

- Existing motion contract tests cover valid, invalid, and effective-flag behavior. Added service tests for valid storage, invalid JSON fallback, and database errors; added route tests for unauthorized access, invalid body, and successful admin update.
- The preview uses the existing Tailwind motion primitives only; no new animation library or keyframe was added.
