import { describe, expect, it, vi } from "vitest";
import { privacyTrackingDisabled, sendAnalyticsPayload } from "@/features/analytics/client/tracker-runtime";

describe("analytics tracker runtime", () => {
  it("respects DNT and Global Privacy Control", () => {
    expect(privacyTrackingDisabled({ doNotTrack: "1" })).toBe(true);
    expect(privacyTrackingDisabled({ doNotTrack: null, globalPrivacyControl: true })).toBe(true);
    expect(privacyTrackingDisabled({ doNotTrack: null, globalPrivacyControl: false })).toBe(false);
  });

  it("uses sendBeacon for page leave payloads", () => {
    const beacon = vi.fn(() => true);
    sendAnalyticsPayload('{"events":[]}', beacon);
    expect(beacon).toHaveBeenCalledWith("/api/v1/events", expect.any(Blob));
  });

  it("uses a keepalive fetch when beacon is unavailable", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 202 }));
    sendAnalyticsPayload('{"events":[]}', null);
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/events", expect.objectContaining({ method: "POST", keepalive: true }));
    fetchMock.mockRestore();
  });
});
