# CLAUDE.md — AI Agent Guidance & Context Pointer

> 🛑 **IMPORTANT**: This repository uses a centralized context rulebook to preserve tokens and enforce architectural discipline.

---

## 📌 Authoritative Documentation Pointers

1. **[AGENTS.md](AGENTS.md)**: Universal rules for AI agents, theme token mandates, TypeScript & Zod strictness, Tech Stack Matrix, Quick Command Reference, Deployment & Environment, and Feature Scoping Guidelines.
2. **[docs/context/index.md](docs/context/index.md)**: Comprehensive repository & module map pointer, architecture overview, domain models, API specifications, and operational procedures.
3. **[WEBSITE_AUDIT_SPEC.md](WEBSITE_AUDIT_SPEC.md)**: Verified audit status, tokenization rules, and known open issues.
5. **[docs/CODER_AGENT_RULES.md](docs/CODER_AGENT_RULES.md)**: Mandatory rules for every coder agent (architecture, design tokens, responsive, security, process safety, definition of done).
4. **[SARBON_ORCHESTRATION.md](SARBON_ORCHESTRATION.md)**: Multi-agent orchestration protocol (SARBON) — orchestrator rules, subagent roles, model matrix, dispatch templates, verification cycle. Also available as the `/sarbon` command.

---

## 📍 Current Status

**Owner says "boshlang", "boshla" or "davom et" → immediately follow [docs/waves/RESUME.md](docs/waves/RESUME.md) (no questions first). Live state: [docs/waves/STATE.md](docs/waves/STATE.md) → "Phase 2".**

**Background: [docs/HANDOFF_2026-09-24.md](docs/HANDOFF_2026-09-24.md) §0** — live state, blockers (Supabase DB down), Telegram bot (@Boyakagabot), and next steps. Owner speaks Uzbek — reply in Uzbek.

---

## 🚀 Deployment & Environment (quick facts, verified 2026-09-09)

- Vercel canonical project: `master-2` — link with `vercel link --yes --project master-2`, pull env with `vercel env pull .env`. Do NOT link to `vibecoding-uz` (deleted duplicate).
- Deploy: `git push origin main && git push origin main:master`. Gate: `npm run build` + `npx vitest run` must pass before every push.
- `DATABASE_URL` (Supabase, ref `gvfzomtdswzlxstjvwiv`) is required — never hardcode secrets, pull from Vercel.
- Full details in [AGENTS.md → Deployment & Environment](AGENTS.md).

---

## ⚡ Quick Command Reference

| Action | Command |
| :--- | :--- |
| **Dev Server** | `npm run dev` |
| **Production Build** | `npm run build` |
| **Type Check** | `npx tsc --noEmit` |
| **Run Tests** | `npm run test` |
| **Linting** | `npm run lint` |
| **DB Tools** | `npm run db:generate` \| `npm run db:migrate` \| `npm run db:seed` |
| **MCP Server** | `npm run mcp:start` |
