# W6B — Portfolio boshqaruvi va reytingi

## Ish holati

- Brancha: `wave/w6b-portfolio`
- Ish bajarildi; W6A bilan parallel `globals.css` va boshqa home komponentlariga tegilmadi.
- Ma'lumotlar bazasi hozir LIVE; migratsiya faqat generatsiya qilindi va qo'llanmadi.

## Schema va migration

`src/db/schema/operations.ts` portfolios jadvaliga qo'shildi:

- `ownership`: `owner | student | client | demo` (DB'da text, default `demo`)
- `featuredRank`: nullable integer (1–3)
- `sortOrder`: mavjud ustun endi `NOT NULL`; null qiymatlar migration'da 0 ga to'ldiriladi
- `status`: `published | draft | hidden` (default `hidden`)
- `coverUrl`, `liveUrl`, `repoUrl`
- `techStack`, `highlights`: `text[]`
- `publishedAt`: timezone timestamp

**Migration:** `drizzle/0006_familiar_naoko.sql`

Migration additive xususiyatga ega: mavcut `sort_order` null'lari avval 0 ga to'ldiriladi, keyin NOT NULL qilinadi; yangi ustunlar default'lari bilan qo'shiladi; `clash-nexus` migrationda `owner/published/featuredRank=1` holatiga o'tkaziladi. Boshqa mavcut qatorlar default `demo/hidden` bo'lib qoladi. Hech qator o'chirilmaydi.

## Single source va ranking

- `src/features/portfolio/server/portfolio.service.ts` public reader'da `unstable_cache`, tag `portfolio`, `revalidate: 300` ishlatadi.
- DB xatosi yoki ulanish muammosida faqat `VERIFIED_PORTFOLIO_FALLBACK` chiqadi: hozir faqat **Clash Nexus** (kod comment bilan owner tasdiqlangan).
- Static ro'yxatdagi boshqa 8 yozuv `ownership: demo`, `status: hidden`; ular public fallbackga kirmaydi.
- `/portfolio` va `/` bitta repository manbasidan o'qiydi.
- Tartib: `status=published`; `ownership` bo'yicha owner oldin, keyin student/client/demo; `featuredRank ASC`; `sortOrder ASC`; `publishedAt DESC`. Null featured ranklar PostgreSQL default `NULLS LAST` bilan oxirga tushadi.
- Bosh sahifada maksimal 3 ta published project chiqadi.
- `/portfolio`: `Asosiy loyihalar` (maksimal 3), keyin `Barcha loyihalar`; filter chips `Barchasi / Mening loyihalarim / Talabalar / Mijozlar`; 6 ta elementdan keyin `Ko'proq ko'rsatish`, SSR vaqtida to'liq bo'sh holat designs.

## Admin

`/admin/portfolio` quyidagilarni qo'llaydi:

- yangi loyiha qo'shish va Zod bilan tahrirlash;
- ownership va status select'lar;
- featured toggle va 1–3 rank input; server featured limiti 3 bilan qat'iy;
- up/down tugmalari va sortOrder input; drag-free, keyboard-friendly;
- cover URL kiritish va preview, live URL havolasini tekshirish hinti;
- tech stack va qisqa proof highlights;
- `/api/portfolio` GET `scope=admin` orqali barcha statuslar ko'rsatiladi.

Har bir POST/PATCH/DELETE:

1. `requireAdmin(request)` — session, admin rol va CSRF;
2. portfolio write rate limit;
3. Zod validation;
4. service use-case;
5. `auditLogs` yozuvi;
6. `revalidateTag("portfolio")`.

## Script

`scripts/portfolio/mark-unverified.ts` default `DRY-RUN` qiladi. Faqat `--apply` bilan yozadi va `clash-nexus`dan tashqari qatorlarni `demo + hidden` holatga o'tkazadi. **Bu agent `--apply` ishga tushirmadi.** Orchestrator owner tasdig'idan keyin qaror qabul qilishi kerak.

## Testlar va gate

- `npx tsc --noEmit` — pass.
- `npx vitest run` — pass: **67 files, 506 passed**.
- `scripts/waves/locked.sh npm run build` — pass: **90 routes generated**.
- Yangi route regression test: `src/__tests__/w6b-portfolio.test.ts` (401, 403, 400 validation, revalidation).
- Service test: ranking/filter behaviour, DB-error fallback, 3-featured server limit, audit/write flows.
- Playwright va Lighthouse ishga tushirilmadi, owner prompti bo'yicha.

## Orchestrator uchun

1. `drizzle/0006_familiar_naoko.sql` ni review qiling.
2. Production DB ga faqat `npm run db:migrate` bilan migration qo'llang (bu agent qo'llamadi).
3. Owner loyihalari tasdiqlanadi: `npx tsx scripts/portfolio/mark-unverified.ts` bilan avval dry-run natijasini ko'ring.
4. Owner tasdig'i bo'lsa faqat `npx tsx scripts/portfolio/mark-unverified.ts --apply`; aks holda qo'llamang.
5. Keyin `npx tsc --noEmit`, `npx vitest run`, `scripts/waves/locked.sh npm run build` qayta ishga tushiring.
6. Shu branchni commit qiling, lekin push qilmaying.
