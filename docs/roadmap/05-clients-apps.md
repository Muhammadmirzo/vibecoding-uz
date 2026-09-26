# 05 — Mijozlar: web, mobil, desktop, Telegram, MCP — bitta backend

## 1. Arxitektura
```
          ┌────────── src/features/* (domen + servislar + can()) ──────────┐
          │  bitta haqiqat manbai: biznes qoidalari, ruxsat, audit        │
          └───┬───────────┬──────────────┬──────────────┬─────────────────┘
        Web (Next)   /api/v1 (REST)   MCP (AI)    Telegram bot/Mini App
                        │
            Mobil (Expo)  Desktop (PWA→Tauri)  Hamkorlar
```
- Kontraktlar: Zod → OpenAPI 3.1 (`/api/v1/openapi.json` bor) → mobil/desktop uchun TypeScript tiplar avtomatik.
- `docs/features.json` + parity testi: har funksiya web + v1 + MCP (yoki `n/a` + sabab). Test yiqilsa merge yo'q.
- Monorepo (trigger: mobil ilova boshlanganda): `apps/web`, `apps/mobile`, `apps/desktop`, `packages/contracts`,
  `packages/ui-tokens` (dizayn tokenlari web va mobilda bir xil).

## 2. Mobil ilova (Expo / React Native, iOS + Android bitta kod)
- Kirish: telefon + OTP, Telegram; tokenlar Keychain/Keystore'da (MOBILE_API.md mavjud).
- Darslar: stream (imzolangan HLS) native pleyerda, YouTube WebView'da; suv belgisi; progress/heartbeat.
- **Internetsiz ko'rish** (O'zbekistonda mobil internet qimmat): shifrlangan yuklab olish, 30 kunlik litsenziya,
  faqat stream provayder darslari uchun (YouTube'ni qoidaga ko'ra yuklab bo'lmaydi).
- Uyga vazifa: kamera/fayl, ovozli izoh; savol-javob; push (`/api/v1/push-devices` bor).
- **To'lov:** Apple/Google raqamli kontent uchun o'z to'lov tizimini talab qiladi. Tavsiya: ilovada sotib olish tugmasi
  yo'q, to'lov saytda (Payme/Click) — ilova "kabinet" vazifasini bajaradi. Store qoidalari chiqarishdan oldin qayta tekshiriladi.
- Versiya darvozasi: eski ilova → 426 `update_required` (RESUME §5.2). OTA yangilanish (EAS Update), bosqichma-bosqich
  chiqarish (10% → 100%), Sentry xatolar.
- Store akkauntlari egasi nomida (Apple Developer ~$99/yil, Google Play bir martalik ~$25 — chiqarishdan oldin tekshiriladi).

## 3. Desktop
- **1-bosqich: PWA** — saytni Windows/Mac/Linux'ga "o'rnatish", ikonka, push, oflayn sahifalar. Qo'shimcha kod deyarli yo'q.
- **2-bosqich: Tauri** (Electron'dan 10x yengil) faqat trigger bo'lsa: desktopda internetsiz video kerak bo'lsa,
  ustozlar uchun efir/ekran yozish vositasi kerak bo'lsa, yoki korporativ (B2B) mijoz o'rnatiladigan ilova so'rasa.
  Kod: `apps/web` ni o'raydi + native modullar; avtoyangilanish, kod imzolash sertifikati (egasi nomida).

## 4. Telegram
- Bot (bor): xabarlar, eslatmalar, ustozga savol xabari, haftalik hisobotlar.
- **Telegram Mini App** (tavsiya, O'zbekistonda juda qulay): kabinetning yengil versiyasi Telegram ichida — darslar
  ro'yxati, progress, vazifa holati, to'lov havolasi. `app.` kodidan qayta foydalanadi, Telegram `initData` imzosi
  server tomonda tekshiriladi.

## 5. MCP (AI mijozlar)
To'liq reja: [02-ai-mcp-roles.md](02-ai-mcp-roles.md). MCP — boshqa mijozlar kabi faqat adapter; o'z biznes mantig'i yo'q.

## 6. API hayot sikli (mijozlar buzilmasligi uchun)
- `/v1` kamida 12 oy qo'llab-quvvatlanadi; o'zgarish faqat qo'shish (maydon qo'shish mumkin, o'chirish/nom o'zgartirish yo'q).
- Buzuvchi o'zgarish → `/v2`; eski versiyada `Deprecation` + `Sunset` sarlavhalari va ilovada ogohlantirish.
- Har so'rovda `x-request-id`, ilova versiyasi, platforma → Sentry va loglarda bog'lanadi.

## 7. Bosqichlar
| Bosqich | Nima | Trigger/bog'liqlik |
| :--- | :--- | :--- |
| C0 | features.json + parity test; `siteConfig.urls` | hozir (R0) |
| C1 | PWA (manifest, ikonka, oflayn sahifa) | R0 dan keyin, arzon |
| C2 | Telegram Mini App | R2 dan keyin |
| C3 | `api.` subdomen + Expo ilova (ichki test: TestFlight / Internal testing) | R1–R2, domen |
| C4 | Store'ga chiqarish, OTA, bosqichma-bosqich | C3 + egasi akkauntlari |
| C5 | Tauri desktop | faqat §3 trigger |
