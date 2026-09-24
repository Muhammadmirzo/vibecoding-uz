# Frontend Audit — src/app, src/components, globals.css, tailwind.config.js

> READ-ONLY audit, 2026-09-24. Stack: Next.js 15 App Router, Tailwind 3.4 (CSS-var tokens), next/font (Onest + Instrument Serif + JetBrains Mono), next-themes (light/dark/likely). No source files modified.

## 1) Sitemap — every public route, sections in order, main CTA

- `/` (`src/app/page.tsx:14-79`) — homepage funnel hub. Order: HeroSection → ProofStats → Halol Isbot strip (`page.tsx:21-54`) → IdeaSimulator → CourseCards (`/#kurs-tanlash`) → PortfolioSection → RiskFreeGuarantee → quiz tie-in bar (`page.tsx:63-73`) → TeaserBanner → HowItWorks → FaqSection. Main CTA: dual hero — `/diagnostika` (primary) + `/bepul-dars` (secondary) (`HeroSection.tsx:47-59`).
- `/diagnostika` (`src/app/diagnostika/page.tsx:19`) — 2-min quiz router (5 questions, `HeroSection.tsx:10`). Sections: badge → H1 → `<DiagnosticQuiz/>`. CTA (result): → `/kurs/[slug]` or `/bepul-dars` (`src/features/quiz/QuizResult.tsx:33,38`).
- `/bepul-dars` (`src/app/bepul-dars/page.tsx:23`) — free 30-min lesson lead magnet. Sections: badge → H1 → 3 bullets → trust note → `FreeLessonForm`. CTA: form submit → Telegram `https://t.me/m/ODAfK_QIMjky` (`FreeLessonForm.tsx:130`). No price, no inline social proof.
- `/kurs/[slug]` (`src/app/kurs/[slug]/page.tsx:10-15,38-46`) — course sales page, 2 slugs: `vibe-coding-express` (8 wk), `ai-asoslari` (4 wk). Sections: badges (level/duration/cohort) → H1 → description → H2 "O'quv Dasturi Modullari" (`:41`) → "KIM UCHUN EMAS" (`:46`) → sticky `CourseCheckoutCard`. Main CTA: login modal or `/kabinet/to-lovlar` (`CourseCheckoutCard.tsx:48-49`); secondary Telegram advice (`:53`), `/bepul-dars` (`:56`). No inline testimonials.
- `/xizmatlar` (`ServicesPageContent.tsx`) — agency services (MVP/bot/automation). Sections: hero → offers w/ price ranges → 3-step process → FAQ (4) → portfolio link. Main CTA: "Telegram'da maslahat olish" → telegramUrl (`siteConfig.ts:66-67`).
- `/blog` (`src/app/blog/page.tsx:39,79-83`) — hub w/ search+category filter. Sections: H1 → filters → count → `BlogCard` grid → bottom banner H2. CTA: "Kurs Dasturini Ko'rish" → `/kurs/vibe-coding-express` (`:82-83`).
- `/blog/[slug]` (`src/app/blog/[slug]/page.tsx:43`) — reader w/ SEO/JSON-LD. Sections: breadcrumb → header → cover → `ArticleMain` + `BlogSidebar` (TOC) → `RelatedPosts` (2). No direct buy button in shell.
- `/ish` (`src/app/ish/page.tsx:38,59-65`) — careers. Sections: H1 → `JobBenefits` → `JobOpenings` (→ `/ish/[slug]`) → H2 fallback. CTA: "Rezyume Yuborish" → general-inquiry modal.
- `/ish/[slug]` (`src/app/ish/[slug]/page.tsx:20-27`) — job detail. Sections: `JobDetailHeader` → `JobDescription` → `JobRequirements` → inline `JobApplySection` form. CTA: inline submit only.
- `/ekspertlar` (`src/app/ekspertlar/page.tsx:10-25,36`) — graduate registry (2 cards: Sardor, Diyora). No CTA button — dead end.
- `/meetlar` (`src/app/meetlar/page.tsx:35,67`) — webinars (1 upcoming 18-Oktyabr 2026 + 1 archive). CTA per card → Telegram link.
- `/portfolio` (`PortfolioGallery.tsx:28,40,73-74`) — dark gallery w/ category filter + "numbers unaudited" disclaimer. CTA: external live links only; header link back to `/`.
- `/resurslar` (`src/app/resurslar/page.tsx:46,82-90`) — prompt packs (4 cards: 12/18/8/10 prompts). CTA each: "Telegram'da bepul olish" → t.me.
- `/testimoniyalar` (`TestimonialsExplorer.tsx:50,176-181`) — reviews explorer w/ filters + empty-state H2. CTAs: `/diagnostika` (`:180`), `/kurs/vibe-coding-express` (`:181`).
- `/shahodatnoma/[code]` (`src/app/shahodatnoma/[code]/page.tsx:31`) — certificate verification (badge → H1 + code → detail card). No CTA.
- `/atamalar` (`src/app/atamalar/page.tsx:17-60,117`) — glossary (6 terms) + SpinWheel + search. No CTA.
- `/pul-qaytarish` (`src/app/pul-qaytarish/page.tsx:18,24,44`) — 7-day guarantee terms (H1 → 3×H2). Link points to itself via `guaranteeTermsUrl` (`siteConfig.ts:37`). No CTA.
- `/maxfiylik`, `/offerta` — static legal, H1 + 2 H2s, no CTA.
- `/ref/[code]` — no UI; sets `ref_code` cookie 30d → redirect `/diagnostika?ref=` (`ref/[code]/route.ts:9-15`).
- `not-found.tsx:16-34` — H1 "Bu sahifa hali yasalmagan". CTAs: `/` (`:27`), `/#kurs-tanlash` (`:34`).
- Excluded from sitemap: `/admin/*`, `/kabinet/*`, `/api/*` (`sitemap.ts:8-22,32-39`; `robots.ts:9-11` disallows them).

