# Handoff — Growth sprint (skills + CRO + SEO + MCP), 2026-09-25

> **"davom et" desa:** shu faylni o'qi → §3 dagi birinchi ✅ bo'lmagan taskdan davom et. Qayta rejalashtirma.
> Egasi o'zbekcha gapiradi — o'zbekcha, qisqa javob ber. Har task tugagach shu faylda katakchani `[x]` qil va commit qil.

PR: https://github.com/Muhammadmirzo/vibecoding-uz/pull/2 — branch `claude/relaxed-gates-9vl0ir`. Hali `main`ga merge QILINMAGAN, deploy QILINMAGAN.

---

## 1. Nima qilindi (shu branch'da)

| Wave | Nima | Tekshiruv |
| :--- | :--- | :--- |
| Skills | 25 ta skill `.claude/skills/` (marketing/CRO/SEO — coreyhaines31, frontend-design/webapp-testing — Anthropic, React/UI — Vercel) + bitta faylda `docs/skills/ALL_SKILLS.md` + mahsulot konteksti `.agents/product-marketing.md` | frontmatter 25/25 OK |
| wave/ui | Button'da ko'rinadigan fokus halqasi (avval klaviatura fokus ko'rinmas edi), Search fokus, `…`, drawer/chat/search'da `overscroll-contain`, `transition-all` olib tashlandi | tsc ✅, vitest 616/616 ✅ |
| wave/funnel | Telefonda header CTA "Diagnostika" ko'rinadi; kafolatdan "100%" olindi (shartlar bor edi); bosh sahifa FAQ'dan xizmat savollari olindi; hero'ga haqiqiy `CohortCountdown`; "Kursni band qilish" → "Kursga yozilish" | tsc ✅, vitest ✅ |
| wave/mcp | 6 ta read-only MCP analitika vositasi (`get_analytics_overview`, `get_traffic_sources`, `get_conversion_funnel`, `get_landing_page_performance`, `get_sales_report`, `get_student_progress_report`); `grade_homework` va `broadcast_notification` endi `audit_logs`ga yozadi (bitta tranzaksiyada); eski `mcp.json`/`mcp-config.json` (o'lik `/api/mcp/sse`) o'chirildi; README yangilandi | tsc ✅, vitest 635/635 ✅ (haqiqiy lokal Postgres'da) |
| wave/seo | canonical (routeMetadata) 11 sahifada, /atamalar va /blog metadata, FAQPage + BreadcrumbList JSON-LD, /admin va /kabinet noindex, robots.ts'da AI botlar, `public/llms.txt`, soft-404 tuzatish (middleware) | §2 ga qarang |

Audit hisobotlari (xulosalari shu faylda; to'liq matn sessiya scratchpad'ida qoldi, repoda yo'q).

---

## 2. TO'LIQ TEKSHIRUV — hali QILINMAGAN (birinchi navbatda shu)

Egasi aytdi: tekshiruvni bepul agentlar bajaradi. Tartib bilan, har biri o'tishi shart:

- [ ] **T1. Gate.** Branch'da: `npm ci && npx tsc --noEmit && npx vitest run && npm run build`. Hammasi yashil bo'lishi shart.
  - vitest haqiqiy DB bilan: `DATABASE_URL` lokal Postgres (§5) yoki `.env`. DB bo'lmasa DB testlari skip bo'ladi — bu normal.
  - `sms-session-rate.test.ts` qayta ishga tushirishda 429 berishi mumkin (§3 T14) — `rate_limit_buckets`ni tozalab qayta ishga tushir, kod xatosi emas.
- [ ] **T2. Soft-404.** `npm run build && npx next start -p 3301` → `curl -s -o /dev/null -w "%{http_code}" localhost:3301/kurs/nope` = **404**, `/blog/nope` = **404**, `/kurs/vibe-coding-express` = **200**, bitta haqiqiy blog slug = **200**. Googlebot UA bilan ham (`-A "Googlebot"`). `src/middleware.ts` diff'ini o'qi: DB yiqilganda sayt yiqilmasligi (fail-open) shart.
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

## 4. Bepul agentlar uchun model tavsiyasi
| Task turi | Model darajasi |
| :--- | :--- |
| T1–T7 tekshiruv, T14 | tez/arzon model yetadi (buyruq ishga tushirish, natijani yozish) |
| T9–T13, G1–G5 | o'rta model (matn + kod) |
| T15, Q6, W8B review, har qanday auth/to'lov/DB o'zgarishi | eng kuchli model yoki egasi bilan Claude — bepul modelga berma |

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
