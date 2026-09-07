import { NextRequest, NextResponse } from "next/server";
import { studentActivityFilterSchema } from "@/lib/validations/crm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = {
      search: searchParams.get("search") || undefined,
      cohortId: searchParams.get("cohortId") || undefined,
      status: searchParams.get("status") || "all",
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10,
    };

    const filter = studentActivityFilterSchema.parse(rawParams);

    // Realistic Uzbek Student Data Mock Generator / DB Repository fallback
    const mockStudents = [
      {
        id: "std_01",
        fullName: "Sardorbek Jo'rayev",
        phone: "+998901234567",
        email: "sardor@vibecoding.uz",
        avatarUrl: null,
        cohortId: "cohort_oct_2026",
        cohortName: "Vibe Coding Express (Oktyabr 2026)",
        lessonProgressPercent: 85,
        completedLessonsCount: 17,
        totalLessonsCount: 20,
        lastActiveAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
        homeworkStats: {
          submitted: 5,
          total: 5,
          approved: 4,
          pending: 1,
          rejected: 0,
        },
        quizScores: {
          diagnosticQuizPercent: 92,
          midtermQuizPercent: 88,
          avgQuizScorePercent: 90,
        },
        status: "active",
        recentActivity: [
          { id: "act_1", type: "lesson_completed", title: "4-Dars: PostgreSQL & Drizzle ORM", timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
          { id: "act_2", type: "homework_submitted", title: "4-Modul Schema & Migratsiya", timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
        ],
      },
      {
        id: "std_02",
        fullName: "Nigora Umarova",
        phone: "+998939876543",
        email: "nigora@gmail.com",
        avatarUrl: null,
        cohortId: "cohort_oct_2026",
        cohortName: "Vibe Coding Express (Oktyabr 2026)",
        lessonProgressPercent: 40,
        completedLessonsCount: 8,
        totalLessonsCount: 20,
        lastActiveAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), // 4 days ago
        homeworkStats: {
          submitted: 2,
          total: 5,
          approved: 1,
          pending: 0,
          rejected: 1,
        },
        quizScores: {
          diagnosticQuizPercent: 65,
          midtermQuizPercent: 60,
          avgQuizScorePercent: 62.5,
        },
        status: "at_risk",
        recentActivity: [
          { id: "act_3", type: "quiz_completed", title: "Diagnostic Quiz", timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
        ],
      },
      {
        id: "std_03",
        fullName: "Boburmirzo Karimov",
        phone: "+998974567890",
        email: "bobur@dev.uz",
        avatarUrl: null,
        cohortId: "cohort_sep_2026",
        cohortName: "AI Asoslari & Prompt Injiniring",
        lessonProgressPercent: 100,
        completedLessonsCount: 20,
        totalLessonsCount: 20,
        lastActiveAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        homeworkStats: {
          submitted: 5,
          total: 5,
          approved: 5,
          pending: 0,
          rejected: 0,
        },
        quizScores: {
          diagnosticQuizPercent: 95,
          midtermQuizPercent: 98,
          avgQuizScorePercent: 96.5,
        },
        status: "completed",
        recentActivity: [
          { id: "act_4", type: "certificate_earned", title: "Vibecoding Express Bitiruv Sertifikati", timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
        ],
      },
      {
        id: "std_04",
        fullName: "Dilnoza Rashidova",
        phone: "+998912223344",
        email: "dilnoza@tech.uz",
        avatarUrl: null,
        cohortId: "cohort_oct_2026",
        cohortName: "Vibe Coding Express (Oktyabr 2026)",
        lessonProgressPercent: 70,
        completedLessonsCount: 14,
        totalLessonsCount: 20,
        lastActiveAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        homeworkStats: {
          submitted: 4,
          total: 5,
          approved: 3,
          pending: 1,
          rejected: 0,
        },
        quizScores: {
          diagnosticQuizPercent: 82,
          midtermQuizPercent: 84,
          avgQuizScorePercent: 83,
        },
        status: "active",
        recentActivity: [
          { id: "act_5", type: "homework_submitted", title: "3-Modul REST API validation", timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
        ],
      },
      {
        id: "std_05",
        fullName: "Jasur Ergashxo'jayev",
        phone: "+998998887766",
        email: null,
        avatarUrl: null,
        cohortId: "cohort_oct_2026",
        cohortName: "Vibe Coding Express (Oktyabr 2026)",
        lessonProgressPercent: 15,
        completedLessonsCount: 3,
        totalLessonsCount: 20,
        lastActiveAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
        homeworkStats: {
          submitted: 0,
          total: 5,
          approved: 0,
          pending: 0,
          rejected: 0,
        },
        quizScores: {
          diagnosticQuizPercent: 50,
          midtermQuizPercent: 0,
          avgQuizScorePercent: 50,
        },
        status: "inactive",
        recentActivity: [],
      },
    ];

    // Filter Students
    let filtered = mockStudents;

    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.phone.includes(q) ||
          (s.email && s.email.toLowerCase().includes(q))
      );
    }

    if (filter.cohortId) {
      filtered = filtered.filter((s) => s.cohortId === filter.cohortId);
    }

    if (filter.status !== "all") {
      filtered = filtered.filter((s) => s.status === filter.status);
    }

    // Summary Analytics KPIs
    const kpis = {
      totalStudents: mockStudents.length,
      activeStudents: mockStudents.filter((s) => s.status === "active").length,
      atRiskStudents: mockStudents.filter((s) => s.status === "at_risk").length,
      completedStudents: mockStudents.filter((s) => s.status === "completed").length,
      avgProgressPercent: Math.round(
        mockStudents.reduce((acc, s) => acc + s.lessonProgressPercent, 0) / mockStudents.length
      ),
      pendingHomeworkCount: mockStudents.reduce((acc, s) => acc + s.homeworkStats.pending, 0),
    };

    return NextResponse.json({
      success: true,
      filter,
      kpis,
      students: filtered,
    });
  } catch (error: any) {
    console.error("Student activity API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Talabalar faolligi ma'lumotlarini olishda xatolik" },
      { status: 400 }
    );
  }
}
