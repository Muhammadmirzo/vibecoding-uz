import { NextResponse } from "next/server";
import { db } from "@/db";
import { portfolios } from "@/db/schema";
import { portfolioSchema } from "@/lib/validations/portfolio";
import { PORTFOLIO_DATA } from "@/features/portfolio/portfolioData";
import { eq, asc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const category = searchParams.get("category");

    let items = await db
      .select()
      .from(portfolios)
      .orderBy(asc(portfolios.sortOrder), asc(portfolios.createdAt));

    // Fallback to static seed data if DB is currently empty
    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        portfolios: PORTFOLIO_DATA.slice(0, limit ? parseInt(limit, 10) : undefined),
        total: PORTFOLIO_DATA.length,
      });
    }

    if (category && category !== "Barchasi") {
      items = items.filter((i) => i.category === category);
    }

    if (limit) {
      items = items.slice(0, parseInt(limit, 10));
    }

    return NextResponse.json({
      success: true,
      portfolios: items,
      total: items.length,
    });
  } catch (error) {
    console.error("GET /api/portfolio error:", error);
    return NextResponse.json(
      { success: true, portfolios: PORTFOLIO_DATA },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = portfolioSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Kiritilgan ma'lumotlar noto'g'ri", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const newPortfolio = await db
      .insert(portfolios)
      .values(parseResult.data)
      .returning();

    return NextResponse.json({
      success: true,
      portfolio: newPortfolio[0],
    });
  } catch (error) {
    console.error("POST /api/portfolio error:", error);
    return NextResponse.json(
      { error: "Portfolioni saqlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
