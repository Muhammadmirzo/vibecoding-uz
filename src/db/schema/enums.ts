import { pgEnum } from "drizzle-orm/pg-core";

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
