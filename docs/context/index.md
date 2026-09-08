# Documentation Context & Repository Index

Welcome to the Vibecoding Platform architecture & context documentation index. This directory (`docs/context/`) provides canonical reference documentation designed for both AI agents and human developers.

---

## 🎯 DOCUMENTATION SITEMAP

| Document | Description |
| :--- | :--- |
| [AGENTS.md](AGENTS.md) | Universal AI agent directives, token preservation rules, tech stack matrix & command reference |
| [architecture.md](docs/context/architecture.md) | System layers, data flow, Next.js App Router structure, Edge runtime boundaries |
| [domain.md](docs/context/domain.md) | Business entities, roles (RBAC), state machines, core domain invariants |
| [api.md](docs/context/api.md) | Public REST endpoints, Server Actions, Payme/Click webhooks, security & auth boundaries |
| [operations.md](docs/context/operations.md) | Environment setup, database migrations (Drizzle), caching, queueing, Docker & deployment |
| [ADR 0001](docs/adr/0001-clean-architecture-and-edge-runtime.md) | Architecture Decision Record: Modular Clean Architecture & Edge Runtime Compatibility |

---

## 📁 MODULE MAP & FEATURE REGISTRY

All core business logic is organized under feature-first modules in `src/features/`. AI agents and developers working on specific features should navigate directly to the respective module directory:

### Core Domain Features
- **[Auth Feature](src/features/auth/README.md)** (`src/features/auth/`): Telegram Login Widget, SMS OTP verification, JWT session tokens, and route protection guards.
- **[Quiz Feature](src/features/quiz/README.md)** (`src/features/quiz/`): Diagnostic quiz flow state machine, interactive Uzbek question sequence, scoring engine, and lead generation.
- **[LMS Feature](src/features/lms/README.md)** (`src/features/lms/`): Student learning cabinet, video lesson streaming player, homework submission flow, and drip content release engine.
- **[CRM Feature](src/features/crm/README.md)** (`src/features/crm/`): Admin leads Kanban pipeline, cohort management, homework grading queue, and sales analytics.
- **[Payments Feature](src/features/payments/README.md)** (`src/features/payments/`): Uzbek Payme & Click merchant payment webhooks, transaction verification, invoice generator, and refund handler.

### Additional Features & System Modules
- **Jobs Feature** (`src/features/jobs/`): Job listings board, candidate application modal, resume parsing integration.
- **Blog Feature** (`src/features/blog/`): Uzbek tech articles, SEO metadata, reading recommendations.
- **Testimonials Feature** (`src/features/testimonials/`): Verified student reviews, video testimonial player.
- **Database Engine** (`src/db/`): PostgreSQL schema (`schema.ts`), connection setup (`index.ts`), seeder (`seed.ts`).
- **Model Context Protocol** (`mcp-server/`): Native MCP tool server exposing LMS & CRM tools to AI assistants (`index.ts`).

---

## 🛑 CONTEXT SCOPING RULES FOR DEVELOPERS & AGENTS

1. **Feature Scoping**: Always restrict code inspections to the target feature folder (`src/features/[feature]/`).
2. **Schema & Validations**: Load global schemas (`src/db/schema.ts` or `src/lib/validations/`) only when verifying type contracts.
3. **No Hardcoded Theme Colors**: Use Tailwind variables (`bg-cream`, `text-ink`, `bg-accent`).
