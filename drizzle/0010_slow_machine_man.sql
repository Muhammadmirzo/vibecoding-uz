CREATE TABLE IF NOT EXISTS "chat_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_token_hash" text NOT NULL,
	"user_id" uuid,
	"lead_id" uuid,
	"display_name" text NOT NULL,
	"contact_phone" text,
	"contact_telegram" text,
	"status" text DEFAULT 'open' NOT NULL,
	"assigned_admin_id" uuid,
	"ai_mode" text DEFAULT 'assist' NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"unread_for_admin" integer DEFAULT 0 NOT NULL,
	"unread_for_visitor" integer DEFAULT 0 NOT NULL,
	"source_path" text DEFAULT '/' NOT NULL,
	"device" text DEFAULT 'unknown' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"client_id" text NOT NULL,
	"sender" text NOT NULL,
	"author_user_id" uuid,
	"body" text NOT NULL,
	"telegram_message_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_assigned_admin_id_users_id_fk" FOREIGN KEY ("assigned_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "chat_conversations_visitor_idx" ON "chat_conversations" USING btree ("visitor_token_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_conversations_status_idx" ON "chat_conversations" USING btree ("status","last_message_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "chat_messages_client_idx" ON "chat_messages" USING btree ("conversation_id","client_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_messages_conversation_idx" ON "chat_messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_messages_telegram_idx" ON "chat_messages" USING btree ("telegram_message_id");