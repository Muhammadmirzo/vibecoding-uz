import { db } from "./index";
import { eq } from "drizzle-orm";
import {
  users,
  userProfiles,
  courses,
  courseSections,
  lessons,
  homeworkAssignments,
  homeworkSubmissions,
  homeworkReviews,
  lessonProgress,
  cohorts,
  enrollments,
  payments,
  leads,
  certificates,
  experts,
  testimonials,
  glossaryTerms,
  blogPosts,
  siteSettings,
  broadcastNotifications,
  auditLogs,
  faqs,
  jobOpenings,
} from "./schema";

async function main() {
  console.log("🌱 Database seeder ishga tushirildi...");

  // 1. Seed Staff & Students Users (10 users)
  console.log("1/10 Users & User Profiles seeding...");
  const seededUsersData = [
    {
      phone: "+998901234567",
      email: "admin@academy.mirzo.uz",
      fullName: "Jasur Bekmuradov",
      role: "superadmin" as const,
      tgUsername: "jasur_vibecoding",
    },
    {
      phone: "+998909876543",
      email: "mentor@academy.mirzo.uz",
      fullName: "Alisher Zokirov",
      role: "mentor" as const,
      tgUsername: "alisher_mentor",
    },
    {
      phone: "+998935551122",
      email: "manager@academy.mirzo.uz",
      fullName: "Malika Karimova",
      role: "manager" as const,
      tgUsername: "malika_sales",
    },
    {
      phone: "+998971112233",
      email: "student1@gmail.com",
      fullName: "Shahnoza Rustamova",
      role: "student" as const,
      tgUsername: "shahnoza_r",
    },
    {
      phone: "+998974445566",
      email: "student2@gmail.com",
      fullName: "Sardor Tillayev",
      role: "student" as const,
      tgUsername: "sardor_t",
    },
    {
      phone: "+998977778899",
      email: "student3@gmail.com",
      fullName: "Nigora Yusupova",
      role: "student" as const,
      tgUsername: "nigora_y",
    },
    {
      phone: "+998903332211",
      email: "student4@gmail.com",
      fullName: "Bekzod Olimov",
      role: "student" as const,
      tgUsername: "bekzod_o",
    },
    {
      phone: "+998905554433",
      email: "student5@gmail.com",
      fullName: "Dildora Ahmedova",
      role: "student" as const,
      tgUsername: "dildora_a",
    },
    {
      phone: "+998912223344",
      email: "student6@gmail.com",
      fullName: "Azizbek Toshmatov",
      role: "student" as const,
      tgUsername: "azizbek_t",
    },
    {
      phone: "+998918889900",
      email: "student7@gmail.com",
      fullName: "Feruza Jalilova",
      role: "student" as const,
      tgUsername: "feruza_j",
    },
  ];

  const createdUsers = [];
  for (const u of seededUsersData) {
    const [inserted] = await db
      .insert(users)
      .values({
        phone: u.phone,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        tgUsername: u.tgUsername,
        locale: "uz",
        lastLoginAt: new Date(),
      })
      .onConflictDoNothing()
      .returning();

    if (inserted) {
      createdUsers.push(inserted);
      await db
        .insert(userProfiles)
        .values({
          userId: inserted.id,
          city: "Toshkent",
          profession: u.role === "student" ? "Startapchi / Tadbirkor" : "AI Injiniring Mutaxassisi",
          goal: "AI yordamida tezkor mahsulotlar qurish va biznesni avtomatlashtirish",
          source: "Telegram Mini App",
          bio: `${u.fullName} Mirzo Academy jamiyatining faol a'zosi.`,
        })
        .onConflictDoNothing();
    }
  }

  // Fetch all users to map IDs safely
  const allUsersList = await db.select().from(users);
  const adminUser = allUsersList.find((u) => u.role === "superadmin") || allUsersList[0];
  const mentorUser = allUsersList.find((u) => u.role === "mentor") || allUsersList[0];
  const studentUsers = allUsersList.filter((u) => u.role === "student");

  // 2. Seed 2 Courses with Full Module Trees & Homeworks
  console.log("2/10 Courses, Sections, Lessons & Homeworks seeding...");

  // Course 1: Vibe Coding Express
  const [courseExpress] = await db
    .insert(courses)
    .values({
      slug: "vibe-coding-express",
      title: "Vibe Coding Express",
      subtitle: "AI bilan real mahsulotlar (web, bot, MVP) qurish mentorlik kursi",
      description:
        "Dasturchilarsiz, g'oyadan jonli mahsulotgacha 8 haftada yetib boring. Claude Code, Cursor va Next.js bilan professional darajadagi dasturlarni AI orqali yozishni o'rganing.",
      coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200",
      level: "Tadbirkorlar va Mutaxassislar uchun",
      durationWeeks: 8,
      priceSum: "2990000.00",
      oldPriceSum: "3990000.00",
      installmentMonths: 3,
      status: "published",
      seoTitle: "Vibe Coding Express - AI bilan dasturlash kursi Uzbek",
      seoDescription: "8 haftada Claude Code va Cursor bilan dasturlashni o'rganing va o'z startapingizni ishga tushiring.",
      sortOrder: 1,
    })
    .onConflictDoNothing()
    .returning();

  // Course 2: AI Asoslari
  const [courseBasics] = await db
    .insert(courses)
    .values({
      slug: "ai-asoslari",
      title: "AI Asoslari & Prompt Injiniring",
      subtitle: "ChatGPT, Claude va Gemini orqali kundalik ishlarni 90% avtomatlashtirish",
      description:
        "Prompt-injiniring sirlari, sun'iy intellekt vositalari va biznes jarayonlarini avtomatlashtirish bo'yicha amaliy 4 haftalik intensiv kurs.",
      coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
      level: "Boshlang'ich",
      durationWeeks: 4,
      priceSum: "990000.00",
      oldPriceSum: "1490000.00",
      installmentMonths: 2,
      status: "published",
      seoTitle: "AI Asoslari Kursi - Prompt Engineering O'zbekistonda",
      seoDescription: "ChatGPT, Claude va Gemini vositalarida professional ishlash va avtomatlashtirish.",
      sortOrder: 2,
    })
    .onConflictDoNothing()
    .returning();

  // Express Sections & Lessons
  const targetExpressId = courseExpress?.id || (await db.select().from(courses).where(eq(courses.slug, "vibe-coding-express")))[0]?.id;
  const targetBasicsId = courseBasics?.id || (await db.select().from(courses).where(eq(courses.slug, "ai-asoslari")))[0]?.id;

  const expressSectionsData = [
    {
      title: "1-Modul: Vibe Coding Falsafasi va Muhit Sozlamalari",
      description: "AI agentlar (Claude Code, Cursor) bilan samarali muloqot va loyiha arxitekturasi.",
      sortOrder: 1,
      lessons: [
        {
          slug: "1-1-vibe-coding-nima",
          title: "1.1 Vibe Coding falsafasi va AI davrida dasturlash",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          durationSec: 1200,
          contentMd: "# Vibe Coding Asoslari\n\nVibe coding - bu dastur sintaksisini qo'lda yozmasdan, AI agentlariga (Claude Code, Cursor) aniq va tizimli ko'rsatma berib mahsulot yaratish Usulidir.",
          isFreePreview: true,
          promptsJson: [{ title: "Loyiha arxitekturasi prompti", prompt: "Men Next.js, Drizzle va Tailwind bo'yicha platforma qurmoqchiman. Menga loyiha fayllar tuzilmasini taklif et." }],
          materialsJson: [{ name: "AI Agentlar Qo'llanmasi PDF", url: "https://example.com/docs/agent-guide.pdf" }],
        },
        {
          slug: "1-2-cursor-ide-setup",
          title: "1.2 Cursor IDE va Rule fayllarni sozlash (AGENTS.md)",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgWgQ",
          durationSec: 1500,
          contentMd: "# Cursor IDE Konfiguratsiyasi\n\nAGENTS.md va .cursorrules fayllari orqali AI ga loyiha qoidalarini singdirish.",
          isFreePreview: false,
          promptsJson: [{ title: "AGENTS.md andozasi", prompt: "Ushbu loyiha uchun AGENTS.md faylini shakllantirib ber..." }],
          materialsJson: [],
        },
      ],
    },
    {
      title: "2-Modul: Frontend va UI Yaratish",
      description: "Tailwind CSS, Lucide va Shard/Next.js komponentlarini AI orqali qurish.",
      sortOrder: 2,
      lessons: [
        {
          slug: "2-1-tailwind-ui-components",
          title: "2.1 UI Komponentlar va Dizayn Sistemasi",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          durationSec: 1800,
          contentMd: "# UI Komponentlar\n\nCream va Ink mavzusi asosida landing page va dashboard komponentlarini yaratish.",
          isFreePreview: false,
          promptsJson: [],
          materialsJson: [],
        },
      ],
    },
    {
      title: "3-Modul: Backend, Database va Next.js API Routes",
      description: "PostgreSQL, Drizzle ORM va Next.js App Router bilan backend yaratish.",
      sortOrder: 3,
      lessons: [
        {
          slug: "3-1-drizzle-orm-schema",
          title: "3.1 Drizzle ORM sxemalari va PostgreSQL",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          durationSec: 2100,
          contentMd: "# Database Architecture\n\nDrizzle ORM bilan relational jadvallar va migrationlar yaratish.",
          isFreePreview: false,
          promptsJson: [],
          materialsJson: [],
        },
      ],
    },
  ];

  const allAssignments: Array<{ id: string; title: string }> = [];

  if (targetExpressId) {
    for (const secData of expressSectionsData) {
      const [sec] = await db
        .insert(courseSections)
        .values({
          courseId: targetExpressId,
          title: secData.title,
          description: secData.description,
          sortOrder: secData.sortOrder,
        })
        .onConflictDoNothing()
        .returning();

      if (sec) {
        let lessonOrder = 1;
        for (const lData of secData.lessons) {
          const [les] = await db
            .insert(lessons)
            .values({
              sectionId: sec.id,
              slug: lData.slug,
              title: lData.title,
              videoUrl: lData.videoUrl,
              durationSec: lData.durationSec,
              contentMd: lData.contentMd,
              promptsJson: lData.promptsJson,
              materialsJson: lData.materialsJson,
              isFreePreview: lData.isFreePreview,
              sortOrder: lessonOrder++,
            })
            .onConflictDoNothing()
            .returning();

          if (les) {
            // Add Homework Assignment for each lesson
            const [assignment] = await db
              .insert(homeworkAssignments)
              .values({
                lessonId: les.id,
                title: `${lData.title} bo'yicha amaliy vazifa`,
                descriptionMd: `Ushbu vazifada ${lData.title} mavzusida o'tilgan bilimlardan foydalanib o'z loyihangizda amaliy natija ko'rsatishingiz lozim.`,
                acceptanceCriteria: [
                  { criterion: "Loyiha arxitekturasi va kod tozaligi", weight: 4 },
                  { criterion: "AI prompt va javoblarning sifatliligi", weight: 3 },
                  { criterion: "Integratsiya va funksionallik to'liqligi", weight: 3 },
                ],
              })
              .onConflictDoNothing()
              .returning();

            if (assignment) {
              allAssignments.push(assignment);
            }
          }
        }
      }
    }
  }

  // 3. Seed Active Cohort
  console.log("3/10 Cohorts seeding...");
  let seededCohortId = "";
  if (targetExpressId) {
    const [cohort] = await db
      .insert(cohorts)
      .values({
        courseId: targetExpressId,
        name: "Sentabr / Oktyabr Guruhi (Express)",
        startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // starts in 7 days
        endsAt: new Date(Date.now() + 63 * 24 * 60 * 60 * 1000),
        seats: 30,
        priceSum: "2990000.00",
        earlyPriceSum: "2490000.00",
        earlyDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        telegramChatId: "-100192837465",
        status: "active",
      })
      .onConflictDoNothing()
      .returning();

    if (cohort) seededCohortId = cohort.id;
  }

  // 4. Enroll 10 Students with Varied Progress & Submissions in EVERY state
  console.log("4/10 Enrollments, Lesson Progress, Submissions & Reviews seeding...");
  if (seededCohortId && studentUsers.length > 0) {
    for (let i = 0; i < studentUsers.length; i++) {
      const student = studentUsers[i];
      const [enrollment] = await db
        .insert(enrollments)
        .values({
          userId: student.id,
          cohortId: seededCohortId,
          status: "active",
          source: i % 2 === 0 ? "quiz" : "form",
        })
        .onConflictDoNothing()
        .returning();

      // Seed Payments
      if (enrollment) {
        await db
          .insert(payments)
          .values({
            userId: student.id,
            enrollmentId: enrollment.id,
            provider: i % 2 === 0 ? "payme" : "click",
            providerTxnId: `TXN_${Date.now()}_${i}`,
            amountSum: "2490000.00",
            status: "paid",
            paidAt: new Date(),
          })
          .onConflictDoNothing();
      }

      // Seed Submissions in EVERY state: submitted, reviewing, approved, rejected
      if (allAssignments.length > 0) {
        const assignment = allAssignments[i % allAssignments.length];

        const statuses: Array<"submitted" | "reviewing" | "approved" | "rejected"> = [
          "submitted",
          "reviewing",
          "approved",
          "rejected",
        ];
        const status = statuses[i % statuses.length];

        const [sub] = await db
          .insert(homeworkSubmissions)
          .values({
            assignmentId: assignment.id,
            userId: student.id,
            attemptNo: 1,
            payload: {
              githubUrl: `https://github.com/${student.tgUsername || "student"}/vibe-project-${i + 1}`,
              fileUrls: ["https://academy.mirzo.uz/uploads/demo-submission.png"],
              note: `Assalomu alaykum mentor. 1-vazifamni bajardim, iltimos tekshirib bering.`,
            },
            status,
            submittedAt: new Date(Date.now() - (i + 1) * 3600 * 1000),
          })
          .onConflictDoNothing()
          .returning();

        // Add Review for Approved or Rejected submissions
        if (sub && (status === "approved" || status === "rejected") && mentorUser) {
          await db
            .insert(homeworkReviews)
            .values({
              submissionId: sub.id,
              mentorId: mentorUser.id,
              criteriaResults: [
                { criterion: "Loyiha arxitekturasi", score: status === "approved" ? 9 : 4, maxScore: 10 },
                { criterion: "AI prompt tozaligi", score: status === "approved" ? 10 : 5, maxScore: 10 },
              ],
              score: status === "approved" ? "9.50" : "4.50",
              feedbackMd:
                status === "approved"
                  ? "Barakalla! Juda ajoyib bajarilgan. Code pattern va promptlar to'liq talabga javob beradi."
                  : "Vazifada kamchiliklar bor. AGENTS.md fayli noto'g'ri sozlangan, qayta ko'rib chiqing.",
              reviewedAt: new Date(),
            })
            .onConflictDoNothing();
        }
      }
    }
  }

  // 5. Seed 6 Blog Posts (Published, Draft, Scheduled)
  console.log("5/10 Blog Posts seeding...");
  const blogPostsData = [
    {
      slug: "vibe-coding-davrida-dasturlash-sirlari",
      title: "Vibe Coding Davrida Dasturlash: Nega 2026-yilda Sintaksis Yodlash Kerak Emas?",
      excerpt: "Sun'iy intellekt agentlari dastur kodini yozishni o'z zimmasiga olmoqda. Xo'sh, dasturchining asosiy rolim nima bo'ladi?",
      contentMd: "# Vibe Coding in 2026\n\nAI agentlar bilan ishlash dasturlash dunyosini tubdan o'zgartirdi...",
      category: "Metodologiya",
      authorName: "Jasur Bekmuradov",
      seoTitle: "Vibe Coding Davri: AI bilan dasturlash 2026",
      seoDescription: "AI agentlar davrida dasturchi roli va mahsulot yaratish tezligi haqida maqola.",
      status: "published" as const,
      publishedAt: new Date(),
    },
    {
      slug: "cursor-ide-va-claude-code-integratsiyasi",
      title: "Cursor IDE va Claude Code: 10x Tezroq Kod Yozish Bo'yicha Amaliy Qo'llanma",
      excerpt: "Cursor IDE da `.cursorrules` va `AGENTS.md` fayllarini to'g'ri sozlash orqali xatolarni 90% ga kamaytiring.",
      contentMd: "# Cursor IDE & Claude Code\n\nOptimal sozlamalar va prompt engineering usullari...",
      category: "AI Vositalar",
      authorName: "Alisher Zokirov",
      seoTitle: "Cursor IDE va Claude Code bilan 10x samaradorlik",
      seoDescription: "Cursor IDE ni to'g'ri sozlash va Claude Code bilan ishlash bo'yicha yo'riqnoma.",
      status: "published" as const,
      publishedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    },
    {
      slug: "mcp-server-model-context-protocol-uzbek",
      title: "Model Context Protocol (MCP) Nima va U Bilan AI Agentlarni Qanday Ulaymiz?",
      excerpt: "MCP standarti orqali AI larni ma'lumotlar bazangiz va API interfeyslaringizga xavfsiz ulash usuli.",
      contentMd: "# Model Context Protocol (MCP)\n\nMCP - bu AI modellarini tashqi dunyo bilan bog'lovchi yangi standart...",
      category: "Arxitektura",
      authorName: "Jasur Bekmuradov",
      seoTitle: "MCP Server Nima? Model Context Protocol Uzbek",
      seoDescription: "Model Context Protocol arxitekturasi va AI agentlarni DB ga ulash.",
      status: "published" as const,
      publishedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
    },
    {
      slug: "telegram-mini-app-vibe-coding-bilan",
      title: "Telegram Mini App'larni Vibe Coding Orqali 3 Soatda Qurish",
      excerpt: "Web App va Bot API integratsiyasini AI yordamida tezkor ishlab chiqish va monetizatsiya qilish.",
      contentMd: "# Telegram Mini Apps\n\nTelegram ekotizimida biznes yuritish va Mini Applar yaratish...",
      category: "Keyslar",
      authorName: "Malika Karimova",
      seoTitle: "Telegram Mini App Yaratish Vibe Coding Orqali",
      seoDescription: "Telegram Web App va botlarni AI bilan tezkor ishlab chiqish.",
      status: "scheduled" as const,
      publishedAt: new Date(Date.now() + 3 * 24 * 3600 * 1000),
    },
    {
      slug: "prompt-injiniring-biznesda",
      title: "Prompt Injiniring: Biznes Jarayonlarini 90% ga Avtomatlashtirish Usullari",
      excerpt: "ChatGPT va Claude orqali mijozlar bilan muloqot, kontent yaratish va analitikani avtomatlashtirish.",
      contentMd: "# Prompt Injiniring Biznesda\n\nQanday qilib aniq promptlar orqali vaqtni tejash mumkin...",
      category: "Biznes",
      authorName: "Jasur Bekmuradov",
      seoTitle: "Prompt Injiniring va Biznes Avtomatlashtirish",
      seoDescription: "Biznes jarayonlarini AI yordamida avtomatlashtirish sirlari.",
      status: "draft" as const,
      publishedAt: new Date(),
    },
    {
      slug: "drizzle-orm-nextjs-postgres",
      title: "Next.js 14 va Drizzle ORM Bilan Zamonaviy PostgreSQL Arxitekturasi",
      excerpt: "Type-safe database queries va migrationlarni Drizzle ORM bilan tezkor boshqarish.",
      contentMd: "# Next.js & Drizzle ORM\n\nPostgreSQL bazasi bilan ishlash bo'yicha eng so'nggi qo'llanma...",
      category: "Backend",
      authorName: "Alisher Zokirov",
      seoTitle: "Drizzle ORM va Next.js PostgreSQL Yo'riqnoma",
      seoDescription: "TypeScript va Drizzle ORM orqali ma'lumotlar bazasini boshqarish.",
      status: "published" as const,
      publishedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000),
    },
  ];

  for (const post of blogPostsData) {
    await db.insert(blogPosts).values(post).onConflictDoNothing();
  }

  // 6. Seed 50 Glossary Terms
  console.log("6/10 Glossary Terms seeding...");
  const glossaryTermsList = [];
  const categories = ["Metodologiya", "AI Vositalar", "Arxitektura", "Frontend", "Backend", "DevOps", "Biznes"];

  const termsData = [
    { slug: "vibe-coding", termEn: "Vibe Coding", termUz: "Vayb Kodlash", category: "Metodologiya", definition: "Dastur kodi sintaksisini yozmasdan AI agentlariga (Claude Code, Cursor) prompt berib mahsulot yaratish usuli." },
    { slug: "prompt-engineering", termEn: "Prompt Engineering", termUz: "Prompt Injiniringi", category: "Metodologiya", definition: "Sun'iy intellektdan aniq va sifatli natija olish uchun ko'rsatmalarni to'g'ri shakllantirish san'ati." },
    { slug: "mcp-server", termEn: "Model Context Protocol", termUz: "Model Kontekst Protokoli", category: "Arxitektura", definition: "AI agentlarini tashqi ma'lumotlar bazasi va API tizimlariga xavfsiz ulaydigan ochiq standart." },
    { slug: "cursor-ide", termEn: "Cursor IDE", termUz: "Cursor Dasturlash Muhiti", category: "AI Vositalar", definition: "VS Code bazasida yaratilgan, AI model bilan chuqur integratsiyalashgan professional koding muhiti." },
    { slug: "claude-code", termEn: "Claude Code", termUz: "Claude Code Agenti", category: "AI Vositalar", definition: "Anthropic kompaniyasi tomonidan yaratilgan, terminalda avtonom ishlaydigan dasturchi AI agenti." },
    { slug: "drizzle-orm", termEn: "Drizzle ORM", termUz: "Drizzle ORM", category: "Backend", definition: "TypeScript uchun yaratilgan juda tezkor, yengil va type-safe SQL ma'lumotlar bazasi ORM kutubxonasi." },
    { slug: "nextjs-app-router", termEn: "Next.js App Router", termUz: "Next.js App Router", category: "Frontend", definition: "React bazasidagi server komponentlari va fayl tizimiga asoslangan zamonaviy web freymvork." },
    { slug: "tailwind-css", termEn: "Tailwind CSS", termUz: "Tailwind CSS", category: "Frontend", definition: "Dizaynlarni tezkor va moslashuvchan yaratish imkonini beruvchi utility-first CSS freymvorki." },
    { slug: "telegram-mini-app", termEn: "Telegram Mini App (TMA)", termUz: "Telegram Mini App", category: "Frontend", definition: "Telegram messenjeri ichida ishlaydigan, veb texnologiyalarga asoslangan ilova." },
    { slug: "zod-validation", termEn: "Zod Validation", termUz: "Zod Validatsiyasi", category: "Backend", definition: "TypeScript uchun ma'lumotlar sxemasini tekshiruvchi va tiplarni kafolatlovchi kutubxona." },
  ];

  // Generate up to 50 terms
  for (let i = 1; i <= 50; i++) {
    const base = termsData[(i - 1) % termsData.length];
    const category = categories[i % categories.length];
    glossaryTermsList.push({
      slug: i <= termsData.length ? base.slug : `${base.slug}-${i}`,
      termEn: i <= termsData.length ? base.termEn : `${base.termEn} Term ${i}`,
      termUz: i <= termsData.length ? base.termUz : `${base.termUz} Atamasi ${i}`,
      category,
      definition: base.definition + ` (Amaliy qo'llanilishi va 2026-yilgi standartlar).`,
      sortOrder: i,
    });
  }

  for (const term of glossaryTermsList) {
    await db.insert(glossaryTerms).values(term).onConflictDoNothing();
  }

  // 7. Seed Testimonials
  console.log("7/10 Testimonials seeding...");
  const testimonialsData = [
    {
      body: "Vibe Coding Express kursida 8 haftada o'z startapim uchun to'liq ishlaydigan CRM va bot tizimini qurdim. Dasturchilarga sarflanadigan oylarni va millionlarni tejab qoldim!",
      rating: 5,
      status: "approved",
    },
    {
      body: "Cursor IDE va Claude Code bilan ishlashni o'rganib, kompaniyamizdagi ichki vositalarni avtomatlashtirdik. AI Asoslari kursi mutaxassislar uchun juda qimmatli!",
      rating: 5,
      status: "approved",
    },
  ];

  for (const test of testimonialsData) {
    await db
      .insert(testimonials)
      .values({
        userId: studentUsers[0]?.id || adminUser.id,
        courseId: targetExpressId,
        type: "text",
        body: test.body,
        rating: test.rating,
        status: test.status,
      })
      .onConflictDoNothing();
  }

  // 8. Seed Verified Expert Profiles
  console.log("8/10 Verified Expert Profiles seeding...");
  if (mentorUser) {
    await db
      .insert(experts)
      .values({
        userId: mentorUser.id,
        slug: "alisher-zokirov-ai-mentor",
        tagline: "Senior AI & Vibe Coding Architect | 5+ yillik amaliy tajriba",
        skills: ["Claude Code", "Cursor IDE", "Next.js", "Drizzle ORM", "Prompt Engineering"],
        gradesJson: { experienceYears: 5, completedProjects: 34, rating: 4.95 },
        availableForWork: true,
        status: "verified",
      })
      .onConflictDoNothing();
  }

  // 9. Seed FAQs
  console.log("9/10 FAQs seeding...");
  const faqsData = [
    {
      question: "Vibe Coding nima va kursda qatnashish uchun dasturlash tajribasi kerakmi?",
      answer: "Yo'q, dasturlash tajribasi shart emas. Vibe Coding - bu sintaksis yozmasdan AI agentlariga to'g mezon prompt berib real mahsulotlar yaratish usuli.",
      category: "Umumiy",
      sortOrder: 1,
    },
    {
      question: "Bo'lib to'lash (Payme / Click) imkoniyati bormi?",
      answer: "Ha, Payme va Click tizimlari orqali 3 oygacha foizsiz bo'lib to'lash imkoniyati mavjud.",
      category: "To'lovlar",
      sortOrder: 2,
    },
    {
      question: "100% pulni qaytarish kafolati qanday ishlaydi?",
      answer: "Dastlabki 14 kun davomida o'quv kursi ma'qul kelmasa, to'langan summa hech qanday savollarsiz 100% qaytarib beriladi.",
      category: "Kafolat",
      sortOrder: 3,
    },
    {
      question: "Kursni muvaffaqiyatli tugatgach sertifikat beriladimi?",
      answer: "Ha, amaliy topshiriqlarni va yakuniy loyihani muvaffaqiyatli topshirgan barcha o'quvchilarga QR-kodli rasmiy raqamli sertifikat taqdim etiladi.",
      category: "Sertifikat",
      sortOrder: 4,
    },
  ];

  for (const f of faqsData) {
    await db.insert(faqs).values(f).onConflictDoNothing();
  }

  // 10. Seed Job Openings
  console.log("10/10 Job Openings seeding...");
  const jobsData = [
    {
      title: "Senior Vibe Coding Mentor",
      department: "Ta'lim bo'limi",
      location: "Toshkent / Masofaviy",
      type: "To'liq stavka",
      descriptionMd: "# Senior Vibe Coding Mentor\n\nTalabalarning amaliy loyihalarini ko'rib chiqish va AI agentlar bo'yicha maslahat berish.",
      requirements: ["Next.js & Drizzle tajribasi", "Claude Code / Cursor ni mukammal bilish", "Mentorlik ishtiyoqi"],
      status: "active",
    },
    {
      title: "Community Manager & CRM Specialist",
      department: "Sotuv va Mijozlar Qo'llab-quvvatlash",
      location: "Toshkent",
      type: "To'liq stavka",
      descriptionMd: "# Community Manager\n\nTelegram hamjamiyatini yuritish va leadlar bilan muloqot qilish.",
      requirements: ["Uzbek tilida ravon so'zlashuv", "CRM va Telegram botlar bilan ishlash"],
      status: "active",
    },
  ];

  for (const j of jobsData) {
    await db.insert(jobOpenings).values(j).onConflictDoNothing();
  }

  console.log("🎉 Seeding completed successfully with full realistic Uzbek data!");
}

main().catch((err) => {
  console.error("❌ Seeding error:", err);
  process.exit(1);
});
