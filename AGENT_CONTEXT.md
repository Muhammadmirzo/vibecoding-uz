# AGENT_CONTEXT.md — Token Optimization & Architectural Blueprint

Welcome AI Agent (Claude Code, Cursor, DeepSeek, OpenRouter, Gemini, AGY)!
This document serves as your **primary system architecture map**, **token-optimization rulebook**, and **engineering guidelines document**. Adhering to these rules guarantees high code quality while dramatically cutting token consumption during prompt execution.

---

## 🛑 TOKEN OPTIMIZATION & CONTEXT SCOPING RULES

To keep context windows small, execution fast, and API costs minimal, all AI agents **MUST** abide by the following token-sparing protocols:

1. **NEVER SCAN OR READ THE ENTIRE REPOSITORY**:
   - Do NOT run recursive directory reads or open files indiscriminately across the repository.
   - Work strictly within the designated feature directory corresponding to the task.

2. **FEATURE-FIRST CONTEXT BOUNDARIES**:
   - `src/features/quiz/` → Diagnostic quiz logic, flow state, questions, scoring, lead capture.
   - `src/features/lms/` → Student cabinet, video player, homework submissions, drip release engine, certificates.
   - `src/features/crm/` → Admin leads pipeline, cohort management, homework grading queue, analytics dashboards.
   - `src/features/payments/` → Payme & Click webhook handlers, manual invoice generator, refund workflows.
   - `src/features/auth/` → Telegram authentication widgets, JWT session cookies, RBAC guards.
   - `src/features/jobs/` → Job board, application submission, resume parsing integration.
   - `src/db/` → Drizzle ORM PostgreSQL schema (`schema.ts`), connection client (`index.ts`), seeder (`seed.ts`).
   - `mcp-server/` → Native Model Context Protocol tools (`index.ts`).

3. **TARGETED SYMBOL DEFINITION LOOKUPS**:
   - Only load `src/db/schema.ts` when modifying database models or writing queries.
   - Only load `src/lib/validations/` when creating or modifying validation schemas for API routes.
   - Do not re-read files that have already been retrieved in previous turns unless file modifications need verification.

---

## 🛠️ TECHNOLOGY STACK & VERSION MATRIX

| Technology | Version | Description / Purpose |
| :--- | :--- | :--- |
| **Next.js** | `^15.1.7` | Framework for App Router, Server Components, Server Actions, API routes |
| **React** | `^18.3.1` | UI Library |
| **React DOM** | `^18.3.1` | DOM Renderer for React |
| **TypeScript** | `^5.6.3` | Type system (Strict mode enabled) |
| **Tailwind CSS** | `^3.4.14` | Styling framework with custom CSS variable theme tokens |
| **Drizzle ORM** | `^0.36.0` | Type-safe SQL ORM for PostgreSQL |
| **Drizzle Kit** | `^0.28.0` | Database schema migrations & inspection CLI |
| **postgres / pg** | `^3.4.5` / `^8.13.1` | PostgreSQL database drivers |
| **Zod** | `^3.23.8` | Schema declaration and validation library |
| **Framer Motion** | `^11.11.11` | React animation engine |
| **Radix UI Primitives** | `^1.1.0` – `^1.2.1` | Unstyled accessible primitives (Accordion, Dialog, Tabs, Dropdown) |
| **MCP SDK** | `^1.0.1` | `@modelcontextprotocol/sdk` Native MCP tools integration |
| **Telegraf** | `^4.16.3` | Telegram Bot framework for Uzbek user notifications |
| **pdf-lib** | `^1.17.1` | PDF generation library for certificates and invoices |
| **Vitest** | `^5.0.0` | Unit & integration testing framework |
| **Playwright** | `^1.63.0` | End-to-End (E2E) browser testing framework |

---

## 🛑 STRICT ANTI-VIBE CODER RULES

### 1. Theme Tokens (No Hardcoded Hex/RGB Colors)
- **Forbidden**: `bg-[#f9f8f6]`, `text-[#1e1e1e]`, `border-[#dddddd]`, `bg-slate-900`, `text-gray-700`
- **Mandatory Semantic Tokens**:
  - **Cream Backgrounds**: `bg-cream` (default page bg), `bg-cream-warm` (cards), `bg-cream-deep` (borders/accents)
  - **Ink Text**: `text-ink` (primary body/headings), `text-ink-muted` (subtext), `text-ink-subtle` (captions)
  - **Accent Colors**: `bg-accent` (CTA buttons), `bg-accent-hover` (hover states), `bg-accent-soft` (badges), `border-accent-line` (decorative borders), `text-accent` (links)
  - **Typography**: `font-sans` (Onest variable sans), `font-serif` (Instrument Serif heading), `font-mono` (Geist Mono code)
  - **Borders & Shadows**: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `shadow-sm`, `shadow-md`, `shadow-lg`

### 2. TypeScript & Zod Strictness
- `any` is strictly prohibited in the codebase.
- All request parameters, query strings, request bodies, and server actions **MUST** be validated using Zod schemas located in `src/lib/validations/`.
- Infer TypeScript types using `z.infer<typeof Schema>` to keep validation logic as the single source of truth.

