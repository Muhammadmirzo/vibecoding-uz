UPDATE "portfolios" SET "sort_order" = 0 WHERE "sort_order" IS NULL;--> statement-breakpoint
ALTER TABLE "portfolios" ALTER COLUMN "sort_order" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolios" ADD COLUMN "ownership" text DEFAULT 'demo' NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolios" ADD COLUMN "featured_rank" integer;--> statement-breakpoint
ALTER TABLE "portfolios" ADD COLUMN "status" text DEFAULT 'hidden' NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolios" ADD COLUMN "cover_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolios" ADD COLUMN "live_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolios" ADD COLUMN "repo_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolios" ADD COLUMN "tech_stack" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolios" ADD COLUMN "highlights" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolios" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "portfolios_public_rank_idx" ON "portfolios" USING btree ("status","ownership","featured_rank","sort_order");--> statement-breakpoint
UPDATE "portfolios" SET "ownership" = 'owner', "status" = 'published', "featured_rank" = 1, "is_featured" = true, "published_at" = COALESCE("published_at", "created_at") WHERE "slug" = 'clash-nexus';