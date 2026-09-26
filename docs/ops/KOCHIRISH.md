# Bitta buyruq bilan ko'chirish (sayt va baza)

Bu qo'llanma: bazani (Supabase) va saytni (Vercel) istalgan boshqa joyga ma'lumot yo'qotmasdan
ko'chirish, har kuni shifrlangan zaxira nusxa olish va har hafta uni tiklab tekshirish.
Texnik tafsilotlar: [PORTABILITY.md](PORTABILITY.md).

## 1. Bir marta sozlash (10 daqiqa)

**Qoida:** baza manzili (URL) va parollarni hech qachon chatga, xatga yoki buyruq qatoriga yozmang.
`gh secret set NOM` buyrug'i qiymatni yashirin so'raydi — shunga joylang.

1. **Zaxira kalitlari (age).** O'z kompyuteringizda: `age-keygen -o naqsh-owner.key` va
   `age-keygen -o naqsh-drill.key`. Har biri `Public key: age1…` ni ko'rsatadi.
   - `naqsh-owner.key` — **asosiy kalit**. Fleshkaga yoki qog'ozga yozib, internetsiz joyda saqlang,
     keyin kompyuterdan o'chiring. U bo'lmasa, falokatda zaxirani ocha olmaysiz.
   - `naqsh-drill.key` — faqat haftalik tekshiruv uchun (GitHub'da saqlanadi).
2. **GitHub o'zgaruvchisi (ochiq kalitlar, sir emas):**
   `gh variable set BACKUP_AGE_RECIPIENTS --body "age1…owner,age1…drill"`
3. **GitHub sirlari** (`gh secret set NOM`, qiymatni yashirin kiritasiz):

| Nom | Nima | Majburiy |
| :--- | :--- | :--- |
| `SOURCE_DATABASE_URL` | Hozirgi baza, Supabase **session pooler** (port 5432) URL — yangi (almashtirilgan) parol bilan | ha |
| `BACKUP_DRILL_AGE_KEY` | `naqsh-drill.key` fayli ichidagi `AGE-SECRET-KEY-…` qatori | ha |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID` | Xato bo'lsa Telegram'ga xabar | tavsiya |
| `NEW_DATABASE_URL` | Ko'chiriladigan **yangi, bo'sh** baza URL (`sslmode=require` bilan) | faqat ko'chirishda |
| `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | Ko'chirgandan keyin Vercel'ni avtomatik almashtirish | ixtiyoriy |
| `BACKUP_S3_URI` + `BACKUP_S3_ACCESS_KEY_ID` + `BACKUP_S3_SECRET_ACCESS_KEY` | Zaxirani yopiq R2/S3 bucket'ga ham yuborish (7 kundan uzoq saqlash) | tavsiya |

Shundan keyin har kecha 00:17 da zaxira olinadi, har dushanba tunda tiklab tekshiriladi.
Xato bo'lsa GitHub'da qizil belgi + Telegram xabari keladi.

## 2. Ko'chirish — bitta buyruq

Telefondan (GitHub ilovasi → Actions → move-db → Run workflow) yoki kompyuterdan:

1. **Mashq (xavfsiz, hech narsa o'zgarmaydi):** `gh workflow run move-db -f rehearsal=true`
   — hozirgi bazani vaqtinchalik bazaga to'liq nusxalab, har bir jadvalni tekshiradi.
2. **Tekshiruv:** yangi bazani `NEW_DATABASE_URL` sirga joylang, keyin `gh workflow run move-db`
   (standart holatda `dry_run=true`: faqat o'qiydi, yangi baza bo'sh va mos ekanini tekshiradi).
3. **Haqiqiy ko'chirish:**
   `gh workflow run move-db -f dry_run=false -f confirm=KOCHIR -f switch_vercel=true`

Kompyuterda (pg_dump 17 o'rnatilgan bo'lsa), yangi URL `.env` faylida `NEW_DATABASE_URL=` qatorida:
`npm run move -- db --to NEW_DATABASE_URL` (so'raganda `KOCHIR` deb yozasiz).

## 3. U nima qiladi

1. Ikkala bazani tekshiradi (versiya, TLS shifrlash, yangi baza bo'shmi). Muammo bo'lsa — to'xtaydi, hech narsa o'zgarmaydi.
2. Eski bazani **faqat o'qish** rejimiga o'tkazadi: sayt ochiladi, lekin yozish (ro'yxatdan o'tish, forma)
   bir necha daqiqa "texnik ishlar" deb javob beradi. Shu tufayli hech bir yozuv yo'qolmaydi.
3. Nusxa oladi → yangi bazaga yozadi (hammasi yoki hech narsa) → xavfsizlik sozlamalarini qayta qo'yadi.
4. Har bir jadvalda qatorlar sonini va nazorat summasini solishtiradi. Bitta farq bo'lsa ham — xato
   deydi va eski bazani avtomatik qayta ochadi.
5. `switch_vercel=true` bo'lsa: Vercel'dagi `DATABASE_URL` ni almashtirib, saytni qayta ishga tushiradi.
   Aks holda: [switch-host.md](../../scripts/ops/switch-host.md) dagi 4 qadam.

## 4. Orqaga qaytish

Eski baza tegilmaydi (faqat o'qish rejimida qoladi). Qaytish uchun:
1. Vercel'da `DATABASE_URL` ni eski qiymatga qaytaring va saytni qayta ishga tushiring (switch-host.md, "Rollback").
2. `npm run move -- db --unfreeze` — eski baza yana yozadigan bo'ladi.

Eski bazani kamida 7 kun o'chirmang.

## 5. Sayt (ilova)ni boshqa serverga

Vercel'siz istalgan VPS'da: `docker compose --env-file .env.production up -d --build`
(Caddy TLS sertifikatni o'zi oladi, cron vazifalari ham ishlaydi). Batafsil: switch-host.md, B bo'lim.
