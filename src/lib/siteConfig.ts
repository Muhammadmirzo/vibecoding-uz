import { z } from "zod";
import { servicesPageCopySchema } from "@/features/services/serviceSchemas";
import { servicesCatalog } from "@/features/services/servicesCatalog";

export const siteConfigSchema = z.object({
  nextCohortDate: z.string(),
  nextCohortShortDate: z.string(),
  guaranteeDays: z.number(),
  guaranteeText: z.string(),
  guaranteeTermsUrl: z.string(),
  guaranteeSummary: z.string(),
  sessionFormat: z.string(),
  stats: z.object({
    studentsCount: z.string(),
    yearsExperience: z.number(),
    yearsExperienceLabel: z.string(),
    liveStartupsCount: z.string(),
    projectsCount: z.string(),
  }),
  courses: z.record(
    z.object({
      price: z.string(),
      oldPrice: z.string(),
      installment: z.string(),
    })
  ),
  servicesPage: servicesPageCopySchema,
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;

export const siteConfig: SiteConfig = siteConfigSchema.parse({
  nextCohortDate: "15-Oktyabr, 2026",
  nextCohortShortDate: "15-Oktyabr",
  guaranteeDays: 7,
  guaranteeText: "7 kunlik 100% pul qaytarish kafolati",
  guaranteeTermsUrl: "/pul-qaytarish",
  guaranteeSummary: "Kursni boshlaganizdan keyin 7 kun ichida belgilangan shartlarni bajarib, amaliy foyda ko'rmaganingizni tasdiqlashingiz mumkin.",
  sessionFormat: "8 haftalik jonli sessiyalar va yozuvlar",
  // Fakt: 1 jonli loyiha (Clash Nexus). Talaba soni birinchi guruhdan keyin yangilanadi.
  stats: {
    studentsCount: "Birinchi guruh",
    yearsExperience: 0,
    yearsExperienceLabel: "Yangi",
    liveStartupsCount: "1",
    projectsCount: "1",
  },
  // NARXLAR — egasi shu yerdan o'zgartiradi: price (asosiy), oldPrice (price bilan teng bo'lsa chegirma ko'rinmaydi; katta yozilsa usti chizilgan eski narx chiqadi), installment (bo'lib to'lash matni). O'zgartirgach: npm run build && git push.
  courses: {
    "vibe-coding-express": {
      price: "550 000 so'm",
      oldPrice: "550 000 so'm",
      installment: "183 334 so'm / oyiga (3 oy)",
    },
    "ai-asoslari": {
      price: "550 000 so'm",
      oldPrice: "550 000 so'm",
      installment: "275 000 so'm / oyiga (2 oy)",
    },
  },
  // XIZMATLAR MATNI — CTA va savol-javoblar uchun yagona tahrir nuqtasi.
  servicesPage: {
    eyebrow: "Loyihani sizga topshiramiz",
    title: "G'oyangizni ishlaydigan xizmatga aylantiramiz",
    promise: "AI yordamida web ilova, Telegram bot yoki ish jarayonini avtomatlashtirishni 7 kun ichida rejalashtirib, yetkazib beramiz.",
    ctaLabel: "Telegram'da maslahat olish",
    telegramUrl: "https://t.me/m/ODAfK_QIMjky",
    portfolioLabel: "Namuna ishlar",
    process: [
      { title: "Bepul 3-kunlik tahlil", description: "Vazifani, ma'lumotlarni va kutilayotgan natijani birgalikda aniqlashtiramiz." },
      { title: "Aniq taklif", description: "Miqdor, muddat va kengayish chegarasini yozma tarzda tasdiqlaymiz." },
      { title: "7 kunlik yetkazib berish", description: "Rejalashtirilgan ishni bajarib, ishlatish bo'yicha qo'llanma beramiz." },
    ],
    faq: [
      { question: "Dasturlash bilimim bo'lishi shartmi?", answer: "Yo'q. Vazifani tushuntirish va amaliy qarorlar uchun javob berish kifoya." },
      { question: "Mendan nima kerak bo'ladi?", answer: "Muqova, Telegram orqali muloqot, zarur kirish ma'lumotlari va muddatga mos bo'lish." },
      { question: "Ma'lumotlarim xavfsizmi?", answer: "Ruxsat berilgan ma'lumotlardan foydalanamiz. Maxfiy kalitlarni yozib qo‘yish yoki begona xizmatlarga berish tavsiya etilmaydi." },
      { question: "Nima kirmaydi?", answer: "Uzoq muddatli qo‘llab-quvvatlash, doimiy xizmatlar, marketing va natijani kafolatlash majburiyatiga kirmaydi." },
    ],
    trustText: "Aks holda natija yoki foyda kafolatlash mumkin emas. Avval haqiqiy misol bilan ishlaymiz.",
  },
});

export { servicesCatalog };

// Header.tsx navigation integration constant (do not import client state here).
export const SERVICES_NAV_ITEM = {
  label: "Xizmatlar",
  href: "/xizmatlar",
} as const;
