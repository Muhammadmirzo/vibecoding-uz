import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { STATIC_BLOG_POSTS } from "@/features/blog/blogData";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://academy.mirzo.uz";
const baseUrl = new URL(siteUrl);

const staticRoutes: MetadataRoute.Sitemap = [
  "",
  "/bepul-dars",
  "/diagnostika",
  "/ekspertlar",
  "/ish",
  "/atamalar",
  "/blog",
  "/meetlar",
  "/portfolio",
  "/pul-qaytarish",
  "/resurslar",
  "/testimoniyalar",
  "/xizmatlar",
  "/maxfiylik",
  "/offerta",
].map((path, index) => ({
  url: new URL(path, baseUrl).toString(),
  lastModified: new Date(),
  changeFrequency: index === 0 ? "weekly" : "monthly",
  priority: index === 0 ? 1 : 0.7,
}));

export default function sitemap(): MetadataRoute.Sitemap {
  const courseEntries: MetadataRoute.Sitemap = Object.keys(siteConfig.courses).map((slug) => ({
    url: new URL(`/kurs/${slug}`, baseUrl).toString(),
    lastModified: new Date(),
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
