# Handoff — Growth sprint (skills + CRO + SEO + MCP), 2026-09-25

> **"davom et" desa:** shu faylni o'qi → §0 (R0, R1) → §2 → §3 → §6 tartibida birinchi `[ ]` taskdan davom et. Qayta rejalashtirma.
> Egasi o'zbekcha gapiradi — o'zbekcha, qisqa javob ber. Har task tugagach shu faylda katakchani `[x]` qil va commit qil.

PR: https://github.com/Muhammadmirzo/vibecoding-uz/pull/2 — branch `claude/relaxed-gates-9vl0ir`. Hali `main`ga merge QILINMAGAN, deploy QILINMAGAN.

## 0. ⚠️ HOLAT 2026-09-26 — `main` oldinga ketdi, AVVAL SHU BO'LIMNI BAJAR

Bu PR yozilgandan keyin `main`ga ~45 commit qo'shildi (W8B MCP + OAuth, E0 hero live demo, Awwwards lab, a-fixes, SARBON, skillkit). PR #2 hozir **6 faylda konflikt** qiladi: `CLAUDE.md`, `src/app/robots.ts`, `src/components/sections/home/HeroSection.tsx`, `src/app/kurs/[slug]/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/__tests__/w4-arch/mcp-http-route.test.ts` (main'da o'chirilgan).

Kompyuterda davom ettirish uchun egasi yangi Claude sessiyasiga shuni yozadi:
> `PR #2 (branch claude/relaxed-gates-9vl0ir) dagi docs/HANDOFF_2026-09-25-growth.md ni o'qi va §0 dan davom et.`

