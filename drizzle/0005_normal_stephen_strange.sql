CREATE TABLE IF NOT EXISTS "telegram_login_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nonce_hash" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"user_id" uuid,
	"tg_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"approved_at" timestamp,
	"consumed_at" timestamp,
	"ip" text,
	"user_agent" text,
	CONSTRAINT "telegram_login_requests_nonce_hash_unique" UNIQUE("nonce_hash")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "telegram_login_requests" ADD CONSTRAINT "telegram_login_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "telegram_login_requests_tg_pending_idx" ON "telegram_login_requests" USING btree ("tg_user_id","status","expires_at");