# Quiz Feature Module (`src/features/quiz/`)

The **Quiz Feature** module powers the interactive diagnostic questionnaire. It analyzes student background, technical level, and goals in Uzbek to calculate course recommendations and capture inbound CRM leads.

---

## 📁 DIRECTORY STRUCTURE & FILES

```
src/features/quiz/
├── README.md               # Module architecture & developer guidelines (this file)
├── DiagnosticQuiz.tsx     # Quiz UI state machine container component
└── quizData.ts            # Diagnostic questions, answer options & scoring weights
```

---

## 🛠️ KEY DEPENDENCIES & CONTRACTS

- **API Endpoints**:
  - `POST /api/quiz/submit`: Submits quiz responses, computes recommended course ID, and inserts an inbound lead into `leads` table.
- **Validations**: `src/lib/validations/quiz.ts` (or `src/lib/validations/crm.ts`).
- **Database Tables**: `leads`, `courses` (`src/db/schema.ts`).
- **Theme Tokens**: Uses `bg-cream`, `bg-cream-warm`, `bg-accent`, `text-ink`.

---

## 🛑 SCOPING DIRECTIVE FOR AI AGENTS

When modifying diagnostic quiz questions, scoring formulas, or lead capture forms, restrict context to `src/features/quiz/` and `quizData.ts`.
