import type { BlogPostItem } from "./types";

export const MORE_BLOG_POSTS: BlogPostItem[] = [
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
