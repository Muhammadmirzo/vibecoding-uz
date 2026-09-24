import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse, okResponse } from "@/lib/http/errors";
import { adminIdParamSchema, updateBlogPostSchema } from "@/lib/validations";
import { drizzleBlogRepository } from "@/features/crm/server/blog.repository";
import { deletePost, getPost, updatePost } from "@/features/crm/server/blog.service";

const repo = drizzleBlogRepository;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const { id } = adminIdParamSchema.parse(await params);
    const post = await getPost(repo, id);
    return okResponse({ success: true, post });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const { id } = adminIdParamSchema.parse(await params);
    const body = updateBlogPostSchema.parse(await request.json());
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const post = await updatePost(repo, id, body, { ip });
    return okResponse({ success: true, post });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const { id } = adminIdParamSchema.parse(await params);
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    await deletePost(repo, id, { ip });
    return okResponse({ success: true, message: "Maqola o'chirildi" });
  } catch (error) {
    return errorResponse(error);
  }
}