## 2) Design system (tokens) + inconsistencies

- Tokens clean: `globals.css:6-38` defines `--color-cream/warm/deep`, `--color-ink/muted/subtle`, `--color-accent/hover/soft/line`, `--color-border/strong`, `--color-success/*`, `--color-telegram/*`, radii 6/10/16/24 (`:30-33`), shadows sm/md/lg (`:35-37`); `tailwind.config.js:12-58` maps all to `cream/ink/accent/border/success/telegram` + fonts + radius + shadow. Dark (`.dark :40-63`) and `likely` (`.likely :65-88`) theme overrides present.
- Fonts: Onest sans (`layout.tsx:13-17`), Instrument Serif italic accent via `.accent-serif` (`globals.css:99-103`, used `HeroSection.tsx:27`), JetBrains Mono (`layout.tsx:27-31`, var named `--font-geist-mono` — misleading name, `tailwind.config.js:46` maps `mono` to it).
- Utilities: `.btn-primary/.btn-secondary` (`globals.css:105-127`), `.scrollbar-none/.no-scrollbar` (`:130-138`); body uses `var(--color-cream)` + `var(--font-onest)` (`:91-97`).
- Inconsistencies (prioritized):
  - Hardcoded hex breaks token rule (AGENTS.md §3): `PortfolioSection.tsx:16` `bg-[#141413]` (should be `bg-ink`); `PortfolioCard.tsx:55-57,66,69,71` macOS dots `bg-[#ff5f57]/#febc2e/#28c840` + live badge `text-[#28c840]`; `ArticleBody.tsx:43` `bg-[#1E1E1E]` code block; `TelegramPreview.tsx:5` `bg-[#0e1621]/bg-[#182533]` (CRM preview, justifiable but untokenized).
  - Dual styling dialects: ~90% classes use `bg-cream/text-ink` tokens, but Hero still uses `bg-[var(--color-cream-warm)]`, `text-[var(--color-ink)]` (`HeroSection.tsx:12,25,31`) — same value, two syntaxes; grep shows `text-[var(--color-accent)]` scattered. Pick token form.
  - Dead `likely` theme: full override block (`globals.css:65-88`) + `ThemeProvider themes={light,dark,likely]}` (`layout.tsx:110`) but no UI switcher exposes it; adds maintenance surface.
  - Radius/shadow tokens exist but raw values still used (`rounded-[var(--radius-md)]`, `shadow-[var(--shadow-lg)]` in `HeroSection.tsx:19,48,69`) instead of `rounded-md/shadow-lg` (`tailwind.config.js:48-58`).

