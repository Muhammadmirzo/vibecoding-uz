import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  uuid,
  decimal,
  varchar,
  index,
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", ["superadmin", "admin", "manager", "mentor", "student"]);
export const courseStatusEnum = pgEnum("course_status", ["draft", "published", "archived"]);
export const dripRuleEnum = pgEnum("drip_rule", ["none", "after_lesson", "date"]);
export const submissionStatusEnum = pgEnum("submission_status", ["submitted", "reviewing", "approved", "rejected"]);
export const paymentProviderEnum = pgEnum("payment_provider", ["payme", "click", "manual"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", ["active", "paused", "finished", "expelled"]);
export const leadSourceEnum = pgEnum("lead_source", ["quiz", "free_lesson", "form", "telegram", "expert", "referral", "manual"]);
export const leadStatusEnum = pgEnum("lead_status", ["new", "contacted", "consultation", "pending", "paid", "rejected", "cancelled"]);
export const testimonialTypeEnum = pgEnum("testimonial_type", ["video", "text"]);

// 1. Users & Auth
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  email: text("email"),
  passwordHash: text("password_hash"),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  tgUserId: text("tg_user_id"),
  tgUsername: text("tg_username"),
  role: userRoleEnum("role").default("student").notNull(),
  locale: varchar("locale", { length: 5 }).default("uz").notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  birthDate: timestamp("birth_date"),
  city: text("city"),
  profession: text("profession"),
  goal: text("goal"),
  source: text("source"),
  bio: text("bio"),
});

export const otpCodes = pgTable("otp_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: varchar("phone", { length: 20 }).notNull(),
  codeHash: text("code_hash").notNull(),
  purpose: text("purpose").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  device: text("device"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
});

// 2. Courses & LMS Curriculum
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  coverUrl: text("cover_url"),
  level: text("level").default("Boshlang'ich"),
  durationWeeks: integer("duration_weeks").default(8),
  priceSum: decimal("price_sum", { precision: 12, scale: 2 }).notNull(),
  oldPriceSum: decimal("old_price_sum", { precision: 12, scale: 2 }),
  installmentMonths: integer("installment_months").default(3),
  status: courseStatusEnum("status").default("published").notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("courses_title_idx").on(table.title),
  index("courses_status_idx").on(table.status),
]);

export const courseSections = pgTable("course_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
});

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  sectionId: uuid("section_id").references(() => courseSections.id, { onDelete: "cascade" }).notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  videoUrl: text("video_url"),
  videoHlsUrl: text("video_hls_url"),
  durationSec: integer("duration_sec").default(0),
  contentMd: text("content_md"),
  promptsJson: jsonb("prompts_json"),
  materialsJson: jsonb("materials_json"),
  isFreePreview: boolean("is_free_preview").default(false).notNull(),
  dripRule: dripRuleEnum("drip_rule").default("none").notNull(),
  dripValue: text("drip_value"),
  sortOrder: integer("sort_order").default(0),
});

export const homeworkAssignments = pgTable("homework_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  descriptionMd: text("description_md").notNull(),
  acceptanceCriteria: jsonb("acceptance_criteria").notNull(), // [{ criterion: string, weight: number }]
});

export const homeworkSubmissions = pgTable("homework_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignmentId: uuid("assignment_id").references(() => homeworkAssignments.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  attemptNo: integer("attempt_no").default(1).notNull(),
  payload: jsonb("payload").notNull(), // { fileUrls: string[], githubUrl?: string, note?: string }
  status: submissionStatusEnum("status").default("submitted").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const homeworkReviews = pgTable("homework_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").references(() => homeworkSubmissions.id, { onDelete: "cascade" }).notNull(),
  mentorId: uuid("mentor_id").references(() => users.id).notNull(),
  criteriaResults: jsonb("criteria_results").notNull(),
  score: decimal("score", { precision: 4, scale: 2 }).notNull(),
  feedbackMd: text("feedback_md"),
  reviewedAt: timestamp("reviewed_at").defaultNow().notNull(),
});

export const lessonProgress = pgTable("lesson_progress", {
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
  positionSec: integer("position_sec").default(0).notNull(),
  completedAt: timestamp("completed_at"),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
});

