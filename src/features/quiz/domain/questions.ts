export const QUIZ_COURSES = ["vibe-coding-express", "ai-asoslari"] as const;

export type QuizCourseSlug = (typeof QUIZ_COURSES)[number];

export interface QuizOption {
  label: string;
  description?: string;
  targetCourse: QuizCourseSlug;
  weight: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  subtitle?: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Asosiy maqsadingiz nimadan iborat?",
    subtitle: "AI imkoniyatlaridan qanday natija kutayotganingizni tanlang",
    options: [
      {
        label: "Shaxsiy startup, MVP yoki Telegram bot qurish",
        description: "Dasturchilarga bog'lanmasdan o'z loyihamni ishga tushirmoqchiman",
        targetCourse: "vibe-coding-express",
        weight: 3,
      },
      {
        label: "Kundalik ishimni avtomatlashtirish",
        description: "Hujjatlar, kontent va tezkor vazifalarda AI'dan foydalanish",
        targetCourse: "ai-asoslari",
        weight: 2,
      },
      {
        label: "Yangi AI kasbini o'rganib daromadga chiqish",
        description: "Mijozlarga AI yechimlar va botlar yaratib berish",
        targetCourse: "vibe-coding-express",
        weight: 3,
      },
    ],
  },
  {
    id: 2,
    question: "Dasturlash bo'yicha tajribangiz bormi?",
    options: [
      {
        label: "Umuman yo'q (noldan boshlayman)",
        description: "Kod yozishni bilmayman, lekin AI orqali o'rganmoqchiman",
        targetCourse: "vibe-coding-express",
        weight: 2,
      },
      {
        label: "Boshlang'ich (HTML/CSS yoki asoslar)",
        description: "Biroz tushuncham bor, lekin to'liq mahsulot qura olmayman",
        targetCourse: "vibe-coding-express",
        weight: 3,
      },
      {
        label: "AI vositalari bilan ishlab ko'rganman (ChatGPT/Claude)",
        description: "ChatGPT ishlataman, lekin tizimli o'rganmaganman",
        targetCourse: "ai-asoslari",
        weight: 2,
      },
    ],
  },
  {
    id: 3,
    question: "Nima yaratmoqchisiz?",
    options: [
      {
        label: "Veb-sayt, SaaS ilova yoki platforma",
        description: "To'liq interaktiv veb-mahsulot",
        targetCourse: "vibe-coding-express",
        weight: 3,
      },
      {
        label: "Telegram bot va CRM integratsiya",
        description: "Avtomatlashtirilgan savdo yoki xizmat boti",
        targetCourse: "vibe-coding-express",
        weight: 3,
      },
      {
        label: "Sifatli promptlar va media tayyorlash",
        description: "Matn, rasm va tahliliy hisobotlar",
        targetCourse: "ai-asoslari",
        weight: 1,
      },
    ],
  },
  {
    id: 4,
    question: "Haftasiga qancha vaqt ajrata olasiz?",
    options: [
      {
        label: "Haftasiga 8–10 soat (intensiv)",
        description: "Mentorlik guruhi va amaliy vazifalar uchun",
        targetCourse: "vibe-coding-express",
        weight: 3,
      },
      {
        label: "Haftasiga 3–4 soat (mustaqil)",
        description: "Erkin grafikda video darslarni ko'rib boraman",
        targetCourse: "ai-asoslari",
        weight: 2,
      },
    ],
  },
  {
    id: 5,
    question: "Qaysi format siz uchun qulayroq?",
    options: [
      {
        label: "Mentorlik + jonli Q&A va vazifalar tekshiruvi",
        description: "Shaxsiy fikr-mulohaza va Telegram guruh ko'magi",
        targetCourse: "vibe-coding-express",
        weight: 3,
      },
      {
        label: "Mustaqil onlayn darslar",
        description: "Videolarni ko'rib, o'z tezligimda bajarish",
        targetCourse: "ai-asoslari",
        weight: 2,
      },
    ],
  },
];

export const QUIZ_COURSE_META: Record<
  QuizCourseSlug,
  { title: string; tagline: string; courseHref: string }
> = {
  "vibe-coding-express": {
    title: "Vibe Coding Express",
    tagline:
      "G'oyangizni 8 haftada ishlaydigan ilovaga aylantiring — AI bilan, mentor ko'magida.",
    courseHref: "/kurs/vibe-coding-express",
  },
  "ai-asoslari": {
    title: "AI Asoslari",
    tagline:
      "Prompt-injiniring va AI vositalarini noldan o'rganing, ishingizni tezlashtiring.",
    courseHref: "/kurs/ai-asoslari",
  },
};
