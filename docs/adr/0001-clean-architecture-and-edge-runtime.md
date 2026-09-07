# ADR 0001: Clean Architecture and Edge Runtime Compatibility

- **Status**: Accepted
- **Date**: 2026-09-08
- **Authors**: Core Engineering Team & AI System Architect

---

## 🎯 CONTEXT & PROBLEM STATEMENT

The Vibecoding Platform requires a scalable, token-efficient, and maintainable codebase. As the application grows to support diagnostic quizzes, LMS video streaming, admin CRM pipelines, and payment processing (Payme & Click), monolithic codebase scanning by AI coding agents leads to massive context pollution, high token usage, and cross-domain regressions. Furthermore, middleware and edge routing require strict runtime isolation.

---

## 💡 DECISION DRIVERS

1. **Token preservation for AI agents**: AI coding assistants (Claude Code, Cursor, DeepSeek, AGY) need strict domain boundaries to load only relevant code chunks.
2. **High cohesion & low coupling**: Each feature (auth, quiz, lms, crm, payments) must encapsulate its logic, components, state, and types.
3. **Edge Runtime safety**: Edge middleware and routes must execute fast without crashing due to incompatible Node.js native binary imports (`fs`, `net`, `child_process`).
4. **Strict schema validation**: Single source of truth for input validation via Zod.

---

## 🚀 DECISION

We adopt a **Modular Clean Architecture** paired with **Strict Edge Runtime Separation**:

1. **Feature Directory Structure (`src/features/[feature_name]/`)**:
   - All feature-specific components, hooks, utilities, and state handlers must live inside their respective feature folder.
   - Global components stay in `src/components/`, database schemas in `src/db/`, and validation contracts in `src/lib/validations/`.

2. **Edge vs Node.js Server Boundaries**:
   - Middleware (`src/middleware.ts`) and lightweight edge routes marked with `export const runtime = 'edge'` MUST rely exclusively on standard Web APIs (`fetch`, `Request`, `Response`, `Web Crypto`).
   - Heavy server tasks (Drizzle ORM, PDF certificate rendering, Telegram Telegraf bot) remain in standard Node.js server runtime routes.

3. **Single Documentation Source of Truth**:
   - `AGENTS.md` and `docs/context/index.md` serve as canonical pointers. `CLAUDE.md` and `.cursorrules` act as concise pointers to prevent text duplication.

---

## 📈 CONSEQUENCES

### Positive
- **Reduced Token Overhead**: AI agents load 80%+ fewer tokens per prompt by focusing on isolated feature modules.
- **Runtime Safety**: No Edge runtime crashes caused by accidental Node.js native module imports.
- **Maintainability**: Clear ownership of features, easier refactoring, and deterministic testing.

### Negative / Trade-offs
- Requires discipline to prevent cross-feature direct imports.
- Dual runtime awareness needed when writing utility helpers (checking Web API vs Node.js compatibility).
