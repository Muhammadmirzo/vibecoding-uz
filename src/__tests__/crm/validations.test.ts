import { describe, it, expect } from "vitest";
import {
  createLeadSchema,
  updateLeadStatusSchema,
  createCohortSchema,
  gradeHomeworkSchema,
  analyticsQuerySchema,
} from "../../lib/validations/crm";

describe("CRM Zod Schema Validations", () => {
  describe("createLeadSchema", () => {
    it("should accept valid lead creation input", () => {
      const validLead = {
        name: "Jamshid Alimov",
        phone: "+998901234567",
        source: "quiz" as const,
        status: "new" as const,
      };
      const result = createLeadSchema.safeParse(validLead);
      expect(result.success).toBe(true);
    });

    it("should reject lead with short name", () => {
      const result = createLeadSchema.safeParse({
        name: "J",
        phone: "+998901234567",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateLeadStatusSchema", () => {
    it("should accept valid lead statuses", () => {
      const statuses = ["new", "contacted", "consultation", "paid", "rejected", "cancelled"] as const;
      for (const status of statuses) {
        const result = updateLeadStatusSchema.safeParse({ status });
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid lead status", () => {
      const result = updateLeadStatusSchema.safeParse({ status: "invalid_status" });
      expect(result.success).toBe(false);
    });
  });

  describe("createCohortSchema", () => {
    it("should accept valid cohort input", () => {
      const validCohort = {
        courseId: "123e4567-e89b-12d3-a456-426614174000",
        name: "Noyabr Guruhi",
        startsAt: "2026-11-01",
        seats: 25,
        priceSum: "2990000",
        earlyPriceSum: "2490000",
        earlyDeadline: "2026-10-25T23:59:59Z",
      };
      const result = createCohortSchema.safeParse(validCohort);
      expect(result.success).toBe(true);
    });

    it("should reject cohort without courseId or name", () => {
      const result = createCohortSchema.safeParse({
        startsAt: "2026-11-01",
        priceSum: "2990000",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("gradeHomeworkSchema", () => {
    it("should accept valid homework grading payload", () => {
      const validGrade = {
        submissionId: "123e4567-e89b-12d3-a456-426614174000",
        criteriaResults: [
          { criterion: "AI Prompt samaradorligi", score: 9, maxScore: 10 },
          { criterion: "Kod arxitekturasi", score: 8, maxScore: 10 },
        ],
        score: 8.5,
        feedbackMd: "Ajoyib ish!",
        status: "approved" as const,
      };
      const result = gradeHomeworkSchema.safeParse(validGrade);
      expect(result.success).toBe(true);
    });

    it("should reject out of bound score (> 10)", () => {
      const result = gradeHomeworkSchema.safeParse({
        submissionId: "123e4567-e89b-12d3-a456-426614174000",
        criteriaResults: [{ criterion: "Test", score: 12, maxScore: 10 }],
        score: 11,
        status: "approved",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("analyticsQuerySchema", () => {
    it("should accept valid analytics periods", () => {
      const periods = ["7d", "30d", "90d", "1y", "all"] as const;
      for (const period of periods) {
        const result = analyticsQuerySchema.safeParse({ period });
        expect(result.success).toBe(true);
      }
    });
  });
});
