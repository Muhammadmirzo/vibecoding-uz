import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PaymentsResponse } from "@/features/payments/format";
import { siteConfig } from "@/lib/siteConfig";

vi.mock("next/navigation", () => ({ usePathname: () => "/kabinet/to-lovlar" }));
vi.mock("@/lib/auth/session", () => ({ getAuthSession: async () => ({ userId: "user-1" }) }));
vi.mock("@/features/payments/server/payments-feed", () => ({ loadStudentPaymentsFeed: vi.fn() }));
vi.mock("@/features/payments/server/checkout-target.service", () => ({
  resolveCheckoutTargetForCourse: vi.fn(),
}));

const COHORT_ID = "11111111-1111-4111-8111-111111111111";

const { default: ToLovlarPage } = await import("@/app/kabinet/to-lovlar/page");
const { buildCheckoutRequestBody } = await import("@/app/kabinet/to-lovlar/checkout-request");
const { loadStudentPaymentsFeed } = await import("@/features/payments/server/payments-feed");
const { resolveCheckoutTargetForCourse } = await import(
  "@/features/payments/server/checkout-target.service"
);

const feed: PaymentsResponse = { payments: [], providers: { payme: true, click: true } };

const openCohort = {
  courseSlug: "vibe-coding-express",
  state: "cohort" as const,
  enrollmentId: null,
  cohortId: COHORT_ID,
  cohortStartsAt: new Date("2026-10-15T00:00:00Z"),
  amountTiyin: 55_000_000,
};

const waitlist = {
  courseSlug: "vibe-coding-express",
  state: "waitlist" as const,
  enrollmentId: null,
  cohortId: null,
  cohortStartsAt: null,
  amountTiyin: null,
};

/** The page is async, so it is called directly (like Next does) and the
 * returned element is rendered — this is the first HTML a student sees. */
async function render(slug?: string): Promise<string> {
  const element = await ToLovlarPage({ searchParams: Promise.resolve(slug ? { course: slug } : {}) });
  return renderToStaticMarkup(element);
}

/** renderToStaticMarkup escapes ' as &#x27; — compare against the escaped text. */
const esc = (value: string): string => value.replace(/'/g, "&#x27;");

beforeEach(() => {
  vi.mocked(loadStudentPaymentsFeed).mockResolvedValue(feed);
  vi.mocked(resolveCheckoutTargetForCourse).mockResolvedValue(openCohort);
});

describe("G1a: /kabinet/to-lovlar for a NEW student with an open cohort", () => {
  it("renders a pay button and resolves the cohort server-side", async () => {
    const html = await render();

    expect(html).toContain("Vibe Coding Express");
    expect(html).toContain(esc(siteConfig.courses["vibe-coding-express"].installment));
    expect(html).toContain('data-checkout-target="cohort"');
    expect(html).toContain("to&#x27;lash");
    expect(html).not.toContain("Keyingi guruh hali ochilmagan");
    expect(resolveCheckoutTargetForCourse).toHaveBeenCalledWith({
      userId: "user-1",
      courseSlug: "vibe-coding-express",
    });
  });

  it("sends the cohortId in the checkout request, so the server accepts it", async () => {
    const element = await ToLovlarPage({ searchParams: Promise.resolve({}) });
    const props = (element as { props: { target: Parameters<typeof buildCheckoutRequestBody>[0]["target"]; payableAmount: number } }).props;
    const body = buildCheckoutRequestBody({
      provider: "payme",
      installmentMonth: 1,
      target: props.target,
      amountHint: 550_000,
    });

    expect(props.payableAmount).toBe(550_000);
    expect(body).toMatchObject({ provider: "payme", cohortId: COHORT_ID });
    expect(body?.enrollmentId).toBeUndefined();
  });

  it("shows the selected course from ?course=, not a hardcoded one", async () => {
    const html = await render("ai-asoslari");

    expect(html).toContain("AI Asoslari");
    expect(html).toContain(esc(siteConfig.courses["ai-asoslari"].installment));
    expect(html).not.toContain("Vibe Coding Express");
    expect(resolveCheckoutTargetForCourse).toHaveBeenCalledWith({
      userId: "user-1",
      courseSlug: "ai-asoslari",
    });
  });
});

describe("G1a: payment providers not configured (env)", () => {
  it("still reaches provider selection, honestly disabled", async () => {
    vi.mocked(loadStudentPaymentsFeed).mockResolvedValue({
      payments: [],
      providers: { payme: false, click: false },
    });

    const html = await render();

    expect(html).toContain("To&#x27;lov tizimini tanlang");
    expect(html).toContain("Hozircha mavjud emas");
    expect(html).toContain("Hozircha hech bir to&#x27;lov tizimi ulanmagan");
    const payButton = html.slice(html.indexOf("To&#x27;lov tizimini tanlang"));
    expect(payButton).toContain("disabled:opacity-50");
  });
});

describe("G1a: no open cohort", () => {
  it("shows the honest waitlist state and NO pay button", async () => {
    vi.mocked(resolveCheckoutTargetForCourse).mockResolvedValue(waitlist);

    const html = await render();

    expect(html).toContain("Keyingi guruh hali ochilmagan");
    expect(html).toContain("Telegram orqali navbatga yozish");
    expect(html).toContain('data-checkout-target="waitlist"');
    expect(html).not.toContain("to&#x27;lash");
    expect(html).not.toContain("To&#x27;lov tizimini tanlang");
  });

  it("builds no checkout request in the waitlist state", () => {
    expect(
      buildCheckoutRequestBody({
        provider: "payme",
        installmentMonth: 1,
        target: waitlist,
        amountHint: 550_000,
      }),
    ).toBeNull();
  });
});

describe("G1a: a tampered client amount cannot change the charge", () => {
  it("prices the payment from the cohort, ignoring the client amount", async () => {
    vi.resetModules();
    vi.doMock("@/db", () => ({
      withTransactionLock: async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({}),
    }));
    const { createCheckout, checkoutInputSchema: schema } = await import(
      "@/features/payments/server/checkout.service"
    );
    const { buildCheckoutRequestBody: build } = await import(
      "@/app/kabinet/to-lovlar/checkout-request"
    );
    const created: number[] = [];
    const repo = {
      findCohort: async () => ({
        enrollmentId: "", userId: "", enrollmentStatus: "active", enrolledAt: new Date(),
        cohortId: COHORT_ID, priceSum: "550000.00", earlyPriceSum: null, earlyDeadline: null,
      }),
      findActiveUserEnrollment: async () => null,
      findActiveUserEnrollmentTx: async () => null,
      createPendingEnrollmentTx: async () => ({ id: "enr-new" }),
      findPendingByEnrollmentTx: async () => null,
      createPaymentTx: async (_ex: unknown, input: { amountTiyin: number }) => {
        created.push(input.amountTiyin);
        return { id: "pay-new" };
      },
    };
    const secrets = {
      paymeMerchantId: "m", paymeKey: "k", clickServiceId: "s",
      clickMerchantId: "m", clickSecretKey: "k",
    };

    const body = build({
      provider: "payme",
      installmentMonth: 1,
      target: openCohort,
      amountHint: 1,
    })!;
    expect(body.amountSum).toBe(1);
    const parsed = schema.safeParse(body);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const result = await createCheckout(
      repo as never,
      { ...parsed.data, userId: "user-1" },
      secrets,
      new Date("2026-09-26T00:00:00Z"),
    );

    expect(result.paymentId).toBe("pay-new");
    expect(created[0]).toBe(55_000_000);
    vi.doUnmock("@/db");
    vi.resetModules();
  });
});
