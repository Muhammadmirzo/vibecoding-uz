# Quiz Feature Module (`src/features/quiz/`)

The **Quiz Feature** module powers the interactive diagnostic questionnaire on
`/diagnostika`. It analyzes goals, experience level, and format preference to
calculate a course recommendation and capture inbound CRM leads.

```
src/features/quiz/
├── README.md                  # This file
├── DiagnosticQuiz.tsx         # Re-export shim (page entry point)
├── quizData.ts                # Re-export shim (kept: imported by /api/quiz route)
├── scoring.ts                 # Re-export shim (QuizCourse alias kept for compat)
├── domain/
│   ├── questions.ts           # Pure question data + course meta (no I/O)
│   ├── scoring.ts             # Pure scoring: scores, recommendation, reasoning, Zod schema
│   └── index.ts               # Barrel export
└── ui/
    ├── DiagnosticQuiz.tsx     # Client island: 1 question/screen, keyboard, progress
    └── QuizResultCard.tsx     # Result: recommendation + reasoning + course card + CTAs
```

## Contracts

- **Lead submit**: `POST /api/quiz` with `{ name, phone, telegram?, source: "quiz",
  quizAnswers, recommendedCourseId }`. The client-side recommendation is for
  instant UX only — the server recomputes score/recommendation (W2-BIZ owns API logic).
- **Lead form UI**: shared `src/features/leads/ui/LeadCaptureForm.tsx`
  (`source`, `ctaLabel`, `onSuccess`, `redirectUrl`, `revealUrl`).
- **Tests**: `src/__tests__/quiz-scoring.test.ts` (9 cases).
- **Theme**: new Samarkand tokens only (`bg-bg-*`, `text-ink-*`, `brand`, `accent`, `gold`).
