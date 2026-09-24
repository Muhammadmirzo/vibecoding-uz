# W8A-ANALYTICS

## Nima yetkazildi

- `analytics_events` event store: UTC `occurred_at`/`received_at`, unique `event_id`, hashed visitor identity, 30-minute session id, UTM/referrer/device/browser/country, whitelisted JSON props, optional UZS value, va kerakli indekslar.
- Zod event contracts: 18 event turlari, batch 1–25, body/props chegaralari, UUID/vaqt/device validatsiyasi.
- `POST /api/v1/events`: anonymous ingestion, visitor cookie (HttpOnly/SameSite=Lax/Secure/13 oy), mobile `X-Visitor-Token`, same-origin check, rate limit, bot filter, dedupe, 202 DB-down degrade.
- `src/features/analytics/client/tracker.ts`: DNT/GPC, 30-minute session, lazy LCP/idle loading, route-change page views, visibility/pagehide beacon, engaged time/scroll depth, CTA attributes, UTM capture. Tracker gzip chunk tekshiruvi build'dan keyin qayta o'lchandi: 1,534 bytes gzip (1.5 kB budget ichida).
- `trackServerEvent`: lead, diagnostic complete, OTP signup/login, password/Telegram login, lesson start, checkout start, Payme/Click success/failure integratsiyasi; helper boshqa server oqimlarida ham qayta ishlatilishi mumkin.
- Analytics query service: overview deltas, timeseries, acquisition, behaviour (entry/exit), funnel, students, sales, devices, countries, realtime; SQL aggregate’lar, 60 soniya cache, Uzbek `summary` sentence, injected repository.
- `/api/v1/admin/analytics/[report]`: `requireAdmin`, Zod range/report validation, v1 envelope.
- `/admin/analytics`: Bugun/7/30/90/custom range, previous-period toggle, KPI cards, SVG charts with table fallback, funnel, sources, pages, students, sales, realtime; token-only light/dark responsive UI.
- `/maxfiylik` first-party analytics paragraph.
- `/api/cron/analytics-retention`: 400 kunidan eski eventlarni o‘chiradi; rollup table qo‘shilmadi, chunki W8A querying live events + indexes bilan ishlaydi va raw data 400 kunlik retention ichida saqlanadi.

## Asosiy qarorlar

- Analytics eventlarida raw IP, telefon va email saqlanmaydi. Server oqimlarida cookie token bo‘lmasa user/event pseudonymous identity token’ining SHA-256 hash’i ishlatiladi; bu fallback hech qachon raw holda saqlanmaydi.
- `event_id` uniqueness idempotency uchun canonical; payment replay’larida success event qayta yozilmaydi.
- Attendance signal’da alohida attendance table yo‘q. Cohort week ichidagi `lesson_start` hodisasi “attended” deb hujjatlanadi.
- Rollup jadval qo‘shilmadi: W8A ma’lumot hajmi 400 kunlik raw retention’da boshqariladi; W8B MCP’da faqar aggregate query’larni cache qiladi. Kelajakda retention chegarasiga yaqin rollup zarur bo‘lsa, yangi migration bilan alohida qaror qabul qilinadi.

## Tekshiruv

- `npx tsc --noEmit` — PASS.
- `npx vitest run` — PASS, 73 test fayli / 529 test.
- `scripts/waves/locked.sh npm run build` — PASS.
- W8A testlari: ingestion validation/dedupe/bot/DB-down/rate-limit; tracker DNT/beacon; barcha service funksiyalari mock repository bilan; admin route auth envelope; dashboard empty-state source test.
- Token audit: analytics UI’da hardcoded hex/rgb yo‘q.

## Migration

- `drizzle/0007_yellow_preak.sql`, `db: w8a analytics migration` commit’ida.
- Faqat additive `CREATE TABLE`/index/FK; live DB’ga migrate qilinmagan.

## Qolgan xavflar

- DB aggregate SQL’lari production schema bilan to‘liq integration smoke test qilinmagan; migration va typed service/repository testlari tayyor.
- Hozirgi LMS’da progress yozuv endpointi yo‘q; mavjud authenticated lesson detail GET’dan `lesson_start` yoziladi, `lesson_complete` va homework submit uchun kelajakdagi product write endpoint kerak.
- Server eventlar best-effort `void trackServerEvent(...)` bilan ishga tushadi; DB uzilganda foydalanuvchi response’i bloklanmaydi va event qayd qilinmaydi.
- Vercel/mobile smoke va Lighthouse navigatsiyasi bu lokal gate’dan tashqarida alohida bajarilishi kerak.
