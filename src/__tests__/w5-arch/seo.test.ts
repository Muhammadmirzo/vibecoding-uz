import { describe, expect, it } from "vitest";
import { breadcrumbJsonLd, canonicalUrl, faqPageJsonLd } from "@/lib/seo";

describe("faqPageJsonLd", () => {
  it("builds a FAQPage schema with a Question/Answer pair per FAQ", () => {
    const jsonLd = faqPageJsonLd([
      { question: "Kurs qancha davom etadi?", answer: "8 hafta davom etadi." },
      { question: "To'lov qanday amalga oshiriladi?", answer: "Payme yoki Click orqali." },
    ]);

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("FAQPage");
    expect(jsonLd.mainEntity).toEqual([
      {
        "@type": "Question",
        name: "Kurs qancha davom etadi?",
        acceptedAnswer: { "@type": "Answer", text: "8 hafta davom etadi." },
      },
      {
        "@type": "Question",
        name: "To'lov qanday amalga oshiriladi?",
        acceptedAnswer: { "@type": "Answer", text: "Payme yoki Click orqali." },
      },
    ]);
  });

  it("returns an empty mainEntity list for no FAQs", () => {
    expect(faqPageJsonLd([]).mainEntity).toEqual([]);
  });
});

describe("breadcrumbJsonLd", () => {
  it("builds a BreadcrumbList with 1-based positions and absolute URLs", () => {
    const jsonLd = breadcrumbJsonLd([
      { name: "Bosh sahifa", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: "Maqola sarlavhasi", path: "/blog/maqola-slug" },
    ]);

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Bosh sahifa", item: canonicalUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: canonicalUrl("/blog") },
      { "@type": "ListItem", position: 3, name: "Maqola sarlavhasi", item: canonicalUrl("/blog/maqola-slug") },
    ]);
  });
});
