import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";

const siteUrl = BRAND.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/kabinet", "/design-system"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
    host: siteUrl,
  };
}
