# REDESIGN_ROADMAP.md — "AI-made"dan "World-class hand-crafted"ga yo'l xaritasi

> Tuzilgan: 2026-09-09. Manba: ZAHAR-RESEARCHER (kodbaza audit, fayl:qator isbotlar bilan),
> ZAHAR-STRATEGY (mahsulot strategiyasi), ZAHAR-ORKESTRATOR (jonli sayt vizual tekshiruvi).
> Maqsad: sayt inson qo'li tekkan darajada ko'rinsin — lekin tezlik va user-friendliness pasaymasin.

---

## 1. TASHXIS: sayt nega "AI yasalgan" ko'rinadi (4 ildiz sabab)

### A) Soxta kontent — eng xavflisi (foydalanuvchi ishonchni bir zumda yo'qotadi)
- Video testimoniallarning barchasi bitta Rickroll havolasi: `src/features/testimonials/testimonialsData.ts:14,32,80` (`dQw4w9WgXcQ`), seed darslari ham xuddi shu (`src/db/seed.ts:207,234,251`, 217-da hatto xato nusxa).
- 8 ta avatar — Unsplash stok portretlar (`testimonialsData.ts:10-124`), real odam yo'q.
- Manbasiz va o'zaro zid raqamlar: hero "1 000+ o'quvchi" (`ProofStats.tsx:11`), testimoniallar sahifasi "250+ bitiruvchi, 4.95 baho" (`testimoniyalar/page.tsx:110-130`), ekspertlar "9.8/10" (`ekspertlar/page.tsx:11-28`).
- Ekspertlar sahifasidagi "Sertifikatni ko'rish" tugmasi onClick'siz — o'lik (`ekspertlar/page.tsx:90`).
- ProofStats'da "portfelni ko'rish / hoziroq oching" matnlari — hech qanday havola yo'q (`ProofStats.tsx:9-11`).

### B) Konversiya yo'lidagi yolg'on va'dalar
- Bepul dars: katta play tugmasi kliklanmaydi (`FreeLessonForm.tsx:49-56`), forma yuborilgach video OCHILMAYDI — "havola yuborildi" deyiladi (`:68`).
- Quiz: tarmoq xatosi `catch {}` bilan yutib yuboriladi, baribir "muvaffaqiyat" ko'rsatiladi (`DiagnosticQuiz.tsx:129-133`) — lead yo'qoladi.
- Kurs sahifasidagi "Joyni band qilish" to'g'ridan-to'g'ri Telegram'ga — on-site checkout yo'q, lekin "Click va Payme orqali xavfsiz to'lov" da'vo qilingan (`kurs/[slug]/page.tsx:160,175`).

### C) Shablonli monotillik (AI imzosining vizual ko'rinishi)
- Har sahifada bir xil pattern: badge-pill → H2 → muted paragraph → checkmark ro'yxati → bir xil CTA juftligi. 6+ sahifada bir xil (`HeroSection.tsx:16`, `CourseCards.tsx:14-22`, `bepul-dars:19-25`, `ekspertlar:43-48`, `testimoniyalar:50-57`).
- Barcha kartalar bir xil `rounded-xl + shadow-lg`, bir xil krem fon, vizual "hovli"/ritm yo'q — `public/images/`da jami 3 ta rasm.
- Aralash til sarlavhalari: "Exclusive Bepul Video Dars", "Verified Bitiruvchilar Reyestri", "Dashboard".

### D) Hardcoded ma'lumot (AI qoldirgan iz)
- "Keyingi guruh: 15-Oktyabr" kodga bog'langan, ikkala kursda bir xil (`kurs/[slug]/page.tsx:99`).
- Kurs ma'lumotlari `COURSES_DATA` obyektida, DB emas (`:10-57`); manbasiz eski narx/chegirma (`:134-136`).
- Landing juda qisqa: hero → 2 kurs kartasi → footer (vizual tekshiruv). Isbot/dastur/FAQ asosiy sahifada yo'q.

---

## 2. YO'L XARITASI

### P0 — Ishonch va konversiyani tiklash (1-2 kunlik ish, katta impact)
| # | Ish | Joy | Effort |
| :--- | :--- | :--- | :--- |
| 1 | Rickroll videoURL'lar: real video qo'yish yoki video badge'larini olib tashlash | testimonialsData.ts, seed.ts | S |
| 2 | Bepul dars: forma yuborilgach video HAQIQIY ochilsin (embed) yoki Telegram deep-link; "yuborildi" yolg'onini olib tashlash | FreeLessonForm.tsx | S |
| 3 | O'lik tugmalar: ProofStats havolalari, ekspertlar sertifikat tugmasi — ishlating yoki olib tashlang | ProofStats.tsx, ekspertlar/page.tsx | S |
| 4 | Quiz xato holati: `res.ok` tekshirilsin, xato bo'lsa foydalanuvchiga ko'rinsin + retry | DiagnosticQuiz.tsx | S |
| 5 | Raqamlarni bitta haqiqatga keltirish: 1000+ vs 250+ ziddiyati; manbasiz raqamlarni olib tashlash yoki [ISBOT KERAK] deb belgilash | 6+ fayl | S |
| 6 | Unsplash avatarlar → real foto yoki initials-avatar | testimonialsData.ts | M |
| 7 | "15-Oktyabr" va narx/chegirma → markaziy config (keyinroq admin panelga) | kurs/[slug]/page.tsx | S |
| 8 | Landing'ga isbot strip: 1 real natija, 1 real video, 1 real raqam (manba bilan) | page.tsx | M |

