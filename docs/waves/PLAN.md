# Naqsh — Rebrand + Motion + Telegram Signup + Performance + Hardening

Status tracking lives in [STATE.md](STATE.md). This file is the **why and what**; STATE is the **where are we**.

## 1. Owner's request (distilled)
1. The site feels generic ("anyone could make this"). Make it feel expert-built and modern: tasteful, *not excessive* animations that never hurt speed.
2. **New name, new brand, new logo** — "VibeCoding.uz" is out.
3. **Telegram signup** — today the Telegram button only *logs in* existing users; a new user gets an error. Must be: not registered → register; registered → log in.
4. Faster site.
5. Animations controllable from the **admin panel**.
6. **Antifragile** (Taleb): look at the site through an enemy's eyes, find every weakness, fix it; failures of one part must not take down others.
7. Every wave hands off, so if a free agent dies mid-way the owner just says "davom et".

## 2. Brand decision — **Naqsh**
- **Name:** `Naqsh` (Uzbek: ornament, pattern, imprint). Ties directly to the existing *Samarkand Modern* design system (girih tiles were made by *ustalar*), to *patterns* in code, and to the promise "leave your mark / ship your own product".
- **Descriptor:** "AI bilan mahsulot yaratish maktabi". **Tagline:** see `src/config/brand.ts`.
- **Voice:** confident mentor, concrete, no hype, no invented numbers (honesty rule stays). Uzbek Latin, correct apostrophes (`o'`, `g'`).
- **Logo:** an 8-point girih star (two squares rotated 45°) drawn as an interlaced stroke; its centre holds a `>` prompt caret / cursor bar — craft meets code. Must work at 16px (favicon), 32px (header), mono (1-colour) and on dark. Wordmark: lowercase `naqsh` in Unbounded, tight tracking. Deliver as React component `src/components/brand/Logo.tsx` (mark + wordmark variants, `currentColor` aware) + `public/brand/*.svg` + favicon/apple-touch/manifest icons + a dynamic OG image (`src/app/opengraph-image.tsx`).
- **Config:** everything reads `src/config/brand.ts`. Grep must find zero user-facing `VibeCoding`/`vibecoding`/`Mirzo Academy` after W1B (code identifiers, package name, env names, URLs of infra may stay).

## 3. Contracts (fixed up front so parallel waves don't collide)
- **Brand:** `import { BRAND } from "@/config/brand"`.
- **Motion settings** (W3): `src/features/motion/domain/settings.ts`
  ```ts
  export type MotionLevel = "off" | "subtle" | "full";
  export interface MotionSettings {
    level: MotionLevel;          // global master switch
    heroIntro: boolean;          // hero headline/terminal choreography
    scrollReveal: boolean;       // section reveal on scroll
    pointerEffects: boolean;     // magnetic buttons, spotlight cards, tilt
    ambient: boolean;            // girih shimmer, gradient drift, marquee
    pageTransitions: boolean;    // View Transitions API between routes
  }
  export const DEFAULT_MOTION: MotionSettings = { level: "full", heroIntro: true, scrollReveal: true, pointerEffects: true, ambient: true, pageTransitions: true };
  ```
  Stored in `site_settings` row key `"motion"` (jsonb, Zod-validated). Read server-side with a cache + **fail-safe to DEFAULT_MOTION when DB is down**. Exposed to the client as `data-motion="off|subtle|full"` + `data-motion-*` flags on `<html>`; CSS and hooks read those. `prefers-reduced-motion: reduce` always wins (forces `off`).
- **Telegram auth** (W2): single "Telegram orqali davom etish" entry that works for both new and existing users (see §4 W2).

## 4. Waves
| Wave | Agent | Scope | Worktree/branch |
| :--- | :--- | :--- | :--- |
| W1A Adversarial audit (read-only) | space-bunny | Enemy-eyes audit of whole site: bugs, UX, copy, a11y, security, perf baseline, antifragility → `docs/waves/reports/W1A-AUDIT.md` with prioritized, file-referenced findings | `wave/w1a-audit` |
| W1B Rebrand | muse-spark-1.3 | Naqsh name, logo, favicon/OG/manifest, metadata, all copy mentions, header/footer brand | `wave/w1b-brand` |
| W2 Telegram signup/login | muse-spark-1.3 | Bot deep-link flow (register + login), 422 handling, tests | `wave/w2-telegram` |
| W3A Motion system + animations | muse-spark-1.3 | CSS-first motion system, hero choreography, reveals, micro-interactions | `wave/w3a-motion` |
| W3B Admin motion control | space-bunny | `site_settings.motion` service, admin "Animatsiyalar" tab, API, tests | `wave/w3b-motion-admin` |
| W4A Performance | space-bunny | Bundle, fonts, images, RSC, caching, third-party scripts | `wave/w4a-perf` |
| W4B Audit fixes | muse-spark-1.3 | Fix every P0/P1 from W1A not covered elsewhere | `wave/w4b-fixes` |
| W5 Final enemy QA + deploy | space-bunny → orchestrator | Re-audit, responsive suite, build+tests, handoff, deploy | `main` |

Order: W1A ∥ W1B → merge → W2 ∥ W3A → merge → W3B ∥ W4A → merge → W4B → W5.

### W2 design (Telegram signup that actually works)
Root cause: `users.phone` is NOT NULL, so `loginWithTelegram` returns `phone_link_required` (422) for any new Telegram user and the widget UI just shows an error. The Login Widget also silently fails unless the bot domain is set in @BotFather (`/setdomain`).
Solution — **bot deep-link auth**, works for new and existing users, no widget domain dependency:
1. Site: `POST /api/auth/telegram/start` → creates a short-lived (5 min), single-use, signed login request (DB row or signed token + DB nonce) → returns `https://t.me/<bot>?start=login_<id>`.
2. User taps it → bot `/start login_<id>`: if the Telegram user is already linked → mark request approved. If not → bot asks "📱 Raqamni ulashish" (request_contact keyboard); on contact (ownership already verified in `contact.ts`) → find user by phone or **create** a student user (phone + name + tg id) → approve.
3. Site polls `GET /api/auth/telegram/status?id=` (every 2s, max 5 min, stops on tab hidden) → on approved sets the session cookie (single use) → UI shows "Xush kelibsiz, <ism>!" → reload/redirect.
4. Keep the widget only as a secondary option if it is configured; on 422 from the widget, fall back to the deep-link flow instead of showing an error.
5. Auth modal copy: "Kirish yoki ro'yxatdan o'tish" — one flow, the user never has to know which one applies.

## 5. Non-negotiables for every wave
- Read `docs/CODER_AGENT_RULES.md` first. Theme tokens only, TS strict, Zod at boundaries, Uzbek UI copy.
- Animations: CSS/WAAPI + IntersectionObserver, **no new animation library** unless < 5 kB gz and justified in the report. Only animate `transform`/`opacity`/`filter`/`clip-path`. No layout shift (CLS 0). Everything visible without JS (SSR final state). `prefers-reduced-motion` respected.
- DB is currently DOWN: every DB-dependent read must degrade gracefully (fallback content, never a 500 page).
- Gate before reporting done: `npx tsc --noEmit` clean, `npx vitest run` green, `npm run build` green.
- Never `pkill -f`. Stop dev servers with `kill $(lsof -t -i:<port>)`. Use a port unique to the wave (see prompt).
- Commit on your wave branch with a clear message. Write the report file. Do not push, do not deploy.
