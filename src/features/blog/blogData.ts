export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentMd: string;
  coverUrl: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  category: string;
  readTimeMin: number;
  publishedAt: string;
  tags: string[];
}

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

export const BLOG_CATEGORIES = [
  "Barchasi",
  "Vibe Coding",
  "AI Vositalar",
  "Keyslar",
  "Metodologiya",
  "Prompt Injiniring",
  "Karyera",
] as const;

export const STATIC_BLOG_POSTS: BlogPostItem[] = [
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
  {
    id: "blog-03",
    slug: "cursor-ide-va-nextjs-bilan-mvp-qurish",
    title: "Cursor IDE va Next.js 15 bilan 3 Kunda MVP Qurish Tajribasi",
    excerpt: "Real keys: qanday qilib Cursor Composer va zamonaviy Next.js App Router yordamida buyurtmalar qabul qiluvchi platforma noldan ishga tushirildi.",
    coverUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    authorName: "Mirzo",
    authorRole: "Mirzo Academy Asoschisi",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    category: "Keyslar",
    readTimeMin: 7,
    publishedAt: "2026-09-04",
    tags: ["Next.js", "Cursor", "MVP", "PostgreSQL"],
    contentMd: `
## Loyiha G'oyasi va Boshlang'ich Talablar {#loyiha-haqida}

Toshkentdagi yetkazib berish xizmati uchun kichik boshqaruv paneli va mijozlar uchun veb-ilova yaratish talab etildi. An'anaviy outsourcing kompaniyalari bunga 4000$ va 1.5 oy muddat so'rashgan edi.

Biz loyihani **Cursor IDE** va **Next.js 15 App Router** yordamida atigi 3 kunda amalga oshirdik.

## Texnologiyalar To'plami: Next.js + Tailwind + Drizzle {#tech-stack}

Loyiha uchun zamonaviy va yengil stack tanlandi:
- **Next.js 15:** Server komponentlar va tezkor routing;
- **Drizzle ORM:** PostgreSQL bilan eng xavfsiz va tez ishlash;
- **Tailwind CSS:** Dizayn tizimini bir necha soatda shakllantirish;
- **Zod:** Barcha forma va API'larni 100% tekshirish.

## Cursor Composer Rejimida Ishlash {#composer-rejimida-ishlash}

\`Ctrl + I\` (yoki \`Cmd + I\`) tugmasi orqali ochiladigan Cursor Composer bir vaqtning o'zida backend routing, DB model va UI komponentlarni bog'lash imkonini berdi.

Bitta prompt bilan:
- Ma'lumotlar bazasi migratsiyasi;
- Buyurtmalar ro'yxati jadvali;
- Holatni o'zgartiruvchi Kanban doskasi tayyor bo'ldi.

## Xatoliklarni Tuzatish va Tekshiruv {#xatoliklarni-tuzatish}

Cursor terminal integratsiyasi tufayli \`next build\` paytidagi xatolar bir tugma orqali avtomatik tahlil qilinadi va tuzatiladi. Bu dasturchiga sintaksis bilan bosh qotirmasdan, biznes mantiqqa e'tibor qaratish imkonini beradi.

## Natija: Jonli Startap va Tejalgan Resurslar {#natija}

Loyiha uchinchi kuni to'liq serverga (Vercel + Supabase) yuklandi va real buyurtmalarni qabul qila boshladi. Tejalgan mablag': 3,500$ dan ortiq!
    `,
  },
  {
    id: "blog-04",
    slug: "prompt-engineering-samarali-qoliplar",
    title: "Dasturchilar va Asoschilar Uchun 10 ta Kuchli Prompt Qolipi",
    excerpt: "AI modelidan aniq, professional va xatosiz kod olish sirlari: kontekst berish, mezonlar qo'yish va qadam-baqadam yo'naltirish qoliplari.",
    coverUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    authorName: "Alisher Zokirov",
    authorRole: "Senior Mentor",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    category: "Prompt Injiniring",
    readTimeMin: 5,
    publishedAt: "2026-09-05",
    tags: ["Prompt", "AI", "Best Practices"],
    contentMd: `
## Nega Oddiy Promptlar Ish Bermaydi? {#prompt-mohiyati}

Ko'pchilik foydalanuvchilar sun'iy intellektga *"Menga online do'kon yozib ber"* kabi umumiy topshiriq berishadi. Natijada AI juda oddiy, xatolarga to'la va ishlatib bo'lmaydigan kod qaytaradi.

Professional prompt injiniringi — bu vazifaning konteksti, cheklovlari va qabul qilish mezonlarini aniq belgilashdir.

## 1. Tizim Arxitekturasi Uchun Prompt {#arxitektura-prompti}

\`\`\`markdown
Sen tajribali Next.js arxitektorisan. Quyidagi talablar asosida ma'lumotlar bazasi sxemasini Drizzle ORM formatida tuz:
- Loyiha: Onlayn ta'lim platformasi
- Jadvallar: Foydalanuvchilar, Kurslar, To'lovlar
- Talab: Barcha id lar UUID bo'lsin, created_at timestamp doimiy bo'lsin.
\`\`\`

## 2. Refaktoring va Toza Kod Prompti {#refactoring-prompti}

Kod sifatini oshirishda doim mezonlarni ko'rsating:

\`\`\`markdown
Quyidagi TypeScript kodini refaktor qil. 
Qoidalar:
1. Hech qanday "any" tipi bo'lmasin.
2. Zod sxemasi orqali barcha kiruvchi parametrlarni tekshir.
3. Funksiyani kichik yordamchi modullarga ajrat.
\`\`\`

## 3. Chuqur Xatoliklarni Topish Prompti {#debugging-prompti}

Xatoni ko'rganda shunchaki stack trace'ni tashlamang, balki nima kutganingizni ham yozing:

\`\`\`markdown
Kutilgan natija: To'lov muvaffaqiyatli o'tganda foydalanuvchi kabinetiga yo'naltirish.
Amaldagi natija: 401 Unauthorized xatosi qaytmoqda.
Mana server loglari va session tekshirish kodi: [kod]
\`\`\`

## Xulosa: Tizimli Yondashuv {#xulosa}

Prompt yozish — bu san'at emas, balki muhandislik intizomidir. Qanchalik aniq shart qo'ysangiz, AI shunchalik mukammal kod taqdim etadi.
    `,
  },
  {
    id: "blog-05",
    slug: "ozbekistonda-ai-karyera-va-daromad",
    title: "2026-yilda O'zbekistonda AI Mutaxassisi Bo'lish: Imkoniyatlar va Daromad",
    excerpt: "Bozor talabi, yangi paydo bo'layotgan kasblar (AI Integrator, Prompt Engineer) va ushbu sohada qanday qilib yuqori daromadga erishish mumkinligi haqida tahlil.",
    coverUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    authorName: "Jamshid Alimov",
    authorRole: "Lead AI Engineer",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    category: "Karyera",
    readTimeMin: 6,
    publishedAt: "2026-09-06",
    tags: ["Karyera", "O'zbekiston", "Maosh", "Frilans"],
    contentMd: `
## O'zbekiston IT Bozoridagi Yangi Talablar {#bozor-talabi}

Bugungi kunda mahalliy bizneslar tezlikka muhtoj. CRM tizimlar, Telegram botlar va ichki hisobot avtomatizatsiyalarini oylar davomida kutish vaqti o'tdi. 

Shu sababli kompaniyalar kodni noldan sekin yozuvchi emas, balki AI vositalari orqali bir necha kunda natija bera oladigan **Vibe Coder** va **AI Integrator**larga katta qiziqish bildirmoqda.

## Kompaniyalar Qanday Mutaxassislarni Qidirmoqda? {#talab-qilinadigan-konikmalar}

1. **AI Agentlarini boshqara oluvchi dasturchilar:** Cursor, Claude Code, GitHub Copilot bilan 5 barobar tez ishlaydiganlar.
2. **Biznes jarayonlarini avtomatlashtiruvchilar:** Make.com, n8n va Telegram API orqali mijozlar oqimini tartibga soluvchilar.
3. **No-code / Low-code MVP yaratuvchilar:** Startap g'oyalarini zudlik bilan sinab ko'ruvchilar.

## Daromad va Maoshlar Tahlili {#daromad-va-maoshlar}

- **Boshlang'ich AI Integrator:** 6,000,000 — 10,000,000 UZS
- **Tajribali Vibe Coder / Full-Stack AI:** 12,000,000 — 25,000,000 UZS
- **Frilans loyihalar:** Bitta MVP tizim yaratish narxi 500$ dan 2,500$ gacha.

## O'rganishni Qayerdan Boshlash Kerak? {#qayerdan-boshlash-kerak}

- ChatGPT va Claude bilan professional muloqotni o'zlashtiring;
- Git va terminal asoslarini o'rganing;
- Mirzo Academy (academy.mirzo.uz) kabi amaliy mentorlik kurslarida real loyihalar ustida ishlang.

## Xulosa: Kelajakka Sarmoya {#xulosa}

Sun'iy intellekt odamlarni ishsiz qoldirmaydi, ammo sun'iy intellektdan unumli foydalana oladigan mutaxassislar boshqalarni ortda qoldiradi.
    `,
  },
];

/**
 * Extracts Table of Contents from Markdown content
 */
export function extractTocFromMarkdown(contentMd: string): TocItem[] {
  const lines = contentMd.split("\n");
  const toc: TocItem[] = [];

  for (const line of lines) {
    // Match ## Heading {#custom-id} or ## Heading
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      let title = match[2].trim();
      let id = "";

      const idMatch = title.match(/\{#([^}]+)\}/);
      if (idMatch) {
        id = idMatch[1];
        title = title.replace(/\{#[^}]+\}/, "").trim();
      } else {
        id = title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-");
      }

      toc.push({ id, title, level });
    }
  }

  return toc;
}
