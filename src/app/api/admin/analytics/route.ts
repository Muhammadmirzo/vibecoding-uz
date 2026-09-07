import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads, payments, cohorts, enrollments, courses, homeworkSubmissions } from "@/db/schema";
import { eq, sql, count, sum } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    // 1. Leads Funnel metrics
    const allLeads = await db.select().from(leads);
    const totalLeads = allLeads.length;

    const newLeadsCount = allLeads.filter((l) => l.status === "new").length;
    const contactedCount = allLeads.filter((l) => l.status === "contacted").length;
    const consultationCount = allLeads.filter((l) => l.status === "consultation").length;
    const pendingCount = allLeads.filter((l) => l.status === "pending").length;
    const paidCount = allLeads.filter((l) => l.status === "paid").length;
    const cancelledCount = allLeads.filter(
      (l) => l.status === "cancelled" || l.status === "rejected"
    ).length;

    // Funnel steps:
    // Step 1: Yangi (Total leads)
    // Step 2: Bog'lanildi (Contacted + Consultation + Pending + Paid)
    // Step 3: Konsultatsiya (Consultation + Pending + Paid)
    // Step 4: To'langan (Paid)
    const step1Count = totalLeads;
    const step2Count = contactedCount + consultationCount + pendingCount + paidCount;
    const step3Count = consultationCount + pendingCount + paidCount;
    const step4Count = paidCount;

    const funnel = [
      {
        stage: "Yangi Leadlar",
        count: step1Count,
        conversionRate: "100.0%",
        dropOffRate: "0.0%",
        dropOffCount: 0,
      },
      {
        stage: "Bog'lanildi (Contacted)",
        count: step2Count,
        conversionRate: step1Count > 0 ? `${((step2Count / step1Count) * 100).toFixed(1)}%` : "0%",
        dropOffRate: step1Count > 0 ? `${(((step1Count - step2Count) / step1Count) * 100).toFixed(1)}%` : "0%",
        dropOffCount: Math.max(0, step1Count - step2Count),
      },
      {
        stage: "Konsultatsiya",
        count: step3Count,
        conversionRate: step1Count > 0 ? `${((step3Count / step1Count) * 100).toFixed(1)}%` : "0%",
        dropOffRate: step2Count > 0 ? `${(((step2Count - step3Count) / step2Count) * 100).toFixed(1)}%` : "0%",
        dropOffCount: Math.max(0, step2Count - step3Count),
      },
      {
        stage: "To'langan (Paid)",
        count: step4Count,
        conversionRate: step1Count > 0 ? `${((step4Count / step1Count) * 100).toFixed(1)}%` : "0%",
        dropOffRate: step3Count > 0 ? `${(((step3Count - step4Count) / step3Count) * 100).toFixed(1)}%` : "0%",
        dropOffCount: Math.max(0, step3Count - step4Count),
      },
    ];

    // 2. Revenue metrics
    const allPayments = await db.select().from(payments);
    const paidPayments = allPayments.filter((p) => p.status === "paid");

    const totalRevenueSum = paidPayments.reduce(
      (acc, curr) => acc + Number(curr.amountSum || 0),
      0
    );

    const paymeRevenue = paidPayments
      .filter((p) => p.provider === "payme")
      .reduce((acc, curr) => acc + Number(curr.amountSum || 0), 0);

    const clickRevenue = paidPayments
      .filter((p) => p.provider === "click")
      .reduce((acc, curr) => acc + Number(curr.amountSum || 0), 0);

    const manualRevenue = paidPayments
      .filter((p) => p.provider === "manual")
      .reduce((acc, curr) => acc + Number(curr.amountSum || 0), 0);

    const averageOrderValue = paidPayments.length > 0
      ? Math.round(totalRevenueSum / paidPayments.length)
      : 0;

    // 3. Lead source distribution
    const sourceMap: Record<string, number> = {};
    allLeads.forEach((l) => {
      const src = l.source || "manual";
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });

    const sources = Object.entries(sourceMap).map(([name, val]) => ({
      name,
      count: val,
      percentage: totalLeads > 0 ? `${((val / totalLeads) * 100).toFixed(1)}%` : "0%",
    }));

    // 4. Cohorts summary metrics
    const allCohorts = await db.select().from(cohorts);
    const allEnrollments = await db.select().from(enrollments);

    const totalSeats = allCohorts.reduce((acc, c) => acc + c.seats, 0);
    const activeStudentsCount = allEnrollments.filter((e) => e.status === "active").length;
    const overallFillRate = totalSeats > 0 ? `${((activeStudentsCount / totalSeats) * 100).toFixed(1)}%` : "0%";

    // 5. Homework queue status
    const allHomeworkSubmissions = await db.select().from(homeworkSubmissions);
    const pendingHomeworkCount = allHomeworkSubmissions.filter((h) => h.status === "submitted" || h.status === "reviewing").length;
    const reviewedHomeworkCount = allHomeworkSubmissions.filter((h) => h.status === "approved" || h.status === "rejected").length;

    return NextResponse.json({
      success: true,
      period,
      summary: {
        totalLeads,
        newLeadsCount,
        paidCount,
        cancelledCount,
        totalRevenueUzS: totalRevenueSum,
        averageOrderValueUzS: averageOrderValue,
        activeStudentsCount,
        overallFillRate,
        pendingHomeworkCount,
        reviewedHomeworkCount,
      },
      funnel,
      revenueByProvider: {
        payme: paymeRevenue,
        click: clickRevenue,
        manual: manualRevenue,
      },
      sources,
    });
  } catch (error) {
    console.error("GET /api/admin/analytics error:", error);
    return NextResponse.json(
      { error: "Analitika ma'lumotlarini yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
