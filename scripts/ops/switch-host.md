# Switch the app to the new database (after a verified `move-db`)

`move-db` only copies and verifies data. The app still talks to the OLD database (now read-only)
until you complete these steps. Do them right away: while the old DB is frozen, the site shows
pages but every write (sign-up, lead form, payment) answers "texnik ishlar" (503).

Never paste a database URL into chat, an issue, a commit or a command line. Use stdin, a file with
`chmod 600`, or the host's dashboard.

## A. App stays on Vercel (project `master-2`)

1. Put the new app URL in a private file (this is what the app will use; for Supabase use the
   transaction pooler, port 6543):
   `umask 077; cat > /tmp/newdb.txt` → paste → Enter → Ctrl-D.
2. `vercel env update DATABASE_URL production --yes < /tmp/newdb.txt`
3. Same for Preview if Preview should also use it: `vercel env update DATABASE_URL preview --yes < /tmp/newdb.txt`
   then `rm /tmp/newdb.txt`.
4. Redeploy (env changes only apply to new deployments). From a clean `main`
   (`git status --porcelain` empty), build and deploy the current code:
   `vercel deploy --prod --yes`
   (or Vercel dashboard → Deployments → latest production → Redeploy).
5. Smoke test: `curl -s -o /dev/null -w '%{http_code}' https://master-2-jade.vercel.app/api/health` = 200,
   log in, submit one lead form, check it in the admin panel.
6. Update the GitHub secret the backups use: `gh secret set SOURCE_DATABASE_URL < file` (session or
   direct URL of the NEW database) so tonight's backup copies the new DB.
7. If the new DB is in another region, set `regions` in `vercel.json` to the closest Vercel region.

`npm run move -- db --to NEW_DATABASE_URL --switch-vercel` does steps 2 and 4 for you after the
verified copy (it asks for `KOCHIR` first). The GitHub workflow does the same with `switch_vercel=true`
when `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets exist.

## B. App moves to a VPS (Docker)

1. On the VPS: install Docker, clone the repo, `cp .env.example .env.production && chmod 600 .env.production`,
   fill every value (take them from `vercel env pull` on your laptop; never through chat). Set
   `DATABASE_URL` to the NEW database, plus `DOMAIN`, `ACME_EMAIL`, `CRON_SECRET`.
2. `docker compose --env-file .env.production up -d --build` (add `--profile local-db` if Postgres runs
   on the same VPS; the app URL is then `postgres://naqsh:<POSTGRES_PASSWORD>@db:5432/naqsh`).
3. Check: `docker compose ps` → app `healthy`; `curl -sI https://<DOMAIN>/api/health` → 200.
4. Point DNS (A/AAAA records of the domain) to the VPS. Caddy gets the TLS certificate by itself.
5. Domain changed? Re-register webhooks: Telegram `setWebhook` with the new URL and
   `TELEGRAM_WEBHOOK_SECRET`; update Payme/Click callback URLs in their merchant cabinets;
   update `NEXT_PUBLIC_APP_URL` (needs a rebuild: step 2 again).
6. Smoke test as in A5, then stop the Vercel project only after a few quiet days.

## Rollback (any time before you delete the old database)

1. Put the OLD `DATABASE_URL` back (A2 + A4, or edit `.env.production` + `docker compose up -d`).
2. Make the old DB writable again: `npm run move -- db --unfreeze` (or the same with `--from OLD_DB_ENV`).
3. Writes made on the NEW database after the switch are not in the old one. If there were any, run
   `move-db` in the other direction into a fresh, empty database instead of rolling back.

Keep the old database (read-only) for at least 7 days before deleting it.
