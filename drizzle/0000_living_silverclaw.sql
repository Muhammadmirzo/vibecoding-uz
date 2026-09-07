CREATE TYPE "public"."course_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."drip_rule" AS ENUM('none', 'after_lesson', 'date');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('active', 'paused', 'finished', 'expelled');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('quiz', 'free_lesson', 'form', 'telegram', 'expert', 'referral', 'manual');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'consultation', 'pending', 'paid', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('payme', 'click', 'manual');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('submitted', 'reviewing', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."testimonial_type" AS ENUM('video', 'text');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('superadmin', 'admin', 'manager', 'mentor', 'student');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"user_email" text,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"details" jsonb,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"content_md" text NOT NULL,
	"cover_url" text,
	"author_name" text DEFAULT 'Vibecoding Team' NOT NULL,
	"category" text DEFAULT 'Vibe Coding' NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"status" text DEFAULT 'published' NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "broadcast_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"channel" text DEFAULT 'telegram' NOT NULL,
	"target_audience" text DEFAULT 'all_users' NOT NULL,
	"cohort_id" uuid,
	"message_body" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"recipients_count" integer DEFAULT 0 NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"code" text NOT NULL,
	"holder_name" text NOT NULL,
	"course_title" text NOT NULL,
	"final_score" numeric(4, 2) NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"pdf_url" text,
	CONSTRAINT "certificates_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cohorts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"name" text NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp,
	"seats" integer DEFAULT 30 NOT NULL,
	"price_sum" numeric(12, 2) NOT NULL,
	"early_price_sum" numeric(12, 2),
	"early_deadline" timestamp,
	"telegram_chat_id" text,
	"status" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text,
	"cover_url" text,
	"level" text DEFAULT 'Boshlang''ich',
	"duration_weeks" integer DEFAULT 8,
	"price_sum" numeric(12, 2) NOT NULL,
	"old_price_sum" numeric(12, 2),
	"installment_months" integer DEFAULT 3,
	"status" "course_status" DEFAULT 'published' NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"cohort_id" uuid NOT NULL,
	"status" "enrollment_status" DEFAULT 'active' NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"source" text,
	"certificate_code" text,
	"final_score" numeric(4, 2)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "experts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"tagline" text NOT NULL,
	"skills" text[],
	"grades_json" jsonb,
	"available_for_work" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'verified' NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "experts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" text DEFAULT 'Umumiy' NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "glossary_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"term_en" text NOT NULL,
	"term_uz" text NOT NULL,
	"definition" text NOT NULL,
	"category" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	CONSTRAINT "glossary_terms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "homework_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description_md" text NOT NULL,
	"acceptance_criteria" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "homework_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"mentor_id" uuid NOT NULL,
	"criteria_results" jsonb NOT NULL,
	"score" numeric(4, 2) NOT NULL,
	"feedback_md" text,
	"reviewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "homework_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"attempt_no" integer DEFAULT 1 NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "submission_status" DEFAULT 'submitted' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_openings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"department" text NOT NULL,
	"location" text DEFAULT 'Toshkent / Masofaviy' NOT NULL,
	"type" text DEFAULT 'To''liq stavka' NOT NULL,
	"description_md" text NOT NULL,
	"requirements" jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" varchar(20) NOT NULL,
	"source" "lead_source" DEFAULT 'form' NOT NULL,
	"quiz_answers" jsonb,
	"recommended_course_id" uuid,
	"utm" jsonb,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"assigned_manager_id" uuid,
	"next_contact_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lesson_progress" (
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"position_sec" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp,
	"last_seen_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"video_url" text,
	"video_hls_url" text,
	"duration_sec" integer DEFAULT 0,
	"content_md" text,
	"prompts_json" jsonb,
	"materials_json" jsonb,
	"is_free_preview" boolean DEFAULT false NOT NULL,
	"drip_rule" "drip_rule" DEFAULT 'none' NOT NULL,
	"drip_value" text,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "otp_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(20) NOT NULL,
	"code_hash" text NOT NULL,
	"purpose" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"enrollment_id" uuid,
	"provider" "payment_provider" NOT NULL,
	"provider_txn_id" text,
	"amount_sum" numeric(12, 2) NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"receipt_url" text,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"device" text,
	"ip" text,
	"user_agent" text,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"course_id" uuid,
	"type" "testimonial_type" DEFAULT 'text' NOT NULL,
	"video_url" text,
	"body" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"status" text DEFAULT 'approved' NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"birth_date" timestamp,
	"city" text,
	"profession" text,
	"goal" text,
	"source" text,
	"bio" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" text,
	"password_hash" text,
	"full_name" text NOT NULL,
	"avatar_url" text,
	"tg_user_id" text,
	"tg_username" text,
	"role" "user_role" DEFAULT 'student' NOT NULL,
	"locale" varchar(5) DEFAULT 'uz' NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "broadcast_notifications" ADD CONSTRAINT "broadcast_notifications_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "certificates" ADD CONSTRAINT "certificates_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_sections" ADD CONSTRAINT "course_sections_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "experts" ADD CONSTRAINT "experts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "homework_assignments" ADD CONSTRAINT "homework_assignments_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "homework_reviews" ADD CONSTRAINT "homework_reviews_submission_id_homework_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."homework_submissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "homework_reviews" ADD CONSTRAINT "homework_reviews_mentor_id_users_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "homework_submissions" ADD CONSTRAINT "homework_submissions_assignment_id_homework_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."homework_assignments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "homework_submissions" ADD CONSTRAINT "homework_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_recommended_course_id_courses_id_fk" FOREIGN KEY ("recommended_course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_manager_id_users_id_fk" FOREIGN KEY ("assigned_manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lessons" ADD CONSTRAINT "lessons_section_id_course_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."course_sections"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "courses_title_idx" ON "courses" USING btree ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "courses_status_idx" ON "courses" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "glossary_terms_uz_idx" ON "glossary_terms" USING btree ("term_uz");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "glossary_terms_en_idx" ON "glossary_terms" USING btree ("term_en");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "glossary_terms_cat_idx" ON "glossary_terms" USING btree ("category");