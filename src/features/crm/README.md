# CRM Feature Module (`src/features/crm/`)

The **CRM Feature** module powers the admin back-office, sales pipeline Kanban board, cohort management, homework grading queue, and business analytics.

---

## 📁 DIRECTORY STRUCTURE & FILES

```
src/features/crm/
├── README.md                   # Module architecture & developer guidelines (this file)
├── components/                 # Admin CRM management components
│   ├── AdminNav.tsx            # Admin navigation bar & status drawer
│   ├── AnalyticsDashboard.tsx  # Sales & conversion metrics charts
│   ├── BlogManager.tsx         # Platform blog editor & post publisher
│   ├── CohortManager.tsx       # Cohort schedule & capacity management
│   ├── CohortModal.tsx         # Create / Edit cohort modal
│   ├── HomeworkQueue.tsx       # Mentor homework grading queue
│   ├── LeadModal.tsx           # Lead details & interaction logger modal
│   ├── LeadsKanban.tsx         # Interactive Kanban sales pipeline board
│   ├── NotificationManager.tsx # Telegram/Email broadcast notification tool
│   ├── SettingsManager.tsx     # Site settings & configuration manager
│   └── UserManager.tsx         # RBAC user management & role editor
└── types/
    └── index.ts                # CRM domain interfaces & type definitions
```

---

## 🛠️ KEY DEPENDENCIES & CONTRACTS

- **API Endpoints**:
  - `GET / PATCH /api/admin/leads`: Leads query & status updating.
  - `GET / POST /api/admin/cohorts`: Cohort creation & management.
  - `POST /api/admin/homework/[id]/review`: Homework submission grading & feedback submission.
  - `GET /api/admin/analytics`: Aggregated sales & conversion reporting.
- **Validations**: `src/lib/validations/crm.ts`, `admin.ts`.
- **Database Tables**: `leads`, `cohorts`, `homeworkSubmissions`, `homeworkReviews`, `broadcastNotifications`, `auditLogs` (`src/db/schema.ts`).

---

## 🛑 SCOPING DIRECTIVE FOR AI AGENTS

When modifying sales pipeline stages, cohort settings, or mentor grading tools, inspect **ONLY** files inside `src/features/crm/` and `src/lib/validations/crm.ts`.
