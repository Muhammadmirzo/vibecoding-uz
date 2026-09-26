# 04 — Domen va subdomenlar: qachon, nega, qanday

## 1. Ajratish mantig'i (katta kompaniyalar nimaga subdomen qiladi)
`mail.google.com`, `payments.google.com` — bu **alohida mahsulot, alohida jamoa, alohida xavfsizlik chegarasi**.
Subdomen sahifa uchun emas. Ajratish faqat quyidagi 5 sababdan kamida bittasi bo'lsa:
1. **Auditoriya boshqa** (mehmon vs tizimga kirgan o'quvchi vs xodim).
2. **Xavfsizlik chegarasi** (admin cookie'si o'quvchi sahifasidagi xatodan himoyalanishi kerak; qat'iy CSP, 2FA).
3. **Mijoz manzilni abadiy yodlab oladi** (mobil ilova, MCP, hamkorlar — manzil o'zgarmasligi kerak).
4. **Infratuzilma boshqa** (video CDN, status sahifasi boshqa provayderda turadi).
5. **Mustaqil deploy / masshtab** (bir qism boshqasini to'xtatmasdan yangilanadi).

**Subdomen QILINMAYDIGAN holatlar:** SEO kontenti (blog, kurslar, maqolalar) — yo'l (`/blog`) bo'lib qoladi,
chunki subdomen asosiy domen obro'sini bo'ladi. Faqat "chiroyli ko'rinsin" uchun — yo'q.

## 2. Ideal xarita (`naqsh.uz` misolida; domen egasi tasdiqlaydi)
| Manzil | Nima | Sabab | Trigger (qachon ajratiladi) |
| :--- | :--- | :--- | :--- |
| `naqsh.uz` | marketing, kurslar, blog, sertifikat tekshiruvi | SEO | hozir (asosiy) |
| `www.naqsh.uz` | → 301 `naqsh.uz` | bitta kanonik | domen ulanganda |
| `app.naqsh.uz` | o'quvchi kabineti, darslar | 1, 5 | kabinet cache/deploy marketingdan farq qilganda yoki ≥ 1000 faol o'quvchi |
| `admin.naqsh.uz` | xodimlar paneli (superadmin, buxgalter, menejer, ustoz) | 2 | **birinchi begona xodim yoki moliya ma'lumoti paydo bo'lganda** (tavsiya: erta) |
| `api.naqsh.uz` | `/v1` mobil, desktop, hamkorlar | 3 | **birinchi mobil ilova store'ga chiqishidan OLDIN** (keyin o'zgartirib bo'lmaydi) |
| `mcp.naqsh.uz` | MCP + OAuth | 3 | MCP'ni AI kataloglariga chiqarishdan oldin; OAuth issuer o'zgarmasligi kerak |
| `id.naqsh.uz` | yagona kirish (SSO) | 2, 3 | `app.` yoki `admin.` ajralganda |
| `media.naqsh.uz` | video/fayl CDN (provayderga CNAME) | 4 | stream provayder ulanganda (R5) |
| `status.naqsh.uz` | ishlash holati sahifasi | 4 | uptime monitor ulanganda |
| `docs.naqsh.uz` | API/MCP hujjatlari hamkorlar uchun | 1 | birinchi tashqi dasturchi/hamkor |
| `send.naqsh.uz` | tranzaksion email yuboruvchi (SPF/DKIM/DMARC) | 4 | birinchi email yuborilishidan oldin |
| `<kompaniya>.naqsh.uz` | B2B mijoz filiali (`org_id`) | 1 | birinchi B2B mijoz o'z brendini so'raganda |
Kerak emas: `pay.` (to'lov webhook'lari `api.` ichida), `blog.`, `mail.` (pochta = Google Workspace/Zoho MX yozuvi).

## 3. Hozirdan tayyorgarlik (arzon, R0 da)
1. **`siteConfig.urls`** — barcha hostlar bitta joyda (`site`, `app`, `admin`, `api`, `mcp`, `media`), hammasi env'dan;
   hozir hammasi bitta hostga teng. 13 fayldagi qattiq yozilgan URL'lar shunga o'tkaziladi; `lessons:check` yangi
   qattiq URL'ni to'xtatadi.
2. **Host-routing middleware** — bitta Next ilova host bo'yicha yo'naltiradi (`admin.` → `/admin/*`). Ajratish =
   DNS + env, kod qayta yozilmaydi. Keyin kerak bo'lsa alohida deploy'ga chiqariladi.
3. **Cookie qoidasi** — sessiya cookie'si host'ga bog'liq (`Domain` yo'q); faqat SSO kelganda `id.` orqali.
   Admin cookie alohida nom, qisqa muddat, 2FA.
4. **CORS allowlist** env'dan; CSP har host uchun alohida.
5. **301 xaritasi** — eski yo'llar (`/admin/*` → `admin.`) avtomatik yo'naltiriladi, SEO va havolalar yo'qolmaydi.
6. **Mobil/MCP** — hozirdan `api`/`mcp` hostini `siteConfig.urls` dan oladi; store'dan oldin `api.` ga o'tiladi.

## 4. Domenni sotib olish va egalik (egasi uchun)
Domen, DNS (Cloudflare tavsiya), Vercel, Supabase, store akkauntlari — **egasining nomida**, 2FA bilan, tiklash
kodlari xavfsiz joyda. Pudratchi nomida bo'lsa loyiha yo'qolishi mumkin.

## 5. Trigger bo'lganda nima bo'ladi
Orkestrator har sessiya boshida va `platform_advice` (06) oyiga bir marta triggerlarni tekshiradi. Trigger yetganda
egasiga bitta Telegram/chat xabar: **"`admin.naqsh.uz` ga ajratish vaqti keldi — sabab: 2 ta yangi xodim qo'shildi;
narx: 0 so'm; siz qiladigan ish: yo'q (DNS agent qiladi) / DNS'ga 1 yozuv qo'shish"**. Egasi "ha" desa agent bajaradi.
