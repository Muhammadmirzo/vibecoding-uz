import { NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts, auditLogs } from "@/db/schema";
import { updateBlogPostSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: "Maqola topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("GET /api/admin/blog/[id] error:", error);
    return NextResponse.json(
      { error: "Maqolani yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parseResult = updateBlogPostSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Ma'lumotlar noto'g'ri kiritildi",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.slug !== undefined) updatePayload.slug = data.slug;
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.excerpt !== undefined) updatePayload.excerpt = data.excerpt;
    if (data.contentMd !== undefined) updatePayload.contentMd = data.contentMd;
    if (data.coverUrl !== undefined) updatePayload.coverUrl = data.coverUrl;
    if (data.authorName !== undefined) updatePayload.authorName = data.authorName;
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.seoTitle !== undefined) updatePayload.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) updatePayload.seoDescription = data.seoDescription;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.publishedAt !== undefined) {
      updatePayload.publishedAt = data.publishedAt ? new Date(data.publishedAt) : new Date();
    }

    const [updatedPost] = await db
      .update(blogPosts)
      .set(updatePayload)
      .where(eq(blogPosts.id, id))
      .returning();

    if (!updatedPost) {
      return NextResponse.json({ error: "Maqola topilmadi" }, { status: 404 });
    }

    // Audit log
    await db.insert(auditLogs).values({
      action: "blog.update",
      entityType: "blog_post",
      entityId: updatedPost.id,
      details: { title: updatedPost.title, changes: Object.keys(data) },
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error("PATCH /api/admin/blog/[id] error:", error);
    return NextResponse.json(
      { error: "Maqolani tahrirlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [deletedPost] = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning();

    if (!deletedPost) {
      return NextResponse.json({ error: "Maqola topilmadi" }, { status: 404 });
    }

    // Audit log
    await db.insert(auditLogs).values({
      action: "blog.delete",
      entityType: "blog_post",
      entityId: deletedPost.id,
      details: { title: deletedPost.title, slug: deletedPost.slug },
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "Maqola o'chirildi" });
  } catch (error) {
    console.error("DELETE /api/admin/blog/[id] error:", error);
    return NextResponse.json(
      { error: "Maqolani o'chirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
