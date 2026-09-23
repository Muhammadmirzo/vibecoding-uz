const CATEGORIES = ["Metodologiya", "AI Vositalar", "Arxitektura", "Frontend", "Backend", "DevOps", "Biznes"];

const TERMS = [
  { slug: "vibe-coding", termEn: "Vibe Coding", termUz: "Vayb Kodlash", category: "Metodologiya", definition: "Dastur kodi sintaksisini yozmasdan AI agentlariga (Claude Code, Cursor) prompt berib mahsulot yaratish usuli." },
  { slug: "prompt-engineering", termEn: "Prompt Engineering", termUz: "Prompt Injiniringi", category: "Metodologiya", definition: "Sun'iy intellektdan aniq va sifatli natija olish uchun ko'rsatmalarni to'g'ri shakllantirish san'ati." },
  { slug: "mcp-server", termEn: "Model Context Protocol", termUz: "Model Kontekst Protokoli", category: "Arxitektura", definition: "AI agentlarini tashqi ma'lumotlar bazasi va API tizimlariga xavfsiz ulaydigan ochiq standart." },
  { slug: "cursor-ide", termEn: "Cursor IDE", termUz: "Cursor Dasturlash Muhiti", category: "AI Vositalar", definition: "VS Code bazasida yaratilgan, AI model bilan chuqur integratsiyalashgan professional koding muhiti." },
  { slug: "claude-code", termEn: "Claude Code", termUz: "Claude Code Agenti", category: "AI Vositalar", definition: "Anthropic kompaniyasi tomonidan yaratilgan, terminalda avtonom ishlaydigan dasturchi AI agenti." },
  { slug: "drizzle-orm", termEn: "Drizzle ORM", termUz: "Drizzle ORM", category: "Backend", definition: "TypeScript uchun yaratilgan juda tezkor, yengil va type-safe SQL ma'lumotlar bazasi ORM kutubxonasi." },
  { slug: "nextjs-app-router", termEn: "Next.js App Router", termUz: "Next.js App Router", category: "Frontend", definition: "React bazasidagi server komponentlari va fayl tizimiga asoslangan zamonaviy web freymvork." },
  { slug: "tailwind-css", termEn: "Tailwind CSS", termUz: "Tailwind CSS", category: "Frontend", definition: "Dizaynlarni tezkor va moslashuvchan yaratish imkonini beruvchi utility-first CSS freymvorki." },
  { slug: "telegram-mini-app", termEn: "Telegram Mini App (TMA)", termUz: "Telegram Mini App", category: "Frontend", definition: "Telegram messenjeri ichida ishlaydigan, veb texnologiyalarga asoslangan ilova." },
  { slug: "zod-validation", termEn: "Zod Validation", termUz: "Zod Validatsiyasi", category: "Backend", definition: "TypeScript uchun ma'lumotlar sxemasini tekshiruvchi va tiplarni kafolatlovchi kutubxona." },
];

export function createGlossaryTerms() {
  return Array.from({ length: 50 }, (_, offset) => {
    const index = offset + 1;
    const base = TERMS[offset % TERMS.length];
    return {
      slug: index <= TERMS.length ? base.slug : `${base.slug}-${index}`,
      termEn: index <= TERMS.length ? base.termEn : `${base.termEn} Term ${index}`,
      termUz: index <= TERMS.length ? base.termUz : `${base.termUz} Atamasi ${index}`,
      category: CATEGORIES[index % CATEGORIES.length],
      definition: base.definition + " (Amaliy qo'llanilishi va 2026-yilgi standartlar).",
      sortOrder: index,
    };
  });
}
