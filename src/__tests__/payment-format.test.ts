import { describe, expect, it } from "vitest";
import {
  computeInstallmentProgress,
  formatDate,
  formatUzs,
  statusLabel,
} from "../features/payments/format";

describe("payment formatters", () => {
  it("groups UZS amounts", () => {
    expect(formatUzs(550000)).toBe("550 000 so'm");
    expect(formatUzs("1250000")).toBe("1 250 000 so'm");
  });

  it("rounds fractional amounts to whole so'm", () => {
    expect(formatUzs(183333.5)).toBe("183 334 so'm");
    expect(formatUzs(183333.49)).toBe("183 333 so'm");
  });

  it("formats zero and invalid amounts safely", () => {
    expect(formatUzs(0)).toBe("0 so'm");
    expect(formatUzs("not-a-number")).toBe("0 so'm");
  });

  it("formats valid ISO dates", () => {
    expect(formatDate("2026-09-24T10:30:00.000Z")).toMatch(/2026/);
  });

  it("handles an invalid date honestly", () => {
    expect(formatDate("invalid")).toBe("—");
  });

  it("labels every payment status", () => {
    expect(statusLabel("paid")).toBe("To'langan");
    expect(statusLabel("pending")).toBe("Kutilmoqda");
    expect(statusLabel("failed")).toBe("Muvaffaqiyatsiz");
    expect(statusLabel("refunded")).toBe("Qaytarilgan");
  });
});

describe("computeInstallmentProgress", () => {
  it("returns 0 percent when the total is zero", () => {
    expect(computeInstallmentProgress(0, 0)).toEqual({
      paidAmount: 0,
      total: 0,
      percent: 0,
      paidCount: 0,
      totalCount: 0,
    });
  });

  it("computes and rounds partial progress", () => {
    expect(computeInstallmentProgress(183334, 550000)).toEqual({
      paidAmount: 183334,
      total: 550000,
      percent: 33,
      paidCount: 0,
      totalCount: 0,
    });
  });

  it("returns 100 percent for full payment", () => {
    expect(computeInstallmentProgress(550000, 550000).percent).toBe(100);
  });

  it("clamps paid and total values to safe bounds", () => {
    const result = computeInstallmentProgress(-100, -200);
    expect(result.paidAmount).toBe(0);
    expect(result.total).toBe(0);
    expect(result.percent).toBe(0);
    expect(computeInstallmentProgress(700, 550).paidAmount).toBe(550);
  });
});
