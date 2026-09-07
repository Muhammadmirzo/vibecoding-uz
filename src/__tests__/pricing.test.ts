import { describe, it, expect } from "vitest";
import {
  calculateCoursePricing,
  formatUzbekSum,
  applyPromoCode,
  calculateInstallmentPlan,
} from "../lib/pricing";

describe("Course Pricing & Installment Calculation", () => {
  const NOW = new Date("2026-09-07T12:00:00Z");

  describe("calculateCoursePricing", () => {
    it("should calculate standard course pricing with old price discount", () => {
      const pricing = calculateCoursePricing({
        priceSum: 1200000,
        oldPriceSum: 1500000,
        installmentMonths: 3,
        now: NOW,
      });

      expect(pricing.effectivePrice).toBe(1200000);
      expect(pricing.originalPrice).toBe(1500000);
      expect(pricing.savingsSum).toBe(300000);
      expect(pricing.discountPercentage).toBe(20);
      expect(pricing.monthlyInstallment).toBe(400000);
      expect(pricing.isEarlyBirdActive).toBe(false);
    });

    it("should apply early bird pricing when deadline is in the future", () => {
      const futureDeadline = new Date("2026-09-15T23:59:59Z");
      const pricing = calculateCoursePricing({
        priceSum: 1500000,
        oldPriceSum: 2000000,
        earlyPriceSum: 1000000,
        earlyDeadline: futureDeadline,
        installmentMonths: 3,
        now: NOW,
      });

      expect(pricing.isEarlyBirdActive).toBe(true);
      expect(pricing.effectivePrice).toBe(1000000);
      expect(pricing.originalPrice).toBe(2000000);
      expect(pricing.savingsSum).toBe(1000000);
      expect(pricing.discountPercentage).toBe(50);
      expect(pricing.monthlyInstallment).toBe(333334); // Math.ceil(1000000 / 3)
    });

    it("should fallback to standard price when early bird deadline is passed", () => {
      const pastDeadline = new Date("2026-09-01T23:59:59Z");
      const pricing = calculateCoursePricing({
        priceSum: 1500000,
        oldPriceSum: 2000000,
        earlyPriceSum: 1000000,
        earlyDeadline: pastDeadline,
        installmentMonths: 3,
        now: NOW,
      });

      expect(pricing.isEarlyBirdActive).toBe(false);
      expect(pricing.effectivePrice).toBe(1500000);
      expect(pricing.savingsSum).toBe(500000);
    });
  });

  describe("formatUzbekSum", () => {
    it("should format amounts into Uzbek Soum currency string", () => {
      expect(formatUzbekSum(1200000)).toBe("1 200 000 so'm");
      expect(formatUzbekSum(50000)).toBe("50 000 so'm");
      expect(formatUzbekSum(0)).toBe("0 so'm");
    });
  });

  describe("applyPromoCode", () => {
    it("should apply percentage discount promo code VIBE20", () => {
      const res = applyPromoCode({ priceSum: 1000000, code: "vibe20" });

      expect(res.valid).toBe(true);
      expect(res.discountAmount).toBe(200000);
      expect(res.finalPrice).toBe(800000);
    });

    it("should apply fixed sum discount promo code UZB100K", () => {
      const res = applyPromoCode({ priceSum: 1000000, code: "UZB100K" });

      expect(res.valid).toBe(true);
      expect(res.discountAmount).toBe(100000);
      expect(res.finalPrice).toBe(900000);
    });

    it("should reject invalid promo codes", () => {
      const res = applyPromoCode({ priceSum: 1000000, code: "INVALID99" });

      expect(res.valid).toBe(false);
      expect(res.discountAmount).toBe(0);
      expect(res.finalPrice).toBe(1000000);
    });
  });

  describe("calculateInstallmentPlan", () => {
    it("should split total sum accurately into monthly installments", () => {
      const plan = calculateInstallmentPlan(1200000, 3);

      expect(plan.monthsCount).toBe(3);
      expect(plan.monthlyAmount).toBe(400000);
      expect(plan.totalAmount).toBe(1200000);
    });
  });
});
