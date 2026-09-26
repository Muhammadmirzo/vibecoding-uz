import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import KursIndexPage from "@/app/kurs/page";
import sitemap from "@/app/sitemap";
import { isClosedRoute } from "@/lib/features/closed";
import { COURSES, COURSE_SLUGS, getCoursePricing } from "@/features/courses/content";
import { siteConfig } from "@/lib/siteConfig";

describe("/kurs course index (g1b)", () => {
  it("lists every course with a deep link, its real price and the next step", () => {
    const html = renderToStaticMarkup(createElement(KursIndexPage));
    for (const slug of COURSE_SLUGS) {
      expect(html).toContain(`/kurs/${slug}`);
      expect(html).toContain(COURSES[slug].title);
      expect(html).toContain(getCoursePricing(slug).price.replace(/'/g, "&#x27;"));
    }
    // Every page ends with a next step, never a dead end.
    expect(html).toContain("/diagnostika");
  });

  it("renders no hardcoded price of its own (prices come from siteConfig)", () => {
    const html = renderToStaticMarkup(createElement(KursIndexPage));
    for (const course of Object.values(siteConfig.courses)) {
      expect(html.includes(course.price.replace(/'/g, "&#x27;"))).toBe(true);
    }
  });

  it("is in the sitemap and is not a closed route", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.some((url) => url.endsWith("/kurs"))).toBe(true);
    expect(isClosedRoute("/kurs")).toBe(false);
  });
});
