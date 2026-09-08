# WEBSITE_AUDIT_SPEC.md — Tekshirilgan Holat va Ideal Vebsayt Talablari

> ⚠️ **MUHIM QOIDA:** Bu faylda "bartaraf etildi" deb yozilgan har bir band **kodda tekshirilgan** bo'lishi shart.
> Audit log'da da'vo qilingan, lekin kodda tasdiqlanmagan bandlar ❌ belgisi bilan qoldiriladi va tuzatilmaguncha
> ✅ ga o'tkazilmaydi. So'nggi to'liq tekshiruv: **2026-09-08**.

---

## 1-QISM. AUDIT BANDESLARINING TEKSHIRILGAN HOLATI

### A) Header va Navigatsiya (P0)
| Band | Holat | Tekshiruv natijasi |
| :--- | :--- | :--- |
| Profil tugmasiga `max-w` + `shrink-0` | ✅ Bajarilgan | Profil tugmasi endi faqat initsiallar ko'rsatadigan `w-10 h-10` doira — ism to'lib ketmaydi |
| Navigatsiya 5 ta dropdown guruhga birlashtirilishi | ✅ Bajarilgan | Kurslar, Bepul dars, Meetlar, Resurslar, Ekspertlar (desktop `lg:flex`) |
| Brending `> vibecoding` stili | ✅ Bajarilgan | Header + Footer'da `>` monogram + `vibe coding` |
| Mobil menyu sub-guruhlari | ✅ Bajarilgan | Kurslar, Asosiy, Resurslar guruhlari mobil drawer'da |
| **Dropdown menyular `overflow-hidden` tufayli kesilishi** | ✅ **YANGI TUZATILDI (2026-09-08)** | Header ichki konteyneridagi `overflow-hidden` dropdown panellarni header balandligida kesib qo'yardi — olib tashlandi |
| **Planshet (768–1024px) navigatsiya teshigi** | ✅ **YANGI TUZATILDI (2026-09-08)** | Hamburger `md:hidden`, navigatsiya `hidden lg:flex` bo'lgani uchun planshetda menyu umuman yo'q edi — hamburger va drawer endi `lg:hidden` (desktop `lg` gacha drawer ishlaydi) |

### B) Admin Panel Dual-Rendering (P0)
| Band | Holat | Tekshiruv natijasi |
| :--- | :--- | :--- |
| `/admin` bo'limida ommaviy Header yashirilishi | ✅ Bajarilgan | `Header.tsx` va `Footer.tsx` da `pathname?.startsWith("/admin")` guard bor |
| AdminNav to'qnashuvi | ✅ Bajarilgan | `admin/layout.tsx` faqat `AdminNav` render qiladi |

### C) Admin Login Demo Yozuvi (P1)
| Band | Holat | Tekshiruv natijasi |
| :--- | :--- | :--- |
| "Superadmin ma'lumotlarini to'ldirish" demo funksiyasi | ✅ Bajarilgan | Faylda demo fill funksiyasi yo'q, faqat `placeholder` qolgan |

### D) Vercel Branch Sinxronizatsiyasi
| Band | Holat | Tekshiruv natijasi |
| :--- | :--- | :--- |
| `main` ↔ `master` sinxron | ✅ Bajarilgan | Ikkala branch bir xil commit'da (0 commit farq) |

### E) Audit log'da da'vo qilingan, aslida bajarilmagan tuzatishlar
| Band | Holat | Tekshiruv natijasi |
| :--- | :--- | :--- |
| "Production build 0 errors" | ❌ **Noto'g'ri da'vo edi** | `src/app/ref/[code]/route.ts` build buzgan (Next.js 15'da `params` Promise bo'lishi shart) — 2026-09-08 da tuzatildi |
| "Hardcoded hex ranglar almashtirildi" | ❌ **Qisman edi** | 63 ta hardcoded class qolgan edi: 51× `#27C93F`, 5× `#24A1DE` va boshqalar — 2026-09-08 da tokenlarga o'tkazildi (quyida 2-qism) |
| Kodbaza "CLEAN" | ❌ **Noto'g'ri da'vo edi** | Supabase DB paroli `src/db/index.ts` ga hardcode qilingan va GitHub'da ochiq — 2026-09-08 da olib tashlanib `.env` (gitignored) ga ko'chirildi |

