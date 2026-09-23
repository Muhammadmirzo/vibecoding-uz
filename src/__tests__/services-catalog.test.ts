import { describe, expect, it } from "vitest";
import { servicesCatalog, serviceOfferSchema, servicesCatalogSchema } from "../features/services/servicesCatalog";

const validOffer = servicesCatalog.offers[0];

describe("services catalog", () => {
  it("parses the editable catalog", () => {
    expect(servicesCatalogSchema.parse(servicesCatalog)).toEqual(servicesCatalog);
  });

  it("contains exactly three offers", () => {
    expect(servicesCatalog.offers).toHaveLength(3);
  });

  it.each(servicesCatalog.offers)("has non-empty Uzbek copy for $id", (offer) => {
    expect(offer.title.trim()).not.toBe("");
    expect(offer.summary.trim()).not.toBe("");
    expect(offer.timeline.trim()).not.toBe("");
    expect(offer.suitableFor.every((item) => item.trim().length > 0)).toBe(true);
    expect(offer.notSuitableFor.every((item) => item.trim().length > 0)).toBe(true);
  });

  it.each(servicesCatalog.offers)("has a valid positive price range for $id", (offer) => {
    expect(offer.priceRange.min).toBeGreaterThan(0);
    expect(offer.priceRange.max).toBeGreaterThanOrEqual(offer.priceRange.min);
  });

  it.each(servicesCatalog.offers)("has deliverables and exclusions for $id", (offer) => {
    expect(offer.deliverables.length).toBeGreaterThan(0);
    expect(offer.deliverables.every((item) => item.trim().length > 0)).toBe(true);
    expect(offer.excluded.length).toBeGreaterThan(0);
    expect(offer.excluded.every((item) => item.trim().length > 0)).toBe(true);
  });

  it("rejects an offer with no deliverables", () => {
    expect(serviceOfferSchema.safeParse({ ...validOffer, deliverables: [] }).success).toBe(false);
  });

  it("rejects an empty Uzbek title", () => {
    expect(serviceOfferSchema.safeParse({ ...validOffer, title: "   " }).success).toBe(false);
  });

  it("rejects an inverted price range", () => {
    expect(serviceOfferSchema.safeParse({ ...validOffer, priceRange: { min: 2_000_000, max: 1_000_000 } }).success).toBe(false);
  });
});
