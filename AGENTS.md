# AGENTS.md — AI Agent Guidance & Architectural Rulebook

Welcome AI Agent (Claude Code, Cursor, DeepSeek, Z.ai, OpenRouter, AGY)!
This document serves as your **authoritative architectural map**, **token-sparing context rulebook**, and **engineering guidelines document**.

---

## 🛑 STRICT RULES FOR AI AGENTS

1. **DO NOT READ THE ENTIRE REPOSITORY**:
   - Never scan or read unrelated folders or full source trees.
   - Restrict file reading strictly to the target feature folder being modified.

2. **Feature-First Scoping**:
   - Work exclusively within module boundaries: `src/features/[feature_name]/`.
   - Refer to [docs/context/index.md](docs/context/index.md) for module mappings.

3. **Theme Tokens Only (No Hardcoded Colors)**:
   - Never hardcode custom hex or RGB colors (e.g. `bg-[#f9f8f6]`, `text-[#1a1a1a]`).
   - Use Tailwind theme tokens: `bg-cream`, `bg-cream-warm`, `bg-cream-deep`, `text-ink`, `text-ink-muted`, `text-ink-subtle`, `bg-accent`, `text-accent`, `border-accent-line`.

4. **TypeScript & Zod Strictness**:
   - Never use `any` or untyped signatures.
   - All API endpoints, Server Actions, and inputs **MUST** be validated using Zod schemas in `src/lib/validations/`.
   - Export and reuse inferred TypeScript types via `z.infer<typeof schema>`.

5. **Edge Runtime Compatibility**:
   - API routes/middleware using `export const runtime = 'edge'` must stick to Web Standard APIs (`fetch`, `Request`, `Response`, Web Crypto).
   - Do NOT import Node.js native modules (`fs`, `net`, `child_process`) in Edge routes.

---

## 🛠️ TECH STACK MATRIX

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | `^15.1.7` | App Router, Server Components, Server Actions, API routes |
| **React & React DOM** | `^18.3.1` | UI Library & DOM renderer |
| **TypeScript** | `^5.6.3` | Strict type safety across application layer |
| **Tailwind CSS** | `^3.4.14` | Utility styling with custom CSS variable theme system |
| **Drizzle ORM** | `^0.36.0` | Type-safe SQL ORM for PostgreSQL |
| **Drizzle Kit** | `^0.28.0` | Database schema migrations & inspection CLI |
| **PostgreSQL Drivers** | `postgres ^3.4.5` / `pg ^8.13.1` | Database connection adapters |
| **Zod** | `^3.23.8` | Universal schema declaration and runtime validation |
| **Framer Motion** | `^11.11.11` | Accessible UI animations & page transitions |
| **Radix UI Primitives** | `^1.1.0` - `^1.2.1` | Accessible unstyled primitives (Dialog, Tabs, Accordion, Dropdown) |
| **MCP SDK** | `^1.0.1` | Native Model Context Protocol server tools integration |
| **Telegraf** | `^4.16.3` | Telegram Bot API integration for Uzbek user notifications |
| **pdf-lib** | `^1.17.1` | PDF generation engine for certificates & payment receipts |
| **Vitest** | `^5.0.0` | High-speed unit & integration test runner |
| **Playwright** | `^1.63.0` | End-to-end (E2E) browser testing framework |

---

## ⚡ QUICK COMMAND MATRIX

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Next.js local development server (http://localhost:3000) |
| `npm run build` | Next.js production build verification |
| `npm run lint` | Run Next.js / ESLint code analysis |
| `npm run test` | Run Vitest unit & integration test suite |
| `npx tsc --noEmit` | Run strict TypeScript type check without emitting output |
| `npm run db:generate` | Generate Drizzle ORM PostgreSQL migrations |
| `npm run db:migrate` | Apply Drizzle ORM migrations to target database |
| `npm run db:seed` | Seed PostgreSQL with realistic Uzbek test data |
| `npm run mcp:start` | Launch MCP (Model Context Protocol) server via `tsx mcp-server/index.ts` |

---

## 🚀 DEPLOYMENT & ENVIRONMENT (VERIFIED 2026-09-09)

> Canonical facts — do not guess or re-discover. Verified working as of 2026-09-09.

### Vercel
- **Canonical production project**: `master-2` (the empty `vibecoding-uz` duplicate was DELETED 2026-09-09 — never link to it).
- **Link local clone**: `vercel link --yes --project master-2`
- **Pull environment variables** (all stored as Config, pullable): `vercel env pull .env`
- **Production URL**: https://master-2-jade.vercel.app
- **Deploy procedure**: commit on `main` → `git push origin main` → `git push origin main:master` (keep `main` and `master` synced; Vercel production follows the GitHub integration).
- **Pre-deploy gate (mandatory)**: `npm run build` AND `npx vitest run` must pass before every push.

### Supabase (PostgreSQL)
- **App database project ref**: `gvfzomtdswzlxstjvwiv` (pooler `aws-0-ap-southeast-2`, port `6543`).
- `DATABASE_URL` is a **required** env var (`src/db/index.ts` throws without it — no fallback by design).
- Get it via `vercel env pull .env` after linking — do NOT ask the user to paste secrets and NEVER commit them.
- Schema changes: `npm run db:generate` → review → `npm run db:migrate` (target the Supabase `DATABASE_URL`).

### Secrets policy
- `.env`, `.env*.local`, `.vercel/` are gitignored. Never hardcode credentials in source (a leaked DB password previously lived in `src/db/index.ts` and git history — see WEBSITE_AUDIT_SPEC.md).
- Known stale artifact: `~/.supabase-db-password.txt` on the owner's machine holds an OLD password; the live credential is only in Supabase/Vercel.

### Next.js 15 App Router conventions
- Dynamic route `params` is a Promise: `{ params: Promise<{ id: string }> }` + `await params`.

---

## 📁 MODULAR FEATURE SCOPING GUIDELINES

When completing tasks, navigate directly to the target module directory:

- `src/features/auth/` -> Telegram login widgets, OTP SMS handlers, JWT sessions, auth guards.
- `src/features/quiz/` -> Diagnostic quiz flow state machine, questions, lead scoring & recommendation logic.
- `src/features/lms/` -> Student cabinet, lesson video player, homework submissions, drip release engine.
- `src/features/crm/` -> Admin leads pipeline, cohort manager, homework grading queue, analytics dashboard.
- `src/features/payments/` -> Payme & Click webhook processors, manual billing invoices, refund workflows.
- `src/features/jobs/` -> IT job board, candidate application submission & parsing.
- `src/features/blog/` & `src/features/testimonials/` -> Marketing articles & student success stories.
- `src/db/` -> Drizzle ORM schema (`schema.ts`), connection client (`index.ts`), seeder (`seed.ts`).
- `mcp-server/` -> Native Model Context Protocol tools (`index.ts`).

For comprehensive architecture details, see [docs/context/index.md](docs/context/index.md).
