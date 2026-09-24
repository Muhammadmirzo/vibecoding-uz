# Coder Agent Rules — VibeCoding.uz

Rules every coding agent (opencode, Claude Code, Codex, etc.) must follow in this repo.
Read this file, `docs/redesign/MASTER_PLAN.md` and `docs/design-system.md` before writing any code.

---

## 1. Before you start
1. Read the task fully. Know your **scope** (which folders you may edit). Never edit outside it — write "out of scope" notes in your report instead.
2. Read the existing code you will change **before** changing it. Match its style.
3. Check `docs/redesign/reports/` for notes other agents left for you.

## 2. Architecture (backend)
Each feature lives in `src/features/<feature>/`:

| Folder | Contains | Rules |
| :--- | :--- | :--- |
| `domain/` | types, Zod schemas, pure business rules | No I/O, no DB, no fetch. 100% unit-tested. |
| `server/*.repository.ts` | Drizzle queries | The **only** place that imports `@/db`. |
| `server/*.service.ts` | use cases | Transactions for every multi-write. Throws `ServiceError`. |
| `actions.ts` | Server Actions | Thin: Zod parse → auth → service. |
| `ui/` | React components | No business logic, no DB. |

- Route handlers (`src/app/api/**`) are thin: **Zod parse → auth check → service → `errorResponse()`** (`src/lib/http/errors.ts`).
- Auth is checked **inside** every admin/protected handler and page, not just in middleware.
- Money is stored in integers (tiyin). Never trust amounts, prices, scores, or roles sent by the client — recompute on the server.
- Payments, refunds and payouts must be **idempotent**.
- Schema change → `npm run db:generate` only. **Never** run `db:migrate` / `db:push` against a real database.

## 3. TypeScript & validation
- No `any`. No `as` casts on external data — parse it with Zod.
- Zod on every boundary: request body, query, params, webhook payload, env vars, API responses used by the client.
- Files ≤ 250 lines. One component / one responsibility per file.

## 4. UI & design
- Use **only** the design tokens (`bg`, `ink`, `brand`, `accent`, `gold`, `border`, …) and primitives from `src/components/ui`. No hex colors, no `bg-[#…]`, no inline styles (except dynamic widths).
- Server components by default. `"use client"` only for interactive islands.
- Images: `next/image` with `sizes`. Headings: one `h1` per page, `text-balance`.
- Every page ends with a next step (`NextStepCTA`) — no dead ends. Main CTA = gold "Bepul diagnostika".
- Copy in natural Uzbek Latin. **Honesty rule:** never invent numbers, reviews, students, or logos.

## 5. Responsive (mandatory)
Must look polished at **375, 390, 768, 1024, 1280, 1440px**:
- Mobile-first Tailwind. No horizontal scroll (fix the cause, don't hide it with `overflow-hidden`).
- Touch targets ≥ 44px. Body text ≥ 16px on phones.
- iPad: sensible 1 → 2 → 3 column grids; nav becomes a drawer below `lg`.
- Test hover **and** touch; respect `prefers-reduced-motion`.

## 6. Security
- Never commit or print secrets. Never edit `.env*`.
- Rate-limit auth, OTP, lead and application endpoints. Use `crypto` for tokens/OTP, never `Math.random`.
- Verify webhook signatures/secrets (Payme, Click, Telegram). Fail closed when a secret is missing.
- No `dangerouslySetInnerHTML` without sanitizing.

## 7. Process safety (learned the hard way)
- **Never use `pkill -f <pattern>`** — it can match and kill your own agent process. Stop servers with `kill $(lsof -t -i:<port>)`.
- **Run commands in the foreground and wait.** Don't background a long command and exit.
- **Don't spawn sub-agents that outlive you.** Finish all work before you exit.
- Don't run `npm run build` or `next dev` while other agents are working (shared `.next` folder) unless your task says you own the dev server.
- Don't commit, push, deploy, or install packages unless the task explicitly says so.

## 8. Definition of done
All of these must pass before you say "done":
```bash
npx tsc --noEmit        # zero errors
npx vitest run          # all green; new logic has new tests
npx playwright test e2e/responsive.spec.ts   # UI tasks only
```
Then write `docs/redesign/reports/<TASK-NAME>.md`: **what changed** (file list), **how you verified it**, **what's left / risks**. Report failures honestly — never claim something passes if you didn't run it.
