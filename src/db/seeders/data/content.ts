export const TESTIMONIALS_DATA: Array<{ body: string; rating: number; status: "approved" }> = [];

export const FAQS_DATA = [
  { question: "Vibe Coding nima va kursda qatnashish uchun dasturlash tajribasi kerakmi?", answer: "Yo'q, dasturlash tajribasi shart emas. Vibe Coding - bu sintaksis yozmasdan AI agentlariga to'g' mezon prompt berib real mahsulotlar yaratish usuli.", category: "Umumiy", sortOrder: 1 },
  { question: "Bo'lib to'lash (Payme / Click) imkoniyati bormi?", answer: "Ha, Payme va Click tizimlari orqali 3 oygacha foizsiz bo'lib to'lash imkoniyati mavjud.", category: "To'lovlar", sortOrder: 2 },
  { question: "100% pulni qaytarish kafolati qanday ishlaydi?", answer: "Dastlabki 7 kun davomida o'quv kursi ma'qul kelmasa, to'langan summa hech qanday savollarsiz 100% qaytarib beriladi.", category: "Kafolat", sortOrder: 3 },
  { question: "Kursni muvaffaqiyatli tugatgach sertifikat beriladimi?", answer: "Ha, amaliy topshiriqlarni va yakuniy loyihani muvaffaqiyatli topshirgan barcha o'quvchilarga QR-kodli rasmiy raqamli sertifikat taqdim etiladi.", category: "Sertifikat", sortOrder: 4 },
];

export const JOBS_DATA = [
  { title: "Senior Vibe Coding Mentor", department: "Ta'lim bo'limi", location: "Toshkent / Masofaviy", type: "To'liq stavka", descriptionMd: "# Senior Vibe Coding Mentor\n\nTalabalarning amaliy loyihalarini ko'rib chiqish va AI agentlar bo'yicha maslahat berish.", requirements: ["Next.js & Drizzle tajribasi", "Claude Code / Cursor ni mukammal bilish", "Mentorlik ishtiyoqi"], status: "active" },
  { title: "Community Manager & CRM Specialist", department: "Sotuv va Mijozlar Qo'llab-quvvatlash", location: "Toshkent", type: "To'liq stavka", descriptionMd: "# Community Manager\n\nTelegram hamjamiyatini yuritish va leadlar bilan muloqot qilish.", requirements: ["Uzbek tilida ravon so'zlashuv", "CRM va Telegram botlar bilan ishlash"], status: "active" },
];
