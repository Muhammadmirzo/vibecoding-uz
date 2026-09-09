import { describe, it, expect } from "vitest";
import { portfolioSchema } from "@/lib/validations/portfolio";
import { PORTFOLIO_DATA } from "@/features/portfolio/portfolioData";
import {
  getWebsiteScreenshotUrl,
  resolvePortfolioImageUrl,
} from "@/features/portfolio/portfolioUtils";

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
        imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fedubaza.uz?w=1200&h=750",
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
        imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fedubaza.uz?w=1200&h=750",
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
        imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fedubaza.uz?w=1200&h=750",
      };

      const result = portfolioSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("Portfolio Screenshot Utilities", () => {
    it("should generate a valid WordPress mshots URL", () => {
      const url = getWebsiteScreenshotUrl("https://edubaza.uz");
      expect(url).toContain("https://s.wordpress.com/mshots/v1/");
      expect(url).toContain(encodeURIComponent("https://edubaza.uz"));
    });

    it("should resolve missing/illustration imageUrl to website screenshot URL", () => {
      const resolved = resolvePortfolioImageUrl({
        url: "https://edubaza.uz",
        imageUrl: "/illustrations/founder/edubaza.webp",
      });
      expect(resolved).toContain("s.wordpress.com/mshots/v1/");
    });

    it("should preserve custom valid HTTP image URL", () => {
      const customUrl = "https://images.unsplash.com/photo-1555066931";
      const resolved = resolvePortfolioImageUrl({
        url: "https://edubaza.uz",
        imageUrl: customUrl,
      });
      expect(resolved).toBe(customUrl);
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
        expect(item.imageUrl).toContain("s.wordpress.com/mshots/v1/");
      });
    });
  });
});
