import { describe, it, expect } from "vitest";
import { portfolioSchema } from "@/lib/validations/portfolio";
import { PORTFOLIO_DATA } from "@/features/portfolio/portfolioData";

describe("Portfolio Module Tests", () => {
  describe("Zod Portfolio Validation Schema", () => {
    it("should validate a correct portfolio object", () => {
      const validData = {
        title: "EduBaza",
        slug: "edubaza",
        url: "https://edubaza.uz",
        domain: "edubaza.uz",
        category: "EdTech",
        description: "O'qituvchilar uchun platforma",
        imageUrl: "/illustrations/founder/edubaza.webp",
        userCount: "27 000+ o'qituvchi foydalanadi",
        badgeText: "Shu metod bilan qurilgan",
        isFeatured: true,
        sortOrder: 1,
      };

      const result = portfolioSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("EduBaza");
        expect(result.data.category).toBe("EdTech");
      }
    });

    it("should fail validation for invalid category enum", () => {
      const invalidData = {
        title: "EduBaza",
        slug: "edubaza",
        url: "https://edubaza.uz",
        domain: "edubaza.uz",
        category: "InvalidCategory",
        description: "O'qituvchilar uchun platforma",
        imageUrl: "/illustrations/founder/edubaza.webp",
      };

      const result = portfolioSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should fail validation for invalid slug format", () => {
      const invalidData = {
        title: "EduBaza",
        slug: "EduBaza Slug Invalid!",
        url: "https://edubaza.uz",
        domain: "edubaza.uz",
        category: "EdTech",
        description: "O'qituvchilar uchun platforma",
        imageUrl: "/illustrations/founder/edubaza.webp",
      };

      const result = portfolioSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("Portfolio Seed Data Verification", () => {
    it("should contain 8 realistic portfolio items", () => {
      expect(PORTFOLIO_DATA.length).toBeGreaterThanOrEqual(8);
    });

    it("should contain required fields for all seed items", () => {
      PORTFOLIO_DATA.forEach((item) => {
        expect(item.id).toBeDefined();
        expect(item.title).toBeDefined();
        expect(item.domain).toBeDefined();
        expect(item.url).toBeDefined();
        expect(item.imageUrl).toBeDefined();
      });
    });
  });
});
