-- 0014 lockdown_public (wave F1). Every statement is idempotent: safe to re-run.
-- Part A (lockdown: REVOKE + default privileges + RLS) was already applied by hand on the live DB
-- on 2026-09-26; it is committed here so fresh databases get the same state.
-- Small tables only (lesson_progress 0 rows, homework_submissions few rows): plain CREATE INDEX is fine.
SET LOCAL lock_timeout = '5s';
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "telegram_updates" (
	"update_id" bigint PRIMARY KEY NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Dedupe lesson_progress before the unique index: keep the most recently seen row per (user, lesson).
DELETE FROM "lesson_progress" a
USING "lesson_progress" b
WHERE a."user_id" = b."user_id" AND a."lesson_id" = b."lesson_id"
  AND (a."last_seen_at", a.ctid) < (b."last_seen_at", b.ctid);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lesson_progress_user_lesson_uq" ON "lesson_progress" USING btree ("user_id","lesson_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "homework_submissions_attempt_uq" ON "homework_submissions" USING btree ("assignment_id","user_id","attempt_no");
--> statement-breakpoint
-- Legacy secrets must live only in env vars (the owner must rotate the Telegram bot token).
DELETE FROM "site_settings" WHERE "key" IN ('paymeSecretKey', 'clickSecretKey', 'telegramBotToken', 'smsApiKey');
--> statement-breakpoint
-- Part A: lock the Supabase Data API out of the public schema. The app connects as postgres (bypasses RLS).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
    REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
  END IF;
END $$;
--> statement-breakpoint
-- RLS on every public table (no policies = deny for anon/authenticated). Loops pg_tables so re-running covers new tables.
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;
