import type { LucideIcon } from "lucide-react";
import { BookOpen, Briefcase, FileText, LayoutGrid, Pencil } from "lucide-react";
import { isClosedRoute } from "@/lib/features/closed";

export interface NavItem {
  href: string;
  title: string;
  description?: string;
  icon: LucideIcon;
}

export interface HeaderSettings {
  headerCtaText?: string;
  headerCtaLink?: string;
  telegramBotLink?: string;
  announcementBannerText?: string;
  announcementBannerLink?: string;
  enableAnnouncementBanner?: boolean;
}

export const courseLinks: NavItem[] = [
  {
    href: "/kurs/vibe-coding-express",
    title: "Vibe Coding Express",
    description: "8 hafta — Claude Code bilan ilovangizni qurib, internetga chiqarasiz",
    icon: BookOpen,
  },
  {
    href: "/kurs/ai-asoslari",
    title: "AI Asoslari",
    description: "Prompt-injiniring va AI vositalari — noldan amaliyotgacha",
    icon: BookOpen,
  },
];

const allResourceLinks: NavItem[] = [
  { href: "/blog", title: "Blog", description: "Maqolalar va tahlillar", icon: Pencil },
  { href: "/resurslar", title: "Bepul resurslar", description: "Qo'llanmalar va soha hublari", icon: FileText },
  // W10 yopiq (/ish): ro'yxatda saqlanadi, pastdagi filtr yashiradi.
  { href: "/ish", title: "Ish o'rinlari", description: "Vakansiyalar", icon: Briefcase },
  { href: "/portfolio", title: "Portfoliolar", description: "Vibe Coding loyihalari", icon: LayoutGrid },
];

/**
 * W10: yopiq funksiyalar havolalari shu yerda filtrlanadi.
 * `closed.ts` dagi bayroqni ochish havolani avtomatik qaytaradi.
 */
export const resourceLinks: NavItem[] = allResourceLinks.filter((link) => !isClosedRoute(link.href));

export const staticHeaderSettings: Required<Pick<HeaderSettings,
  "headerCtaText" | "headerCtaLink" | "telegramBotLink" | "announcementBannerText" |
  "announcementBannerLink" | "enableAnnouncementBanner"
>> = {
  headerCtaText: "Kurs tanlash",
  headerCtaLink: "/#kurs-tanlash",
  telegramBotLink: "https://t.me/m/ODAfK_QIMjky",
  announcementBannerText: "Yangi Vibe Coding Express guruhiga qabul boshlandi!",
  announcementBannerLink: "/kurs/vibe-coding-express",
  enableAnnouncementBanner: true,
};
