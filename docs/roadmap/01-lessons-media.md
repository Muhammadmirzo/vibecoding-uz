# 01 — Dars media: video, YouTube, stream, jonli efir, fayllar, savol-javob, audio

## Hozirgi holat (2026-09-26, kodda tekshirildi)
- `lessons`: `video_url` (YouTube yoki to'g'ridan MP4), `video_hls_url` (ishlatilmaydi), `content_md`, `materials_json`,
  drip (`none/after_lesson/date`), `lesson_progress.position_sec`. `src/features/lms/videoUtils.ts` YouTube'ni aniqlaydi.
- Uyga vazifa: `homework_assignments/submissions/reviews` bor. Fayl yuklash, izoh, audio, subtitr yo'q.

## Maqsad va o'lchov
O'quvchi darsni bir joyda ko'radi, savol beradi, 24 soatda javob oladi, kursni tugatadi.
O'lchov: dars ko'rilish foizi (heartbeat), savolga birinchi javob vaqti, kurs tugatish ulushi, dars bahosi.

## 1. Ma'lumot modeli (yangi jadvallar, timestamptz + org_id bilan)
- `media_assets`: id, org_id, kind (`video|audio|file|caption`), provider (`youtube|stream|storage|live`),
  provider_ref (YouTube ID / provider asset id / storage key), status (`uploading|processing|ready|failed`),
  duration_sec, size_bytes, mime, checksum, created_by, created_at, deleted_at.
