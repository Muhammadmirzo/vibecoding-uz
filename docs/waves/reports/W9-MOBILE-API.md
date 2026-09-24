# W9 — Mobile API (iOS/Android tayyorgarlik) — hisobot

**Branch:** `wave/w9-mobile-api` · **Dev port:** 3308 · **Holat:** tugadi, push qilinmadi.

## Nima yetkazildi

**1. Token auth (native):** `api_refresh_tokens` (hashed, device_id/name,
platform, last_used_at, revoked_at, rotated_from) va `push_devices`
(Expo/FCM/APNs token, app_version, locale, last_seen, disabled_at) —
`src/db/schema/mobile.ts` + additiv migratsiya `drizzle/0007_needy_warstar.sql`.
Access — 15 daqiqalik JWT (HMAC-SHA256, `API_JWT_SECRET`, aud `naqsh-mobile`,
sub/role/sid) — `src/lib/auth/mobile-access.ts` (Edge-safe, WebCrypto).
Endpointlar: `POST /api/v1/auth/token` (web login bilan bir xil lockout/rate-limit),
`POST /api/v1/auth/telegram/start|/status` (claim token cookie o'rniga body'da),
`POST /auth/refresh` (rotatsiya + reuse → qurilma oilasi revoke),
`POST /auth/logout`, `GET|DELETE /auth/sessions`.
`require-auth.ts` gate `Authorization: Bearer`'ni qabul qiladi — CSRF faqat
bearer uchun skip, rollar bir xil, cookie yo'li o'zgarmagan (526 testda regressiya yo'q).

**2. Resurslar (`/api/v1`, hammasi v1 envelope + Zod):** `GET|PATCH /me`,
`GET /me/enrollments|payments|certificates|referral`, `GET /courses`,
`GET /courses/{slug}[ /lessons]`, `GET /lessons/{id}` (web player bilan bir xil
video/content + positionSec/completed), `POST /lessons/{id}/progress`,
`GET|POST /homework`, `POST|DELETE /push-devices`, `GET /app/config`
(min/latest versiya, flaglar, support, chat, deep-linklar, deprecation matni).
Chat/analytics v1 endpointlari W7/W8A'da merge qilinmagan — bu to'lqinda ular
yo'q (`src/features/*/contracts.ts` umuman mavjud emas, izoh qoldirildi).

**3. OpenAPI 3.1:** `@asteasolutions/zod-to-openapi@7.3.0` (zod 3 mos;
v9 zod 4 talab qilgani uchun maxsus 7.x tanlandi) — `GET /api/v1/openapi.json`
(23 path, 26 nomli schema, error envelope, bearer+cookie sxemalar, taglar),
`/api/v1/docs` — Scalar CDN, noindex. Har route moduli `registerV1Route()`
chaqiradi; `openapi-completeness` vitest ro'yxatdan o'tmagan route'da yiqiladi.

**4. Plumbing:** `.well-known` route'lar env'dan generatsiya (`IOS_TEAM_ID`,
`IOS_BUNDLE_ID`, `ANDROID_PACKAGE`, `ANDROID_SHA256`), `application/json`,
env'siz bo'sh-xavfsiz. (Dastlabki `public/` fayllar app route bilan konflikt
berib 500 qaytardi — olib tashlandi, faqat dinamik route qoldi.)
Public GET'larda `ETag` + `Cache-Control`, `Accept-Language` uz|ru|en
(kontent hozircha o'zbekcha), har v1 javobda `X-Request-Id` + `X-Api-Version`,
`Sunset`/`sunset()` mexanizmi + siyosat matni config va qo'llanmada.

**5. Qo'llanma:** `docs/MOBILE_API.md` — auth diagrammalar (matn), Keychain/Keystore,
refresh strategiya, push, deep link, xatolar, sahifalash, offline, har endpointga curl.

## Testlar (yangi: 5 fayl, 24 test; jami 73 fayl / 526 test — yashil)

- `gate-bearer`: cookie ishlaydi; bearer ishlaydi; soxta/muddati o'tgan/sessiyasiz → 401; CSRF faqat bearer'da skip.
- `refresh-rotation`: rotatsiya zanjiri; reuse → oila revoke; noma'lum/muddati o'tgan → 401.
- `access-token`: sign/verify, EXPIRED (qo'lda imzolangan), BAD_SIGNATURE, Bearer parse.
- `openapi-completeness`: har `route.ts` handler ro'yxatda + o'zi ro'yxatdan o'tgan.
- `well-known`: env'siz bo'sh, env bilan team-scoped.
- Jonli smoke (port 3308): config/openapi/docs/well-known 200, `/me` 401,
  token 401 Uzbek xabar (DB ulanadi), `X-Request-Id/ETag/Cache-Control` tekshirildi.
- `npx tsc --noEmit` ✅ · `npx vitest run` ✅ · `locked.sh npm run build` ✅ (25 v1 + 2 well-known route).

## Owner sozlashi shart bo'lgan env

| Var | Maqsad |
|---|---|
| `API_JWT_SECRET` | Access JWT imzo (bo'lmasa `SESSION_SECRET` ishlatiladi; prod'da shart) |
| `IOS_TEAM_ID`, `IOS_BUNDLE_ID` | Apple Universal Links |
| `ANDROID_PACKAGE`, `ANDROID_SHA256` | Android App Links |
| `MIN_APP_VERSION_IOS/ANDROID`, `LATEST_APP_VERSION_IOS/ANDROID` | Majburiy yangilash mantig'i (default `1.0.0`) |
| `SUPPORT_EMAIL`, `SUPPORT_PHONE` | app/config yordam kontaktlari |
| `CHAT_ENABLED=false` | chatni o'chirish (default yoqilgan) |

Mavjud `SESSION_SECRET`/`NEXTAUTH_SECRET`, `DATABASE_URL`, Telegram, Payme/Click o'zgarishsiz.

## Qolgan / risklar

- Migratsiya apply qilinmagan (qoida bo'yicha taqiqlangan) — orchestrator merge'da bajarsin.
- Push yuborish (Expo/FCM/APNs sender) bu to'lqinda yo'q — faqat token ro'yxati; yuborish keyingi to'lqin ishi.
- Kontent lokalizatsiyasi (ru/en) — hozircha faqat `Content-Language` passthrough.
- Qo'shilgan dependency: `@asteasolutions/zod-to-openapi@7.3.0` (kichik, faqat OpenAPI generatsiya uchun).
