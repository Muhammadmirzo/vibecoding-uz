import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, decimal, index } from "drizzle-orm/pg-core";
import { testimonialTypeEnum } from "./enums";
import { users } from "./users";
import { courses } from "./courses";
import { enrollments } from "./commercial";

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
  authorName: text("author_name").default("Naqsh jamoasi").notNull(),
  category: text("category").default("Vibe Coding").notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  status: text("status").default("published").notNull(),
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
