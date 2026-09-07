import { describe, it, expect } from "vitest";
import {
  checkRefundEligibility,
  GUARANTEE_DAYS,
  MAX_ALLOWED_MODULES_FOR_REFUND,
  RefundEligibilityParams,
} from "../lib/refund";

describe("100% Money-Back Guarantee Refund Eligibility", () => {
  const BASE_PRICE = 1200000;
  const NOW = new Date("2026-09-07T12:00:00Z");

  const createParams = (
    daysAgo: number,
    completedModules: number,
    status: RefundEligibilityParams["paymentStatus"] = "paid"
  ): RefundEligibilityParams => {
    const enrolledAt = new Date(NOW.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return {
      enrolledAt,
      completedModulesCount: completedModules,
      paymentStatus: status,
      amountSum: BASE_PRICE,
      now: NOW,
    };
  };

  describe("7-Day Time Window Rule", () => {
    it("should grant 100% refund on same day of enrollment (0 days)", () => {
      const params = createParams(0, 1);
      const result = checkRefundEligibility(params);

      expect(result.eligible).toBe(true);
      expect(result.reason).toBe("ELIGIBLE");
      expect(result.refundAmount).toBe(BASE_PRICE);
      expect(result.daysRemaining).toBe(7);
    });

    it("should grant 100% refund on day 3 of enrollment", () => {
      const params = createParams(3, 2);
      const result = checkRefundEligibility(params);

      expect(result.eligible).toBe(true);
      expect(result.reason).toBe("ELIGIBLE");
      expect(result.refundAmount).toBe(BASE_PRICE);
      expect(result.daysRemaining).toBe(4);
    });

    it("should grant refund exactly at day 7 bound", () => {
      const params = createParams(7, 2);
      const result = checkRefundEligibility(params);

      expect(result.eligible).toBe(true);
      expect(result.reason).toBe("ELIGIBLE");
      expect(result.refundAmount).toBe(BASE_PRICE);
    });

    it("should reject refund request after 7 days (day 8)", () => {
      const params = createParams(8, 1);
      const result = checkRefundEligibility(params);

      expect(result.eligible).toBe(false);
      expect(result.reason).toBe("EXPIRED_7_DAYS");
      expect(result.refundAmount).toBe(0);
      expect(result.daysRemaining).toBe(0);
      expect(result.message).toContain("7 kunlik kafolat muddati o'tgan");
    });
  });

  describe("First 2 Modules Completion Constraint", () => {
    it("should allow refund if student completed 0 modules", () => {
      const params = createParams(2, 0);
      const result = checkRefundEligibility(params);

      expect(result.eligible).toBe(true);
      expect(result.reason).toBe("ELIGIBLE");
      expect(result.refundAmount).toBe(BASE_PRICE);
    });

    it("should allow refund if student completed 1 module", () => {
      const params = createParams(4, 1);
      const result = checkRefundEligibility(params);

      expect(result.eligible).toBe(true);
      expect(result.reason).toBe("ELIGIBLE");
    });

    it("should allow refund if student completed exactly 2 modules", () => {
      const params = createParams(5, 2);
      const result = checkRefundEligibility(params);

      expect(result.eligible).toBe(true);
      expect(result.reason).toBe("ELIGIBLE");
    });

    it("should reject refund if student completed 3 modules (exceeded limit)", () => {
      const params = createParams(3, 3);
      const result = checkRefundEligibility(params);

      expect(result.eligible).toBe(false);
      expect(result.reason).toBe("EXCEEDED_MODULE_LIMIT");
      expect(result.refundAmount).toBe(0);
      expect(result.message).toContain("2 tadan ortiq modul");
    });

    it("should reject refund if student completed 5 modules even within 7 days", () => {
      const params = createParams(1, 5);
      const result = checkRefundEligibility(params);

      expect(result.eligible).toBe(false);
      expect(result.reason).toBe("EXCEEDED_MODULE_LIMIT");
    });
  });

  describe("Combined Edge Cases & Payment Status Checks", () => {
    it("should reject refund if payment is pending or unpaid", () => {
      const params = createParams(2, 1, "pending");
      const result = checkRefundEligibility(params);

      expect(result.eligible).toBe(false);
      expect(result.reason).toBe("NOT_PAID");
    });

    it("should reject refund if already refunded", () => {
      const params = createParams(2, 1, "refunded");
      const result = checkRefundEligibility(params);

      expect(result.eligible).toBe(false);
      expect(result.reason).toBe("ALREADY_REFUNDED");
    });

    it("should enforce precedence of 7-day rule over module limit", () => {
      const params = createParams(10, 5);
      const result = checkRefundEligibility(params);

      expect(result.eligible).toBe(false);
      expect(result.reason).toBe("EXPIRED_7_DAYS");
    });

    it("should check default constants values", () => {
      expect(GUARANTEE_DAYS).toBe(7);
      expect(MAX_ALLOWED_MODULES_FOR_REFUND).toBe(2);
    });
  });
});
