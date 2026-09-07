export interface QuizQuestion {
  id: number;
  question: string;
  subtitle?: string;
  options: {
    label: string;
    description?: string;
    targetCourse: "vibe-coding-express" | "ai-asoslari";
    weight: number;
  }[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Asosiy maqsadingiz nimadan iborat?",
    subtitle: "AI imkoniyatlaridan qanday natija kutayotganingizni tanlang",
    options: [
      {
        label: "Shaxsiy startup, MVP yoki Telegram bot qurish",
        description: "Dasturchilariga bog'lanmasdan o'z loyihamni ishga tushirmoqchiman",
        targetCourse: "vibe-coding-express",
        weight: 3,
      },
      {
        label: "Kundalik ishimni 90% ga avtomatlashtirish",
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
        label: "Umuman yo'q (Noldan boshlayman)",
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
        description: "ChatGPT ishlataman, lekin mukammal prompter emasman",
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
        label: "Veb-sayt, SaaS ilova yoki Platforma",
        description: "To'liq interaktiv veb mahsulot",
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
        label: "Haftasiga 8–10 soat (Intensiv)",
        description: "Mentorlik guruhi va amaliy vazifalar uchun",
        targetCourse: "vibe-coding-express",
        weight: 3,
      },
      {
        label: "Haftasiga 3–4 soat (Mustaqil)",
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
        label: "Mentorlik + Jonli Q&A va vazifalar tekshiruvi",
        description: "Shaxsiy feedback va Telegram guruh qo'llab-quvvatlovi",
        targetCourse: "vibe-coding-express",
        weight: 3,
      },
      {
        label: "Self-serve (Mustaqil online darslar)",
        description: "Videolarni ko'rib, o'z tezligimda bajarish",
        targetCourse: "ai-asoslari",
        weight: 2,
      },
    ],
  },
];
