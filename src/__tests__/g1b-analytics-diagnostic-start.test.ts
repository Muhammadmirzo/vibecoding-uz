import { describe, expect, it, vi } from "vitest";

/**
 * `diagnostic_start` was defined in the W8A contract but never emitted, so the
 * funnel's "Diagnostika" step was structurally 0. These tests pin the contract
 * variant and the one-shot client send.
 */
describe("diagnostic_start analytics (g1b)", () => {
  it("is part of the existing event contract with a uuid diagnosticId", async () => {
    const { analyticsEventInputSchema, ANALYTICS_EVENT_TYPES } = await import("@/features/analytics/contracts");
    expect(ANALYTICS_EVENT_TYPES).toContain("diagnostic_start");
    const id = "33333333-3333-4333-8333-333333333333";
    const result = analyticsEventInputSchema.safeParse({
      eventId: id,
      occurredAt: new Date().toISOString(),
      sessionId: id,
      path: "/diagnostika",
      device: "mobile",
      browserFamily: "Chrome",
      type: "diagnostic_start",
      props: { diagnosticId: id },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-uuid diagnosticId, so the tracker must generate one", async () => {
    const { analyticsEventInputSchema } = await import("@/features/analytics/contracts");
    const id = "33333333-3333-4333-8333-333333333333";
    const result = analyticsEventInputSchema.safeParse({
      eventId: id,
      occurredAt: new Date().toISOString(),
      sessionId: id,
      path: "/diagnostika",
      device: "mobile",
      browserFamily: "Chrome",
      type: "diagnostic_start",
      props: { diagnosticId: "not-a-uuid" },
    });
    expect(result.success).toBe(false);
  });

  it("is emitted from the diagnostic quiz island, once per session", async () => {
    const store = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, value); },
    } as unknown as Storage);
    vi.stubGlobal("crypto", { randomUUID: () => "44444444-4444-4444-8444-444444444444" });
    vi.stubGlobal("screen", { width: 390 });
    vi.stubGlobal("navigator", { userAgent: "Chrome", maxTouchPoints: 0, doNotTrack: null });
    vi.stubGlobal("document", { referrer: "", visibilityState: "visible", addEventListener() {}, documentElement: { scrollHeight: 100 } });
    vi.stubGlobal("location", { pathname: "/diagnostika", search: "" });
    vi.stubGlobal("addEventListener", () => undefined);
    vi.stubGlobal("history", { pushState() {}, replaceState() {} });
    vi.stubGlobal("innerHeight", 800);
    vi.stubGlobal("scrollY", 0);
    const fetchMock = vi.fn(async (_url: string, _init?: { body?: string }) => new Response("{}", { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);

    const tracker = await import("@/features/analytics/client/tracker");
    tracker.trackDiagnosticStart();
    tracker.trackDiagnosticStart();

    const bodies = fetchMock.mock.calls.map((call) => JSON.parse(String(call[1]?.body ?? "{}")));
    const events = bodies.flatMap((body) => body.events as { type: string; props: { diagnosticId: string } }[]);
    const starts = events.filter((event) => event.type === "diagnostic_start");
    expect(starts).toHaveLength(1);
    expect(starts[0].props.diagnosticId).toMatch(/^[0-9a-f-]{36}$/);
    expect(tracker.diagnosticId()).toBe(starts[0].props.diagnosticId);

    vi.unstubAllGlobals();
  });
});
