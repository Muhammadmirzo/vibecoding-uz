# W4B — W1A audit fixes

- **Branch:** `wave/w4b-fixes`
- **Scope:** Remaining W1A P0/P1/P2 findings not owned by W3A or W4A.
- **W3A/W4A-owned findings:** A-009, A-022, A-023, A-024, A-025, A-026, A-029 — intentionally not changed.

## Finding status

| Finding ID | Status | Commit/file |
|---|---|---|
| A-001 | already fixed by W2 | `docs/waves/reports/W2-TELEGRAM.md`; Telegram deep-link signup/login |
| A-002 | already fixed by W2 | `docs/waves/reports/W2-TELEGRAM.md`; owned-contact registration path |
| A-003 | fixed | `fix(admin): remove provider secrets from settings`; `src/features/crm/server/admin.service.ts`, `src/lib/validations/admin.ts`, `src/features/crm/components/settings/IntegrationsTab.tsx` |
| A-004 | fixed | `fix(resilience): map database outages to retryable responses`; `src/lib/http/errors.ts`, `src/app/api/me/*` consumers |
| A-005 | fixed | `fix(security): use nonce CSP without unsafe script sources`; `src/lib/security/headers.ts`, `src/middleware.ts`, `next.config.mjs` |
| A-006 | fixed | `fix(seo): centralize guarantee policy`; `src/features/crm/server/admin.service.ts`, `src/features/crm/components/settings/PricingGuaranteeTabs.tsx` |
| A-007 | fixed | `fix(conversion): resume course checkout after auth`; `src/app/kurs/CourseCheckoutCard.tsx`, `src/context/AuthContext.tsx` |
| A-008 | fixed | `fix(resilience): time-bound and explain lead capture failures`; `src/features/leads/ui/LeadCaptureForm.tsx`, `src/lib/http/fetch.ts` |
| A-009 | already owned by W3A | skipped per parallelism note |
| A-010 | already fixed by W1B | `docs/waves/reports/W1B-BRAND.md` |
| A-011 | fixed | `fix(seo): add route canonical metadata and schema builders`; `src/lib/seo.ts`, course/blog pages |
| A-012 | fixed | `fix(seo): stabilize sitemap dates and canonical host`; `src/app/sitemap.ts`, `src/app/robots.ts` |
| A-013 | already fixed by W2 | registration-aware auth copy in W2 |
| A-014 | fixed | `fix(ux): replace disabled homework dead end with mentor handoff`; `src/features/lms/components/LessonPlayerView.tsx` |
| A-015 | fixed | `fix(ux): label activity reminder as local draft signal`; Activity components |
| A-016 | fixed | `fix(security): require Redis in production and normalize client IP`; `src/lib/security/rateLimit/index.ts` |
| A-017 | fixed | `fix(security): narrow CSP image and frame sources`; `src/lib/security/headers.ts` |
| A-018 | fixed | `fix(resilience): bound Telegram and email provider calls`; `src/lib/http/fetch.ts`, Telegram/email adapters |
| A-019 | fixed | `fix(copy): remove unverified 24-hour lead SLA`; `src/app/bepul-dars/*` |
| A-020 | fixed | `fix(copy): mark unverified expert profiles as examples`; `src/app/ekspertlar/page.tsx` |
| A-021 | already fixed by W1B | brand/copy normalization in W1B report |
| A-022 | already owned by W3A | skipped per parallelism note |
| A-023 | already owned by W4A | skipped per parallelism note |
| A-024 | already owned by W4A | skipped per parallelism note |
| A-025 | already owned by W4A | skipped per parallelism note |
| A-026 | already owned by W4A | skipped per parallelism note |
| A-027 | fixed | `fix(seo): use BRAND URL across SEO surfaces`; `src/config/brand.ts`, `src/lib/seo.ts`, sitemap/robots |
| A-028 | fixed | `fix(seo): centralize safe JSON-LD builders and course offer`; `src/lib/seo.ts` |
| A-029 | already owned by W4A | skipped per parallelism note |
| A-030 | fixed | `fix(ux): expose job application receipt and remove SLA claim`; jobs route, validation, form and modal |

## Antifragility changes

- Database connectivity failures are normalized centrally to a `503`, `retryable: true` response with an Uzbek recovery message. Production now fails closed without `DATABASE_URL`; database transactions no longer fall back to a null executor.
- `fetchWithTimeout()` gives Telegram, Resend, Redis-adjacent provider calls, and user-facing lead/job requests bounded deadlines where changed. Telegram/operator handoff now reports delivery failure instead of claiming a message was sent.
- Missing production email configuration returns failure rather than a mock success. Telegram dynamic HTML is escaped and the canonical `BRAND.url` is used.
- Production rate limiting requires Upstash Redis; raw `x-forwarded-for` is not trusted in production.
- Admin settings ignore legacy secret rows, never return secret values, and expose only `sozlangan / sozlanmagan` status. Provider secrets remain environment-managed.

## Verification

- `npx tsc --noEmit` — pass.
- `npx vitest run` — pass: **63 files, 494 passed, 1 skipped**.
- `npm run build` — pass: **89 routes generated**.
- New regression coverage: `src/__tests__/w4b-hardening.test.ts` covers nonce CSP, DB outage envelope, secret redaction/status, and canonical/JSON-LD serialization.
- Playwright responsive suite was not rerun in this wave; no W3A-owned visual files were changed.

## Risks / follow-up

- Apply the W2 Telegram database migrations after the database is restored.
- Configure and rotate provider credentials in the deployment environment. Historical credentials exposed through the old admin settings surface should be rotated by the owner.
- Course checkout still redirects to the existing cabinet payment screen after auth; a full cart/intent persistence workflow remains a future enhancement.
- The admin activity control is now explicitly a local draft signal; a real queued delivery workflow remains future work.
