import { describe, expect, it, vi } from "vitest";
import { blogAdminQuerySchema } from "@/lib/validations/admin";
import { createPost, deletePost, getPost, listPosts, updatePost } from "@/features/crm/server/blog.service";
import type { BlogPostRow, BlogRepository } from "@/features/crm/server/blog.repository";

vi.mock("@/db", () => ({
  withTransactionLock: async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({}),
}));

const POST_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function makePost(overrides: Partial<BlogPostRow> = {}): BlogPostRow {
  return {
    id: POST_ID,
    slug: "test-post",
    title: "Test Post",
    excerpt: null,
    contentMd: "Content here",
    coverUrl: null,
    authorName: "Mirzo Academy Team",
    category: "Vibe Coding",
    seoTitle: null,
    seoDescription: null,
    status: "published",
    publishedAt: new Date("2026-01-01T00:00:00Z"),
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

const newPostInput = {
  slug: "new-post",
  title: "New Post",
  contentMd: "Long enough content",
  authorName: "Mirzo Academy Team",
  category: "Vibe Coding",
  status: "published" as const,
};

function baseRepo(overrides: Partial<BlogRepository> = {}): BlogRepository {
  const fake: BlogRepository = {
    listPosts: async () => [],
    findPostById: async (id) => (id === POST_ID ? makePost() : null),
    findPostBySlug: async (slug) => (slug === "taken-slug" ? makePost({ id: "other-post-id", slug }) : null),
    createPostTx: async (_ex, input) => makePost({ slug: input.slug, title: input.title }),
    updatePost: async (id, patch) => {
      if (id === "missing") return null;
      const row = makePost({ id });
      if (patch.title !== undefined) row.title = patch.title;
      return row;
    },
    deletePost: async (id) => (id === "missing" ? null : makePost({ id })),
    recordAuditTx: async () => undefined,
    ...overrides,
  };
  return fake;
}

describe("blog service", () => {
  it("rejects a duplicate slug with CONFLICT on create", async () => {
    const repo = baseRepo();
    await expect(createPost(repo, { ...newPostInput, slug: "taken-slug" }, { ip: "1.1.1.1" })).rejects.toMatchObject({
      code: "CONFLICT",
      status: 409,
    });
  });

  it("creates a post and writes a blog.create audit record", async () => {
    const audits: string[] = [];
    const repo = baseRepo({ recordAuditTx: async (_ex, input) => { audits.push(input.action); } });
    const post = await createPost(repo, newPostInput, { ip: "1.1.1.1" });
    expect(post.slug).toBe("new-post");
    expect(audits).toEqual(["blog.create"]);
  });

  it("rejects a slug owned by another post on update", async () => {
    const repo = baseRepo();
    await expect(updatePost(repo, POST_ID, { slug: "taken-slug" }, { ip: "1.1.1.1" })).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });

  it("allows keeping the same slug on update and audits the change", async () => {
    const audits: { action: string; details: Record<string, unknown> }[] = [];
    const repo = baseRepo({
      findPostBySlug: async (slug) => (slug === "test-post" ? makePost() : null),
      recordAuditTx: async (_ex, input) => { audits.push({ action: input.action, details: input.details }); },
    });
    const post = await updatePost(repo, POST_ID, { slug: "test-post", title: "Renamed" }, { ip: "1.1.1.1" });
    expect(post.title).toBe("Renamed");
    expect(audits).toEqual([{ action: "blog.update", details: { title: "Renamed", changes: ["slug", "title"] } }]);
  });

  it("returns NOT_FOUND for missing posts on get/update/delete", async () => {
    const repo = baseRepo();
    await expect(getPost(repo, "missing")).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });
    await expect(updatePost(repo, "missing", { title: "x" }, { ip: "1.1.1.1" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(deletePost(repo, "missing", { ip: "1.1.1.1" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("audits deletes and paginates the list", async () => {
    const audits: string[] = [];
    const repo = baseRepo({
      listPosts: async () => [makePost({ id: "p-1" }), makePost({ id: "p-2" }), makePost({ id: "p-3" })],
      recordAuditTx: async (_ex, input) => { audits.push(input.action); },
    });
    await deletePost(repo, POST_ID, { ip: "1.1.1.1" });
    expect(audits).toEqual(["blog.delete"]);
    const page = await listPosts(repo, { search: undefined, status: "all", page: 2, limit: 2 });
    expect(page.posts.map((p) => p.id)).toEqual(["p-3"]);
    expect(page.total).toBe(3);
  });

  it("validates the blog admin query", () => {
    expect(blogAdminQuerySchema.parse({})).toMatchObject({ status: "all", page: 1, limit: 100 });
    expect(blogAdminQuerySchema.parse({ search: "vibe", limit: "5" })).toMatchObject({ search: "vibe", limit: 5 });
  });
});