### P1 — World-class feel (1-2 hafta)
| # | Ish | Nega ishlaydi | Effort |
| :--- | :--- | :--- | :--- |
| 9 | Vizual ritm: kamida 2 section boshqa tilda (dark banner, katta foto blok, video blok) | monotonlik — AI imzosi | M |
| 10 | Mentor yuzi + 60s intro video (poster-frame, lazy embed) | cohort ta'limda ishonch shaxsdan keladi | M |
| 11 | Talaba loyihalari galereyasi — live URL'lar bilan | "bu kursdan chiqqan" eng kuchli isbot, raqobatchilarda yo'q | M |
| 12 | Outcome-sillabus: "1-modul: X" emas, "1-hafta oxirida tayyor bo'ladigan artefakt: [konkret]" | natijaga sotish imkoniyatga sotishdan 3x kuchli | S |
| 13 | Microcopy rewrite: har tugma kontekstli ("Batafsil" → "Sillani oching"), o'zbekcha personality, aralash til toza | ton = brend | S |
| 14 | Cohort energetikasi: "7 joy qoldi" + countdown (statik deadline JSON, client interval) | jonlilik + shoshilinchlik | S |
| 15 | "Bu kurs KIM UCHUN EMAS" bo'limi | samimiyat signali + noto'g'ri lead filtri | S |
| 16 | Narh shaffofligi: nima kiradi, nega bu narx, bo'lib to'lash breakdown | O'zbekistonda to'lov qo'rquvi = asosiy to'siq | S |
| 17 | FAQ (to'lov, sertifikat, daraja, vaqt) | qaror qabul qilishdagi oxirgi e'tirozlar | S |
| 18 | Payme/Click logotiplari bilan ishonch stripe'i | lokal to'lov ko'rinishi = "bu bizga mos" signali | S |
| 19 | Quizni 9→5 savolga qisqartirish yoki natijani formadan OLDIN ko'rsatish | drop-off kamayishi | M |

### P2 — Polirovka (davom etuvchi)
BTS kontent (darsdan klip, kurator kundaligi), alumni Telegram kanali embed'lari, o'zbekcha 404 ("Bu sahifa hali yasalmagan — bizga topshiriq bering"), kurator voice-note feedback, animatsiya polirovkasi (faqat CSS transform/opacity, prefers-reduced-motion, LCP'dan keyin).

### Performance qoidalari (har ishda majburiy)
Video: poster-frame + lazy embed, klip <5MB. Rasm: next/image + width/height (layout shift yo'q). Countdown: statik deadline + client interval, har pageview'da fetch yo'q. Animatsiya: Framer Motion `viewport: { once: true }`. 3D/canvas/parallax — QILMASLIK kerak, bu saytda kerak emas.

---

## 3. ZAHAR'GA YAXSHIROQ SO'ROV BERISH PATTERNLARI (foydalanuvchi uchun)

1. Persona + cheklov + o'lchanadigan kriteriya: "Bu hero copy'ni qayta yoz. Persona: 25-40 yosh tadbirkor, Telegram'dan keldi. 3 variant, har biri 8 so'zdan oshmasin. Kriteriya: 5 soniyada 'bu menga' degan xulosa."
2. Referens + "nega" tahlili: "vibecoding.uz hero'sini tahlil qil: nima yaxshi, nima AI-made ko'rinadi, biz qanday farqlanamiz — keyin biznikini yoz."
3. Scope cheklovi: "Faqat src/app/kurs/[slug]/page.tsx ni o'zgartir, boshqa faylga tegma, oxirida o'zgarishlar ro'yxatini ber."
4. Self-review majburiy: "Bu copy'ni 3 persona ko'zi bilan o'qit: tadbirkor, student, dizayner. Qaysi so'z notanish?"
5. Variant + tanlov + sabab: "Har tugma uchun 5 variant microcopy, eng yaxshisini sababi bilan tanla."
6. Performance cheklovi oldindan: "Animatsiya qo'sh, lekin faqat CSS, prefers-reduced-motion, LCP'dan keyin."
7. Anti-hallucination: "Saytdagi har raqam/da'vo uchun manba so'ra; isbotsiz bo'lsa [ISBOT KERAK] belgisi qoldir."
8. Outcome framing: "Sillabusni outcome-formatga o'tkaz: har hafta yakunida real artefakt."
9. Critic persona: "Bu saytni shubhali foydalanuvchi sifatida review qil: 'AI yasagan' belgilar ro'yxatini chiqar."
10. Incremental nazorat: "Katta vazifa: avval 5 qatorli reja + tegiladigan fayllar ro'yxati, men tasdiqlagach kod."

---
*Manbalar: RESEARCHER hisoboti (21 topilma, fayl:qator bilan), STRATEGY hisoboti (12 kriteriya, 12 g'oya, 10 prompt), Orkestrator vizual tekshiruvi (landing qisqaligi, karta monotilligi). Verifikatsiya: hujjat o'zgarishi — kod tegmagan.*
