# W3-APP — Logged-in product UI

## Changed

### Student cabinet and LMS UI

- `src/app/kabinet/page.tsx`: real-data dashboard shell, parallel `/api/me` and `/api/me/payments` loading, honest enrollment/empty/error states, and quick navigation.
- `src/app/kabinet/to-lovlar/page.tsx`, `PaymentSummaryCard.tsx`, `PaymentHistorySection.tsx`, `ReceiptsTable.tsx`: responsive payment summary/history, phone-card receipt layout, live status/error feedback, preserved checkout request/redirect contract.
- `src/app/kabinet/sozlamalar/page.tsx`: accessible responsive tabs with linked panels and keyboard navigation.
- `src/app/kabinet/baholar/page.tsx`: removed invented grade/demo content and replaced it with an honest empty state.
- `src/app/kabinet/referral/page.tsx`: modern referral composition while preserving the LMS hook contract.
- `src/features/lms/components/KabinetNav.tsx`: desktop `lg+` sidebar, phone bottom tabs, and iPad/mobile Radix drawer with safe-area and viewport handling.
- `src/features/lms/components/KabinetPage.tsx`: new shared page header, skeleton, and empty/error state helpers.
- `src/features/lms/components/LessonPlayerView.tsx`, `video/VideoPlayer.tsx`, `video/PlayerControls.tsx`, `video/ProgressBar.tsx`: responsive course player, keyboard-accessible tabs, 44px controls, labeled seek/speed controls, live copy feedback, and safe narrow-screen layout.
- `src/features/lms/components/settings/*`: accessible profile, credentials, and notification forms; pending/success/error states; browser-local notification behavior is now explicit.
- `src/features/lms/components/referral/*`: responsive stats/history/link UI, viewport-safe accessible payout dialog, and preserved referral API behavior.
- `src/app/kabinet/sertifikat/**` was excluded and was not edited by W3-APP.

### Admin and CRM UI

- `src/app/admin/layout.tsx`, `page.tsx`, `login/page.tsx`: responsive admin shell and overview; fixed mobile login focus/error handling and semantic controls.
- `src/features/crm/components/AdminNav.tsx`: desktop sidebar plus safe-area-aware mobile/iPad drawer.
- `src/features/crm/components/LeadsKanban.tsx`, `Leads/**`: responsive kanban with preserved drag/drop, optimistic status updates, touch/keyboard status selector, and accessible lead dialog.
- `src/features/crm/components/Activity/**`, `Users/**`, `Blogs/**`, `Homework/**`, `Cohorts/**`, `Portfolios/**`, `Notifications/**`, `Analytics/**`, and manager entry components: phone-card/desktop-table layouts, semantic states, responsive dialogs/forms, status badges, and mobile-safe actions.
- `src/features/crm/components/Portfolios/PortfolioTable.tsx`, `PortfolioFormModal.tsx`: `next/image` replaces raw `<img>` with explicit dimensions and `sizes`.
- `src/features/crm/components/Portfolios/usePortfolioFilters.ts`: extracted portfolio filter orchestration.
- `src/features/crm/components/Cohorts/CohortModal.tsx`: formatted accessible Radix dialog using shared form primitives; original payload and validation contract preserved.
- `src/features/crm/components/settings/*`: JSON requests now use `Content-Type: application/json`; sensitive controls remain separate and no API contract was changed.
- Student activity reminder behavior is labeled as local-only because no reminder endpoint exists.

### Auth UI

- `src/features/auth/components/AuthModal.tsx`: responsive Radix dialog, viewport gutters, internal scrolling, safe-area padding, semantic status/error feedback, and 44px close target.
- `src/features/auth/components/LoginForm.tsx`: shared form primitives, phone autocomplete/input mode, accessible error/helper associations, and preserved normalized `+998` login call.
- `src/features/auth/components/OtpForm.tsx`: fieldset/legend semantics, one-time-code autocomplete, paste and arrow-key handling, duplicate-submit guard, accessible error/status behavior, and 44px controls.
- `src/features/auth/components/TelegramLoginButton.tsx`: Telegram widget cleanup safety, loading/error/success states, and unchanged `/api/auth/telegram` payload/response contract.

## Standards applied

- Samarkand Modern semantic tokens and `src/components/ui` primitives only in W3 code.
- No `cream`, `accent-line`, `likely`, hardcoded hex/RGB, raw palette classes, raw `<img>`, or explicit `any` in the assigned scope.
- Server components remain the default; client boundaries are limited to navigation, forms, dialogs, filters, and media controls.
- Responsive source audit covers 375, 390/430, 768, 1024, 1280, and 1440px: phone cards, tablet drawers/two-column grids, desktop sidebars/tables, safe-area insets, and content padding for sticky bars.
- Interactive controls use visible focus, semantic labels, keyboard alternatives, and minimum 44px touch targets.
- All scoped TypeScript/TSX files are 250 lines or fewer.
- Uzbek Latin copy is used; unavailable data is represented by honest empty states rather than invented metrics, reviews, grades, or reminders.

## Verification

- `npx tsc --noEmit` — PASS.
- `npx vitest run` — PASS: 33 files, 329 passed, 1 skipped (330 total).
- `git diff --check` — PASS.
- Scoped token/primitive/raw-image/type/file-size audit — PASS.
- No build or dev server was run, per MASTER_PLAN section 6.

## Left / risks

- A live browser screenshot pass was not run because starting `next dev` is prohibited by the wave rules; responsive behavior was verified by source audit and the implementation was designed against all required viewport widths.
- Vitest prints a non-blocking warning that `vitest.config.ts` uses CommonJS-loaded ESM syntax; tests still pass.
- Concurrent W2-BIZ work updated the repository and created commit `6398405` while W3-APP was in progress. W3-APP did not create that commit; the final state was rechecked after it landed.
- Certificate UI remains outside W3-APP ownership and still requires its owning agent's independent verification.
