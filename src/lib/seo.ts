import type { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { cohortDateToIso } from "@/features/courses/domain/cohort-date";

export const canonicalBase = (() => {
  try { return new URL(BRAND.url); } catch { return new URL("https://master-2-jade.vercel.app"); }
})();

export function canonicalUrl(path: string): string {
  return new URL(path.replace(/^\//, ""), canonicalBase).toString();
}

export function routeMetadata(input: { title: string; description: string; path: string }): Metadata {
  const url = canonicalUrl(input.path);
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: { title: input.title, description: input.description, url: input.path, siteName: BRAND.name },
  };
}

export function serializeJsonLd(value: unknown): string {
  const escaped = { "<": "\\u003c", ">": "\\u003e", "&": "\\u0026", "\u2028": "\\u2028", "\u2029": "\\u2029" } as const;
  return JSON.stringify(value).replace(new RegExp("[<>&\\u2028\\u2029]", "g"), (character) => escaped[character as keyof typeof escaped] ?? character);
}

export function courseJsonLd(input: { name: string; description: string; price: string; path: string; startDate: string }): Record<string, unknown> {
  const amount = Number(input.price.replace(/[^0-9]/g, ""));
  // Schema.org wants an ISO 8601 date; the human copy is Uzbek ("15-Oktyabr,
  // 2026"), so convert through the shared parser and drop the field when the
  // configured value cannot be parsed rather than emit a broken date.
  const startDate = cohortDateToIso(input.startDate) ?? undefined;
  return {
    "@context": "https://schema.org", "@type": "Course", name: input.name, description: input.description,
    url: canonicalUrl(input.path), provider: { "@type": "Organization", name: BRAND.name, url: canonicalBase.toString() },
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", ...(startDate ? { startDate } : {}),
      offers: { "@type": "Offer", price: amount, priceCurrency: "UZS", url: canonicalUrl(input.path), availability: "https://schema.org/InStock" } },
  };
}

export function articleJsonLd(input: { title: string; description: string; image: string; publishedAt: string; author: string; path: string }): Record<string, unknown> {
  return {
    "@context": "https://schema.org", "@type": "Article", headline: input.title, description: input.description,
    image: input.image, datePublished: input.publishedAt, author: { "@type": "Person", name: input.author },
    publisher: { "@type": "Organization", name: BRAND.name, url: canonicalBase.toString() },
    mainEntityOfPage: canonicalUrl(input.path),
  };
}
