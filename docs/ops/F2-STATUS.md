# Wave F2 portability — status (2026-09-26)

## Done
- Design: `docs/ops/PORTABILITY.md`; owner guide (Uzbek): `docs/ops/KOCHIRISH.md`; host switch: `scripts/ops/switch-host.md`.
- `scripts/ops/move-db.ts` (+ `lib/`): preflight → freeze (role IN DATABASE read-only) → snapshot manifest +
  `pg_dump -Fc --snapshot` → `pg_restore --single-transaction` → security baseline → counts+checksums verify;
  auto-unfreeze on failure; `--dry-run`, `--no-freeze`, `--unfreeze`, `--keep-dump` (age only).
- Wrapper `npm run move -- db --to NEW_DATABASE_URL [--switch-vercel]`.
- `backup-db.ts` (age-encrypted dump + manifest), `verify-restore.ts`; skillkit `scripts/restore-drill.mjs`
  (+ `scripts/db-check/{applied,detect,util}.mjs`) copied unchanged.
- Workflows: `move-db.yml` (dry_run default, rehearsal, confirm=KOCHIR, switch_vercel), `db-backup.yml`
  (nightly, encrypted artifact 7 d, optional S3/R2), `restore-drill.yml` (weekly, staleness check);
  composite `.github/actions/pg-tools`; Telegram alert script. actionlint clean.
- App anywhere: Dockerfile (non-root, healthcheck `/api/health`, no secrets in layers), `.dockerignore`,
  `docker-compose.yml` (app + Caddy TLS + cron sidecar + optional Postgres 17), `deploy/`.
- Maintenance: SQLSTATE 25006 → 503 `maintenance` + Retry-After in `src/lib/http/errors.ts`.
- Tests: `src/__tests__/ops/*` (49 tests).

## Verified
- tsc, full vitest (712), lessons:check, `npm run build` (standalone output) all green.
- Secretless build (no `.env`, placeholder DB + SESSION_SECRET) passes; placeholder not in `.next/`.
- Standalone server smoke: `/`, `/blog`, openapi, `/_next/image` (sharp), edge OG image = 200; cron route 401 without secret.
- Real rehearsal with PGDG 17.11 binaries (extracted locally, no root): live Supabase → local PG17, `--no-freeze`:
  43 tables / 856 rows identical. Local: backup → age → skillkit drill → verify OK; tamper caught; freeze/unfreeze OK.

## Not done / untested
- GitHub workflows never executed (need secrets); Docker image never built (no Docker here).
- Freeze on Supabase through Supavisor not exercised on live (by design: no writes to prod).
- `--switch-vercel` / workflow `switch_vercel` not exercised.

## Next steps
1. Owner sets secrets/vars (KOCHIRISH.md §1) with the ROTATED DB password.
2. `gh workflow run move-db -f rehearsal=true` → `gh workflow run db-backup` → `gh workflow run restore-drill`.
3. Build the image once on a Docker host / CI: `docker build .` and `docker compose config`.
4. After F1 merges: `/api/health` exists (Docker healthcheck); `cron-sync.test.ts` then enforces vercel.json ↔ deploy/crontab.txt.
