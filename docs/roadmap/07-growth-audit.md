# 07 — O'sish auditi: marketing, sotuv, biznes, texnik (2026-09-26)

Manba: 4 ta mustaqil Gemini auditi (`.orchestra/reports/m1-cro.md`, `m2-funnel.md`, `m3-business.md`, `m4-tech.md`).
Orkestrator (Claude) quyidagilarni kodda/jonli saytda **o'zi tasdiqladi** (✔). Tasdiqlanmaganlar "tekshiriladi".

## Build vs buy xulosasi
O'z platformasi — to'g'ri: Skool/Udemy/Teachable Payme/Click/Uzcard/Humo'ni, o'zbek tilini, Telegram'ni,
o'quvchi kontaktiga to'liq egalikni va MCP/AI boshqaruvni bermaydi (manbalar: m3-business.md; narxlar u yerda
manba bilan). Lekin video hosting, jonli efir, SMS/email — **sotib olinadi**, qurilmaydi.
Hozirgi eng katta muammo texnologiyada emas, **voronkadagi uzilishlarda**.

## G1 — sotuvni to'xtatayotgan xatolar (darhol)
| # | Muammo | Dalil | Holat |
| :--- | :--- | :--- | :--- |
| 1 | **Yangi o'quvchi to'lay olmaydi**: checkout `enrollmentId` yoki `cohortId` talab qiladi, `PaymentSummaryCard` yangi o'quvchi uchun ikkalasini ham yubormaydi → 400 | `src/app/kabinet/to-lovlar/PaymentSummaryCard.tsx:58-64`, `src/features/payments/server/checkout.service.ts:22` | ✔ |
| 2 | `/kabinet/to-lovlar` bitta kursga qattiq bog'langan; tanlangan kurs ko'rinmaydi | m4, m3 | tekshiriladi (G1a) |
| 3 | **Telegram bot narxi saytdan farq qiladi**: botda 2 990 000 va 990 000 so'm, saytda 550 000 | `src/lib/telegram/handlers/commands.ts:11,15` | ✔ |
| 4 | Botdagi `#kalkulyator` havolasi o'lik | `commands.ts:54` | ✔ |
| 5 | `/kurs` = 404 (reklama/qidiruv yo'qoladi) | jonli: 404 | ✔ |
| 6 | `/ekspertlar` "Namuna profil 1/2" va "rozik" bilan ochiq | jonli sahifa | ✔ |
| 7 | 5 ta imlo xatosi (qarar, rozik, shu yerde, boshlaganizdan, Resurdan) | m1 | ✔ (rozik) |
| 8 | Yangi lid haqida menejerga darhol Telegram xabari yo'q | m2 | tekshiriladi |
| 9 | `/ref/[code]` UTM'ni yo'qotadi; Telegram login referalni biriktirmaydi | m2 | tekshiriladi |
| 10 | `diagnostic_start` hodisasi yuborilmaydi (voronka o'lchanmaydi) | m1 | tekshiriladi |

## G2 — konversiyani oshirish (keyingi)
- Root layout `cookies()` o'qiydi → butun sayt dinamik, CDN kesh yo'q (`src/app/layout.tsx:84`, jonli:
  `cache-control: private, no-store`) ✔. Marketing sahifalari statik/keshli bo'lishi kerak (TTFB).
- Hero'da 3 CTA o'rniga 1 asosiy yo'l; narx yonida qiymat tushuntirish + bo'lib to'lash aniq.
- Kurs sahifasidan bir qadamli checkout (to'lov bilan birga akkaunt), tashlab ketilgan to'lovga Telegram eslatma,
  tungi lidga avtomatik iliq javob, kurs OG rasmlari, Course schema `startDate` ISO 8601, CSP `frame-src` (YouTube, to'lov).
- Admin parolni tiklash (SMS-OTP), Sentry + Telegram alert (F3 bilan).
- Tariflar: 08-pricing-plans.md (narxlarni egasi belgilaydi; audit taklif qilgan raqamlar qabul qilinmaydi).

## Egasidan kerak (kod bilan hal bo'lmaydi)
1. **Mentor/asoschi haqiqiy surati, to'liq ismi, Telegram/LinkedIn** — "M" harfli anonim avatar ishonchni yo'qotadi.
2. **Bepul dars videosi** (YouTube unlisted) — ariza qoldirgan zahoti ko'rsatiladi.
3. **Oferta rekvizitlari**: YaTT/MCHJ nomi, STIR, manzil, bank — `/offerta` uchun.
4. Backup kalitlari (RESUME §5.3b), uptime monitor.

## Halol kutish
"Har tashrif buyuruvchi yoziladi" — bo'lmaydi. Maqsad: har qadam konversiyasini o'lchab, eng katta teshikdan yopish.
Hozir eng katta teshik — to'lov umuman ishlamasligi (#1), shuning uchun boshqa hamma narsadan oldin.
