import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: () => {
    const error = new Error("NEXT_NOT_FOUND") as Error & { digest: string };
    error.digest = "NEXT_NOT_FOUND";
    throw error;
  },
}));

import {
  CLOSED_FEATURES,
  closedApiPrefixes,
  closedRoutePrefixes,
  isClosed,
  isClosedApi,
  isClosedRoute,
} from "@/lib/features/closed";
import sitemap from "@/app/sitemap";
import { resourceLinks } from "@/components/layout/headerData";
import { STATIC_SEARCH_DATA } from "@/features/search/domain/search";
import IshClosedLayout from "@/app/ish/layout";
import TestimonialsClosedLayout from "@/app/testimoniyalar/layout";
import { POST as applyPost } from "@/app/api/ish/apply/route";

describe("W10 closed-features registry", () => {
  it("closes jobs, testimonials, spinWheel and dead admin flags", () => {
    expect(isClosed("jobs")).toBe(true);
    expect(isClosed("testimonials")).toBe(true);
    expect(isClosed("spinWheel")).toBe(true);
    expect(isClosed("adminFeatureFlags")).toBe(true);
    expect(Object.values(CLOSED_FEATURES).every((f) => typeof f.closed === "boolean")).toBe(true);
  });

  it("matches closed routes with and without nested segments", () => {
    expect(isClosedRoute("/ish")).toBe(true);
    expect(isClosedRoute("/ish/senior-vibe-coding-mentor")).toBe(true);
    expect(isClosedRoute("/testimoniyalar")).toBe(true);
    expect(isClosedRoute("/ekspertlar")).toBe(false);
    expect(isClosedRoute("/")).toBe(false);
    expect(closedRoutePrefixes()).toEqual(expect.arrayContaining(["/ish", "/testimoniyalar"]));
    expect(isClosedApi("/api/ish/apply")).toBe(true);
    expect(isClosedApi("/api/quiz")).toBe(false);
    expect(closedApiPrefixes()).toEqual(expect.arrayContaining(["/api/ish"]));
  });

  it("keeps closed routes out of the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.length).toBeGreaterThan(0);
    expect(urls.some((url) => url.endsWith("/ish") || url.includes("/ish/"))).toBe(false);
    expect(urls.some((url) => url.endsWith("/testimoniyalar"))).toBe(false);
    expect(urls.some((url) => url.endsWith("/ekspertlar"))).toBe(true);
  });

  it("keeps closed routes out of header navigation and the search index", () => {
    for (const link of resourceLinks) {
      expect(isClosedRoute(link.href)).toBe(false);
    }
    expect(resourceLinks.some((link) => link.href === "/ish")).toBe(false);
    for (const item of STATIC_SEARCH_DATA) {
      expect(isClosedRoute(item.url)).toBe(false);
    }
  });

  it("renders a real 404 from the closed page layouts", () => {
    expect(() => IshClosedLayout({ children: null })).toThrowError(/NEXT_NOT_FOUND/);
    expect(() => TestimonialsClosedLayout({ children: null })).toThrowError(/NEXT_NOT_FOUND/);
  });

  it("returns a real 404 from middleware for closed routes", async () => {
    const { middleware } = await import("@/middleware");
    for (const path of ["/ish", "/ish/senior-vibe-coding-mentor", "/testimoniyalar"]) {
      const response = await middleware({ nextUrl: new URL(`http://localhost${path}`) } as never);
      expect(response.status).toBe(404);
    }
    const open = await middleware({ nextUrl: new URL("http://localhost/ekspertlar") } as never);
    expect(open.status).not.toBe(404);
  });

  it("returns legacy-shape 404 from the closed job-apply API", async () => {
    const response = await applyPost(
      new Request("http://localhost/api/ish/apply", { method: "POST", body: "{}" }),
    );
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Bu bo'lim vaqtincha yopiq" });
  });
});
