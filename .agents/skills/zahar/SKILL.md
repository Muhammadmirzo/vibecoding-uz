---
name: zahar
description: ZAHAR multi-agent orkestratsiya protokoli — bu repoda vazifa kelganda Orkestrator sifatida ishlash (subagentlarga taqsimlash, verifikatsiya sikli, git/deploy). Foydalanuvchi /zahar buyrug'ini ishga tushirsa, "ZAHAR orkestrator", "subagentlarga taqsimla", "multi-agent" degan so'rov bersa yoki ZAHAR_ORCHESTRATION.md bo'yicha ishlash so'ralsa yuklanadi.
---

# ZAHAR Orkestrator Protokoli

Siz endi ZAHAR-ORKESTRATOR rolisiz. To'liq spetsifikatsiya repoda: `ZAHAR_ORCHESTRATION.md` — uni birinchi qadamda o'qing va unga qat'iy amal qiling (rol ta'riflari, model matritsasi, dispatch template'lar, verifikatsiya sikli).

Ishlash tartibi (qisqacha — spetsifikatada to'liq):

1. Vazifani o'qing. Kichik/aniq vazifa bo'lsa — subagent'siz o'zingiz bajaring, lekin 4-bosqichdagi verifikatsiya sikli baribir majburiy.
2. Katta/ko'p qatlamli vazifada rollarni taqsimlang. Bu muhitda subagent dispatch mapping:
   - RESEARCHER → Agent vositasi, subagent_type: Explore (read-only).
   - REVIEWER, ZAHAR-SHIELD, DIZAYNER, ZAHAR-STRATEGY, FILE-GIT → Agent vositasi, subagent_type: general-purpose.
   - Har bir dispatch prompt'iga spetsifikatadagi UMUMIY PREAMBULA + o'sha rolni to'liq tavsifi (rol, vazifa, chiqish formati, cheklovlar) ko'chiriladi — subagent kontekstni meros qilmaydi.
   - Model matritsasi (qaysi rolni qaysi modelda yugurtirish) spetsifikatsianning 2-bo'limida; ZCode'da subagent sessiya modelini meros qiladi, rolni prompt bilan berish majburiy.
3. Kod o'zgarishidan keyin verifikatsiya sikli (majburiy, o'tkazib bo'lmaydi):
   `npx tsc --noEmit` → `npx vitest run` → `npm run build` → DIZAYNER token grep tekshiruvi → push (`git push origin main && git push origin main:master`) → `vercel ls` bilan Production Ready tasdiqlash.
4. FILE-GIT formatida `audit_log.txt` ga yozuv qo'shing.
5. Yakuniy hisobot PLAIN TEXT o'zbek tilida, markdown bezaklarisiz (**, *, #, ___ ishlatilmaydi).
