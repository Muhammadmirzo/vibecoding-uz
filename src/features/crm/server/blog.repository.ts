// NOTE(W4-ARCH): `import "server-only"` intentionally omitted — the package is not
// installed and the bare import crashes at runtime. Re-add once `server-only` is a dependency.
import { desc, eq, like, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, blogPosts } from "@/db/schema";
import type { CreateBlogPostInput, UpdateBlogPostInput } from "@/lib/validations/admin";

export type DbExecutor = Pick<typeof db, "select" | "update" | "insert" | "delete">;

export type BlogPostRow = typeof blogPosts.$inferSelect;

export interface BlogRepository {
  listPosts(filter: { status: string; search?: string }): Promise<BlogPostRow[]>;
  findPostById(id: string): Promise<BlogPostRow | null>;
  findPostBySlug(slug: string): Promise<BlogPostRow | null>;
  createPostTx(ex: DbExecutor, input: CreateBlogPostInput): Promise<BlogPostRow>;
  updatePost(id: string, patch: UpdateBlogPostInput): Promise<BlogPostRow | null>;
  deletePost(id: string): Promise<BlogPostRow | null>;
  recordAuditTx(
    ex: DbExecutor,
    input: { action: string; entityType: string; entityId?: string; details: Record<string, unknown>; ip: string },
  ): Promise<void>;
}

function buildConditions(status: string, search?: string): SQL<unknown> | undefined {
  const conditions: SQL<unknown>[] = [];
  if (status && status !== "all") {
    conditions.push(eq(blogPosts.status, status));
  }
  if (search) {
    conditions.push(
      or(
        like(blogPosts.title, `%${search}%`),
        like(blogPosts.slug, `%${search}%`),
        like(blogPosts.category, `%${search}%`),
      ) as SQL<unknown>,
    );
  }
  return conditions.length > 0 ? (or(...conditions) as SQL<unknown>) : undefined;
}

export const drizzleBlogRepository: BlogRepository = {
  async listPosts(filter) {
    return db
      .select()
      .from(blogPosts)
      .where(buildConditions(filter.status, filter.search))
      .orderBy(desc(blogPosts.publishedAt));
  },
  async findPostById(id) {
    const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    return row ?? null;
  },
  async findPostBySlug(slug) {
    const [row] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    return row ?? null;
  },
  async createPostTx(ex, input) {
    const [row] = await ex
      .insert(blogPosts)
      .values({
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt || null,
        contentMd: input.contentMd,
        coverUrl: input.coverUrl || null,
        authorName: input.authorName,
        category: input.category,
        seoTitle: input.seoTitle || null,
        seoDescription: input.seoDescription || null,
        status: input.status,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
      })
      .returning();
    return row;
  },
  async updatePost(id, patch) {
    const updatePayload: Partial<{
      slug: string; title: string; excerpt: string | null; contentMd: string;
      coverUrl: string | null; authorName: string; category: string;
      seoTitle: string | null; seoDescription: string | null; status: string;
      publishedAt: Date; updatedAt: Date;
    }> = { updatedAt: new Date() };
    if (patch.slug !== undefined) updatePayload.slug = patch.slug;
    if (patch.title !== undefined) updatePayload.title = patch.title;
    if (patch.excerpt !== undefined) updatePayload.excerpt = patch.excerpt;
    if (patch.contentMd !== undefined) updatePayload.contentMd = patch.contentMd;
    if (patch.coverUrl !== undefined) updatePayload.coverUrl = patch.coverUrl;
    if (patch.authorName !== undefined) updatePayload.authorName = patch.authorName;
    if (patch.category !== undefined) updatePayload.category = patch.category;
    if (patch.seoTitle !== undefined) updatePayload.seoTitle = patch.seoTitle;
    if (patch.seoDescription !== undefined) updatePayload.seoDescription = patch.seoDescription;
    if (patch.status !== undefined) updatePayload.status = patch.status;
    if (patch.publishedAt !== undefined) {
      updatePayload.publishedAt = patch.publishedAt ? new Date(patch.publishedAt) : new Date();
    }
    const [row] = await db.update(blogPosts).set(updatePayload).where(eq(blogPosts.id, id)).returning();
    return row ?? null;
  },
  async deletePost(id) {
    const [row] = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
    return row ?? null;
  },
  async recordAuditTx(ex, input) {
    await ex.insert(auditLogs).values({
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      details: input.details,
      ipAddress: input.ip,
    });
  },
};
