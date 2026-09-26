# Portability kit (foundations-first item 31)

Goal: move the app and the database to any host with one command, no data loss, no security loss.
Owner-facing Uzbek guide: [KOCHIRISH.md](KOCHIRISH.md). Host switch checklist: [switch-host.md](../../scripts/ops/switch-host.md).

## 1. App runs anywhere

| Piece | File |
| :--- | :--- |
| Standalone Node server (`output: "standalone"`, already on; Vercel ignores it) | `next.config.mjs` |
| Multi-stage image, non-root, no secrets baked, healthcheck `/api/health` | `Dockerfile`, `.dockerignore` |
| Plain VPS: app + Caddy (TLS) + cron sidecar + optional Postgres 17 (`--profile local-db`) | `docker-compose.yml`, `deploy/` |

Build-time env: only `NEXT_PUBLIC_*` (inlined into JS). `DATABASE_URL` may be passed as a BuildKit
secret (never a layer); without it the build uses an unreachable placeholder (all DB pages are dynamic).
Runtime env: the same names as on Vercel (`.env.example`), given via `env_file` with 0600 permissions.

### Vercel-specific things and their portable path

| Vercel thing | Where | Portable path |
| :--- | :--- | :--- |
| `regions: ["syd1"]` | `vercel.json` | Put the VPS in the same region as the DB. |
| Crons (`vercel.json` `crons`) | `/api/cron/*`, `CRON_SECRET` | `cron` sidecar (`deploy/cron.sh` + `deploy/crontab.txt`) or any external scheduler sending `Authorization: Bearer $CRON_SECRET`. Keep both lists in sync. |
| `x-vercel-forwarded-for` (rate-limit IP) | `src/lib/security/rateLimit` | Caddy deletes the client-sent header and sets `X-Real-IP` to the real peer. The app port is never published. |
| `x-vercel-ip-country` (analytics) | `api/v1/events` | Stripped by Caddy; country is `null` off Vercel (analytics only). |
| `after()` | chat, analytics | Supported by `next start`/standalone; stop with SIGTERM (compose `stop_grace_period: 30s`). |
| Edge runtime OG images (`next/og`) | `opengraph-image.tsx` etc. | Supported by the Node server. |
| Image optimization | `next/image` | Built in (`sharp`), zero config. |
| `unstable_cache` / `revalidateTag` | motion, portfolio | Filesystem cache per instance. One instance = fine. Several = add a cache handler. |
| Env vars in Vercel | dashboard | `.env` on the host (0600) from the secrets list; never copied through logs. |
| `@vercel/*` packages, `VERCEL_ENV` | none used | — |
| Webhook URLs (Telegram, Payme, Click) | providers | Re-register only if the domain changes (checklist). |

## 2. Database is plain Postgres

Only schemas `public` (app) and `drizzle` (migration journal) are ours. No Supabase Auth, Storage,
Realtime or policies. Column defaults use core `gen_random_uuid()`, so no extension is required
(preflight still computes the list from `pg_depend`). All `public` tables have RLS on and no grants to
`anon`/`authenticated`; that baseline is re-applied on every target.

## 3. `move-db` design (`scripts/ops/move-db.ts`)

1. **Preflight (read-only):** pg_dump/pg_restore ≥ 17 present; TLS for every non-loopback host
   (`sslmode` disable/allow/prefer is refused); source is not the transaction pooler (6543 is
   converted to the Supabase session port 5432); target major ≥ source major; target has no tables or
   types in `public`/`drizzle`; required extensions available; source ≠ target.
2. **Freeze (maintenance):** `ALTER ROLE CURRENT_USER IN DATABASE <source db> SET
   default_transaction_read_only = on` + terminate that role's other sessions on that database (and our
   own, so a pooler can't hand out a pre-freeze read-write backend); a fresh session must report
   read-only or the move stops. Works on any host, instantly, without redeploy. The app maps SQLSTATE
   `25006` to a retryable `503 maintenance` (`src/lib/http/errors.ts`); reads keep working. Rate-limited
   endpoints and anything that writes on a read path may also answer 503 during the freeze.
3. **Snapshot:** one `REPEATABLE READ READ ONLY` transaction exports a snapshot; the source manifest
   (per-table exact row count + md5 of rows in primary-key order, sequences, RLS flags) and
   `pg_dump -Fc --snapshot` both read that same snapshot, so verification is exact.
4. **Dump → restore:** `pg_dump -Fc -n public -n drizzle --no-owner --no-privileges` into a 0700 temp
   dir; `pg_restore --single-transaction --exit-on-error --no-owner --no-privileges` (all or nothing).
5. **Security baseline** on the target (REVOKE from `anon`/`authenticated` if they exist, RLS on every
   `public` table), then the **target manifest must equal the source manifest**.
6. **Result:** source stays frozen (no lost writes). Next step: switch `DATABASE_URL` and redeploy.
   Rollback: `move-db --unfreeze` — the old DB was never modified.
7. **Cleanup:** the temp dir (dump, pgpass) is deleted on exit, error and Ctrl-C. A kept copy is only
   ever written age-encrypted. URLs/passwords are masked in all output.

On failure after the freeze, the source is unfrozen automatically.

## 4. Backups and restore drill

- `db-backup.yml` (nightly): same snapshot + manifest code → age-encrypted dump + manifest → 7-day
  artifact (acceptable only because it is encrypted; the repo is public). Better: private R2/S3 bucket
  (optional step, `BACKUP_S3_URI`).
- `restore-drill.yml` (weekly + manual): fails if the newest backup is older than 72 h; throwaway
  `postgres:17` on the runner; decrypt with the drill key; restore with the skillkit drill
  (`scripts/restore-drill.mjs --dump`, copied unchanged from `~/.skillkit/templates`); then
  `scripts/ops/verify-restore.ts` compares counts + checksums with the backup's own manifest.
  Fails loudly (red run + Telegram alert).
- Two age recipients: the owner's offline key (disaster recovery) and a drill key kept as a repo
  secret. The drill key gives no more access than the DB URL secret stored next to it.

## 5. What is verified where

- Unit tests (`src/__tests__/ops`): arg parsing, URL masking/redaction, TLS policy, pooler switch,
  same-DB guard, pgpass escaping, checksum SQL builder, table ordering, manifest compare, TOC filter,
  dump/restore flags, scratch-dir cleanup, age recipients, freeze SQL, 25006 → 503, cron sync with
  `vercel.json`, and the CLI end-to-end (exit codes, no password in output).
- 2026-09-26 local rehearsal with PGDG 17.11 binaries extracted to a scratch dir (no root):
  live Supabase (read-only, `--no-freeze`) → local Postgres 17: 43 tables / 856 rows identical;
  backup-db → age → skillkit drill → verify-restore OK, and a one-row tamper was caught; freeze →
  move → frozen source refuses writes, target writable, non-empty target refused → `--unfreeze` OK.
- Not yet run: the GitHub workflows themselves (validated with actionlint only), the freeze on
  Supabase's `postgres` role through Supavisor, `--switch-vercel`, and the Docker image build (no
  Docker on the dev machine). First real run: `gh workflow run move-db -f rehearsal=true`, then
  `gh workflow run db-backup` and `gh workflow run restore-drill`.
