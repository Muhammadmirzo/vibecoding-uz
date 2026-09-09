import { getWebsiteScreenshotUrl } from "./portfolioUtils";

export interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  url: string;
  domain: string;
  category: "Startup MVP" | "EdTech" | "AI Bot" | "B2B SaaS";
  description: string;
  imageUrl: string;
  userCount?: string | null;
  badgeText: string;
  isFeatured: boolean;
  sortOrder: number;
}

export const PORTFOLIO_DATA: PortfolioItem[] = [
  {
    id: "edubaza",
    slug: "edubaza",
    title: "EduBaza",
    url: "https://edubaza.uz",
    domain: "edubaza.uz",
    category: "EdTech",
    description: "O'qituvchilar uchun interaktiv ta'lim resurslari va dars ishlanmalari platformasi.",
    imageUrl: getWebsiteScreenshotUrl("https://edubaza.uz"),
    userCount: "27 000+ o'qituvchi foydalanadi",
    badgeText: "Shu metod bilan qurilgan",
    isFeatured: true,
    sortOrder: 1,
  },
  {
    id: "chatla",
    slug: "chatla",
    title: "Chatla",
    url: "https://chatla.uz",
    domain: "chatla.uz",
    category: "B2B SaaS",
    description: "Instagram va Telegram bizneslari uchun mijozlar savollariga avtomatik javob beruvchi sun'iy intellekt xizmati.",
    imageUrl: getWebsiteScreenshotUrl("https://chatla.uz"),
    userCount: "500+ biznes foydalanadi",
    badgeText: "Shu metod bilan qurilgan",
    isFeatured: true,
    sortOrder: 2,
  },
  {
    id: "imkonday",
    slug: "imkonday",
    title: "ImkonDay",
    url: "https://imkonday.uz",
    domain: "imkonday.uz",
    category: "Startup MVP",
    description: "Startaplarni investorlar va venchur fondlar bilan bog'laydigan har oylik pitch platformasi.",
    imageUrl: getWebsiteScreenshotUrl("https://imkonday.uz"),
    userCount: "30+ loyiha pitch qildi",
    badgeText: "Shu metod bilan qurilgan",
    isFeatured: true,
    sortOrder: 3,
  },
  {
    id: "edubazabot",
    slug: "edubazabot",
    title: "EduBaza Telegram Bot",
    url: "https://t.me/edubazabot",
    domain: "t.me/edubazabot",
    category: "AI Bot",
    description: "Pedagoglar uchun tezkor metodik yordamchi va hujjat generatsiyasi boti.",
    imageUrl: getWebsiteScreenshotUrl("https://edubaza.uz"),
    userCount: "15 000+ faol foydalanuvchi",
    badgeText: "Shu metod bilan qurilgan",
    isFeatured: true,
    sortOrder: 4,
  },
  {
    id: "viberesume",
    slug: "viberesume",
    title: "VibeResume AI",
    url: "https://viberesume.uz",
    domain: "viberesume.uz",
    category: "B2B SaaS",
    description: "Nomzodlar uchun sun'iy intellekt yordamida rezume va portfolio yaratuvchi tezkor platforma.",
    imageUrl: getWebsiteScreenshotUrl("https://viberesume.uz"),
    userCount: "1 200+ rezume yaratildi",
    badgeText: "Talabalarimiz loyihasi",
    isFeatured: true,
    sortOrder: 5,
  },
  {
    id: "fastform",
    slug: "fastform",
    title: "FastForm AI",
    url: "https://fastform.uz",
    domain: "fastform.uz",
    category: "Startup MVP",
    description: "Telegram bot va saytlar uchun 1 daqiqada aqlli forma generatori.",
    imageUrl: getWebsiteScreenshotUrl("https://fastform.uz"),
    userCount: "350+ shakl to'ldirildi",
    badgeText: "Talabalarimiz loyihasi",
    isFeatured: true,
    sortOrder: 6,
  },
  {
    id: "legalhelper",
    slug: "legalhelper",
    title: "AI Legal Helper",
    url: "https://legalbot.uz",
    domain: "legalbot.uz",
    category: "AI Bot",
    description: "Kichik biznes egalari uchun shartnoma va huquqiy konsultatsiyalar bo'yicha AI yordamchisi.",
    imageUrl: getWebsiteScreenshotUrl("https://legalbot.uz"),
    userCount: "800+ konsultatsiya",
    badgeText: "Talabalarimiz loyihasi",
    isFeatured: false,
    sortOrder: 7,
  },
  {
    id: "shopspeed",
    slug: "shopspeed",
    title: "ShopSpeed AI",
    url: "https://shopspeed.uz",
    domain: "shopspeed.uz",
    category: "B2B SaaS",
    description: "E-commerce do'konlar uchun mahsulot tavsiflarini avtomatik generatsiya qiluvchi tizim.",
    imageUrl: getWebsiteScreenshotUrl("https://shopspeed.uz"),
    userCount: "120+ do'kon ulangan",
    badgeText: "Talabalarimiz loyihasi",
    isFeatured: false,
    sortOrder: 8,
  },
];
