# Payments Feature Module (`src/features/payments/`)

The **Payments Feature** module handles payment integrations with Uzbek payment providers (Payme & Click), transaction state handling, manual payment invoice generation, and refund workflows.

---

## 📁 DIRECTORY STRUCTURE & FILES

```
src/features/payments/
├── README.md               # Module architecture & developer guidelines (this file)
├── payme.ts                # Payme JSON-RPC 2.0 protocol handler & signature validator
└── click.ts                # Click merchant API webhook processor & MD5 digest validator
```

---

## 🛠️ KEY DEPENDENCIES & CONTRACTS

- **API Routes**:
  - `POST /api/payments/payme`: Handles Payme JSON-RPC calls (`CheckPerformTransaction`, `CreateTransaction`, `PerformTransaction`, `CancelTransaction`).
  - `POST /api/payments/click`: Handles Click merchant prepare & complete actions.
- **Validations**: `src/lib/validations/payments.ts` (or `admin.ts`).
- **Database Tables**: `payments`, `enrollments`, `users`, `cohorts` (`src/db/schema.ts`).
- **Idempotency & Security**: Payment handlers MUST verify provider secret tokens / signatures and handle retry requests idempotently.

---

## 🛑 SCOPING DIRECTIVE FOR AI AGENTS

When modifying Payme/Click webhook handlers or payment state processing, restrict context strictly to `src/features/payments/`.
