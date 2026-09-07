import { describe, it, expect, vi } from "vitest";
import fs from "fs";
import path from "path";
import {
  sendSmsSchema,
  sendOtpSmsSchema,
  sendEmailSchema,
  welcomeEmailSchema,
  dripUnlockEmailSchema,
  cronTriggerSchema,
  cronResultSchema,
  searchQuerySchema,
  searchItemSchema,
} from "@/lib/validations";
import { sendSms, sendOtpSms, normalizePhoneForEskiz } from "@/lib/sms/eskiz";
import { sendEmail, sendWelcomeEmail, sendDripUnlockEmail } from "@/lib/email/resend";

// Mock global fetch for testing provider adapters
global.fetch = vi.fn();

describe("Infrastructure Integrations: SMS, Email, Cron, Search & PWA", () => {
  describe("1. SMS Provider (Eskiz.uz Adapter & Validations)", () => {
    it("normalizes Uzbek phone numbers correctly for Eskiz", () => {
      expect(normalizePhoneForEskiz("+998 90 123-45-67")).toBe("998901234567");
      expect(normalizePhoneForEskiz("901234567")).toBe("998901234567");
      expect(normalizePhoneForEskiz("8901234567")).toBe("998901234567");
    });

    it("validates sendSms schema", () => {
      const valid = sendSmsSchema.parse({
        phone: "+998901234567",
        message: "Test SMS message",
      });
      expect(valid.phone).toBe("+998901234567");
      expect(() => sendSmsSchema.parse({ phone: "", message: "" })).toThrow();
    });

    it("validates sendOtpSms schema", () => {
      const valid = sendOtpSmsSchema.parse({
        phone: "998901234567",
        code: "7788",
      });
      expect(valid.code).toBe("7788");
      expect(() => sendOtpSmsSchema.parse({ phone: "123", code: "1" })).toThrow();
    });

    it("sends SMS in mock mode when Eskiz env vars are missing", async () => {
      const res = await sendSms({
        phone: "+998901234567",
        message: "Hello Vibecoding",
      });
      expect(res.success).toBe(true);
      expect(res.mock).toBe(true);
      expect(res.messageId).toBeDefined();
    });

    it("sends OTP SMS in mock mode", async () => {
      const res = await sendOtpSms({
        phone: "+998901234567",
        code: "123456",
      });
      expect(res.success).toBe(true);
      expect(res.mock).toBe(true);
    });
  });

  describe("2. Email Provider (Resend Adapter & Validations)", () => {
    it("validates sendEmail schema", () => {
      const valid = sendEmailSchema.parse({
        to: "student@example.com",
        subject: "Xush kelibsiz",
        html: "<p>Salom</p>",
      });
      expect(valid.to).toBe("student@example.com");
      expect(() => sendEmailSchema.parse({ to: "invalid-email", subject: "", html: "" })).toThrow();
    });

    it("validates welcomeEmail and dripUnlockEmail schemas", () => {
      const welcome = welcomeEmailSchema.parse({
        to: "user@test.uz",
        fullName: "Jasur Rahimov",
        courseTitle: "Vibe Coding Express",
      });
      expect(welcome.fullName).toBe("Jasur Rahimov");

      const drip = dripUnlockEmailSchema.parse({
        to: "user@test.uz",
        fullName: "Jasur Rahimov",
        lessonTitle: "1-dars: Claude Code O'rnatish",
        lessonUrl: "https://vibecoding.uz/kabinet",
      });
      expect(drip.lessonTitle).toBe("1-dars: Claude Code O'rnatish");
    });

    it("sends email in mock mode when RESEND_API_KEY is missing", async () => {
      const res = await sendEmail({
        to: "test@vibecoding.uz",
        subject: "Sinov xati",
        html: "<p>Test</p>",
      });
      expect(res.success).toBe(true);
      expect(res.mock).toBe(true);
      expect(res.id).toBeDefined();
    });

    it("sends welcome email in mock mode", async () => {
      const res = await sendWelcomeEmail({
        to: "test@vibecoding.uz",
        fullName: "Anvar Karimov",
      });
      expect(res.success).toBe(true);
      expect(res.mock).toBe(true);
    });

    it("sends drip unlock email in mock mode", async () => {
      const res = await sendDripUnlockEmail({
        to: "test@vibecoding.uz",
        fullName: "Anvar Karimov",
        lessonTitle: "Prompting texnikalari",
        lessonUrl: "https://vibecoding.uz/kabinet",
      });
      expect(res.success).toBe(true);
      expect(res.mock).toBe(true);
    });
  });

  describe("3. Cron Job Reminders Validations", () => {
    it("validates cron trigger parameters", () => {
      const valid = cronTriggerSchema.parse({
        action: "drip",
      });
      expect(valid.action).toBe("drip");

      const defaultParsed = cronTriggerSchema.parse({});
      expect(defaultParsed.action).toBe("all");
    });

    it("validates cron result schema", () => {
      const result = cronResultSchema.parse({
        success: true,
        timestamp: new Date().toISOString(),
        dripUnlocksProcessed: 2,
        homeworkAlertsSent: 5,
        inactivityNudgesSent: 1,
        details: {
          dripNotifications: ["User 1 -> Lesson 1"],
          homeworkAlerts: ["User 2 -> HW 1"],
          inactivityNudges: ["User 3"],
        },
      });
      expect(result.success).toBe(true);
      expect(result.dripUnlocksProcessed).toBe(2);
    });
  });

  describe("4. Global Search Validations", () => {
    it("validates searchQuerySchema", () => {
      const valid = searchQuerySchema.parse({
        q: "Claude Code",
        category: "courses",
        limit: 10,
      });
      expect(valid.q).toBe("Claude Code");
      expect(valid.category).toBe("courses");

      expect(() => searchQuerySchema.parse({ q: "" })).toThrow();
    });

    it("validates searchItemSchema", () => {
      const item = searchItemSchema.parse({
        id: "c-1",
        title: "Vibe Coding Express",
        subtitle: "8 haftalik intensiv",
        category: "course",
        url: "/kurs/vibe-coding-express",
        badge: "Kurs",
      });
      expect(item.category).toBe("course");
      expect(item.url).toBe("/kurs/vibe-coding-express");
    });
  });

  describe("5. PWA Manifest & Service Worker Verification", () => {
    it("verifies public/manifest.json exists and is valid JSON", () => {
      const manifestPath = path.join(process.cwd(), "public", "manifest.json");
      expect(fs.existsSync(manifestPath)).toBe(true);

      const content = fs.readFileSync(manifestPath, "utf-8");
      const parsed = JSON.parse(content);
      expect(parsed.name).toContain("Mirzo Academy");
      expect(parsed.start_url).toBe("/");
      expect(parsed.display).toBe("standalone");
    });

    it("verifies public/sw.js exists and contains ServiceWorker logic", () => {
      const swPath = path.join(process.cwd(), "public", "sw.js");
      expect(fs.existsSync(swPath)).toBe(true);

      const content = fs.readFileSync(swPath, "utf-8");
      expect(content).toContain("vibecoding-v1");
      expect(content).toContain("addEventListener(\"install\"");
      expect(content).toContain("addEventListener(\"fetch\"");
    });
  });
});
