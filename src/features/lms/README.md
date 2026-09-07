# LMS Feature Module (`src/features/lms/`)

The **LMS Feature** module manages the student learning cabinet, video lesson streaming player, homework submission flow, drip content release engine, and course progress tracking.

---

## 📁 DIRECTORY STRUCTURE & FILES

```
src/features/lms/
├── README.md               # Module architecture & developer guidelines (this file)
├── components/             # Student Cabinet UI components
│   └── KabinetNav.tsx      # LMS student navigation sidebar & subheader
└── dripEngine.ts           # Drip content release evaluation engine & access rules
```

---

## 🛠️ KEY DEPENDENCIES & CONTRACTS

- **API Endpoints**:
  - `POST /api/lms/progress`: Saves video position and marks lesson completion.
  - `POST /api/lms/homework`: Handles student homework submissions (GitHub link & attachments).
  - `GET /api/kabinet/*`: Student cabinet data fetchers.
- **Validations**: `src/lib/validations/student.ts`, `drip.ts`.
- **Database Tables**: `courses`, `courseSections`, `lessons`, `homeworkAssignments`, `homeworkSubmissions`, `lessonProgress`, `enrollments` (`src/db/schema.ts`).
- **Service Adapters**: `src/lib/certificates/` (PDF generation).

---

## 🛑 SCOPING DIRECTIVE FOR AI AGENTS

When working on student cabinet UI, video playback, homework submissions, or drip rules, work exclusively within `src/features/lms/`.
