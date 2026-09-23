-- Lead contact integrity: separate Telegram username from phone.
-- Step 1: relax the NOT NULL constraint on phone (non-destructive: existing rows keep their values).
ALTER TABLE "leads" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
-- Step 2: add a dedicated column for Telegram usernames.
ALTER TABLE "leads" ADD COLUMN "telegram" varchar(64);