# 09 — Admin boshqaruvi, mentor sahifalari, kurs hamjamiyati (egasi, 2026-09-26)

## Egasi qarorlari
- Hozirgi narxlar (550 000 / 2 990 000) va bepul dars — **test**. Haqiqiy narx, guruh, bepul dars **admin paneldan** kiritiladi;
  kodga narx yozilmaydi.
- Mentor sahifasi: mentorni bosganda uning kurslari chiqadi; umumiy katalog ham qoladi.
- Kurs ichida o'quvchilarning o'zaro muloqoti (Skool'dagidek) — kursga yozilganlar uchun.

## Hozirgi holat (kodda tekshirildi)
- Narx 3 joyda: `courses.price_sum`, `cohorts.price_sum`, `siteConfig.courses` (kod). Checkout `cohorts.price_sum` bo'yicha oladi,
  sayt `siteConfig` ni ko'rsatadi → nomuvofiqlik (07 §G1). `CohortModal` standart narxi `2990000` qattiq yozilgan.
- Admin: guruhlar (`/admin/cohorts`) bor; **kurslar, darslar, tariflar, bepul dars uchun admin sahifa yo'q**.
- Kurs ↔ mentor bog'lanishi yo'q (`experts` alohida, `cohorts` da mentor yo'q). Guruhda `telegram_chat_id` bor.

## A — Admin: hamma narsa paneldan (to'lqin A1, F3 pul poydevori bilan)
1. **Yagona narx manbai = DB.** `course_plans` (08: Start/Pro/Premium, 1–3 ta, `price_tiyin` bigint). Guruh narxni tarifdan oladi
   (guruhga maxsus narx faqat ixtiyoriy override). Sayt, bot, checkout, MCP — hammasi DB'dan o'qiydi; `siteConfig.courses` o'chiriladi.
   Test: sayt ko'rsatgan narx = checkout olgan narx (bitta helper).
2. `/admin/courses`: kurs yaratish/tahrirlash (nom, tavsif, muqova, daraja, holat: qoralama/nashr), tariflar, mentor(lar) biriktirish.
3. `/admin/courses/[id]/lessons`: bo'lim va darslar muharriri (01 §8): YouTube havolasi yoki fayl, matn, materiallar, drip,
   `is_free_preview`, tartibni sudrab o'zgartirish.
4. **Bepul dars** = kursdagi `is_free_preview` darsi (alohida tizim emas). `/bepul-dars` shuni ko'rsatadi; bo'lmasa halol
   "tez orada" + navbatga yozilish. Ariza qoldirgan zahoti video ochiladi (07 G2).
5. Guruh: boshlanish/tugash, o'rinlar, mentor, Telegram chat; o'tgan sanali guruh sotuvda ko'rinmaydi.
6. Har o'zgarish audit log'ga (kim, qachon, eski → yangi narx). Ruxsat: `can()` — narxni faqat superadmin/buxgalter.
7. Parity: `/api/v1/admin/*` + MCP (`course_update`, `plan_update` — tasdiq bilan).

## B — Mentor sahifalari va katalog (to'lqin M1)
- Model: `course_mentors` (course_id, user_id, role: `lead|assistant`, sort) + `cohorts.mentor_id`. Mentor profili `experts`
  jadvalidan (rasm, bio, havolalar) — egasi/mentor o'zi admin'da to'ldiradi va tasdiqlaydi.
- Sahifalar: `/ustozlar` (ro'yxat), `/ustozlar/[slug]` (bio + **uning kurslari** + natijalar), `/kurs` katalogida mentor bo'yicha
  filtr, kurs sahifasida mentor kartasi → profilga havola.
- Halollik: profil faqat haqiqiy va tasdiqlangan bo'lsa ochiladi (hozirgi `/ekspertlar` yopildi — shu sababli).
- **Trigger:** faqat 1 mentor bo'lsa — kurs sahifasida mentor kartasi yetarli; ≥ 2 haqiqiy mentor → `/ustozlar` ochiladi.
- Ko'p mentor = marketplace: mentor ulushi va to'lovlari (02 buxgalter `mentor_payouts`), sifat nazorati (03) shart.

## C — Kurs hamjamiyati (to'lqin C-1, R2 savol-javob infratuzilmasi ustida)
**Nega o'zimizda (Telegram guruh emas):** muhokamalar kurs/dars bilan bog'lanadi, qidiriladi, yangi o'quvchi eskisini ko'radi,
sifat metrikalariga kiradi (03), o'quvchi chiqib ketsa kirish yopiladi, ma'lumot bizda qoladi. Telegram — faqat bildirishnoma ko'prigi.
- Tuzilma: har kursda "Hamjamiyat" bo'limi; kanallar: `E'lonlar` (faqat mentor), `Savollar`, `Natijalarim` (loyiha ko'rsatish),
  `Umumiy`. Ixtiyoriy: guruh (cohort) bo'yicha alohida oqim.
- Post: matn, rasm/skrinshot, havola, kod bloki; izoh, reaksiya, mentor javobi belgisi, qadab qo'yish (pin), darsga bog'lash.
- Kirish: faqat faol yozilganlar (`can()`); bitiruvchilar — "alumni" rejimida o'qish/yozish (egasi hal qiladi).
- Faollik: haftalik challenge, "haftaning loyihasi", yangi a'zoga salom postini so'rash, mentor haftalik jonli Q&A.
- Himoya: rate limit, spam/havola filtri, shikoyat, moderator (mentor/menejer), soft-delete, qoidalar sahifasi, bloklash.
- Bildirishnoma: Telegram bot orqali (javob keldi, e'lon), kunlik yig'ma; ilovada push (05).
- Metrikalar (03): faol a'zolar ulushi, savolga javob vaqti, post/izoh soni, hamjamiyatda faollar vs tugatish foizi.
- MCP: `community_digest` (mentor/menejer: haftalik xulosa, javobsiz savollar), `community_moderate` (tasdiq bilan).
- **Trigger:** kursda ≥ 15 faol o'quvchi bo'lganda yoqiladi (bo'sh hamjamiyat "o'lik" ko'rinadi); undan oldin guruh Telegram chati.

## Tartib
A1 (admin + yagona narx, F3 bilan) → R1 (dars media) → R2 (savol-javob) → C-1 hamjamiyat → M1 mentor sahifalari (≥ 2 mentor).
