# W3-PAGES — Public pages redesign

## O'zgarishlar

- `/xizmatlar`: premium B2B xizmat kompozitsiyasi, 3 ta taklif, narx diapazonlari, jarayon, FAQ va `LeadCaptureForm source="xizmatlar"` qo'shildi.
- `/blog` va `/blog/[slug]`: yangi semantic tokenlar, `next/image`, server metadata, 70ch-ish o'qish kompozitsiyasi va closing CTA; mavjud TOC/related posts saqlandi.
- `/portfolio`: yangi gallery, kategoriya filtri, `next/image`, `PortfolioCard` tokenlari va CTA.
- `/testimoniyalar`, `/ekspertlar`: yangi editorial/card kompozitsiyalari, honest disclaimer va CTA.
- `/meetlar`, `/resurslar`: Telegram havolasi `LeadCaptureForm` muvaffaqiyatidan keyin ochiladi.
- `/atamalar`: premium qidiruvli glossary; eski SpinWheel olib tashlandi.
- `/ish`, `/ish/[slug]`: token sweep, job detail server component, static params va metadata.
- `/shahodatnoma/[code]`, `/pul-qaytarish`, `/maxfiylik`, `/offerta`: yangi typografiya va CTA; refund sahifasi self-reference o'rniga `/offerta` link qiladi.
- `not-found.tsx`, `loading.tsx`, `error.tsx`: branded 404 va public segment state UI.
- LeadCaptureForm source union `xizmatlar`, `meetlar`, `resurslar` bilan kengaytirildi.

## Tekshiruv

- `npx tsc --noEmit` bajarildi. W3 o'zgarishlaridan tashqari mavjud `src/features/lms/components/settings/NotificationSettingsForm.tsx:18` da `ButtonProps` ga `target` prop tushmaganligi bo'yicha bitta pre-existing xato qoldi.
- Target route va blog/portfolio fayllarida legacy token va raw `<img>` sweep qilindi.

## Xavflar / qoldiqlar

- `/shahodatnoma/[code]` ma'lumotlari hozirgi statik demo ma'lumotlari; live certificate lookup bu scope'ga kirmadi.
- LeadCaptureForm API route mapping mavjud `/api/quiz` ichida qolgan; API route'lariga tegilmadi.
- Vizual responsive smoke test uchun dev server ishga tushirilmadi (`MASTER_PLAN.md §6`).
