import { describe, expect, it } from "vitest";
import { estimateCustomIdea } from "../features/ideaSimulator/estimateIdea";

const requiredExcludedCosts = [
  "Kurs narxi",
  "Server va API xarajatlari",
  "Dastur va dizayn vaqti",
];

describe("estimateCustomIdea", () => {
  it.each([
    ["Telegram yordamchi bot", "bot-telegram"],
    ["Klinika uchun CRM", "crm-service"],
    ["Instagram kontent avtomatizatsiyasi", "content-social"],
    ["Mebellar uchun onlayn katalog", "catalog-shop"],
  ])("%s matches %s", (idea, category) => {
    const estimate = estimateCustomIdea(idea);

    expect(estimate.category).toBe(category);
    expect(estimate.matched).toBe(true);
  });

  it("returns the wide unmatched range when no category keyword is present", () => {
    const estimate = estimateCustomIdea("g'alati kripto-chiroq hodisa");

    expect(estimate.category).toBe("boshqa");
    expect(estimate.matched).toBe(false);
    expect(estimate.dayRange).toEqual({ min: 14, max: 35 });
    expect(estimate.costRange).toEqual({ min: 3_000_000, max: 12_000_000 });
  });

  it("produces different ranges for different categories", () => {
    const bot = estimateCustomIdea("Telegram bot");
    const crm = estimateCustomIdea("Klinika CRM");

    expect(bot.dayRange).not.toEqual(crm.dayRange);
    expect(bot.costRange).not.toEqual(crm.costRange);
  });

  it("always returns all excluded costs", () => {
    const estimate = estimateCustomIdea("Salon uchun Telegram bot");

    expect(estimate.excludedCosts).toEqual(requiredExcludedCosts);
  });
});
