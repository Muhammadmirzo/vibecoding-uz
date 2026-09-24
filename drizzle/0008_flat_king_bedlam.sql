CREATE TABLE IF NOT EXISTS "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_id" uuid NOT NULL,
	"visitor_hash" text NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid,
	"type" text NOT NULL,
	"path" text NOT NULL,
	"referrer_host" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_term" text,
	"utm_content" text,
	"device" text NOT NULL,
	"browser_family" text NOT NULL,
	"country" text,
	"props" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"value_uzs" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "analytics_events_event_id_uidx" ON "analytics_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_events_occurred_at_idx" ON "analytics_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_events_type_occurred_at_idx" ON "analytics_events" USING btree ("type","occurred_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_events_visitor_occurred_at_idx" ON "analytics_events" USING btree ("visitor_hash","occurred_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_events_session_id_idx" ON "analytics_events" USING btree ("session_id");