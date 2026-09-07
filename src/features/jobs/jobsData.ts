export interface JobOpeningItem {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  experience: string;
  descriptionMd: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  status: "active" | "closed";
  postedDate: string;
}

export const JOB_DEPARTMENTS = [
  "Barchasi",
  "Ta'lim & Mentorlik",
  "Dasturlash & AI",
  "Marketing & Sotuv",
  "Kontent & SMM",
] as const;

export const STATIC_JOB_OPENINGS: JobOpeningItem[] = [
  {
    id: "job-01",
    slug: "senior-vibe-coding-mentor",
    title: "Senior Vibe Coding Mentor",
    department: "Ta'lim & Mentorlik",
    location: "Toshkent / Masofaviy (Gibrid)",
    type: "To'liq stavka",
    salary: "15,000,000 - 25,000,000 UZS",
    experience: "2+ yil dasturlash yoki AI vositalari tajribasi",
    descriptionMd: "Mirzo Academy (academy.mirzo.uz) platformasining asosiy yo'nalishi — Vibe Coding Express talabalariga mentorlik qilish, uy vazifalarini ko'rib chiqish va amaliy MVP loyihalarini yaratishda yo'l-yo'riq ko'rsatish.",
    responsibilities: [
      "Vibe Coding Express kohortasi talabalariga haftalik jonli sessiyalar o'tkazish;",
      "Talabalarning Next.js, Drizzle ORM va Cursor/Claude Code asosidagi kodlarini ko'rib chiqish va baholash;",
      "Real-world MVP arxitekturasi bo'yicha maslahatlar berish;",
      "O'quv dasturini eng so'nggi AI trendlari bilan boyitib borish.",
    ],
    requirements: [
      "TypeScript, Next.js (App Router), Tailwind CSS va PostgreSQL/Drizzle bo'yicha chuqur bilim;",
      "Claude Code, Cursor IDE va zamonaviy LLM vositalarini professional darajada qo'llash tajribasi;",
      "Murakkab texnik bilimlarni o'zbek tilida sodda va ravon tushuntira olish qobiliyati;",
      "Pedagogik yoki mentorlik ishtiyoqi, sabr va e'tibor.",
    ],
    benefits: [
      "Raqobatbardosh oylik maosh va kohorta natijalariga ko'ra oylik bonuslar;",
      "Barcha eng so'nggi AI vositalariga (Claude Max, Cursor Pro, ChatGPT Plus) bepul to'liq obunalar;",
      "Erkin ish grafigi va masofaviy ishlash imkoniyati;",
      "Toshkent markazidagi shinam kovorking ofis.",
    ],
    status: "active",
    postedDate: "2026-09-02",
  },
  {
    id: "job-02",
    slug: "full-stack-ai-integrator",
    title: "Full-Stack AI Integrator / Dasturchi",
    department: "Dasturlash & AI",
    location: "Masofaviy (Remote)",
    type: "To'liq stavka",
    salary: "12,000,000 - 20,000,000 UZS",
    experience: "1.5+ yil veb dasturlash",
    descriptionMd: "Platformamizning LMS, CRM va Model Context Protocol (MCP) server integratsiyalarini rivojlantirish, to'lov shlyuzlari (Payme, Click) va Telegram bot ekotizimini kengaytirish.",
    responsibilities: [
      "Next.js 15, Drizzle ORM va Node.js infratuzilmasini optimallashtirish;",
      "AI agentlari uchun maxsus MCP server vositalari va API shlyuzlarini yaratish;",
      "Payme va Click to'lov tizimlari webhooklarini xavfsiz va barqaror integratsiya qilish;",
      "Avtomatlashtirilgan testlar (Vitest, Playwright) yozish va CI/CD jarayonlarini nazorat qilish.",
    ],
    requirements: [
      "TypeScript, Next.js, PostgreSQL va Docker texnologiyalarida ishlash tajribasi;",
      "REST API, Webhooklar va asinxron arxitektura tushunchalari;",
      "AI API'lari (Anthropic Claude, OpenAI, Telegram Bot API) bilan ishlash ko'nikmasi;",
      "Clean Code va Zod validatsiyasi tamoyillariga qat'iy rioya qilish.",
    ],
    benefits: [
      "Dunyoning istalgan nuqtasidan 100% masofaviy ishlash;",
      "Tezkor martaba o'sishi va platformaning ulush (ESOP) dasturida ishtirok etish imkoniyati;",
      "IT konferensiyalar va xalqaro tadbirlar uchun korporativ byudjet;",
      "Har yili yangilanadigan texnika kompensatsiyasi.",
    ],
    status: "active",
    postedDate: "2026-09-03",
  },
  {
    id: "job-03",
    slug: "community-growth-manager",
    title: "Community & Telegram Growth Manager",
    department: "Marketing & Sotuv",
    location: "Toshkent (Ofis yoki Gibrid)",
    type: "To'liq stavka",
    salary: "8,000,000 - 14,000,000 UZS + KPI bonuslar",
    experience: "1+ yil Telegram kanallar yoki hamjamiyat boshqaruvi",
    descriptionMd: "Mirzo Academy'ning 15,000+ kishilik Telegram jamoasini faol ushlab turish, vebinarlar tashkillashtirish va yangi talabalar oqimini jalb qilish.",
    responsibilities: [
      "Telegram kanali va yopiq talabalar guruhlarida faollikni oshirish, savollarga zudlik bilan javob berish;",
      "Haftalik bepul jonli darslar va 'Build in Public' meetlarini rejalashtirish va olib borish;",
      "Leadlar va ro'yxatdan o'tganlar bilan CRM tizimi orqali samimiy muloqot o'rnatish;",
      "Hamjamiyat a'zolari o'rtasida networking va loyihalar namoyishini tashkil etish.",
    ],
    requirements: [
      "O'zbek tilida savodli, tushunarli va jalb qiluvchi matn yoza olish mahorati;",
      "Telegram botlar, CRM tizimlar (AmoCRM yoki ichki tizimimiz) bilan ishlash tajribasi;",
      "Yuqori muloqot madaniyati, empatiya va ijobiy energiya;",
      "Sun'iy intellekt va zamonaviy texnologiyalarga qiziqish.",
    ],
    benefits: [
      "Har bir sotilgan kohorta kursi uchun saxiy KPI bonuslari;",
      "Kompaniya hisobidan o'quv kurslari va mentorlik;",
      "Yosh, g'ayratli va innovatsion jamoada ishlash;",
      "Bepul tushlik va qahva.",
    ],
    status: "active",
    postedDate: "2026-09-05",
  },
  {
    id: "job-04",
    slug: "technical-content-creator",
    title: "Technical Content Creator / YouTube & Reels",
    department: "Kontent & SMM",
    location: "Toshkent / Gibrid",
    type: "To'liq stavka / Loyihaviy",
    salary: "10,000,000 - 18,000,000 UZS",
    experience: "1+ yil video montaj va kontent yaratish",
    descriptionMd: "Vibe coding va AI yangiliklari bo'yicha qiziqarli, qisqa (Instagram Reels, YouTube Shorts) hamda to'liq metrajli amaliy qo'llanma videolarini tayyorlash.",
    responsibilities: [
      "AI vositalarining yangi xususiyatlari haqida tezkor qisqa videolar (Reels/Shorts) ishlab chiqarish;",
      "Vibe Coding kurslarimizdagi talabalar muvaffaqiyat hikoyalari bo'yicha video intervyular olish;",
      "YouTube uchun darsliklar va keyslar stsenariylarini ishlab chiqish va montaj qilish;",
      "Vizuallarni AI vositalari (Midjourney, Runway) yordamida boyitish.",
    ],
    requirements: [
      "Premiere Pro, After Effects yoki CapCut bilan professional darajada ishlash;",
      "Kamerada erkin so'zlash yoki instruktorlarimiz nutqini qiziqarli montaj qilish qobiliyati;",
      "YouTube va Instagram algoritmlarini yaxshi tushunish;",
      "Kreativ fikrlash va yangi trendlarni tez ilg'ay olish.",
    ],
    benefits: [
      "Zamonaviy suratga olish texnikalari (kameralar, yorug'lik, mikrofonlar) bilan to'liq ta'minlangan studiya;",
      "Ko'rishlar soni va yangi obunachilar o'sishi bo'yicha alohida oylik mukofotlar;",
      "Erkin ish jadvali.",
    ],
    status: "active",
    postedDate: "2026-09-06",
  },
];