- `lesson_media`: lesson_id, asset_id, role (`main|extra|material|audio_version|caption`), sort_order.
- `video_watch_events` (yig'ma): user_id, lesson_id, from_sec, to_sec, created_at — heartbeat 15 s da bir.
  Faqat yig'ma saqlanadi (har 15 s alohida qator emas → har seans oxirida segmentlar birlashtiriladi).
- `lessons.video_url` → expand/contract: avval `media_assets` ga ko'chiriladi, eski ustun bir reliz keyin o'chadi.

## 2. Video manbalari — har dars uchun tanlanadi
| Manba | Qachon | Qo'yish | Himoya (halol baho) |
| :--- | :--- | :--- | :--- |
| **YouTube** | tez qo'yish, bepul/preview darslar, arzon kurslar | admin havolani qo'yadi → oEmbed bilan nom/davomiylik avtomatik | o'rtacha: pastda |
| **Stream provayder** | pullik asosiy darslar | admin fayl yuklaydi (resumable, foiz ko'rinadi) | yuqori: pastda |
| **Jonli efir** | guruh darslari | §4 | yozuv avtomatik darsga |

**YouTube himoyasi — maksimal, lekin halol:** YouTube'da domen cheklovi yo'q, video ID sahifa kodida doim ko'rinadi,
shuning uchun "ko'chirib bo'lmaydi" deb va'da qilinmaydi. Qilinadigani:
- video "Ro'yxatda yo'q" (unlisted), `youtube-nocookie.com`, IFrame API, `rel=0`, o'z boshqaruv tugmalarimiz;
- sarlavha/logotip ustida shaffof qatlam (YouTube'ga o'tish tugmasi bosilmaydi), o'ng tugma menyusi o'chirilgan;
- ID faqat kursga yozilgan o'quvchiga, server orqali beriladi (sahifa HTML'ida ochiq turmaydi);
- **dinamik suv belgisi**: o'quvchi ID/telefon oxirgi 4 raqami, joyi vaqti-vaqti bilan o'zgaradi (sizib chiqsa kim ekanligi ma'lum);
- bir akkaunt bir vaqtda ≤ 2 qurilmada ko'radi (sessiyalar bo'yicha);
- admin panelda "YouTube → Stream'ga o'tkazish" tugmasi (R5 dan keyin): asl faylni yuklaydi, dars manbasi almashadi.

**Stream provayder** (`VideoProvider` interfeysi: `createUpload`, `getPlayback(signed, ttl)`, `delete`, `webhook`):
- HLS, internetga qarab 360p–1080p; imzolangan havola 1–4 soat; token foydalanuvchiga bog'langan; suv belgisi;
- nomzodlar: Bunny Stream, Cloudflare Stream, Mux — **narx va O'zbekistondan tezlik o'lchab** (R5 boshida jadval),
  keyin tanlanadi. Narxni taxmin bilan aytmaslik.
- xarajat to'sig'i: oylik trafik limiti, 80% da egasiga Telegram ogohlantirish.
- ekranni yozib olishni hech kim to'liq to'xtata olmaydi; himoya = qiyinlashtirish + kimligini aniqlash.

## 3. Pleyer (bitta komponent, barcha manbalar)
Tezlik 0.75–2x, davom ettirish (`position_sec`), bo'limlar (chapters), subtitr, klaviatura bilan boshqarish,
mobil uchun yengil rejim. Heartbeat → progress + analitika (`lesson_dropoff` tool allaqachon bor, ma'lumoti boyiydi).
Dars 90% ko'rilganda "tugatildi" + 1–5 baho so'raladi (03 uchun).

## 4. Jonli efir (stream)
- **1-bosqich (arzon, tez):** YouTube Live (unlisted) yoki Google Meet havolasi dars jadvalida; kirish faqat guruh a'zolariga;
  davomat = sahifaga kirish + heartbeat (`cohort_attendance` tool bor). Efirdan keyin yozuv havolasi darsga biriktiriladi.
- **2-bosqich (trigger: ≥ 3 guruh parallel yoki yozuvni himoya qilish kerak):** provayder live (RTMP, ustoz OBS'dan),
  efir chati = bizning savol-javob (real vaqtda SSE), efir tugashi bilan yozuv avtomatik `media_assets` ga → darsga.
- Ustoz uchun: "Efirni boshlash" sahifasi — RTMP kalit, sinov, jadval; kechikib boshlansa menejerga ogohlantirish (03).

## 5. Fayllar (`FileStorage` interfeysi, S3-mos API)
- Hozir: Supabase Storage **S3 API orqali** (keyin R2/S3/O'zbekiston serveriga env bilan o'tadi).
- Hammasi yopiq (private); yuklab olish = qisqa muddatli imzolangan havola; faqat huquqi borlarga (`can()`).
- Tekshiruv: hajm (materiallar ≤ 200 MB, uyga vazifa ≤ 50 MB), turi haqiqiy tarkibidan (magic bytes), virus skaneri
  (ClamAV yoki provayder), rasm EXIF tozalash; har foydalanuvchiga kvota.
- Uyga vazifaga fayl/skrinshot/kamera (mobil); `materials_json` → `media_assets` ga ko'chiriladi.
- Zaxira: tungi backup'ga fayl bucket'i ham qo'shiladi (shifrlangan, alohida joy); tiklash sinovi.
- O'chirish siyosati: kurs arxivlansa fayllar 12 oy saqlanadi, foydalanuvchi so'rasa o'chiriladi (qonun).

## 6. Savol-javob (izohlar)
- `lesson_comments`: id, org_id, lesson_id, user_id, parent_id, body, video_sec (ixtiyoriy), status
  (`visible|hidden|deleted`), is_answer, created_at, edited_at. Reaksiya: `comment_votes`.
- Vaqt belgisi: "12:34" → bosilsa pleyer o'sha joyga o'tadi. Mentor javobi ajralib turadi, eng foydali tepada.
- Xabar: yangi savol → ustozga Telegram (bot bor), 15 daqiqada bir birlashtirib; 24 soatda javob bo'lmasa menejerga.
- Himoya: rate limit (DB'da, xotirada emas), havola/spam filtri, moderatsiya, shikoyat tugmasi, soft-delete.
- AI xavfsizligi: izoh matni MCP orqali AI'ga borganda "ishonchsiz foydalanuvchi matni" deb belgilanadi (02).

## 7. Audio
- Darsning audio versiyasi video'dan **avtomatik** olinadi (provayder yoki ffmpeg ishi), alohida yuklash shart emas.
- Mentorning ovozli izohi (uyga vazifa va savolga) — mobil va web'da yozish, ≤ 3 daqiqa, `media_assets` (audio).
- Subtitr/transkript: avtomatik (Whisper sinfidagi model) + qo'lda tahrir; o'zbekcha sifati avval 3 darsda sinaladi.

## 8. Admin: dars muharriri
Qoralama/nashr, tartibni sudrab o'zgartirish, dars versiyasi (o'quvchi ko'rayotganda buzilmaydi), yuklash navbati,
"hamma YouTube darslarni tekshir" (o'chirilgan/yopiq videolarni topish), preview o'quvchi ko'zi bilan.

## 9. Parity (har funksiya uchun)
| Funksiya | Web | `/api/v1` | MCP | Mobil |
| :--- | :--- | :--- | :--- | :--- |
| Dars ko'rish/progress | ✔ | `GET /lessons/{id}/playback`, `POST /lessons/{id}/progress` | `lesson_dropoff`, `lesson_stats` | ✔ |
| Fayl yuklash | ✔ | `POST /uploads` (imzolangan) | n/a (AI fayl yuklamaydi) | ✔ kamera |
| Savol-javob | ✔ | `GET/POST /lessons/{id}/comments` | `questions_unanswered`, `question_reply` | ✔ |
| Jonli efir | ✔ | `GET /cohorts/{id}/live` | `live_schedule`, `attendance` | ✔ |

## 10. Qabul mezonlari (har bo'lak)
Yangi SQL jonli DB'da bir marta ishlatildi (L2); boshqa foydalanuvchi faylini/videosini ochib bo'lmasligi testda;
imzolangan havola muddati o'tgach 403; heartbeat 3G'da ham ishlaydi; 4 o'lcham skrinshot; fayllar ≤ 250 qator.
