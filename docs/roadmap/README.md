# Naqsh — katta yo'l xaritasi (roadmap), 2026-09-26

Egasi so'rovi (2026-09-26): darslar (video/YouTube/stream/fayl/izoh/audio), har bir rol uchun AI (MCP) orqali nazorat,
dars sifatini raqam va diagrammada o'lchash, subdomenlarga ajratish mantig'i, mobile/desktop/MCP ilovalar.
Bu papka — shu ishlarning yagona rejasi. Orkestrator har sessiyada shu yerdan keyingi to'lqinni oladi.

| Fayl | Mavzu |
| :--- | :--- |
| [01-lessons-media.md](01-lessons-media.md) | Video (YouTube + stream provayder + jonli efir), fayllar, savol-javob, audio |
| [02-ai-mcp-roles.md](02-ai-mcp-roles.md) | Har rol uchun MCP (superadmin, buxgalter, menejer, ustoz, talaba), barcha AI mijozlar |
| [03-quality-control.md](03-quality-control.md) | Ustoz va dars sifatini raqamlarda o'lchash, diagramma, ogohlantirish |
| [04-domains-subdomains.md](04-domains-subdomains.md) | Subdomen xaritasi, qachon ajratiladi (triggerlar), hozirdan tayyorgarlik |
| [05-clients-apps.md](05-clients-apps.md) | Web, mobile (Expo), desktop (PWA → Tauri), Telegram Mini App, MCP — bitta backend |
| [06-platform-growth.md](06-platform-growth.md) | Supabase hozir, keyin ko'chirish; o'sish triggerlari va "maslahatchi" |
| [08-pricing-plans.md](08-pricing-plans.md) | Tariflar: har kursda 1–3 (Start · Pro · Premium) |

## Asosiy tamoyillar (hamma to'lqinga tegishli)
1. **Bitta backend, ko'p mijoz.** Mantiq `src/features/*` servislarida; web, `/api/v1`, MCP, Telegram, mobile, desktop
   — faqat adapterlar. Funksiya "tayyor" = web UI + `/api/v1` (OpenAPI) + MCP tool (yoki `n/a` + sabab) + test.
2. **Provayder interfeysi.** Video, fayl, jonli efir, email, SMS — har biri interfeys ortida (`VideoProvider`,
   `FileStorage`, ...). Provayder almashishi = bitta adapter + env, kod qayta yozilmaydi.
3. **Yangi jadvallar to'g'ri tug'iladi.** `timestamptz`, `org_id`, `created_at/updated_at`, soft-delete qarori,
   ruxsat `can()` orqali. Eski jadvallar F3 da tuzatiladi.
4. **Halollik (L14).** Namuna kichik bo'lsa "ma'lumot yetarli emas"; to'qima raqam, sharh yo'q.
5. **Ingichka bo'laklar.** Har to'lqin: gate'lar → jonli DB'da SQL → 390/768/1280/1440 skrinshot → reliz → handoff.
6. **Hostlar markazlashgan.** Hech bir URL kodda qattiq yozilmaydi — `siteConfig.urls` (hozir 13 faylda
   `master-2-jade`/`naqsh.uz` qattiq yozilgan; R0 da tuzatiladi).

## To'lqinlar tartibi
| To'lqin | Nima | Bog'liqlik | Agent |
| :--- | :--- | :--- | :--- |
| **R0 Poydevor** | `features.json` + parity test; `siteConfig.urls` + host-routing middleware (ajratmasdan); `can()` + yangi rollar (`accountant`, `teacher`=mentor nomi saqlanadi); MCP audit log | yo'q (DB sxema: faqat rollar/permissions — `naqsh-dev` kerak) | muse-spark |
| **F3 Ma'lumot poydevori** | timestamptz, tiyin+valyuta, org_id, E.164, Sentry (RESUME §5.4) | `naqsh-dev` | muse-spark |
| **R1 Dars media v1** | `lesson_media` jadvali, himoyalangan YouTube pleyer + suv belgisi + heartbeat; fayllar (S3 interfeys, Supabase Storage) | R0, F3 | muse-spark |
| **R2 Savol-javob** | izoh + vaqt belgisi + mentor javobi + Telegram xabar + dars bahosi (1–5) | R1 | muse-spark |
| **R3 MCP rol paketlari** | ustoz/buxgalter/menejer/superadmin tool'lari, "holat" tool, MCP prompts, mijozlar matritsasi | R0 | muse-spark + gemini review |
| **R4 Sifat nazorati** | metrikalar, `/admin/sifat`, MCP diagrammalar, haftalik Telegram hisobot | R1–R3 | muse-spark |
| **R5 Stream + jonli efir** | provayder adapteri (signed HLS), YouTube Live → provayder live, yozuv avtomatik darsga | R1, egasi narxni tasdiqlaydi | muse-spark |
| **R6 Mobil + Telegram Mini App** | `api.` subdomen (store'dan OLDIN), Expo ilova, Mini App | R0–R2, domen | muse-spark |
| **R7 Desktop** | PWA o'rnatish; Tauri faqat trigger bo'lsa | R6 | space-bunny |

Subdomen ajratish va provayder almashish — **trigger bo'yicha** (04, 06). Trigger yetganda orkestrator egasiga
bitta xabarda aytadi: nima, nega, qancha turadi, nima qilish kerak.

## Egasining qarorlari (bir marta so'raladi)
- Hal qilingan: Supabase hozircha (Sidney), keyin ko'chirish mumkin bo'lsin; YouTube ham qo'llab-quvvatlansin;
  MCP barcha rollar va deyarli barcha AI'lar uchun; subdomen mantig'ini orkestrator belgilaydi.
- 2026-09-26: domen hozir olinadi (egasi nomida); tariflar har kursda 1–3 (08); `naqsh-dev` qadamlari yuborildi.
- Ochiq: (2) o'quvchilar soni va video soatlari (narx
  hisobi uchun); (3) dars formati: jonli guruh / yozilgan video / aralash; (4) `naqsh-dev` yaratish.
