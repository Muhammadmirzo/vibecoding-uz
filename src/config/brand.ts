/**
 * Single source of truth for the brand. Every user-facing name, tagline,
 * domain and bot handle MUST come from here — never hardcode "Naqsh" (or the
 * old "VibeCoding") in components. Renaming the brand = editing this file.
 */
export const BRAND = {
  /** Short name — wordmark, <title> suffix, footer. */
  name: "Naqsh",
  /** Descriptor shown next to / under the wordmark. */
  descriptor: "AI bilan mahsulot yaratish maktabi",
  /** One-line promise (hero eyebrow, OG image, meta description lead). */
  tagline: "G'oyangizni ishlaydigan mahsulotga aylantiring — AI bilan, 8 haftada.",
  /** Why the name: naqsh = ornament / imprint. Leave your mark. */
  meaning: "Naqsh — ustalar qoldiradigan iz. Biz sizga o'z mahsulotingizni yaratib, iz qoldirishni o'rgatamiz.",
  founder: "Mirzo",
  founderRole: "Mentor, vibe-coder",
  /** Public production URL; override with NEXT_PUBLIC_APP_URL. */
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://master-2-jade.vercel.app",
  /** Production Telegram bot (without @). Override with NEXT_PUBLIC_TELEGRAM_BOT_NAME. */
  telegramBot: process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME ?? "Boyakagabot",
  locale: "uz_UZ",
} as const;

export type Brand = typeof BRAND;
