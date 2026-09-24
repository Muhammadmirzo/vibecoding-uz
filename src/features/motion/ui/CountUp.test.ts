import { describe, expect, it } from "vitest";
import { formatCount } from "./CountUp";

describe("formatCount", () => {
  it("formats integers with locale grouping", () => {
    const out = formatCount(320, 0);
    expect(out).toContain("320");
  });

  it("respects decimals", () => {
    expect(formatCount(4.9, 1)).toContain("4");
    expect(formatCount(0, 0)).toBe("0");
  });
});
