import { siteConfig } from "@/lib/siteConfig";

export interface RoadmapWeek {
  week: string;
  title: string;
  outcome: string;
  project: string;
}

export interface CourseFaq {
  question: string;
  answer: string;
}

export interface CourseContent {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  level: string;
  format: string;
  outcomes: string[];
  forWhom: string[];
  notForWhom: string[];
  roadmap: RoadmapWeek[];
  projects: { title: string; description: string }[];
  faqs: CourseFaq[];
}

function expressPricing() {
  const course = siteConfig.courses["vibe-coding-express"];
  return { price: course.price, oldPrice: course.oldPrice, installment: course.installment };
}

function basicsPricing() {
  const course = siteConfig.courses["ai-asoslari"];
  return { price: course.price, oldPrice: course.oldPrice, installment: course.installment };
}

export function getCoursePricing(slug: string) {
  return slug === "ai-asoslari" ? basicsPricing() : expressPricing();
}

export const COURSES: Record<string, CourseContent> = {
  "vibe-coding-express": {
    slug: "vibe-coding-express",
    title: "Vibe Coding Express",
    subtitle: "AI bilan real mahsulotlar (veb, bot, MVP) qurish mentorlik kursi",
    description:
      "8 haftalik amaliy guruh kursi. Kod yozishni bilmasangiz ham, Claude Code va Cursor yordamida g'oyangizni ishlaydigan haqiqiy mahsulotga aylantirasiz.",
    duration: "8 hafta (intensiv)",
    level: "Boshlang'ich daraja talab qilinmaydi",
    format: siteConfig.sessionFormat,
    outcomes: [
      "G'oyangizni 8 haftada ishlaydigan veb-ilova yoki Telegram botga aylantirasiz",
      "Claude Code va Cursor bilan mustaqil mahsulot qurolish ko'nikmasini olasiz",
      "To'lov tizimlari (Payme, Click) ulangan real loyihani ishga tushirasiz",
      "Xavfsizlik va deploy asoslarini bilgan holda loyihani e'lon qilasiz",
    ],
    forWhom: [
      "Tadbirkorlar — g'oyasini dasturchisiz tez sinab ko'rmoqchilar",
      "Frilanserlar — mijozlarga AI yechimlar sotmoqchilar",
      "Talabalar — 8 haftada portfolio uchun real loyiha qurmoqchilar",
    ],
    notForWhom: [
      "Faqat video ko'rib o'tirmoqchilar — bu yerda har darsda o'zingiz qurasiz",
      "Bir kechada boy bo'lish sirini izlayotganlar — natija 8 hafta mehnat evaziga",
      "Haftasiga kamida 8 soat ajrata olmaydiganlar — intensiv tempga ulgurish qiyin",
    ],
    roadmap: [
      { week: "1-hafta", title: "Vibe coding va prompt asoslari", outcome: "AI ga to'g'ri topshiriq berishni o'rganasiz", project: "Birinchi mini-sahifa" },
      { week: "2-hafta", title: "Claude Code va Cursor muhiti", outcome: "Ish muhitini sozlab, tez ishlashni boshlaysiz", project: "Loyiha skeleti" },
      { week: "3-hafta", title: "Front-end va UI komponentlar", outcome: "Tayyor komponentlardan chiroyli interfeys yig'asiz", project: "Mahsulot interfeysi" },
      { week: "4-hafta", title: "Ma'lumotlar bazasi (PostgreSQL)", outcome: "Foydalanuvchi va buyurtmalarni saqlashni o'rganasiz", project: "Ishlaydigan baza" },
      { week: "5-hafta", title: "Telegram bot va avtomatlashtirish", outcome: "Bot orqali mijozlar bilan ishlashni yo'lga qo'yasiz", project: "Jonli Telegram bot" },
      { week: "6-hafta", title: "Payme va Click to'lovlari", outcome: "Mahsulotingiz pul qabul qila boshlaydi", project: "To'lov ulangan MVP" },
      { week: "7-hafta", title: "Xavfsizlik va yuklamaga tayyorlik", outcome: "Loyihani himoyalab, xatolardan tozalaysiz", project: "Tekshiruvdan o'tgan loyiha" },
      { week: "8-hafta", title: "Deploy va taqdimot", outcome: "Loyihani e'lon qilib, sertifikat olasiz", project: "Jonli mahsulot + sertifikat" },
    ],
    projects: [
      { title: "Biznes uchun Telegram bot", description: "Buyurtma qabul qiladigan, to'lov ulangan avtomat bot." },
      { title: "Startup MVP sayt", description: "Ro'yxatdan o'tish va to'lov ishlaydigan veb-ilova." },
      { title: "Shaxsiy loyiha", description: "O'z g'oyangizni mentor bilan jonli mahsulotga aylantirish." },
    ],
    faqs: [
      { question: "Dasturlashni bilmasam ham qatnasha olamanmi?", answer: "Ha. Kurs noldan boshlanadi: birinchi haftadanoq AI yordamida kod yozish va tushunishni o'rganasiz. Faqat kompyuterda ishonchli ishlay olish kifoya." },
      { question: "Darslar qanday formatda o'tadi?", answer: `${siteConfig.sessionFormat}. Barcha jonli sessiyalar yozib olinadi va shaxsiy kabinetingizda saqlanadi.` },
      { question: "Kurs oxirida nima qoladi qo'limda?", answer: "Ishlaydigan jonli loyihangiz (sayt yoki bot), GitHub portfolio, bitiruv sertifikati va mustaqil qurish ko'nikmasi." },
      { question: "Pul qaytarish kafolati bormi?", answer: `${siteConfig.guaranteeText}. Batafsil shartlar “Pul qaytarish” sahifasida yozilgan.` },
    ],
  },
  "ai-asoslari": {
    slug: "ai-asoslari",
    title: "AI Asoslari",
    subtitle: "Prompt-injiniring va AI vositalarini noldan o'rganing",
    description:
      "4 haftalik mustaqil onlayn kurs. ChatGPT, Claude va Gemini orqali kundalik ishingiz va kontent tayyorlashni sezilarli tezlashtirasiz.",
    duration: "4 hafta (mustaqil)",
    level: "Mutlaqo boshlang'ich",
    format: "Mustaqil video darslar va amaliy topshiriqlar",
    outcomes: [
      "AI ga aniq topshiriq berish (prompt-injiniring) asoslarini o'zlashtirasiz",
      "Matn, tarjima va hisobotlarni bir necha baravar tez tayyorlaysiz",
      "Rasm va taqdimotlar uchun AI vositalardan foydalana olasiz",
      "Kundalik ish jarayoningizga AI odatini kiritasiz",
    ],
    forWhom: [
      "Ofis xodimlari — hujjat va hisobotlarni tezlashtirmoqchilar",
      "O'qituvchilar va SMM mutaxassislari — kontentni oson tayyorlamoqchilar",
      "Hali kodga kirmasdan AI dan foyda olmoqchilar",
    ],
    notForWhom: [
      "Tayyor ilova yoki bot qurmoqchilar — bu maqsad uchun Vibe Coding Express mos",
      "Jonli mentorlik va guruh muhitini xohlovchilar — bu kurs mustaqil formatda",
      "Chuqur dasturlash o'rganmoqchilar — bu kurs vositalar va ko'nikmalarga qaratilgan",
    ],
    roadmap: [
      { week: "1-hafta", title: "AI turlari va to'g'ri topshiriq", outcome: "Har qanday vazifani AI ga aniq tushuntirasiz", project: "Shaxsiy prompt to'plami" },
      { week: "2-hafta", title: "Matn va kontent yaratish", outcome: "Maqola, post va hujjatlarni tez yozasiz", project: "10 ta tayyor kontent" },
      { week: "3-hafta", title: "Media va hujjat tahlili", outcome: "Rasm, PDF va jadvallar bilan ishlaysiz", project: "Tahliliy hisobot" },
      { week: "4-hafta", title: "Ish unumdorligi tizimi", outcome: "Kundalik ish oqimingizga AI ni ulaysiz", project: "Shaxsiy AI ish rejasi" },
    ],
    projects: [
      { title: "Kontent rejasi", description: "Bir oylik postlar AI bilan bir kunda tayyorlanadi." },
      { title: "Hujjat yordamchisi", description: "Hisobot va xatlarni tez tayyorlash andozalari." },
      { title: "Shaxsiy AI to'plam", description: "Ishingizga mos 20 ta sinovdan o'tgan prompt." },
    ],
    faqs: [
      { question: "Bu kursda kod yoziladimi?", answer: "Yo'q. Bu kurs AI vositalaridan foydalanishga qaratilgan: yozish, tahlil va kontent. Kod yozib mahsulot qurish uchun Vibe Coding Express mavjud." },
      { question: "Qanday qurilmalarda o'qisa bo'ladi?", answer: "Telefon, planshet yoki kompyuter — barcha darslar brauzerda ochiladi, qo'shimcha dastur shart emas." },
      { question: "Keyin Vibe Coding Express ga o'tsam bo'ladimi?", answer: "Ha. AI Asoslarini bitirganlar Vibe Coding Express da ancha tez natija ko'rsatadi, chunki prompt asoslari allaqachon mustahkam bo'ladi." },
      { question: "Pul qaytarish kafolati bormi?", answer: `${siteConfig.guaranteeText}. Batafsil shartlar “Pul qaytarish” sahifasida yozilgan.` },
    ],
  },
};

export const COURSE_SLUGS = Object.keys(COURSES);

export const COMPARISON_ROWS: { label: string; vibe: string; bootcamp: string; youtube: string }[] = [
  { label: "O'quv tili", vibe: "To'liq o'zbek tilida", bootcamp: "Ko'pincha rus/ingliz", youtube: "Tarqoq tillarda" },
  { label: "Amaliyot", vibe: "Har darsda o'z loyihangiz", bootcamp: "Dars oxirida loyiha", youtube: "Faqat kuzatish" },
  { label: "Mentor yordami", vibe: "Shaxsiy tekshiruv", bootcamp: "Guruhli javoblar", youtube: "Yo'q" },
  { label: "Narx", vibe: "Bitta to'lov, bo'lib to'lash bor", bootcamp: "Bir necha baravar qimmat", youtube: "Bepul, lekin tizimsiz" },
  { label: "Natija", vibe: "Jonli mahsulot + sertifikat", bootcamp: "Sertifikat", youtube: "Kafolat yo'q" },
];
