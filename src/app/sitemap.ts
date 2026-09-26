import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { STATIC_BLOG_POSTS } from "@/features/blog/blogData";
import { BRAND } from "@/config/brand";
import { isClosedRoute } from "@/lib/features/closed";

const baseUrl = new URL(BRAND.url);

const staticRoutes: MetadataRoute.Sitemap = [
  "",
  "/bepul-dars",
  "/diagnostika",
  "/kurs",
  "/ekspertlar",
  "/ish", // W10 yopiq: pastdagi filtr yashiradi, ro'yxatdan o'chirilmaydi.
  "/atamalar",
  "/blog",
  "/meetlar",
  "/portfolio",
  "/pul-qaytarish",
  "/resurslar",
  "/testimoniyalar", // W10 yopiq: pastdagi filtr yashiradi.
  "/xizmatlar",
  "/maxfiylik",
  "/offerta",
]
  // W10: yopiq sahifalar (/ish, /testimoniyalar) sitemap'da bo'lmasligi shart.
  .filter((path) => !isClosedRoute(path === "" ? "/" : path)).map((path, index) => ({
  url: new URL(path, baseUrl).toString(),
  changeFrequency: index === 0 ? "weekly" : "monthly",
  priority: index === 0 ? 1 : 0.7,
}));

export default function sitemap(): MetadataRoute.Sitemap {
  const courseEntries: MetadataRoute.Sitemap = Object.keys(siteConfig.courses).map((slug) => ({
    url: new URL(`/kurs/${slug}`, baseUrl).toString(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const blogEntries: MetadataRoute.Sitemap = STATIC_BLOG_POSTS.map((post) => ({
    url: new URL(`/blog/${post.slug}`, baseUrl).toString(),
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...courseEntries, ...blogEntries];
}