### 3. Edge Runtime Compatibility
- API routes or middleware marked with `export const runtime = 'edge'` MUST rely solely on standard Web APIs (`fetch`, `Request`, `Response`, `Web Crypto`).
- Do NOT import Node.js native libraries (`fs`, `net`, `child_process`, `crypto`) in Edge runtime routes.

### 4. Code Edits & Precision
- Use targeted chunk replacements when modifying code files.
- Preserve existing comments, docstrings, and tests unrelated to the target modification.

---

## 📂 SYSTEM SITEMAP & DIRECTORY MAP

```
.
├── AGENTS.md                  # Context rulebook for AI agents
├── AGENT_CONTEXT.md           # Token optimization & architecture blueprint (this document)
├── CLAUDE.md                  # Quick reference directives for Claude Code
├── .cursorrules               # Rules & prompts for Cursor IDE agent
├── next.config.mjs            # Next.js configuration
├── package.json               # Scripts, dependencies, and version matrix
├── tailwind.config.js         # Theme color tokens, fonts, radii, and shadows
├── vitest.config.ts           # Vitest unit test runner config
├── playwright.config.ts       # Playwright E2E runner config
├── docker-compose.yml         # Local dev environment (PostgreSQL 16)
├── mcp-server/                # Model Context Protocol Native Tools
│   └── index.ts               # MCP Server setup exposing LMS & CRM tools
└── src/
    ├── app/                   # Next.js App Router Routes
    │   ├── admin/             # CRM Admin Panel (Leads, Cohorts, Grading, Invoices)
    │   ├── api/               # API Endpoints (Payme, Click, Telegram, LMS, Quiz)
    │   ├── atamalar/          # Uzbek Tech Glossary
    │   ├── bepul-dars/        # Free Masterclass landing page
    │   ├── blog/              # Platform Blog articles
    │   ├── diagnostika/       # Diagnostic Quiz Page
    │   ├── ekspertlar/        # Experts / Instructors directory
    │   ├── ish/               # Job Board page
    │   ├── kabinet/           # Student LMS Cabinet (Lessons, Submissions, Certificates)
    │   ├── kurs/              # Course curriculum details page
    │   ├── meetlar/           # Live Q&A Meets schedule
    │   ├── maxfiylik/         # Privacy Policy
    │   ├── offerta/           # Public Offer / Service Terms
    │   ├── pul-qaytarish/     # Refund Policy
    │   ├── resurslar/         # Free Resources / Downloads
    │   ├── shahodatnoma/      # Public Certificate verification page
    │   ├── testimoniyalar/    # Student Testimonials page
    │   ├── globals.css        # CSS variables & Tailwind directives
    │   ├── layout.tsx         # Root Layout
    │   └── page.tsx           # Main Landing Page
    ├── components/            # Reusable React UI Components
    │   ├── layout/            # Header, Footer, Support Drawer, Nav
    │   ├── sections/          # Hero, Quiz Preview, Curriculum, Testimonials, Pricing
    │   └── ui/                # Buttons, Dialogs, Cards, Badges, Tabs
    ├── db/                    # Drizzle ORM Database Engine
    │   ├── index.ts           # Drizzle connection setup
    │   ├── schema.ts          # PostgreSQL Schema (Users, Cohorts, Homeworks, Payments, Leads)
    │   └── seed.ts            # Seeder script with Uzbek test data
    ├── features/              # Feature-First Core Modules
    │   ├── auth/              # Telegram auth, session management, route guards
    │   ├── blog/              # Blog posts logic & renderers
    │   ├── crm/               # Lead status workflow, cohorts, homework grading queue
    │   ├── jobs/              # IT job board listings & application handler
    │   ├── lms/               # Lesson player, video state, drip rules, homework submit
    │   ├── payments/          # Payme & Click webhook processors, invoice generator
    │   ├── quiz/              # Quiz flow engine, question state, score calculator
    │   └── testimonials/      # Student case studies & video reviews
    ├── lib/                   # Utility Libraries & Service Adapters
    │   ├── auth/              # JWT & session utilities
    │   ├── certificates/      # Certificate PDF renderer (pdf-lib)
    │   ├── email/             # Resend email templates & provider adapter
    │   ├── pricing.ts         # Course pricing & promo code calculation logic
    │   ├── refund.ts          # Automated refund eligibility logic
    │   ├── security/          # CSRF, rate limiters, input sanitizer
    │   ├── sms/               # Eskiz.uz Uzbek SMS Gateway adapter
    │   ├── telegram/          # Telegraf Bot adapter & notification dispatcher
    │   └── validations/       # Zod schemas (quiz, crm, lms, payments, auth)
    └── middleware.ts          # Next.js Middleware (Auth guards, edge routing)
```

---

## ⚡ QUICK REFERENCE COMMAND MATRIX

```bash
# 1. Start Local Development Server
npm run dev

# 2. Production Build Check
npm run build

# 3. Code Linting & Static Analysis
npm run lint

# 4. Run Unit & Integration Tests (Vitest)
npm run test
# OR directly:
npx vitest run

# 5. Database Schema Generation (Drizzle Kit)
npm run db:generate

# 6. Apply Database Migrations (Drizzle Kit)
npm run db:migrate

# 7. Seed Database with Uzbek Test Data
npm run db:seed

# 8. Start MCP Server (Model Context Protocol)
npm run mcp:start
```
