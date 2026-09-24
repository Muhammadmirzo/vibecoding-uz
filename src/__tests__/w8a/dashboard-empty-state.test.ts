import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("analytics dashboard empty state", () => {
  it("contains the honest first-visit empty message", () => {
    const source = readFileSync("src/features/analytics/ui/AnalyticsDashboard.tsx", "utf8");
    expect(source).toContain("Ma'lumot yig‘ilmoqda — birinchi tashriflar kelishi bilan shu yerda ko‘rinadi.");
  });
});
