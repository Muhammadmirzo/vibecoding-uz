import { pgTable, text, timestamp, integer, uuid, varchar } from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums";

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
