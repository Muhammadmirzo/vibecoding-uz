# System Architecture & Runtime Boundaries

This document defines the high-level architecture, layer separation, data flow models, and runtime boundaries of the Vibecoding Platform.

---

## 🏗️ SYSTEM LAYERS OVERVIEW

The application follows a **Modular Clean Architecture** designed around high cohesion, low coupling, and token-sparing feature boundaries:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│  Next.js 15 App Router (`src/app/`), React 18 Server & Client Components│
│  Global Layout & UI Components (`src/components/`)                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FEATURE MODULES LAYER                           │
│  Domain Logic & Feature Handlers (`src/features/[feature]/`)           │
│  • auth   • quiz   • lms   • crm   • payments   • jobs               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       VALIDATION & ADAPTER LAYER                       │
│  Zod Schemas (`src/lib/validations/`)                                  │
│  External Providers (`src/lib/sms/`, `src/lib/telegram/`, `email/`)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         DATA ACCESS LAYER                              │
│  Drizzle ORM Connection & Query Builder (`src/db/`)                    │
│  PostgreSQL Database (Users, Cohorts, Homeworks, Leads, Payments)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ ARCHITECTURAL LAYERS DETAIL

### 1. Presentation & Routing Layer (`src/app/`)
- **Next.js App Router**: Utilizes file-system routing (`src/app/admin`, `src/app/kabinet`, `src/app/diagnostika`, `src/app/api`).
- **Server vs Client Components**: 
  - Server Components (default) handle data fetching, SSR HTML rendering, and database queries.
  - Client Components (`'use client'`) handle interactive UI state, Framer Motion animations, forms, and browser-only APIs.
- **Theme Engine**: Styled with Tailwind CSS variable tokens (`bg-cream`, `text-ink`, `bg-accent`). Hardcoded hex values are strictly forbidden.

### 2. Feature Modules Layer (`src/features/`)
- Each business domain resides in an isolated directory:
  - `auth/`: Login widgets, OTP SMS flow, session management.
  - `quiz/`: Diagnostic questionnaire, scoring engine, course recommendation.
  - `lms/`: Cabinet dashboard, video player state, homework submission & drip rules.
  - `crm/`: Admin leads Kanban pipeline, cohort management, grading queue.
  - `payments/`: Webhook receivers for Payme & Click, transaction verification, invoice generator.
- Cross-module dependencies are kept minimal and routed through shared lib adapters or database contracts.

### 3. Validation & Infrastructure Adapters (`src/lib/`)
- **Zod Validations**: All API inputs, Server Action payloads, and form submissions pass through strict Zod schemas (`src/lib/validations/`).
- **Provider Adapters**:
  - `sms/`: Eskiz.uz SMS Gateway adapter (with mock fallback for dev/testing).
  - `telegram/`: Telegraf bot notification dispatcher & webhook receiver.
  - `email/`: Resend email client with HTML templates.
  - `certificates/`: PDF certificate rendering engine (`pdf-lib`).

### 4. Data Access Layer (`src/db/`)
- **Drizzle ORM**: Fully type-safe query builder targeting PostgreSQL.
- **Schema Single Source of Truth**: Defined in `src/db/schema.ts` with strict Enums, foreign keys, and indexes.
- **Seeding & Migrations**: Managed via `drizzle-kit` (`npm run db:generate`, `npm run db:migrate`, `npm run db:seed`).

---

## 🔄 DATA FLOW PATTERN

1. **Request Reception**: User triggers a UI action or external webhook sends an HTTP POST request to `src/app/api/` or a Server Action.
2. **Input Validation**: Request payload is parsed against a Zod schema in `src/lib/validations/`. If invalid, standard HTTP 400 JSON or form error is returned immediately.
3. **Domain Processing**: The feature handler (`src/features/[feature]/`) executes business logic (e.g. drip unlock calculation, lead scoring, payment state transition).
4. **Data Persistence**: Database mutations are executed using Drizzle ORM queries against PostgreSQL.
5. **Notification & Side Effects**: Out-of-band events (Telegram notifications, SMS OTP send, email receipt) are dispatched via service adapters.
6. **Response Rendering**: Result is returned as typed JSON response, or UI state is revalidated via Server Components / `revalidatePath`.

---

## 🌐 RUNTIME BOUNDARIES & COMPATIBILITY

| Runtime Target | Route Scope | Allowed APIs | Prohibited APIs |
| :--- | :--- | :--- | :--- |
| **Edge Runtime** (`export const runtime = 'edge'`) | Middleware (`src/middleware.ts`), lightweight API routes | Web Fetch API, `Request`/`Response`, Web Crypto, standard JS | Node.js native modules (`fs`, `net`, `child_process`, `tls`), native C bindings |
| **Node.js Server Runtime** (default) | Heavy API routes, PDF generation, Database connection pools, MCP server | Full Node.js standard library, Drizzle ORM, `pdf-lib`, `telegraf` | Browser DOM APIs |

---

## 🤖 MODEL CONTEXT PROTOCOL (MCP) INTEGRATION

The system includes a native MCP server (`mcp-server/index.ts`) running on `@modelcontextprotocol/sdk`. It exposes native tools to AI agents for:
- Querying CRM leads, cohorts, and grading queues.
- Reading LMS course structures and student progress.
- Managing system configuration and audit logs.
