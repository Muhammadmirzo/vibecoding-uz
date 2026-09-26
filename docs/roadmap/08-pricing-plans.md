# 08 — Tariflar (egasi qarori 2026-09-26)

Har kurs uchun **1, 2 yoki 3 tarif** — egasi har kursda o'zi tanlaydi. Nomlar: **Start · Pro · Premium**
(1 ta tarif bo'lsa nom ko'rsatilmaydi, faqat narx).

## Ma'lumot modeli (F3 pul poydevori bilan birga, `siteConfig` → keyin `course_plans` jadvali)
- `plans[]` (uzunligi 1–3): `id` (`start|pro|premium`), `name`, `priceTiyin` (bigint), `oldPriceTiyin?`,
  `installmentMonths?` (bo'lib to'lash matni avtomatik hisoblanadi, qo'lda yozilmaydi), `features[]`
  (✔/— jadvali uchun), `highlighted` (bittasi "Eng ko'p tanlanadi" — faqat haqiqiy sotuv ma'lumoti bo'lsa, L14),
  `seats?` (Premium mentor sig'imi — haqiqiy son, soxta tanqislik yo'q).
- `payments.plan_id` + narx to'lov paytida nusxalanadi (keyin narx o'zgarsa eski to'lov buzilmaydi).
- Tarifni oshirish (Start → Pro): faqat farqini to'lash; `/api/v1` + MCP (`sales_by_plan`) parity.

## Tavsiya etilgan farqlash (egasi mazmunini to'ldiradi)
| | Start | Pro | Premium |
| :--- | :--- | :--- | :--- |
| Darslar + yozuvlar | ✔ | ✔ | ✔ |
| Uyga vazifa tekshiruvi | — | ✔ | ✔ |
| Jonli sessiyalar, guruh chati | — | ✔ | ✔ |
| Shaxsiy mentor (1:1), portfolio loyihasi | — | — | ✔ |
| Sertifikat | ✔ | ✔ | ✔ |
Qoidalar: o'rtadagi tarif asosiy tanlov bo'lishi uchun eng yaxshi qiymat unda bo'ladi; narxlar faqat `siteConfig`/DB'dan
(hech qayerda qattiq yozilmaydi); pul qaytarish kafolati barcha tariflarga bir xil.

## Qabul mezonlari
1/2/3 tarifli kurslar 390/1440 da to'g'ri ko'rinadi; checkout tanlangan tarif narxini serverda qayta hisoblaydi
(mijoz yuborgan narxga ishonilmaydi); eski to'lovlar ko'chirishdan keyin ham to'g'ri summani ko'rsatadi.
