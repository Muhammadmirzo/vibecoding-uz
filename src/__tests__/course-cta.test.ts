import { describe, expect, it } from "vitest";
import { getCourseCtaState } from "../app/kurs/cta";

describe("getCourseCtaState", () => {
  it("asks an unauthenticated visitor to sign in", () => {
    expect(getCourseCtaState({ isAuthenticated: false, hasConfiguredProvider: true })).toBe("login");
  });

  it("asks an unauthenticated visitor to sign in without a provider", () => {
    expect(getCourseCtaState({ isAuthenticated: false, hasConfiguredProvider: false })).toBe("login");
  });

  it("routes an authenticated visitor with a provider to checkout", () => {
    expect(getCourseCtaState({ isAuthenticated: true, hasConfiguredProvider: true })).toBe("checkout");
  });

  it("keeps an authenticated visitor on contact when no provider is configured", () => {
    expect(getCourseCtaState({ isAuthenticated: true, hasConfiguredProvider: false })).toBe("contact");
  });

  it("prioritizes login over provider configuration", () => {
    expect(getCourseCtaState({ isAuthenticated: false, hasConfiguredProvider: true })).not.toBe("checkout");
  });
});