- [ ] **R0. PR'ni yangi main'ga moslashtirish** (kuchli model; egasi "ha" degandan keyin). Tartib:
  1. `git checkout claude/relaxed-gates-9vl0ir && git fetch origin`.
  2. **wave/mcp'ni qaytar** — W8B (`src/features/mcp/registry/*`: `analytics_overview`, `analytics_acquisition`, `analytics_funnel`, `sales_summary`, … OAuth bilan) buni to'liq qoplaydi: `git revert -m 1 be05c1c`. `mcp.json`/`mcp-config.json` o'chirilishi ham bekor bo'ladi — ular W8B holatida qolsin.
  3. `git merge origin/main` (rebase EMAS — PR ochiq). Konfliktlar:
     - `CLAUDE.md` → main'nikini ol, faqat 2 qator qo'sh: skills README havolasi va shu handoff havolasi.
     - `HeroSection.tsx` → **main'nikini to'liq ol** (E0 hero egasi tasdiqlagan). CohortCountdown'ni qo'shma; kerak bo'lsa egasidan so'ra.
     - `robots.ts` → main'dagi `/lab` disallow + bizning AI bot qoidalari (har bir botga ham `/lab`).
     - `kurs/[slug]`, `blog/[slug]` → main'ning kodini asos qil, ustiga faqat bizning FAQPage/BreadcrumbList JSON-LD qo'shimchalarini qo'y.
     - `mcp-http-route.test.ts` → o'chir (main kabi).
  4. `src/middleware.ts` avtomatik merge bo'ladi — main'da a-fixes'ning `dynamicParams=false` urinishi qaytarilgan (`c830c07`), ya'ni soft-404 main'da HALI tuzalmagan; bizning middleware yechimi kerak. Takroriy tekshiruv yo'qligini ko'r.
  5. Gate: `npm run lessons:check` (main'dagi yangi qoida), `npx tsc --noEmit`, `npx vitest run`, `npm run build`. So'ng §2 T2–T5.
  6. Push faqat shu branch'ga. `main`ga merge — faqat egasi aytganda.
- [ ] **R1. SARBON/skillkit bilan moslik.** main'da `ZAHAR_ORCHESTRATION.md` → `SARBON_ORCHESTRATION.md`, `.skillkit.json`, `.claude/skills/naqsh-lessons` bor. Bizning `.claude/skills/*` va `docs/skills/ALL_SKILLS.md` ularga zid emasligini tekshir; `AGENTS.md`dagi havolani saqla. Model matritsasi/skillkit sozlamalarini O'ZGARTIRMA (egasi taqiqlagan).
- Qaysi ish hali qimmatli (R0 dan keyin qoladi): skills, SEO (canonical, JSON-LD, noindex, AI robots, llms.txt, **middleware soft-404**), a11y fokus halqasi, telefonda header CTA, halol kafolat matni, FAQ tozalash, "Kursga yozilish", audit hisobotlari `docs/growth/reports/`.
- Endi keraksiz: wave/mcp (W8B qoplaydi), hero countdown (hero almashgan).

---

## 1. Nima qilindi (shu branch'da)

| Wave | Nima | Tekshiruv |
| :--- | :--- | :--- |
| Skills | 25 ta skill `.claude/skills/` (marketing/CRO/SEO — coreyhaines31, frontend-design/webapp-testing — Anthropic, React/UI — Vercel) + bitta faylda `docs/skills/ALL_SKILLS.md` + mahsulot konteksti `.agents/product-marketing.md` | frontmatter 25/25 OK |
| wave/ui | Button'da ko'rinadigan fokus halqasi (avval klaviatura fokus ko'rinmas edi), Search fokus, `…`, drawer/chat/search'da `overscroll-contain`, `transition-all` olib tashlandi | tsc ✅, vitest 616/616 ✅ |
| wave/funnel | Telefonda header CTA "Diagnostika" ko'rinadi; kafolatdan "100%" olindi (shartlar bor edi); bosh sahifa FAQ'dan xizmat savollari olindi; hero'ga haqiqiy `CohortCountdown`; "Kursni band qilish" → "Kursga yozilish" | tsc ✅, vitest ✅ |
| wave/mcp | 6 ta read-only MCP analitika vositasi (`get_analytics_overview`, `get_traffic_sources`, `get_conversion_funnel`, `get_landing_page_performance`, `get_sales_report`, `get_student_progress_report`); `grade_homework` va `broadcast_notification` endi `audit_logs`ga yozadi (bitta tranzaksiyada); eski `mcp.json`/`mcp-config.json` (o'lik `/api/mcp/sse`) o'chirildi; README yangilandi | tsc ✅, vitest 635/635 ✅ (haqiqiy lokal Postgres'da) |
| wave/seo | canonical (routeMetadata) 11 sahifada, /atamalar (yangi layout.tsx) va /blog metadata, FAQPage + BreadcrumbList JSON-LD, /admin va yangi /kabinet/layout.tsx'da noindex, robots.ts'da AI botlar, `public/llms.txt`, soft-404: `src/middleware.ts` noma'lum `/kurs/<slug>` va `/blog/<slug>`ni statik slug ro'yxatlariga (`COURSE_SLUGS`, `STATIC_BLOG_POSTS`) qarab 404 qiladi | agent: tsc ✅, vitest ✅, build ✅, standalone server'da curl 404/200 ✅. Merge'dan keyin: tsc ✅, vitest 641/641 ✅ (build qayta ishga tushirilmagan) |

Audit va implementatsiya hisobotlari to'liq matni: `docs/growth/reports/` (A-FUNNEL, B-SEO, C-UI, D-ADMIN-MCP, I-*). Eslatma: D-ADMIN-MCP va I-MCP W8B'dan oldin yozilgan — MCP bo'yicha main'dagi `docs/waves/reports/W8B-MCP.md` ustun.

---

## 2. TO'LIQ TEKSHIRUV — hali QILINMAGAN (R0 dan keyin)

Egasi aytdi: tekshiruvni bepul agentlar bajaradi. Tartib bilan, har biri o'tishi shart:

- [ ] **T1. Gate.** Branch'da: `npm ci && npx tsc --noEmit && npx vitest run && npm run build`. Hammasi yashil bo'lishi shart.
  - vitest haqiqiy DB bilan: `DATABASE_URL` lokal Postgres (§5) yoki `.env`. DB bo'lmasa DB testlari skip bo'ladi — bu normal.
  - `sms-session-rate.test.ts` qayta ishga tushirishda 429 berishi mumkin (§3 T14) — `rate_limit_buckets`ni tozalab qayta ishga tushir, kod xatosi emas.
- [ ] **T2. Soft-404.** `npm run build && PORT=3301 node .next/standalone/server.js` (`next start` `output: standalone` bilan noto'g'ri ishlaydi) → `curl -s -o /dev/null -w "%{http_code}" localhost:3301/kurs/nope` = **404**, `/blog/nope` = **404**, `/kurs/vibe-coding-express` = **200**, bitta haqiqiy blog slug = **200**. Googlebot UA bilan ham (`-A "Googlebot"`). Diqqat: blog DB'dan emas, faqat `STATIC_BLOG_POSTS`dan o'qiydi — yangi post qo'shilsa o'sha ro'yxatga qo'shiladi, middleware avtomatik taniydi. Agar kelajakda blog DB'ga o'tsa, middleware tekshiruvini olib tashlash SHART (aks holda yangi postlar 404).
- [ ] **T3. SEO tekshiruv.** Ko'rish: `curl localhost:3301/robots.txt`, `/llms.txt`, `/sitemap.xml`; `/kurs/vibe-coding-express` HTML'ida `application/ld+json` ichida `Course`, `FAQPage`, `BreadcrumbList`; har public sahifada `<link rel="canonical">`; `/admin/login` va `/kabinet`da `noindex`.
- [ ] **T4. Responsive + e2e.** `npx playwright test e2e/responsive.spec.ts e2e/visibility.spec.ts e2e/funnel.spec.ts` (`E2E_PORT` bilan). Funnel testida matn "Kursga yozilish" va "7 kunlik pul qaytarish kafolati" ga o'zgargan.
- [ ] **T5. Vizual.** Skill: `docs/skills/ALL_SKILLS.md` → `webapp-testing`. Skrinshot 375, 390, 768, 1440 — light + dark: bosh sahifa (header'da "Diagnostika" tugmasi 375px'da sig'adimi, hero'dagi countdown layout shift bermayaptimi), /kurs/vibe-coding-express (StickyBuyBar "Yozilish"), Tab tugmasi bilan fokus halqasi ko'rinishi. 0 console error.
- [ ] **T6. Lighthouse mobil** (`--throttling-method=devtools`): bosh sahifa CLS = 0, LCP ≤ 2.5 s (countdown qo'shilgani uchun).
- [ ] **T7. MCP smoke.** `.env`da `MCP_AUTH_TOKEN` bilan `npm run mcp:start` yoki HTTP `/api/mcp`: `tools/list` → 13 ta vosita; `get_analytics_overview` haqiqiy prod DB'da xatosiz javob beradi (read-only, xavfsiz).
- [ ] **T8. Merge + deploy** (faqat T1–T7 yashil bo'lsa, egasi "merge qil" desa): PR #2 ni `main`ga merge → `git push origin main && git push origin main:master` → https://master-2-jade.vercel.app smoke (asosiy route'lar 200, 0 console error). Migratsiya YO'Q bu PR'da.
  - ⚠️ W8B (`wave/w8b-mcp`, egasining kompyuterida, push qilinmagan) shu PR bilan `mcp-server/server.ts`, `mcp-server/README.md`, `src/lib/validations/mcp.ts`da konflikt berishi mumkin — W8B review qilinganda ikkala tomondagi vositalarni ham saqla.

---

## 3. Qolgan tasklar (tekshiruvdan keyin, tartib bilan)

Har task uchun: o'qiladigan skill bo'limi `docs/skills/ALL_SKILLS.md` ichida. Qoidalar: `docs/CODER_AGENT_RULES.md` (faqat theme tokenlar, fayl ≤ 250 qator, o'zbekcha matn, **soxta raqam/sharh/talaba soni yo'q**).

### A. Kod — egasining qarorisiz qilsa bo'ladi
- [ ] **T9. Sahifaga mos NextStepCTA.** `/pul-qaytarish`, `/xizmatlar` va boshqa `<NextStepCTA />` props'siz sahifalarga sahifa mavzusiga mos `title`/`subtitle` (namuna: `src/app/kurs/[slug]/page.tsx`). Skill: `cro`, `copywriting`.
- [ ] **T10. Kurs OG rasmi.** `src/app/kurs/[slug]/opengraph-image.tsx` — kurs nomi + narx (root `opengraph-image.tsx` naqshida). Skill: `seo-audit`.
- [ ] **T11. `public/pricing.md`.** Ikkala kurs narxi (UZS), bo'lib to'lash, 7 kunlik kafolat shartlari — faqat `src/lib/siteConfig.ts`dagi faktlar. Skill: `ai-seo`, `pricing`.
- [ ] **T12. Narxni Intl bilan formatlash.** `siteConfig.courses[*].price` string → raqam + `new Intl.NumberFormat("uz-UZ")` helper; barcha ishlatilgan joylar va testlar. Skill: `web-design-guidelines`.
- [ ] **T13. Analitika tracking rejasi.** Mavjud `data-track` atributlari va `src/features/analytics` hodisalarini `analytics` skill bo'yicha tekshir: funnel har qadami (diagnostika start/finish, lead, signup, checkout, payment) o'lchanadimi? Yo'qlarini qo'sh. Hisobot: `docs/reports/TRACKING-PLAN.md`.
- [ ] **T14. Flaky test.** `src/__tests__/hardening/sms-session-rate.test.ts` qat'iy telefon raqamlari + doimiy `rate_limit_buckets` → ketma-ket ishga tushirishda 429. Testda tasodifiy raqam ishlat yoki test boshida o'z bucket'larini tozala. Testni o'chirma/skip qilma.
- [ ] **T16. Chiroyli 404.** Middleware 404'lari (yopiq route'lar + noma'lum slug) oddiy matn "Bu sahifa topilmadi" qaytaradi. Brendlangan `not-found` sahifasini 404 status bilan ko'rsatish (masalan `NextResponse.rewrite(new URL("/404-sahifa", request.url), { status: 404 })` — Next 15'da status saqlanishini curl bilan tekshir). Skill: `cro` (404'da ham keyingi qadam CTA).
- [ ] **T15. Revenue aniqligi.** `src/features/analytics/server/*` summalarni `::int`ga cast qiladi → so'm kasri yo'qoladi, ~2.1 mlrd so'mdan oshsa overflow. `::bigint` yoki numeric → JS'da xavfsiz o'giring; haqiqiy DB'da test.

### B. Egasining qarori kerak (so'ramasdan qilma — avval egasidan so'ra)
- [ ] **Q1. `.agents/product-marketing.md`** dagi **[TASDIQLANG]** joylar: raqobatchilar, haqiqiy mijoz iboralari, joriy ko'rsatkichlar. Egasi aytgach yangilang (skill: `product-marketing`).
- [ ] **Q2. /bepul-dars:** sahifa "video dars" deydi, lekin video yo'q — lead forma → Telegram bot. Variant a) haqiqiy videoni sahifaga joylash; b) matnni "Bepul dars — Telegram orqali olasiz" ga o'zgartirish.
- [ ] **Q3. Guruhda joy chegarasi bormi?** Bo'lsa `siteConfig`ga haqiqiy `seats` + ko'rsatish; yo'q bo'lsa hech narsa qilma.
- [ ] **Q4. Bonus:** egasi haqiqatan bera oladigan bonus (masalan 1-hafta uy vazifasini Mirzo shaxsan tekshiradi) bormi? Skill: `offers`.
- [ ] **Q5. Ikkala kurs narxi bir xil (550 000).** Farqlash kerakmi? Skill: `pricing`.
- [ ] **Q6. Uy vazifasi bahosi 100.** `homework_reviews.score` = `numeric(4,2)` → 100 saqlanmaydi (overflow). Migratsiya `numeric(5,2)` — `npm run db:generate`, live DB'ga egasi ruxsati bilan. (ZAHAR-DB review.)
- [ ] **Q7. claude.ai connector** faqat OAuth qabul qiladi, bizning `/api/mcp` Bearer token → 401. Hozir Claude Code / Desktop (`mcp-remote`) orqali ishlaydi. OAuth — W8B'da bo'lishi mumkin; W8B review'da hal qil. Vercel'da `MCP_AUTH_TOKEN` o'rnatilganini tekshir.
- [ ] **Q8. Dizayn o'ziga xosligi:** har bo'lim ustidagi mono/UPPERCASE "eyebrow" yozuvi — AI-shablon belgisi. Taklif: kichik girih belgisi (mavjud `GirihPattern`dan) bilan almashtirish. Egasi rozi bo'lsa, avval bosh sahifada, skrinshot bilan ko'rsat. Skill: `frontend-design`.

### C. O'sish rejalari (15-oktyabr guruhi uchun) — hujjat, kod emas
Natija: `docs/growth/<nom>.md`, o'zbekcha, faqat haqiqiy faktlar, egasi ko'rib chiqadi.
- [ ] **G1. Launch rejasi** — 15-oktyabr guruhini to'ldirish: kanallar (Telegram, Instagram), kunma-kun reja. Skill: `launch`, `marketing-psychology`.
- [ ] **G2. Referral dasturi** — mavjud 10% komissiya (`src/features/referrals/domain/policy.ts`) asosida taklif matnlari va kabinetdagi joylashuv. Skill: `referrals`.
- [ ] **G3. Lead nurture ketma-ketligi** — diagnostika/bepul dars'dan keyingi Telegram bot xabarlari (5–7 ta). Skill: `emails` (kanal Telegram).
- [ ] **G4. Lead magnit / bepul vosita g'oyalari** — masalan "AI bilan bot narxi kalkulyatori". Skill: `lead-magnets`, `free-tools`.
- [ ] **G5. A/B test rejasi** — diagnostika natijasini kontakt formasidan oldin qisman ko'rsatish; qaytgan tashrifchiga "Sotib olish" birinchi. Skill: `ab-testing`. Faqat reja; trafik yetarli bo'lganda ishga tushadi.

---

- Eslatma: `/testimoniyalar` yopiq route (W10) — unga qo'shilgan canonical zararsiz. Ba'zi eski sarlavhalarda "| Naqsh" ikki marta chiqadi (layout template ham qo'shadi) — kichik tuzatish, T9 bilan birga qilsa bo'ladi.

## 6. 🚚 KO'CHIRISH TALABI (egasi 2026-09-26) — hostingdan mustaqillik

**Talab (egasining so'zi bilan):** loyiha hozir Vercel + Supabase'da. Uni istalgan boshqa serverga (VPS, boshqa bulut) va bazani boshqa servisga **bitta buyruq bilan** ko'chirish mumkin bo'lsin. Ko'chirishda **hech qanday ma'lumot yo'qolmasin**, xatolik bo'lmasin, **xavfsizlikka zarar yetmasin**.

**Hozirgi holat (main, 2026-09-26 tekshirildi):**
- ✅ Yaxshi: kod Supabase SDK ishlatmaydi — oddiy Postgres (`DATABASE_URL`, Drizzle, `drizzle/` migratsiyalar). `next.config.mjs`da `output: 'standalone'`, `Dockerfile` (node:20-alpine, standalone) va `docker-compose.yml` (postgres:16 + MinIO) bor. `@vercel/*` paketlari yo'q.
- ⚠️ `docker-compose.yml`da **standart parollar hardcode** (`POSTGRES_PASSWORD`/`MINIO_ROOT_PASSWORD` default qiymatlari) — prod'da xavfli; default'siz majburiy qilish kerak.
- ⚠️ `.env.example`da ~15 ta o'zgaruvchi, kod esa ~40 tasini o'qiydi (ESKIZ_*, API_JWT_SECRET, CRON_SECRET, TELEGRAM_*, MCP_*, UPSTASH_*, RESEND_*, IOS_*/ANDROID_* …) — ko'chirganda nimadir unutiladi.
- ⚠️ Cron route'lar (`/api/cron/reminders`, `/api/cron/analytics-retention`) Vercel'dan tashqarida o'zi ishlamaydi — tashqi scheduler kerak.
- ⚠️ `vercel.json` `regions: ["syd1"]` — Supabase (ap-southeast-2) yoniga qo'yilgan; baza ko'chsa, server ham bazaga yaqin bo'lishi kerak (aks holda login 3–5 s — STATE.md tarixi).
- ⚠️ Telegram webhook URL domen o'zgarsa qayta ro'yxatdan o'tkazilishi kerak; `NEXT_PUBLIC_APP_URL`, OAuth issuer (W8B `/.well-known/oauth-*`), CSP ham domenga bog'liq.

**Tasklar** (ZAHAR-DB/SHIELD darajasi — kuchli model; har bir qadam egasi ruxsati bilan; production DB'ga yozish faqat egasi "ha" desa):
- [ ] **M1. `.env.example` to'liq** — kod o'qiydigan barcha o'zgaruvchilar (grep `process.env.`), har biriga izoh: majburiymi, qayerdan olinadi. Qiymat YOZILMAYDI. Env'ni Zod bilan startda tekshirish (yo'q bo'lsa aniq xato, sirni chop etmay).
- [ ] **M2. docker-compose prod-xavfsiz** — default parollarni olib tashlash (`${POSTGRES_PASSWORD:?required}`), portlarni faqat localhost'ga, app servisi + healthcheck, cron uchun kichik scheduler servisi (`CRON_SECRET` bilan `curl`).
- [ ] **M3. `scripts/migrate-host.sh` — bitta buyruq.** Talablar:
  - `--dry-run` standart; haqiqiy ko'chirish faqat `--apply` bilan.
  - Manba va nishon DB URL'lari env'dan (`SOURCE_DATABASE_URL`, `TARGET_DATABASE_URL`), hech qachon ekranga/logga chiqarilmaydi.
  - Qadamlar: manba zaxirasi (`pg_dump -Fc`, sana bilan, checksum) → nishonga `pg_restore` → `drizzle-kit migrate` → **har jadval qator soni manba = nishon** tekshiruvi (+ asosiy jadvallar uchun hash) → farq bo'lsa to'xtaydi va hech narsani o'chirmaydi.
  - Manba HECH QACHON o'zgartirilmaydi/o'chirilmaydi; eski hosting nishon tekshirilgunicha ishlab turadi (rollback = DNS'ni qaytarish).
  - Yozuv oynasi: ko'chirish paytida saytni "faqat o'qish" rejimiga o'tkazish yoki qisqa maintenance (to'lov webhook'lari yo'qolmasligi uchun — Payme/Click qayta yuboradi, lekin tekshirilsin).
- [ ] **M4. Fayllar/media** — hozir rasmlar qayerda saqlanadi (public/, tashqi URL, MinIO?) — aniqlash va ko'chirish skriptiga qo'shish.
- [ ] **M5. Domen/tashqi servislar checklist** — `docs/runbooks/MIGRATE-HOST.md`: DNS, TLS, Telegram `setWebhook`, Payme/Click callback URL, OAuth issuer, CSP, `NEXT_PUBLIC_APP_URL`, cron, backup jadvali. Har qadamda tekshirish buyrug'i.
- [ ] **M6. Mashq (rehearsal)** — lokal: docker-compose'da bo'sh nishonga, seed'langan manbadan `migrate-host.sh --apply`; qator sonlari teng, sayt ishlaydi, login ishlaydi. Natija runbook'ga.
- [ ] **M7. Xavfsizlik review** (kuchli model, `security-review`): skript sirlarni chiqarmasligi, zaxira fayllar ruxsatlari (600), shifrlash, tarmoq faqat TLS.

## 4. Bepul agentlar uchun model tavsiyasi
| Task turi | Model darajasi |
| :--- | :--- |
| T1–T7 tekshiruv, T14 | tez/arzon model yetadi (buyruq ishga tushirish, natijani yozish) |
| T9–T13, G1–G5 | o'rta model (matn + kod) |
| R0, T15, Q6, M1–M7, har qanday auth/to'lov/DB o'zgarishi | eng kuchli model yoki egasi bilan Claude — bepul modelga berma |

Qoida (STATE.md dan): agentlar mock testlar bilan haqiqiy SQL xatolarini 3 marta o'tkazib yuborgan — DB'ga tegadigan har o'zgarishni haqiqiy DB'da sinab ko'r.

## 5. Lokal Postgres (DB testlari uchun, ixtiyoriy)
```bash
# Postgres 16 o'rnatilgan bo'lsa:
initdb -D ~/pgdata -U postgres --auth=trust && pg_ctl -D ~/pgdata -l ~/pg.log start
psql -h 127.0.0.1 -U postgres -c "create database naqsh"
export DATABASE_URL=postgres://postgres@127.0.0.1:5432/naqsh
npx drizzle-kit migrate && npm run db:seed
```
Hech qachon `db:migrate`/`db:push`ni production DB'ga egasi ruxsatisiz ishga tushirma.
