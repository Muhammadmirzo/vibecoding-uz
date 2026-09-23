import type { BlogPostItem } from "./types";

export const CORE_BLOG_POSTS: BlogPostItem[] = [
  {
    id: "blog-01",
    slug: "vibe-coding-nima-va-u-qanday-ishlaydi",
    title: "Vibe Coding Nima va U Qanday Ishlaydi? 2026-yilgi Dasturlash Inqilobi",
    excerpt: "Dasturchi kabi sintaksis yozmasdan, AI agentlariga aniq arxitektura va prompt berib to'liq ishlaydigan dasturiy mahsulotlar yaratish metodologiyasi.",
    coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    authorName: "Mirzo",
    authorRole: "Mirzo Academy Asoschisi & Bosh Instruktor",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    category: "Vibe Coding",
    readTimeMin: 6,
    publishedAt: "2026-09-01",
    tags: ["Vibe Coding", "Claude Code", "Cursor", "Startap"],
    contentMd: `
## Kirish: Dasturlash Olamining Yangi Bosqichi {#kirish}

So'nggi bir necha o'n yillikda dasturiy ta'minot yaratish jarayoni asosan bitta qoidaga tayanar edi: sintaksisni yodlash, funksiyalar va sinflarni qo'lda terish, semikolon yoki qavslar xatosini soatlab qidirish. 

Biroq, 2026-yilga kelib bu yondashuv tubdan o'zgardi. **Vibe Coding** — bu dasturchi sintaksis bilan emas, balki mahsulot g'oyasi, mantiqiy arxitektura va foydalanuvchi tajribasi bilan shug'ullanadigan yangi davr paradigmati.

> "Vibe Coding — bu kod yozishdan ko'ra ko'proq tizimni boshqarish, AI agentiga to'g'ri topshiriq bera olish va me'mor kabi loyihani boshqarishdir."

## Vibe Coding Falsafasi: Sintaksisdan Arxitekturaga {#vibe-coding-falsafasi}

An'anaviy dasturlashda 80% vaqt kod yozishga va 20% vaqt loyihalashga ketar edi. Vibe coding bu nisbatni teskarisiga o'girdi:

1. **Arxitektura va Spetsifikatsiya (50%):** Ma'lumotlar bazasi qanday tuziladi? Foydalanuvchi qanday qadamlarni bosadi? Qaysi API'lar ulanishi kerak?
2. **AI Agentiga Yo'l-yo'riq Berish (30%):** Prompt Engineering, \`AGENTS.md\` fayli, aniq cheklovlar va qoidalar orqali agentni yo'naltirish.
3. **Verifikatsiya va Testlash (20%):** Agent yaratgan kodni tekshirish, testlarni ishga tushirish va jonli loyihada sinash.

Bu metodologiya orqali ilgari 3-4 kishilik jamoa 2 oyda qiladigan MVP mahsulotni bitta mutaxassis 3-5 kunda mustaqil yaratishi mumkin bo'ldi.

## Asosiy Vositalar: Claude Code va Cursor IDE {#vositalar}

Vibe coderning asosiy qurollari:

- **Claude Code:** Terminalda avtonom ishlaydigan agent. U butun loyiha katalogini ko'radi, testlarni yurgizadi, git komandalarni bajaradi.
- **Cursor IDE:** VS Code asosidagi sun'iy intellekt muhiti. Composer rejimi bir vaqtning o'zida o'nlab fayllarni yangilashga qodir.
- **Model Context Protocol (MCP):** AI modelni PostgreSQL bazasi, GitHub yoki Stripe/Payme tizimlariga to'g'ridan-to'g'ri ulovchi standart.

## Amaliy Misol: 1 Kunda MVP Yaratish {#amaliy-misol}

Tasavvur qiling, sizga restoranlar uchun QR-kodli buyurtma tizimi kerak. Vibe coding bilan bu jarayon qanday kechadi?

- **1-qadam:** Spetsifikatsiya tuzasiz: menyu, buyurtma savati, Payme integratsiyasi.
- **2-qadam:** Drizzle ORM sxemasini Claude Code orqali generatsiya qilasiz.
- **3-qadam:** Tailwind UI komponentlarini yaratib, real vaqtda Telegram botga buyurtma yuborishni o'rnatasiz.

Hammasi 24 soat ichida ishga tayyor bo'ladi!

## Xulosa va Maslahatlar {#xulosa}

Agar siz dasturchi bo'lmasangiz ham, Vibe Coding orqali o'z biznesingiz yoki startapingizni hech kimga bog'liq bo'lmasdan qurishingiz mumkin. Eng muhim qoida — texnologiyadan qo'rqmaslik va AI bilan hamkor sifatida ishlashni o'rganishdir.
    `,
  },
  {
    id: "blog-02",
    slug: "claude-code-terminal-agenti-boyicha-qollanma",
    title: "Claude Code: Terminalda Mustaqil Ishlovchi AI Agenti Qo'llanmasi",
    excerpt: "Anthropic kompaniyasining terminalda ishlovchi agenti: o'rnatish, AGENTS.md arxitekturasi, tokenlarni tejash va avtonom kodlash usullari.",
    coverUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    authorName: "Jamshid Alimov",
    authorRole: "Lead AI Engineer",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    category: "AI Vositalar",
    readTimeMin: 8,
    publishedAt: "2026-09-03",
    tags: ["Claude Code", "Anthropic", "Terminal", "DevOps"],
    contentMd: `
## Claude Code Nima va Nega U O'zgacha? {#kirish}

Ko'pchilik ChatGPT yoki oddiy chat-interfeyslariga o'rganib qolgan: kodni nusxalash, muharrirga qo'yish, xatolarni yana chatga yuborish. Bu juda ko'p vaqt va diqqatni oladi.

**Claude Code** esa butunlay boshqacha yondashuv: u sizning kompyuteringiz terminalida ishlaydi, fayllaringizni to'g'ridan-to'g'ri o'qiydi, tahrirlaydi, testlarni boshqaradi va git commitlarni amalga oshiradi.

## O'rnatish va API Sozlamalari {#ornatish-va-sozlash}

Claude Code'ni ishga tushirish juda oson:

\`\`\`bash
npm install -g @anthropic-ai/claude-code
export ANTHROPIC_API_KEY="sk-ant-api03-..."
claude
\`\`\`

Shundan so'ng terminal sizdan loyiha papkasini tahlil qilishga ruxsat so'raydi.

## Kontekst Boshqaruvi va AGENTS.md Qoidalari {#kontekst-boshqaruvi}

Claude Code loyiha ichida adashib qolmasligi va tokenlarni ortiqcha sarflamasligi uchun ildiz katalogda \`AGENTS.md\` fayli bo'lishi shart.

Misol uchun:
- Qaysi kataloglarda qanday logika joylashganligi;
- Qat'iy qoidalar (masalan: hech qachon \`any\` ishlatmaslik, doim Zod sxemalaridan foydalanish);
- Tailwind ranglar tokenlari.

## Eng Yaxshi Prompt Amaliyotlari {#eng-yaxshi-amaliyotlar}

Claude Code bilan ishlashda eng muhim tamoyil — kichik va aniq maqsadli topshiriqlar berishdir:

1. Avval reja so'rang: *"Ushbu xatolikni tuzatish uchun qadamlarni sanab ber."*
2. Rejani tasdiqlagach: *"1- va 2-qadamlarni bajar va natijani tsc orqali tekshir."*
3. Xatolik chiqsa, darhol to'xtating va qayta tahlil qildiring.

## Kelajak Dasturlash Jarayoni {#xulosa}

Terminal agentlari dasturchining o'rnini to'liq egallamaydi, ammo Claude Code'dan foydalanuvchi bitta mutaxassis oddiy 5 nafar dasturchidan ko'proq natija beradi.
    `,
  },
];
