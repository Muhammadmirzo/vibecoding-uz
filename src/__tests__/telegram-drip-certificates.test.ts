import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  tgAuthLinkSchema,
  operatorHandoffSchema,
  homeworkAlertSchema,
  meetReminderSchema,
  checkLessonAccessSchema,
  generateCertificateSchema,
} from "../lib/validations";
import { generateCertificatePdf, generateUniqueCertificateCode } from "../lib/certificates/generator";
import { linkTelegramAccount, handleOperatorHandoff } from "../lib/telegram/bot";

// Mock DB module for unit testing
vi.mock("@/db", () => {
  return {
    db: {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
    },
  };
});

describe("Telegram Bot & LMS Drip & Certificate Generator", () => {
  describe("Zod Validations", () => {
    it("validates Telegram auth link schema correctly", () => {
      const valid = tgAuthLinkSchema.parse({
        tgUserId: "123456789",
        tgUsername: "testuser",
        phone: "+998901234567",
      });
      expect(valid.tgUserId).toBe("123456789");
      expect(valid.phone).toBe("+998901234567");

      expect(() => tgAuthLinkSchema.parse({ tgUserId: "" })).toThrow();
    });

    it("validates homework alert schema", () => {
      const valid = homeworkAlertSchema.parse({
        submissionId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        userId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
        assignmentTitle: "Next.js App Router Integration",
        status: "approved",
        score: 9.5,
        feedbackMd: "Ajoyib topshiriq!",
      });

      expect(valid.status).toBe("approved");
      expect(valid.score).toBe(9.5);
    });

    it("validates meet reminder schema", () => {
      const valid = meetReminderSchema.parse({
        chatId: "-100123456789",
        title: "Live Q&A Session",
        startsAt: "2026-09-10T18:00:00Z",
        meetingUrl: "https://zoom.us/j/123456789",
      });

      expect(valid.title).toBe("Live Q&A Session");
    });

    it("validates drip check schema", () => {
      const valid = checkLessonAccessSchema.parse({
        userId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
        lessonId: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
      });

      expect(valid.userId).toBe("b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22");
    });
  });

  describe("Certificate Generator", () => {
    it("generates a unique certificate code in correct format", () => {
      const code = generateUniqueCertificateCode();
      expect(code).toMatch(/^VIBE-\d{4}-[A-Z0-9]{5}$/);
    });

    it("generates a valid PDF buffer with student credentials", async () => {
      const pdfBuffer = await generateCertificatePdf({
        holderName: "Alisher Navoiy",
        courseTitle: "AI Vibecoding Masterclass",
        finalScore: 9.8,
        code: "VIBE-2026-TEST1",
      });

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.length).toBeGreaterThan(1000);
      // PDF header magic bytes %PDF-
      const header = pdfBuffer.toString("utf-8", 0, 5);
      expect(header).toBe("%PDF-");
    });
  });

  describe("Telegram Bot Handlers", () => {
    it("handles operator handoff response gracefully", async () => {
      const res = await handleOperatorHandoff({
        tgUserId: "99887766",
        tgUsername: "operator_test",
        userFullName: "Bekzod Rahimov",
      });

      expect(res.success).toBe(true);
      expect(res.message).toContain("Operator bilan bog'lanish");
    });
  });
});