---

## 2-QISM. 2026-09-08 DA QO'LLANGAN TUZATISHLAR (TEKSHIRILGAN)

1. **`src/app/ref/[code]/route.ts`** — Next.js 15 App Router uchun `params: Promise<{ code: string }>` + `await params`.
2. **`src/components/layout/Header.tsx`**:
   - Ichki konteynerdan `overflow-hidden` olib tashlandi (dropdown panellar kesilmasligi uchun).
   - Hamburger tugma va mobil drawer `md:hidden` → `lg:hidden` (planshet navigatsiya teshigi yopildi).
3. **Hardcoded hex → Theme tokenlar** (17 fayl, 63 class):
   - `text-[#27C93F]` → `text-success` (34)
   - `bg-[#27C93F]/15` → `bg-success-soft` (17)
   - `border-[#27C93F]/30` → `border-success-line` (7)
   - `text-[#24A1DE]` → `text-telegram` (4), `bg-[#24A1DE]/15` → `bg-telegram-soft` (1), `bg-[#27C93F]` → `bg-success` (1)
   - Yangi tokenlar: `--color-success-line`, `--color-telegram`, `--color-telegram-soft` (3 ta theme'da ham: light, dark, likely) + `tailwind.config.js`
4. **`src/db/index.ts`** — hardcoded Supabase connection string olib tashlandi; `DATABASE_URL` majburiy env var bo'ldi. Parol gitignored `.env` faylda.
5. **`vitest.config.ts`** — `loadEnv` orqali `.env` testlarga yuklanadigan bo'ldi (parol olib tashlangach `hardening.test.ts` yiqilgan edi).

**Verifikatsiya:** `npm run build` ✅ | `npx vitest run` → 135/135 ✅ | DB ulanishi (Supabase) ✅

---

## 3-QISM. TOKENIZATSIYA ISTISNOLARI (ATAYLAB QOLDIRILGAN)

Quyidagi hardcoded ranglar **tashqi UI ko'rinishini aniq takrorlash** uchun qoldirildi — tokenlarga o'tkazilsa ma'no yo'qoladi:

| Joy | Sabab |
| :--- | :--- |
| `src/features/crm/components/NotificationManager.tsx` (`#0e1621`, `#182533`, `gray-*`) | Telegram chat preview — Telegram'ning haqiqiy dark tema ranglari |
| `src/app/blog/[slug]/page.tsx` (`#1E1E1E`) | Kod bloki — terminal/VS Code ko'rinishi |
| `src/lib/email/resend.ts` (barcha hex'lar) | Email HTML template — Tailwind tokenlari ishlamaydi, inline CSS shart |

---

## 4-QISM. KELGUSIDAGI IDEAL VEBSAYT TALABLARI (BARCHA AI AGENTLAR UCHUN MAJBURIY)

### 1. Theme Tokens Only
- Saytdagi barcha ranglar faqat Tailwind CSS variables tokenlari orqali: `bg-cream`, `text-ink`, `bg-accent`, `border-border`, `text-success`, `text-telegram` va h.k.
- Hardcoded hex/RGB class'lar (`bg-[#...]`, `text-[#...]`) — **taqiqlangan**. 3-QISM'dagi istisnolar bundan mustasno.
- Tailwind palette ranglari (`slate-*`, `gray-*`, `zinc-*`) — **taqiqlangan** (Telegram preview istisnosi bundan tashqari).
- Yangi semantik rang kerak bo'lsa: avval `globals.css` ga `--color-*` var qo'sh (3 ta theme'da ham!), keyin `tailwind.config.js` ga map qil.

### 2. Parallel Breakpoints & Responsive
Har bir UI o'zgarishi quyidagi 4 oralig'da parallel tekshirilishi SHART:
- Mobil: `< 768px`
- Planshet: `768px – 1024px`
- Noutbuk: `1024px – 1440px`
- Desktop: `1440px+`

Diqqat: desktop nav `lg:flex` (≥1024px), drawer `lg:hidden` (<1024px) — bu ikkisi bir-birini to'ldiradi, breakpoint'larni o'zgartirsang ikkala class'ni birga yangila.

### 3. Security & Billing Idempotency
- Payme/Click webhooklar: takroriy to'lov himoyasi (`withTransactionLock`) va MD5/auth tekshiruvi buzilmasligi shart.
- Eskiz SMS OTP: rate-limiting va backoff mexanizmi saqlanishi shart.
- `withRetry` / `withTransactionLock` (`src/db/index.ts`) funksiyalarining imzolarini o'zgartirmasdan ishlat.

### 4. Strict Zod & TypeScript
- `any` — taqiqlangan. Barcha API/Server Action kiritmalari `src/lib/validations/` dagi Zod sxemalari orqali tekshiriladi.
- Yangi sxema kerak bo'lsa `src/lib/validations/` ga qo'sh va `z.infer<typeof Schema>` bilan tip ol.

### 5. Edge Runtime Compatibility
- `runtime = 'edge'` routelarda faqat Web API'lar (`fetch`, `Request`, `Response`, Web Crypto). Node.js kutubxonalari (`fs`, `net`, `crypto`) taqiqlangan.

### 6. Next.js 15 App Router konventsiyalari
- Dinamik route'larda `params` — doim `Promise`: `{ params: Promise<{ id: string }> }` + `await params`.

---

## 5-QISM. OCHIQ MUAMMOLAR (HALI HAL QILINMAGAN)

| # | Muammo | Ustuvorlik | Izoh |
| :--- | :--- | :--- | :--- |
| 1 | **Supabase DB paroli git tarixida qolgan** (eski commit'larda `src/db/index.ts` ichida ko'rinadi) | 🔴 P0 | Kod toza, lekin tarix ochiq. Supabase Dashboard → Database → parolni ROTATE qilish va Vercel env var'ini yangilash kerak. CLI boshqa Supabase accauntga ulangani uchun avtomatlashtirib bo'lmadi (app DB ref: `gvfzomtdswzlxstjvwiv`). |
| 2 | AI hujjatlaridagi o'lik yo'llar (CLAUDE.md, AGENTS.md, docs/context) | ✅ **HAL QILINDI (2026-09-09)** | 16 ta `file:///home/mirzo/orca/...` yo'li relative path'larga o'tkazildi |
| 3 | Vercel'da bo'sh `vibecoding-uz` duplikat loyiha (noto'g'ri linklanish manbasi) | ✅ **HAL QILINDI (2026-09-09)** | O'chirildi. Kanonik loyiha: `master-2`. Hujjatlarga "link faqat master-2" qoidasi yozildi |
| 4 | `DATABASE_URL` Vercel'da faqat Production'da bor edi (preview build yiqilar edi) | ✅ **HAL QILINDI (2026-09-09)** | Uchala muhitga qo'yildi va Config tipiga o'tkazildi — `vercel env pull .env` istalgan mashinada ishlaydi |
| 5 | AI agentlar uchun deploy/env hujjatlari yo'q edi | ✅ **HAL QILINDI (2026-09-09)** | AGENTS.md → "Deployment & Environment" bo'limi + CLAUDE.md, .cursorrules, AGENT_CONTEXT.md ko'rsatmalari |

---

*So'nggi yangilash: 2026-09-09 — AI-agent-friendly deploy/env yechimi. Verifikatsiya: build ✅, 135/135 test ✅, `vercel env pull` ✅.*
