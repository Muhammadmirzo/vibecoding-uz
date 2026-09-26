import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolvePayablePrice, tiyinToUzs } from "@/features/payments/domain/payable-price";
import { siteConfig } from "@/lib/siteConfig";

/**
 * Price truth: checkout charges `cohorts.price_sum`, so the pay page must show
 * the cohort amount ("X so'm") as the payable price. The siteConfig string stays
 * marketing/waitlist copy and must never be presented as the charge.
 */

vi.mock("next/navigation", () => ({ usePathname: () => "/kabinet/to-lovlar" }));
vi.mock("@/lib/auth/session", () => ({ getAuthSession: async () => ({ userId: "user-1" }) }));
vi.mock("@/features/payments/server/payments-feed", () => ({ loadStudentPaymentsFeed: vi.fn() }));
vi.mock("@/features/payments/server/checkout-target.service", () => ({
  resolveCheckoutTargetForCourse: vi.fn(),
}));

const { default: ToLovlarPage } = await import("@/app/kabinet/to-lovlar/page");
const { loadStudentPaymentsFeed } = await import("@/features/payments/server/payments-feed");
const { resolveCheckoutTargetForCourse } = await import("@/features/payments/server/checkout-target.service");

const marketingText = siteConfig.courses["vibe-coding-express"].price;

/** renderToStaticMarkup escapes ' as &#x27; */
const esc = (value: string): string => value.replace(/'/g, "&#x27;");

describe("resolvePayablePrice (pure helper)", () => {
  it("formats the cohort amount the server will charge as \"X so'm\"", () => {
    const price = resolvePayablePrice({ amountTiyin: 55_000_000, marketingText });

    expect(price.amount).toBe(550_000);
    expect(price.label).toBe("550 000 so'm");
    expect(price.amountTiyin).toBe(55_000_000);
  });

  it("never falls back to the marketing text when nothing is payable", () => {
    for (const amountTiyin of [null, undefined, 0, -1, Number.NaN]) {
      const price = resolvePayablePrice({ amountTiyin, marketingText });
      expect(price.amount).toBeNull();
      expect(price.label).toBeNull();
    }
  });

  it("keeps the siteConfig text as marketing copy, not as the charge", () => {
    // The cohort row (490 000 so'm) deliberately differs from siteConfig
    // (550 000 so'm): the two must never be conflated.
    const price = resolvePayablePrice({ amountTiyin: 49_000_000, marketingText });
    expect(price.label).toBe("490 000 so'm");
    expect(price.label).not.toBe(marketingText);
    expect(price.marketingText).toBe(marketingText);
  });

  it("groups thousands in the label", () => {
    expect(resolvePayablePrice({ amountTiyin: 123_456_700, marketingText }).label).toBe("1 234 567 so'm");
  });

  it("converts tiyin to so'm, rounded to kopecks", () => {
    expect(tiyinToUzs(55_000_000)).toBe(550_000);
    expect(tiyinToUzs(1_234)).toBe(12.34);
  });
});

describe("the pay page shows the charge, not the marketing price", () => {
  const cohort = {
    courseSlug: "vibe-coding-express",
    state: "cohort" as const,
    enrollmentId: null,
    cohortId: "11111111-1111-4111-8111-111111111111",
    cohortStartsAt: new Date("2026-10-15T00:00:00Z"),
    // 490 000 so'm — intentionally different from the siteConfig 550 000.
    amountTiyin: 49_000_000,
  };

  beforeEach(() => {
    vi.mocked(loadStudentPaymentsFeed).mockResolvedValue({
      payments: [],
      providers: { payme: true, click: true },
    });
    vi.mocked(resolveCheckoutTargetForCourse).mockResolvedValue(cohort);
  });

  it("renders the cohort amount as the payable price", async () => {
    const html = renderToStaticMarkup(
      await ToLovlarPage({ searchParams: Promise.resolve({}) }),
    );

    expect(html).toContain(esc("To'lanadigan narx"));
    expect(html).toContain(esc("490 000 so'm"));
  });

  it("still shows the siteConfig price, labelled as the site's price", async () => {
    const html = renderToStaticMarkup(
      await ToLovlarPage({ searchParams: Promise.resolve({}) }),
    );

    expect(html).toContain(esc(marketingText));
    expect(html).toContain(esc("Saytdagi kurs narxi"));
  });

  it("no pay button and no charge when the cohort has no amount", async () => {
    vi.mocked(resolveCheckoutTargetForCourse).mockResolvedValue({
      ...cohort,
      amountTiyin: null,
    });

    const html = renderToStaticMarkup(
      await ToLovlarPage({ searchParams: Promise.resolve({}) }),
    );

    // No invented number, no pay button: the honest waitlist state.
    expect(html).not.toContain(esc("To'lanadigan narx"));
    expect(html).not.toContain("490 000 so&#x27;m");
    expect(html).not.toContain("to&#x27;lash");
    expect(html).toContain("Keyingi guruh hali ochilmagan");
  });
});
