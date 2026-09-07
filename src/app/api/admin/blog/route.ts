import { NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts, auditLogs } from "@/db/schema";
import { createBlogPostSchema } from "@/lib/validations";
import { desc, eq, like, or } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    let query = db.select().from(blogPosts);

    const conditions = [];
    if (status && status !== "all") {
      conditions.push(eq(blogPosts.status, status));
    }
    if (search) {
      conditions.push(
        or(
          like(blogPosts.title, `%${search}%`),
          like(blogPosts.slug, `%${search}%`),
          like(blogPosts.category, `%${search}%`)
        )
      );
    }

    const posts = await db
      .select()
      .from(blogPosts)
      .where(conditions.length > 0 ? or(...conditions) : undefined)
      .orderBy(desc(blogPosts.publishedAt));

    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("GET /api/admin/blog error:", error);
    return NextResponse.json(
      { error: "Blog maqolalarini yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = createBlogPostSchema.safeParse(body);

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

    const [newPost] = await db
      .insert(blogPosts)
      .values({
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt || null,
        contentMd: data.contentMd,
        coverUrl: data.coverUrl || null,
        authorName: data.authorName,
        category: data.category,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        status: data.status,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
      })
      .returning();

    // Record audit log
    await db.insert(auditLogs).values({
      action: "blog.create",
      entityType: "blog_post",
      entityId: newPost.id,
      details: { title: newPost.title, slug: newPost.slug, status: newPost.status },
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json(
      {
        success: true,
        post: newPost,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/blog error:", error);
    return NextResponse.json(
      { error: "Yangi blog maqolasini yaratishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
