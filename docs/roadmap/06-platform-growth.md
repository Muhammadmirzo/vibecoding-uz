# 06 — Platforma: Supabase hozir, ko'chish tayyor; o'sish triggerlari va maslahatchi

## 1. Hal qilingan qaror (egasi, 2026-09-26)
Boshlanishida Supabase (Sidney) ishlatiladi. O'zbekistondan boshqa davlatda bo'lsa ham, keyin boshqa joyga
ko'chirish mumkin bo'lishi shart. Qayta so'ralmaydi.

**Ma'lum xavf (yozib qo'yamiz, qaror egasida):** O'zbekiston qonuni (ZRU-547) fuqarolar shaxsiy ma'lumotini
O'zbekistondagi serverda saqlashni talab qiladi. Yangi funksiyalar (izoh, fayl, ovoz, transkript) shaxsiy ma'lumotni
ko'paytiradi. Shuning uchun hamma narsa ko'chiriladigan qilib quriladi (§2) va "ko'chish triggeri" §3 da.

## 2. Ko'chiriladiganlik qoidalari (lock-in yo'q)
- DB = oddiy Postgres (Drizzle, migratsiyalar); Supabase Auth/Realtime/Edge Functions yadroda ishlatilmaydi.
- Fayllar = S3 API (Supabase Storage S3-mos) → R2/S3/O'zbekiston serveri env bilan.
- Video = `VideoProvider` interfeysi; YouTube/stream/live adapterlar.
- Real vaqt (izoh, efir chati) = Postgres + SSE; kerak bo'lsa keyin provayder adapteri.
- Navbat/cron = portativ route + `CRON_SECRET` (F1 da bor).
- Ko'chirish = bitta buyruq (`scripts/ops/move.ts`, F2): DB + fayllar bucket'i + env + deploy + tekshiruv.
  Fayl bucket'ini ko'chirish R1 da qo'shiladi.

## 3. O'sish triggerlari (maslahatchi shularni tekshiradi)
| Trigger | O'lchov | Tavsiya |
| :--- | :--- | :--- |
| Birinchi begona xodim / moliya ma'lumoti | `users.role` ≠ student soni > 1 | `admin.` subdomen + 2FA majburiy |
| Mobil ilova store'ga tayyorlanmoqda | C3 boshlandi | `api.` subdomen, versiya darvozasi |
| MCP tashqi kataloglarga | egasi qarori | `mcp.` subdomen, OAuth issuer barqaror |
| Stream provayder ulandi | R5 | `media.` CNAME, xarajat limiti |
| Faol o'quvchi ≥ 1000 yoki kabinet p75 LCP > 2.5 s | analitika / Vercel | `app.` ajratish, DB indeks/replika tekshiruvi |
| DB ulanishlar > 70% yoki CPU > 70% 7 kun | Supabase metrikalari | tarif oshirish yoki replika |
| Oylik xarajat > belgilangan byudjet 80% | Vercel/Supabase/video | xarajat tahlili (`vercel-optimize`) |
| Qonun talabi / B2B mijoz O'zbekistonda saqlashni talab qildi / O'zbekistondan kechikish > 400 ms | egasi, monitoring | O'zbekiston data-markaziga ko'chirish (`move.ts`) |
| Birinchi B2B mijoz | org soni > 1 | `<org>.naqsh.uz`, org bo'yicha hisobotlar |
| Birinchi tashqi dasturchi | PAT'lar soni | `docs.` subdomen, API kalitlar sahifasi |

## 4. Maslahatchi (`platform_advice`)
- Skript `scripts/advisor/scale-check.ts` + oylik cron + MCP tool `platform_advice` (superadmin).
- Har trigger: holat (ok/yaqin/yetdi), raqam, tavsiya, narx (faqat tekshirilgan), egasi nima qiladi.
- "yetdi" bo'lsa egasiga Telegram: qisqa, o'zbekcha, bitta qaror so'raydi ("ha" → agent bajaradi).
- Orkestrator har sessiya boshida (RESUME) shu natijani o'qiydi va ochiq tavsiyani eslatadi.

## 5. Kuzatuv va xarajat
Sentry (web + mobil), `/api/health` uptime monitor (egasi amali), `status.` sahifasi, xarajat ogohlantirishlari
(Vercel, Supabase, video provayder, AI API), har rol uchun AI chaqiruvlar limiti.
