# W2-HOME — Homepage va global chrome

## O'zgarishlar

- `src/app/page.tsx`: 11 ta majburiy homepage bo'limi tizimli kompozitsiyasi, homepage metadata, Organization va Course list JSON-LD qo'shildi.
- `src/components/sections/home/`: yangi `HeroSection`, `ToolStrip`, `ProblemShift`, `Transformation`, `Roadmap`, `Projects`, `Mentor`, `Pricing`, `Comparison`, `Faq` komponentlari yaratildi. Hero GirihPattern va Claude Code TerminalWindow ishlatadi; roadmap va mobil navigatsiya kabi interaktiv qismlar client island.
- `src/components/layout/`: sticky blurred header, yangi server `Brand`/`DesktopNav`/`SiteBanner`/`Footer`, gold diagnostika CTA, theme toggle va user menu; mobile drawer Radix focus trap/Escape bilan yangilandi.
- `src/components/layout/UserMenu.tsx` va `SearchButton.tsx`: yangi semantic tokenlarga o'tkazildi.
- `src/lib/siteConfig.ts`: mavzudagi cohort va kafolat konfiguratsiyasi qo'llanildi; takroriy narx yoki testimonial ma'lumotlari qo'shilmedi.
- Eski homepage section komponentlari import tekshiruvidan keyin o'chirildi.

## Tekshiruv

- `npx tsc --noEmit` — o'tdi.
- Ichki footer/header linklari `src/app/**/page.tsx` bilan tekshirildi; tashqi Telegram, email va Academy linklari `href` sifatida aniq ko'rsatilgan.
- Yangi kodda legacy `cream` va `accent-line` tokenlari ishlatilmadi.

## Qolgan xavflar

- Portfolio ma'lumotlaridagi ochiq raqamlar mustaqil audit qilinmagan; UI buni ochiq aytib beradi.
- Eski route va boshqa sahifalardagi legacy tokenlar W4 sweep'gacha qolishi mumkin; bu W2-HOME scope'iga kirmadi.