// 3. Cohorts & Commercial Sales
export const cohorts = pgTable("cohorts", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at"),
  seats: integer("seats").default(30).notNull(),
  priceSum: decimal("price_sum", { precision: 12, scale: 2 }).notNull(),
  earlyPriceSum: decimal("early_price_sum", { precision: 12, scale: 2 }),
  earlyDeadline: timestamp("early_deadline"),
  telegramChatId: text("telegram_chat_id"),
  status: text("status").default("active").notNull(),
});

export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  cohortId: uuid("cohort_id").references(() => cohorts.id, { onDelete: "cascade" }).notNull(),
  status: enrollmentStatusEnum("status").default("active").notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  source: text("source"),
  certificateCode: text("certificate_code"),
  finalScore: decimal("final_score", { precision: 4, scale: 2 }),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  enrollmentId: uuid("enrollment_id").references(() => enrollments.id),
  provider: paymentProviderEnum("provider").notNull(),
  providerTxnId: text("provider_txn_id"),
  amountSum: decimal("amount_sum", { precision: 12, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  paidAt: timestamp("paid_at"),
  receiptUrl: text("receipt_url"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. CRM Leads Pipeline
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  source: leadSourceEnum("source").default("form").notNull(),
  quizAnswers: jsonb("quiz_answers"),
  recommendedCourseId: uuid("recommended_course_id").references(() => courses.id),
  utm: jsonb("utm"),
  status: leadStatusEnum("status").default("new").notNull(),
  assignedManagerId: uuid("assigned_manager_id").references(() => users.id),
  nextContactAt: timestamp("next_contact_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. SEO, Content & Trust proof
export const certificates = pgTable("certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  enrollmentId: uuid("enrollment_id").references(() => enrollments.id).notNull(),
  code: text("code").notNull().unique(),
  holderName: text("holder_name").notNull(),
  courseTitle: text("course_title").notNull(),
  finalScore: decimal("final_score", { precision: 4, scale: 2 }).notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  pdfUrl: text("pdf_url"),
});

export const experts = pgTable("experts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  slug: text("slug").notNull().unique(),
  tagline: text("tagline").notNull(),
  skills: text("skills").array(),
  gradesJson: jsonb("grades_json"),
  availableForWork: boolean("available_for_work").default(true).notNull(),
  status: text("status").default("verified").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  courseId: uuid("course_id").references(() => courses.id),
  type: testimonialTypeEnum("type").default("text").notNull(),
  videoUrl: text("video_url"),
  body: text("body").notNull(),
  rating: integer("rating").default(5).notNull(),
  status: text("status").default("approved").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

export const glossaryTerms = pgTable("glossary_terms", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  termEn: text("term_en").notNull(),
  termUz: text("term_uz").notNull(),
  definition: text("definition").notNull(),
  category: text("category").notNull(),
  sortOrder: integer("sort_order").default(0),
}, (table) => [
  index("glossary_terms_uz_idx").on(table.termUz),
  index("glossary_terms_en_idx").on(table.termEn),
  index("glossary_terms_cat_idx").on(table.category),
]);

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  contentMd: text("content_md").notNull(),
  coverUrl: text("cover_url"),
  authorName: text("author_name").default("Mirzo Academy Team").notNull(),
  category: text("category").default("Vibe Coding").notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  status: text("status").default("published").notNull(), // draft, published, scheduled, archived
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const broadcastNotifications = pgTable("broadcast_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  channel: text("channel").default("telegram").notNull(), // telegram, email, sms, all
  targetAudience: text("target_audience").default("all_users").notNull(), // all_users, active_students, leads_new, leads_consultation, cohort_students
  cohortId: uuid("cohort_id").references(() => cohorts.id, { onDelete: "set null" }),
  messageBody: text("message_body").notNull(),
  status: text("status").default("draft").notNull(), // draft, sent, failed
  recipientsCount: integer("recipients_count").default(0).notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  userEmail: text("user_email"),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").default("Umumiy").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobOpenings = pgTable("job_openings", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  location: text("location").default("Toshkent / Masofaviy").notNull(),
  type: text("type").default("To'liq stavka").notNull(),
  descriptionMd: text("description_md").notNull(),
  requirements: jsonb("requirements"),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