## 3) Component inventory + duplication/spaghetti

- `sections/` (9 files, 8/9 `"use client"` L1; only `RiskFreeGuarantee.tsx:59-line` is server): HeroSection ~107, ProofStats ~88, CourseCards ~148, PortfolioSection ~76, IdeaSimulator ~194, RiskFreeGuarantee ~59, TeaserBanner ~40, HowItWorks ~143, FaqSection ~160. None >250 lines — no spaghetti files in scope.
- `layout/` (12 files, all client except `headerData.ts:55-line` server): Header ~90, Footer ~91, MobileDrawer ~76, DesktopNav ~79, Brand ~21, SiteBanner ~32, ThemeProvider ~11, ThemeToggle ~55, ClientModals ~22 (dynamic ssr:false Auth+Search), UserMenu ~65, SearchButton ~21.
- `ui/search/` + `ui/`: `SearchModal.tsx:3-line` barrel re-exports `search/SearchModal.tsx:71-line` (Radix Dialog, Ctrl+K); `SearchInput.tsx:46`, `SearchResults.tsx:120`, `useSearch.ts`, `types.ts`; `SpinWheel.tsx:74`; `portfolio/PortfolioCard.tsx:175`.
- Duplication: search barrel vs deep import — two valid import paths (`@/components/ui/SearchModal` in ClientModals vs `@/components/ui/search/SearchModal`); keep barrel, normalize imports. No other duplicated components found.
- Inline `style=`: only 1 in scope — `PortfolioSection.tsx:22-25` radial-gradient glow (legit, but tokenize or move to CSS). (Out-of-scope `style=` for width-% progress bars in quiz/LMS/CRM is legitimate dynamic use.)
- `bg-ink/85` overlay (`HeroSection.tsx:80`) + `border-white/10` (`PortfolioSection.tsx:16`) bypass theme opacity scale — check dark-mode contrast.

## 4) UX / conversion problems

- [P0] Zero inline social proof on money pages: `/kurs/[slug]` shows price + guarantee but no testimonials/portfolio embed (proof lives only on `/testimoniyalar`, `/ekspertlar`, `/portfolio`). Homepage `ProofStats` admits `studentsCount: "Birinchi guruh"`, `yearsExperience: 0` (`siteConfig.ts:41-47`) — honest but weak; Halol strip (`page.tsx:21-54`) compensates with format + guarantee, not outcomes.
- [P0] Dead-end proof pages: `/ekspertlar` (2 grads, no CTA), `/portfolio` (external links only), `/shahodatnoma/[code]` (no next step) — add → `/diagnostika` / `/kurs/...` CTAs.
- [P1] CTA confusion: header CTA "Kurs tanlash" → `/#kurs-tanlash` (`headerData.ts:46-47`) vs hero primary `/diagnostika` vs course card "Kursni band qilish" → login modal vs Telegram advice link — 4 competing next steps; no single funnel spine. Announcement banner → `/kurs/vibe-coding-express` (`headerData.ts:49-50`) adds a fifth.
- [P1] Weak hero differentiation: H1 "professional mentordan o'rganing" (`HeroSection.tsx:25-28`) + single Clash Nexus example (`:32-42`, link `clash-nexus.vercel.app`); subhead sells one project, not outcome/transformation. Microcopy "2 daqiqalik diagnostika · 5 savol" (`:61-63`) good; hardcodes `QUIZ_QUESTION_COUNT = 5` (`:10`) — drifts from `quizData.ts` if questions change.
- [P1] Guarantee friction: `/pul-qaytarish` conditions (2 modules + homework, `page.tsx:18`) + self-referential `guaranteeTermsUrl` (`siteConfig.ts:37`) — user reads terms that link to themselves.
- [P2] Mobile: hero stacks CTA full-width (`HeroSection.tsx:46-47` `w-full sm:w-auto` — good); risk spots: `max-w-[1360px]` + `px-5` gutters consistent, but `overflow-x-hidden` on body (`globals.css:95`) can mask horizontal overflow instead of fixing; horizontal sliders depend on `.no-scrollbar` (`:130-138`) with no visible affordance.
- [P2] `/atamalar` SpinWheel + glossary with no CTA wastes traffic; `/resurslar` + `/meetlar` CTAs all exit to Telegram (no lead capture on-site).

