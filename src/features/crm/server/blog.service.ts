import { withTransactionLock } from "@/db";
import { ServiceError } from "@/lib/http/errors";
import type { BlogAdminQuery, CreateBlogPostInput, UpdateBlogPostInput } from "@/lib/validations/admin";
import { paginate, type PageResult } from "../domain/pagination";
import type { BlogPostRow, BlogRepository, DbExecutor } from "./blog.repository";

/**
 * Admin blog CRUD. Lives under crm/server (not features/blog) because it
 * is an admin/CRM concern: every mutation writes an audit log entry.
 * Public blog reads stay in features/blog.
 */

export async function listPosts(
  repo: BlogRepository,
  query: BlogAdminQuery,
): Promise<PageResult<BlogPostRow> & { posts: BlogPostRow[] }> {
  const all = await repo.listPosts({ status: query.status, search: query.search });
  const page = paginate(all, query.page, query.limit);
  return { ...page, posts: page.items };
}

export async function getPost(repo: BlogRepository, id: string): Promise<BlogPostRow> {
  const post = await repo.findPostById(id);
  if (!post) throw new ServiceError("NOT_FOUND", "Maqola topilmadi", 404);
  return post;
}

export async function createPost(
  repo: BlogRepository,
  input: CreateBlogPostInput,
  opts: { ip: string },
): Promise<BlogPostRow> {
  const clash = await repo.findPostBySlug(input.slug);
  if (clash) throw new ServiceError("CONFLICT", "Bu slug bilan maqola allaqachon mavjud", 409);
  return withTransactionLock(`blog-create:${input.slug}`, async (tx) => {
    const ex = tx as DbExecutor;
    if (!ex) throw new ServiceError("PROVIDER_UNAVAILABLE", "Baza tranzaksiyasi mavjud emas", 503);
    const post = await repo.createPostTx(ex, input);
    await repo.recordAuditTx(ex, {
      action: "blog.create",
      entityType: "blog_post",
      entityId: post.id,
      details: { title: post.title, slug: post.slug, status: post.status },
      ip: opts.ip,
    });
    return post;
  });
}

export async function updatePost(
  repo: BlogRepository,
  id: string,
  patch: UpdateBlogPostInput,
  opts: { ip: string },
): Promise<BlogPostRow> {
  if (patch.slug !== undefined) {
    const clash = await repo.findPostBySlug(patch.slug);
    if (clash && clash.id !== id) {
      throw new ServiceError("CONFLICT", "Bu slug boshqa maqola tomonidan ishlatilmoqda", 409);
    }
  }
  const updated = await repo.updatePost(id, patch);
  if (!updated) throw new ServiceError("NOT_FOUND", "Maqola topilmadi", 404);
  return withTransactionLock(`blog-update:${id}`, async (tx) => {
    const ex = tx as DbExecutor;
    if (!ex) throw new ServiceError("PROVIDER_UNAVAILABLE", "Baza tranzaksiyasi mavjud emas", 503);
    await repo.recordAuditTx(ex, {
      action: "blog.update",
      entityType: "blog_post",
      entityId: updated.id,
      details: { title: updated.title, changes: Object.keys(patch) },
      ip: opts.ip,
    });
    return updated;
  });
}

export async function deletePost(repo: BlogRepository, id: string, opts: { ip: string }): Promise<BlogPostRow> {
  const deleted = await repo.deletePost(id);
  if (!deleted) throw new ServiceError("NOT_FOUND", "Maqola topilmadi", 404);
  return withTransactionLock(`blog-delete:${id}`, async (tx) => {
    const ex = tx as DbExecutor;
    if (!ex) throw new ServiceError("PROVIDER_UNAVAILABLE", "Baza tranzaksiyasi mavjud emas", 503);
    await repo.recordAuditTx(ex, {
      action: "blog.delete",
      entityType: "blog_post",
      entityId: deleted.id,
      details: { title: deleted.title, slug: deleted.slug },
      ip: opts.ip,
    });
    return deleted;
  });
}
