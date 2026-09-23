# Telegram Registration — Handoff

**Branch:** `feat/telegram-registration`
**Baza tag:** `pre-telegram-fix-20260923`
**Sana:** 2026-09-23
**Muhandis:** RELEASE ENGINEER (subagent)

## Maqsad

Telegram orqali ro'yxatdan o'tish oqimini joriy qilish — foydalanuvchi Telegram Login Widget orqali autentifikatsiya qilinadi, sessiya JWT bilan saqlanadi.

## O'zgarishlar

| Fayl | Sabab | Agent |
|------|-------|-------|
| `src/app/api/auth/telegram/route.ts` (YANGI, 130 qator) | Telegram Login Widget POST: Zod → HMAC verify → freshness → tgUserId lookup → session + Set-Cookie | Backend |
| `src/lib/telegram/verify.ts` (YANGI, 66 qator) | Edge-compatible HMAC-SHA256 verify + 24s freshness, timing-safe compare | Backend |
| `src/lib/validations/telegram.ts` (+12) | `telegramAuthSchema` + `TelegramAuthInput` tipi | Backend |
| `src/app/api/auth/otp/verify/route.ts` (fix) | Cookie bug: `setSessionCookie` return tashlab ketilgan edi — endi `Set-Cookie` header to'g'ri qo'yiladi | Backend |
| `src/features/auth/components/TelegramLoginButton.tsx` (YANGI, 161) | Widget script + loading/error/disabled holatlari, token ranglar | Frontend |
| `src/features/auth/components/telegram-helpers.ts` (YANGI, 61) | Sof helperlar: map/error/botName (test qilinadigan) | Frontend |
| `src/features/auth/components/AuthModal.tsx` (+13) | "yoki" divider + Telegram tugmasi (har ikki step'da) | Frontend |
| `src/__tests__/telegram-auth.test.ts` (YANGI, 7 test) | Helper unit testlari | Frontend |
| `docs/handoff/telegram-registration.md` | Handoff qaydi (doimiy yangilanadi) | Release |
| `scripts/rollback.sh` | Safe rollback scripti | Release |

## Verifikatsiya

| Tekshiruv | Buyruq | Natija |
|-----------|--------|--------|
| Typecheck | `npx tsc --noEmit` | ✅ 2026-09-23 exit 0 |
| Unit test | `npx vitest run src/__tests__/telegram-auth.test.ts` | ✅ 7/7 |
| Full suite | `npx vitest run` | ⚠️ 141/142 — 1 yiqildi: `hardening.test.ts > withTransactionLock sequentially` — `PostgresError ENOTFOUND tenant postgres.gvfzomtdswzlxstjvwiv` (Supabase DNS, bizning kodga aloqasi yo'q, flaky/infra) |
| Prod build | `npm run build` | ✅ exit 0 |
| Secrets/hex/any | `git grep` + `grep` | ✅ yangi fayllarda hex/`any` yo'q; eski P0 (`login/route.ts:51` backdoor, `session.ts:36` fallback) hali ochiq — keyingi slice |

Pre-deploy gate (majburiy): `npm run build` VA `npx vitest run` push dan oldin yashil bo'lishi shart.

## Rollback

Safe rollback — destruktiv buyruq yo'q (`push --force` taqiqlanadi):

```bash
# 1. Mavjud taglarni ko'rish
git tag --list 'pre-telegram-fix-*'

# 2. Avtomatik script (tasdiq so'raydi)
bash scripts/rollback.sh

# 3. Qo'lda variant (script ishlamasa)
git stash push -m "telegram-wip-backup"
git checkout main
git checkout -b restore/pre-telegram-fix-20260923 pre-telegram-fix-20260923
```

Restore branch tayyor bo'lgach, PR orqali `main` ga qaytariladi — to'g'ridan-to'g'ri `main` ga `reset --hard` qilinmaydi.

## Vercel

- **Loyiha:** `master-2` (canonical production; `vibecoding-uz` duplikat o'chirilgan — ulanmang).
- **Production URL:** https://master-2-jade.vercel.app
- **Deploy:** `main` ga commit → `git push origin main` → `git push origin main:master` (`main`/`master` sinxron saqlanadi).
- **Muhit o'zgaruvchilari (faqat nom, qiymatsiz):**
  - `TELEGRAM_BOT_TOKEN` — server-only, hech qachon `NEXT_PUBLIC_` qilinmasin
  - `NEXT_PUBLIC_TELEGRAM_BOT_NAME` — public bot username
- Vercel CLI ushbu muhitda o'rnatilmagan (`vercel: command not found`) — env mavjudligini Vercel dashboarddan tekshiring.

## Keyingi qadamlar

1. [ ] Auth ishchisi "O'zgarishlar" jadvalini aniq fayllar bilan to'ldiradi.
2. [ ] Verifikatsiya jadvali ishga tushirib to'ldiriladi (`tsc`, `vitest`, `build`).
3. [ ] `TELEGRAM_BOT_TOKEN` Vercel dashboardda borligi tekshiriladi.
4. [ ] `main` ga merge PR + pre-deploy gate yashil.
5. [ ] Push `main` va `master` ga, production smoke-test.
