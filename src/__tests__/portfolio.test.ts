import { describe, it, expect } from "vitest";
import { portfolioSchema } from "@/lib/validations/portfolio";
import { PORTFOLIO_DATA } from "@/features/portfolio/portfolioData";
import {
  resolvePortfolioImageUrl,
  generatePlaceholderSvg,
} from "@/features/portfolio/portfolioUtils";

describe("Portfolio Module Tests", () => {
  describe("Zod Portfolio Validation Schema", () => {
    it("should validate a correct portfolio object with imageUrl", () => {
      const validData = {
        title: "EduBaza",
        slug: "edubaza",
        url: "https://edubaza.uz",
        domain: "edubaza.uz",
        category: "EdTech",
        description: "O'qituvchilar uchun platforma",
        imageUrl: "https://edubaza.uz/og-image.png",
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

    it("should allow empty imageUrl and default to empty string", () => {
      const validWithoutImage = {
        title: "Chatla",
        slug: "chatla",
        url: "https://chatla.uz",
        domain: "chatla.uz",
        category: "B2B SaaS",
        description: "AI bot xizmati",
      };

      const result = portfolioSchema.safeParse(validWithoutImage);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.imageUrl).toBe("");
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
      };

      const result = portfolioSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("Portfolio Image & Fallback Utilities", () => {
    it("should resolve valid external HTTP image URL as-is", () => {
      const customUrl = "https://edubaza.uz/static/og-banner.jpg";
      const resolved = resolvePortfolioImageUrl({
        url: "https://edubaza.uz",
        imageUrl: customUrl,
      });
      expect(resolved).toBe(customUrl);
    });

    it("should resolve empty or local illustration imageUrl to empty string (triggering fallback mockup)", () => {
      const resolvedEmpty = resolvePortfolioImageUrl({
        url: "https://edubaza.uz",
        imageUrl: "",
      });
      expect(resolvedEmpty).toBe("");

      const resolvedLocal = resolvePortfolioImageUrl({
        url: "https://edubaza.uz",
        imageUrl: "/illustrations/founder/edubaza.webp",
      });
      expect(resolvedLocal).toBe("");
    });

    it("should generate a valid SVG data URI placeholder", () => {
      const svgUri = generatePlaceholderSvg("EduBaza", "edubaza.uz");
      expect(svgUri).toContain("data:image/svg+xml");
      expect(svgUri).toContain("edubaza.uz");
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
        expect(item.category).toBeDefined();
      });
    });
  });
});
