# 03 — Dars va ustoz sifatini doimiy nazorat qilish

## Maqsad
Menejer va superadmin ustoz/dars sifatini **raqamlarda, diagrammada va aniq g'oyalar bilan** ko'radi;
ustoz o'z ko'rsatkichlarini ko'rib o'zi yaxshilanadi. Jazo vositasi emas — o'sish vositasi.

## 1. Metrikalar (manba ko'rsatilgan)
**O'quvchi tomonidan (natija):**
| Metrika | Manba | Yaxshi |
| :--- | :--- | :--- |
| Dars ko'rilish foizi | heartbeat (01 §3) | ≥ 70% |
| Tashlab ketish nuqtalari | `video_watch_events` → qaysi daqiqada ketishadi | keskin cho'qqi yo'q |
| Qayta ko'rish cho'qqilari | bir joy ko'p qayta ko'rilsa → tushunarsiz joy | kam |
| Dars bahosi 1–5 + sabab | dars oxirida 1 savol | ≥ 4.3 |
| Uyga vazifa o'tish ulushi | `homework_reviews` | ≥ 75% |
| Kursni tugatish | `lesson_progress` | kogorta bo'yicha trend |
| Modul NPS | har modul oxirida | ≥ 40 |
| Qaytarish (refund) | payments | guruh bo'yicha |

**Ustoz tomonidan (jarayon):**
| Metrika | Manba | Maqsad (SLA) |
| :--- | :--- | :--- |
| Savolga birinchi javob vaqti | `lesson_comments` | < 24 soat |
| Vazifani tekshirish vaqti | `homework_reviews` | < 48 soat |
| Jonli dars o'z vaqtida boshlandi | live start vs jadval | ≤ 5 daq kechikish |
| Yozuv darsga biriktirildi | `media_assets` | efirdan keyin ≤ 2 soat |
| Fikr sifati | vazifa izohi uzunligi/aniqligi (AI yordamchi baho) | — |

## 2. AI yordamidagi dars tahlili (yordamchi, hakam emas)
- Jonli/yozilgan dars transkripti → rubrika: tuzilma, aniqlik, misollar, sur'at, faollik, xatolar.
- Natija: 3 ta kuchli tomon + 3 ta aniq taklif ("12:40–15:10 da misol yo'q, tashlab ketish 18%").
- **Adolat qoidalari:** kichik namunada (n < 20 baho) reyting ko'rsatilmaydi; ustozlar faqat bir xil kurs/darajada
  solishtiriladi; AI bahosi menejer tasdig'isiz qarorga asos bo'lmaydi; ustoz o'z hisobotini ko'radi va izoh yoza oladi.
- Transkript shaxsiy ma'lumot: faqat `quality:read` ruxsatli rollar; saqlash muddati 12 oy.

## 3. Ko'rinish
- **Web:** `/admin/sifat` — ustozlar jadvali (trend strelkasi bilan), dars issiqlik xaritasi (qaysi darslar zaif),
  tashlab ketish grafigi, SLA buzilishlari. Ustoz o'zi: `/kabinet/ustoz/sifat`.
- **MCP:** `mentor_quality`, `lesson_quality`, `quality_trends`, `at_risk_students` → diagramma + g'oyalar (02).
- **Telegram:** har dushanba menejer va superadminga haftalik xulosa; ustozga o'z xulosasi.
- **Ogohlantirish (darhol):** dars bahosi 3 darsda ketma-ket < 3.5; SLA buzilishi; guruhda 3 kun kirmaganlar > 20%.

## 4. G'oyalar bazasi ("nima qilish kerak")
Har ogohlantirish bilan tavsiya: past ko'rilish → darsni 10 daqiqalik bo'laklarga bo'lish; qayta ko'rish cho'qqisi →
o'sha joyga qo'shimcha misol/matn; vazifa o'tish past → oldingi darsda mashq qo'shish. Tavsiyalar `quality_playbook`
jadvalida, menejer qo'shib boradi; qaysi tavsiya natija berganini keyingi kogortada o'lchaymiz.

## 5. Qabul mezonlari
Metrikalar jonli DB'da hisoblanadi (SQL L2); n kichik bo'lsa halol "ma'lumot yetarli emas"; ustoz boshqa ustoz
tafsilotini ko'rmaydi; haftalik xabar sinov guruhiga yuborildi; diagrammalar light/dark va 390/1440 da tekshirildi.
