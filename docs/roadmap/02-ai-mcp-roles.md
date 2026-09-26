# 02 — AI (MCP) orqali har rol uchun nazorat

## Hozirgi holat (W8B, kodda tekshirildi)
- Masofaviy MCP: `src/app/api/mcp/route.ts`, OAuth 2.1 + PKCE, shaxsiy tokenlar (PAT), menejer bo'yicha ruxsat.
- 24 tool, 7 scope (`analytics:read`, `sales:read`, `students:read`, `chat:read/write`, `leads:write`, `content:write`),
  diagrammalar SVG + tuzilgan ma'lumot (`src/features/mcp/registry/visual.ts`).
- Rollar: `superadmin, admin, manager, mentor, student` (`src/db/schema/enums.ts`); tekshiruv 40+ joyda
  `role === "..."` sifatida sochilgan → `can()` kerak (F3/R0).

## Maqsad
Har bir xodim o'z AI'siga (Claude, ChatGPT, Gemini, Cursor, ...) ulanadi va **bir so'z bilan** ("holat", "bugun",
"qarzlar", "guruhim") o'z sohasidagi hamma narsani ko'radi. Faqat o'ziga ruxsat berilgan ma'lumotni.

## 1. Rollar va ruxsatlar (`can(user, action, resource)`)
| Rol | Ko'radi | O'zgartira oladi | Ko'rmaydi |
| :--- | :--- | :--- | :--- |
| **superadmin** | hammasi + audit log + xodimlar faoliyati | hammasi (xavfli amallar tasdiq bilan) | — |
| **buxgalter** (`accountant`, yangi) | to'lovlar, qaytarishlar, qarzdorlar, Payme/Click solishtirish, ustozlarga to'lov, soliq hisobotlari | qaytarishni tasdiqlash (ikki kishi qoidasi), invoice | darslar mazmuni, chat |
| **menejer** | lidlar, sotuv, o'quvchilar, o'z ustozlari sifati, guruhlar | lid holati, o'quvchini guruhga o'tkazish | moliya tafsiloti (faqat yig'ma) |
| **ustoz** (`mentor`) | faqat o'z guruhlari: davomat, uyga vazifa navbati, javobsiz savollar, dars statistikasi | vazifa baholash, savolga javob, dars materiali | boshqa guruhlar, to'lovlar |
| **talaba** | o'z progressi, vazifalari, sertifikati | savol berish | boshqalar ma'lumoti |

- Ruxsatlar jadvalda (`role_permissions`), kodda emas → yangi rol qo'shish = jadvalga qator.
- Qator darajasida cheklov servis qatlamida (ustoz → `cohort.mentor_id = user.id`); MCP ham, web ham, API ham
  bitta servisni chaqiradi — shuning uchun AI boshqa yo'l bilan ko'proq ko'ra olmaydi.
- PII niqoblash rolga qarab: buxgalter telefonni `+998 90 *** ** 67` ko'radi; talabalar ro'yxati eksportida ham.

## 2. Tool paketlari (scope = ruxsat)
**Hamma rol uchun "holat" tool'i** — `status_overview`: rolga qarab KPI'lar + ogohlantirishlar + diagramma.
- superadmin: bugungi sotuv, faol o'quvchilar, javobsiz savollar, SLA buzilishi, xatolar (Sentry), cron holati, xarajat.
- buxgalter: bugun/oy tushum, qaytarishlar, muddati o'tgan to'lovlar, provayder bilan tafovut.
- menejer: yangi lidlar, konversiya, ustozlar sifat reytingi, xavfdagi o'quvchilar (3 kun kirmagan).
- ustoz: bugungi dars, tekshirilmagan vazifalar, javobsiz savollar, oxirgi dars bahosi.

**Yangi tool'lar (R3):**
| Paket | Tool'lar |
| :--- | :--- |
| Moliya (`finance:read/write`) | `revenue_report`, `debtors_list`, `reconcile_provider`, `refund_approve` (tasdiq), `mentor_payouts`, `finance_export` (xlsx) |
| Ta'lim (`teaching:read/write`) | `my_cohorts`, `homework_queue`, `homework_grade`, `questions_unanswered`, `question_reply`, `lesson_stats`, `live_schedule` |
| Sifat (`quality:read`) | `mentor_quality`, `lesson_quality`, `quality_trends`, `at_risk_students` (03) |
| Boshqaruv (`admin:read`) | `staff_activity`, `audit_log`, `system_health`, `costs_overview`, `platform_advice` (06) |

**MCP prompts** (tayyor ssenariylar, mijozda "/" bilan chiqadi): `/kunlik-hisobot`, `/haftalik-moliya`,
`/ustoz-sifati`, `/guruhim`, `/xavfdagi-talabalar`. **Resources**: kurs dasturi, narxlar, qoidalar (faqat o'qish).

## 3. Diagramma va natija formati
Har tool: (1) qisqa matn xulosa, (2) `structuredContent` (JSON), (3) SVG diagramma rasm sifatida,
(4) MCP Apps (`ui://` interaktiv panel) qo'llab-quvvatlagan mijozlarda. Qo'llamaganida — matn jadval.
Kichik namunada "ma'lumot yetarli emas (n=7)" (L14).

## 4. Barcha AI mijozlarga ulanish
Bitta endpoint: `https://mcp.<domen>/mcp` (Streamable HTTP) + OAuth 2.1 (dinamik ro'yxatdan o'tish) + PAT zaxira.
| Mijoz | Usul |
| :--- | :--- |
| Claude (web, desktop, Code) | masofaviy connector, OAuth |
| ChatGPT | connector / developer mode (masofaviy MCP); MCP'siz joyda — OpenAPI Actions (`/api/v1/openapi.json`) |
| Gemini CLI, Antigravity | `settings.json` da HTTP MCP server |
| Cursor, VS Code Copilot, Windsurf, Zed | HTTP MCP konfiguratsiya (PAT yoki OAuth) |
| Faqat stdio qo'llaydigan mijozlar | `npx mcp-remote https://mcp.<domen>/mcp` ko'prigi |
- `/kabinet/ai` sahifasi: har mijoz uchun "bir tugmada ulash" ko'rsatmasi, PAT yaratish/bekor qilish, faol ulanishlar.
- **Moslik matritsasi** `docs/mcp/CLIENTS.md` da; har chorakda qayta sinaladi (mijozlar tez o'zgaradi — da'vo
  faqat sinovdan keyin yoziladi). CI: MCP Inspector/konformans testi har PR'da.

## 5. Xavfsizlik
- Eng kam ruxsat: token scope'lari rolidan oshmaydi; token muddati (access 1 soat, refresh 30 kun), bekor qilish.
- **Audit log** (`mcp_audit`): kim, qaysi tool, qachon, argument xeshi, natija hajmi, IP — o'zgarmas (append-only).
- Yozuvchi/xavfli tool'lar: `destructive: true`, tasdiq so'raydi, idempotency kaliti, pul amallari ikki kishi tasdig'i.
- Prompt injection: foydalanuvchi matni (izoh, chat, lid izohi) `untrusted` maydonda qaytadi; xavfli tool'lar
  ishonchsiz matndagi buyruq bilan ishga tushmaydi. Tool tavsiflari server tomonda qat'iy.
- Rate limit har token va har tool bo'yicha (DB'da); katta eksport navbatga (cron) tushadi.
- Ma'lumot hajmi: ro'yxatlar kursor bilan (`meta.nextCursor`), bir javobda ≤ 200 qator.

## 6. Qabul mezonlari
Har rol uchun e2e test: ustoz boshqa guruhni ko'ra olmaydi; buxgalter izoh matnini ko'rmaydi; bekor qilingan token
401; audit log yozildi; kamida 3 mijoz (Claude, ChatGPT, Gemini CLI) bilan qo'lda sinov skrinshoti.
