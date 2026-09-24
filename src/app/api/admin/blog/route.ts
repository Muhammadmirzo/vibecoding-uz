import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse, okResponse } from "@/lib/http/errors";
import { blogAdminQuerySchema, createBlogPostSchema } from "@/lib/validations";
import { drizzleBlogRepository } from "@/features/crm/server/blog.repository";
import { createPost, listPosts } from "@/features/crm/server/blog.service";

const repo = drizzleBlogRepository;

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const query = blogAdminQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const result = await listPosts(repo, query);
    return okResponse({ success: true, posts: result.posts, total: result.total, page: result.page, limit: result.limit });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const body = createBlogPostSchema.parse(await request.json());
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const post = await createPost(repo, body, { ip });
    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
