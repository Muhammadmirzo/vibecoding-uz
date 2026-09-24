CREATE TABLE IF NOT EXISTS "api_refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid,
	"token_hash" text NOT NULL,
	"device_id" text DEFAULT 'unknown' NOT NULL,
	"device_name" text,
	"platform" text DEFAULT 'android' NOT NULL,
	"app_version" text,
	"expires_at" timestamp NOT NULL,
	"last_used_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	"rotated_from" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "api_refresh_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" text DEFAULT 'android' NOT NULL,
	"push_token" text NOT NULL,
	"app_version" text,
	"locale" text DEFAULT 'uz' NOT NULL,
	"last_seen" timestamp DEFAULT now() NOT NULL,
	"disabled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_devices_push_token_unique" UNIQUE("push_token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "api_refresh_tokens" ADD CONSTRAINT "api_refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "push_devices" ADD CONSTRAINT "push_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "api_refresh_tokens_user_idx" ON "api_refresh_tokens" USING btree ("user_id","revoked_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "api_refresh_tokens_device_idx" ON "api_refresh_tokens" USING btree ("user_id","device_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "push_devices_user_idx" ON "push_devices" USING btree ("user_id","disabled_at");