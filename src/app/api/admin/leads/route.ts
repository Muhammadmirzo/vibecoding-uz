import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads, courses, users } from "@/db/schema";
import { eq, desc, or, ilike } from "drizzle-orm";
import { createLeadSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("q");

    let query = db
      .select({
        id: leads.id,
        name: leads.name,
        phone: leads.phone,
        source: leads.source,
        quizAnswers: leads.quizAnswers,
        recommendedCourseId: leads.recommendedCourseId,
        recommendedCourseTitle: courses.title,
        utm: leads.utm,
        status: leads.status,
        assignedManagerId: leads.assignedManagerId,
        assignedManagerName: users.fullName,
        nextContactAt: leads.nextContactAt,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .leftJoin(courses, eq(leads.recommendedCourseId, courses.id))
      .leftJoin(users, eq(leads.assignedManagerId, users.id))
      .orderBy(desc(leads.createdAt));

    let allLeads = await query;

    if (statusParam && statusParam !== "all") {
      allLeads = allLeads.filter((lead) => lead.status === statusParam);
    }

    if (searchParam && searchParam.trim().length > 0) {
      const q = searchParam.trim().toLowerCase();
      allLeads = allLeads.filter(
        (lead) =>
          lead.name.toLowerCase().includes(q) ||
          lead.phone.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      leads: allLeads,
    });
  } catch (error) {
    console.error("GET /api/admin/leads error:", error);
    return NextResponse.json(
      { error: "Leadlarni yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = createLeadSchema.safeParse(body);

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

    const [newLead] = await db
      .insert(leads)
      .values({
        name: data.name,
        phone: data.phone,
        source: data.source,
        status: data.status,
        recommendedCourseId: data.recommendedCourseId || null,
        quizAnswers: data.quizAnswers || null,
        utm: data.utm || null,
        assignedManagerId: data.assignedManagerId || null,
        nextContactAt: data.nextContactAt ? new Date(data.nextContactAt) : null,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        lead: newLead,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/leads error:", error);
    return NextResponse.json(
      { error: "Yangi lead yaratishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
