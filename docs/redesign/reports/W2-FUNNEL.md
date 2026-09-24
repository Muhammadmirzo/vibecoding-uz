# W2-FUNNEL — Conversion funnel rebuild

## Changed

**Quiz domain (pure, tested)** — `src/features/quiz/domain/`
- `questions.ts`: typed `QuizQuestion`/`QuizOption` data + `QUIZ_QUESTIONS` + `QUIZ_COURSE_META` (no I/O).
- `scoring.ts`: `quizAnswersSchema` (Zod), `calculateScores`, `calculateRecommendation`
  (same tie-break as before: express wins ties), `buildReasoning` (per-answer trace),
  `recommendationSummary` (honest, score-citing copy).
- `quizData.ts` / `scoring.ts` kept as 1–2 line re-export shims — `/api/quiz` route
  imports them and was NOT touched. `DiagnosticQuiz.tsx` is a re-export shim.
- Removed superseded legacy-token components: `QuestionCard`, `QuizProgress`,
  `QuizResult`, quiz-local `LeadCaptureForm` (replaced by `ui/` versions).

**Quiz UI** — `src/features/quiz/ui/`
- `DiagnosticQuiz.tsx` (client island): one question per screen, `role=progressbar`,
  radio-based options (native arrow-key support) + digit shortcuts + Enter to advance,
  back button, `animate-fade-up` step transitions (global reduced-motion CSS disables
  them), live-region announcements. Flow: questions → contact gate → result.
- `QuizResultCard.tsx`: recommendation with reasoning list, course card, CTAs to
  `/kurs/[slug]` and `/bepul-dars`.

**Shared lead capture** — `src/features/leads/ui/`
- `LeadCaptureForm.tsx` (client, Zod-validated): props `source`, `ctaLabel`,
  `title`/`description`, `quizAnswers`, `recommendedCourseId`, `onSuccess(leadName)`,
  `redirectUrl`, `revealUrl` + reveal copy. Fields: name, +998 phone mask (required),
  Telegram username (optional). POSTs to existing `/api/quiz` (no API edits).
  Success state reveals next step (Telegram button when `revealUrl` set).
- `phoneMask.ts`: `formatPhoneMask`, `isValidUzbekPhone`, `isValidTelegramUsername`.

**Course content** — `src/features/courses/content.ts`
- Typed `COURSES` record (outcomes, for/not-for, per-week roadmap with project,
  projects, FAQs), pricing via `siteConfig` (single source), `COMPARISON_ROWS`,
  `COURSE_SLUGS`. `ai-asoslari` roadmap is honestly 4 weeks, not 8.

**Pages (server by default, new tokens + primitives only)**
- `src/app/diagnostika/page.tsx`: metadata, `Badge`/`Heading`, quiz island, closing
  card linking to `/bepul-dars` + courses (full `NextStepCTA` skipped — it would loop to self).
- `src/app/bepul-dars/page.tsx` + `LeadSection.tsx` (client island): outcome hero,
  30-min agenda timeline, for/not-for, mentor block, Radix `Accordion` FAQ,
  lead form revealing the existing Telegram link after submit, course-links closer
  (full `NextStepCTA` skipped — its secondary button would loop to self).
  Deleted old `FreeLessonForm.tsx` (replaced by shared form).
- `src/app/kurs/[slug]/page.tsx`: outcome hero, for/not-for, weekly roadmap timeline,
  real projects (featured portfolio data, existing badges), mentor, pricing
  (`CourseCheckoutCard`, restyled to new tokens, behavior unchanged: login modal /
  `/kabinet/to-lovlar`), comparison table, FAQ, `NextStepCTA` closer, JSON-LD Course
  schema, `generateMetadata`/`generateStaticParams`.
- `src/app/kurs/[slug]/StickyBuyBar.tsx` (client island): sticky mobile buy bar,
  same login-modal/checkout entry behavior.

**Tests** — `src/__tests__/quiz-scoring.test.ts`: 9 cases (dominance both ways,
tie/empty fallback, invalid-index tolerance, weight sums, reasoning trace,
summary copy, Zod validation, question shape).

## Verification

- `npx tsc --noEmit`: no errors in any funnel file. Two remaining errors are
  pre-existing and out of scope (`api/telegram/webhook/route.ts`,
  `lib/auth/require-auth.ts` — untouched, other agents' area).
- `npx vitest run src/__tests__/quiz-scoring.test.ts`: 9/9 pass.
- All new/edited files ≤ 250 lines; grep for legacy tokens (`cream`, `accent-line`,
  `var(--color`, hex, `btn-primary/secondary`) in scope returns 0.

## Left / risks

- Server-side score recomputation in `POST /api/quiz` belongs to **W2-BIZ** (this task
  only calls the endpoint; client sends `quizAnswers` + client-computed
  `recommendedCourseId` for instant UX). Note: `quizLeadSchema` currently strips the
  `telegram` field for `source: "quiz"` — W2-BIZ may want to persist it.
- `free_lesson` API rule accepts exactly one contact method (phone XOR telegram);
  the shared form always requires phone and treats Telegram as optional extra —
  compatible, but a phone-less Telegram-only signup is not offered.
- Visual check of animations/sticky bar needs a running app (not started per agent rules).
- `tailwind.config.js` still ships `cream` aliases for W4 migration — new funnel code
  does not use them.
