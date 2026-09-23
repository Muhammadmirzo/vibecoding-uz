export type IdeaCategory =
  | "bot-telegram"
  | "crm-service"
  | "content-social"
  | "catalog-shop"
  | "boshqa";

export type IdeaComplexity = "simple" | "medium" | "advanced";

export type Range = {
  min: number;
  max: number;
};

export type IdeaPlan = {
  id: string;
  label: string;
  category: IdeaCategory;
  tools: string[];
  roadmap: string[];
  dayRange: Range;
  costRange: Range;
  complexity: IdeaComplexity;
};

export const ideaPresets: IdeaPlan[] = [
  {
    id: "telegram-bot",
    label: "Telegram bot",
    category: "bot-telegram",
    tools: ["Telegram Bot API", "Node.js", "Supabase", "Vercel"],
    roadmap: [
      "Bot ssenariysi va komandalar ro'yxatini aniqlashtirish",
      "Ma'lumotlar bazasi va asosiy bot oqimini qurish",
      "Admin paneli va xatolarni kuzatishni qo'shish",
      "Test va sinov hisobida joylashga tayyorlash",
    ],
    dayRange: { min: 5, max: 10 },
    costRange: { min: 500_000, max: 2_500_000 },
    complexity: "medium",
  },
  {
    id: "service-crm",
    label: "Salon yoki klinika CRM",
    category: "crm-service",
    tools: ["Next.js", "PostgreSQL", "Drizzle ORM", "Tailwind CSS"],
    roadmap: [
      "Mijoz, xizmat va navbat ma'lumotlarini modellashtirish",
      "Admin paneli va kundalik vazifalar oqimini qurish",
      "Mijoz bazasi va rolga kirishni ulash",
      "Mobil ko'rinish, test va sinovdan o'tkazish",
    ],
    dayRange: { min: 10, max: 20 },
    costRange: { min: 1_500_000, max: 5_000_000 },
    complexity: "advanced",
  },
  {
    id: "content-social",
    label: "Kontent va social media",
    category: "content-social",
    tools: ["Next.js", "Telegram API", "Content API", "Supabase"],
    roadmap: [
      "Kontent turi, kanal va nashr jadvalini belgilash",
      "Matn va tasvir tayyorlash interfeysini qurish",
      "Telegram yoki ijtimoiy tarmoqlar API sidan ulash",
      "Jadvalga qo'yish, monitoring va sinovdan o'tkazish",
    ],
    dayRange: { min: 5, max: 12 },
    costRange: { min: 700_000, max: 3_000_000 },
    complexity: "medium",
  },
  {
    id: "catalog-shop",
    label: "Katalog yoki onlayn do'kon",
    category: "catalog-shop",
    tools: ["Next.js", "PostgreSQL", "Stripe yoki Payme", "Supabase"],
    roadmap: [
      "Katalog, mahsulot va narx ma'lumotlarini tuzish",
      "Katalog sahifalari va qidiruvni qurish",
      "Savatcha hamda to'lov oqimini ulash",
      "Mobil moslashuv, test va sinovga joylash",
    ],
    dayRange: { min: 8, max: 18 },
    costRange: { min: 1_200_000, max: 4_500_000 },
    complexity: "advanced",
  },
];

export const categoryLabels: Record<IdeaCategory, string> = {
  "bot-telegram": "Bot va Telegram",
  "crm-service": "CRM, salon va xizmat",
  "content-social": "Kontent va ijtimoiy tarmoqlar",
  "catalog-shop": "Katalog va do'kon",
  boshqa: "Boshqa loyiha",
};

export const excludedCosts = [
  "Kurs narxi",
  "Server va API xarajatlari",
  "Dastur va dizayn vaqti",
] as const;

export const estimationRules = [
  "Bot va Telegram kalit so'zlari bot shabloniga bog'lanadi.",
  "CRM, salon, klinika va xizmat so'zlari xizmat CRM shabloniga bog'lanadi.",
  "Kontent va ijtimoiy tarmoq so'zlari kontent shabloniga bog'lanadi.",
  "Katalog, do'kon va magazin so'zlari do'kon shabloniga bog'lanadi.",
  "Kalit so'z topilmasa, 14–35 kun va 3–12 mln so'mlik keng diapazon beriladi.",
] as const;
