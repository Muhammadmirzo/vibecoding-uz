import { db } from "../index";
import { blogPosts } from "../schema";
import { createBlogPostsData } from "./data/blog";

export async function seedBlog(): Promise<void> {
  console.log("5/10 Blog Posts seeding...");
  for (const post of createBlogPostsData()) {
    await db.insert(blogPosts).values(post).onConflictDoNothing();
  }
}
