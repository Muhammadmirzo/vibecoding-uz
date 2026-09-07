# API Specifications, Webhooks & Auth Boundaries

This document provides a reference for public APIs, internal Server Actions, payment provider webhooks, validation schemas, and security boundaries.

---

## 🔒 AUTHENTICATION & SECURITY BOUNDARIES

- **Authentication Tokens**: HTTP-Only JWT cookies or Authorization header (`Bearer <token>`).
- **Middleware Guard**: `src/middleware.ts` intercepts incoming requests:
  - Unauthenticated users attempting to reach `/kabinet/*` or `/admin/*` are redirected to `/diagnostika` or login modal.
  - Admin endpoints under `/api/admin/*` require roles `superadmin`, `admin`, or `manager`.
- **Validation Strictness**: All request bodies, path params, and query strings MUST be validated using Zod schemas (`src/lib/validations/`). Raw un-sanitized input is prohibited.

---

## 🌐 PUBLIC REST ENDPOINTS & API ROUTE REGISTRY

### 1. Auth API (`/api/auth/`)
| Endpoint | Method | Zod Schema | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/send-otp` | `POST` | `sendOtpSchema` | Dispatch SMS OTP to Uzbek phone number (+998...) |
| `/api/auth/verify-otp` | `POST` | `verifyOtpSchema` | Verify OTP code and establish user session |
| `/api/auth/telegram` | `POST` | `telegramAuthSchema` | Authenticate via Telegram Login Widget hash verification |
| `/api/auth/me` | `GET` | — | Retrieve current authenticated user profile |
| `/api/auth/logout` | `POST` | — | Invalidate active session cookie |

### 2. Diagnostic Quiz API (`/api/quiz/`)
| Endpoint | Method | Zod Schema | Description |
| :--- | :--- | :--- | :--- |
| `/api/quiz/submit` | `POST` | `quizSubmitSchema` | Process completed diagnostic quiz, calculate recommended course, save CRM lead |

### 3. LMS Student API (`/api/kabinet/` / `/api/lms/`)
| Endpoint | Method | Zod Schema | Description |
| :--- | :--- | :--- | :--- |
| `/api/lms/progress` | `POST` | `lessonProgressSchema` | Record video playback position and lesson completion |
| `/api/lms/homework` | `POST` | `homeworkSubmitSchema` | Submit homework assignment (GitHub URL / attachments) |

### 4. Admin & CRM API (`/api/admin/`)
| Endpoint | Method | Zod Schema | Description |
| :--- | :--- | :--- | :--- |
| `/api/admin/leads` | `GET` / `PATCH` | `updateLeadSchema` | Kanban leads management & stage transitions |
| `/api/admin/homework/review` | `POST` | `homeworkReviewSchema` | Grade student homework submission with feedback |
| `/api/admin/cohorts` | `GET` / `POST` | `cohortSchema` | Manage cohort schedules, pricing, and limits |
| `/api/admin/analytics` | `GET` | — | Sales conversion rates & enrollment metrics |

---

## 💳 PAYMENT WEBHOOK SPECIFICATIONS

Payment providers communicate via dedicated webhook routes using provider-specific transaction protocols:

### 1. Payme Webhook (`/api/payments/payme`)
- **Protocol**: JSON-RPC 2.0 over HTTP POST with Basic Auth header.
- **Supported Methods**:
  - `CheckPerformTransaction`: Verify account eligibility & amount.
  - `CreateTransaction`: Lock transaction state (`pending`).
  - `PerformTransaction`: Complete payment (`paid`), trigger student enrollment.
  - `CancelTransaction`: Cancel or refund transaction (`failed` / `refunded`).
  - `CheckTransaction`: Query current transaction status.

### 2. Click Webhook (`/api/payments/click`)
- **Protocol**: Form POST / JSON payload with MD5 digest signature verification (`click_trans_id`, `service_id`, `secret_key`).
- **Supported Actions**:
  - `Prepare` (`action = 0`): Verify user identity and order amount.
  - `Complete` (`action = 1`): Confirm payment completion and grant course access.

---

## 📜 ZOD VALIDATION SCHEMAS REGISTRY

Located under `src/lib/validations/`:

- `auth.ts`: `sendOtpSchema`, `verifyOtpSchema`, `telegramAuthSchema`.
- `crm.ts`: `leadSchema`, `updateLeadStatusSchema`, `cohortSchema`.
- `student.ts`: `homeworkSubmitSchema`, `profileUpdateSchema`.
- `admin.ts`: `homeworkReviewSchema`, `broadcastNotificationSchema`.
- `jobs.ts`: `jobApplicationSchema`.
- `mcp.ts`: `mcpQuerySchema`, `mcpActionSchema`.