## 5) A11y + performance

- Over-client-ization: 26/28 components start `"use client"` L1. Static candidates for server: `Brand.tsx:21-line`, `SiteBanner.tsx:32-line`, `Footer.tsx:91-line`, `TeaserBanner.tsx:40-line`, `RiskFreeGuarantee` already server (correct). `Header.tsx:90-line` client only to pass state to drawer/nav — consider server shell + client islands.
- Images: hero uses `next/image` + `priority` + `sizes` correctly (`HeroSection.tsx:71-79`, `layout.tsx:66-73` OG `hero-banner.jpg` 1376×768). Violations: raw `<img>` without optimization — `BlogCard.tsx:10,32` (cover + avatar, `loading="lazy"` only), `blog/[slug]/page.tsx:70` (cover), `RelatedPosts.tsx:12`, `ArticleHeader.tsx:37`, `PortfolioCard.tsx:84-90` — migrate to `next/image` (esp. covers/avatars in lists).
- Fonts: `next/font/google` + `display: swap` (`layout.tsx:13-31`) — good; `lang="uz"` + `suppressHydrationWarning` (`:108`) correct for next-themes. Missing: no `<html>` theme pre-script noted beyond provider; verify FOUC on dark.
- A11y gaps: `PortfolioSection` glow `style=` is decorative (ok if `aria-hidden` — not set, `:22-25`); `text-white` on hardcoded `bg-[#141413]` (`:16`) needs contrast check in `likely` theme; `bg-ink/85` badge link (`HeroSection.tsx:80-90`) small 12px mono — check 4.5:1; search modal uses Radix Dialog (focus trap ok) but global `toggle-search-modal` event (`SearchButton.tsx:21-line`) needs keyboard equivalent audit; avatar `<img alt="">` (`BlogCard.tsx:10,32`) empty alt on meaningful avatars.
- PWA: `PwaRegister` mounted globally (`layout.tsx:116`), manifest + apple icons set (`layout.tsx:49-53`) — verify service-worker caching doesn't stale course content.

## 6) The offer (as seen in code/content)

- Core products (`siteConfig.ts:49-60`, `headerData.ts:20-33`): `Vibe Coding Express` — 8 weeks, Claude Code, build + ship app, `550 000 so'm`, installment `183 334 so'm/mo × 3`; `AI Asoslari` — 4 weeks, prompt-engineering, `550 000 so'm`, installment `275 000 so'm/mo × 2`. `oldPrice == price` both — no discount display (strikethrough logic dormant). Cohort: `15-Oktyabr, 2026` (`:33-34`); format: "8 haftalik jonli sessiyalar va yozuvlar" (`:39`).
- Guarantee: `7 kunlik 100% pul qaytarish` (`:36`), terms at `/pul-qaytarish` (homework condition).
- Funnels: (a) free lesson `/bepul-dars` → Telegram form submit; (b) diagnostics `/diagnostika` (5Q quiz) → course/free-lesson routing; (c) courses `/kurs/[slug]` → login modal → `/kabinet/to-lovlar` (Payme/Click badges, `CourseCheckoutCard.tsx:62-63`); (d) services `/xizmatlar` — MVP 800k–3M / bot 1.2M–4M / automation 2.5M–8M so'm (`servicesCatalog.ts:14,29,44`) → Telegram consult; (e) referral `/ref/[code]` → quiz + 30d cookie. Lead magnets: `/resurslar` prompt packs, `/meetlar` webinars, `/atamalar` glossary — all exit to Telegram, no on-site capture.
