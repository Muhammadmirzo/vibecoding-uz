# Auth Feature Module (`src/features/auth/`)

The **Auth Feature** module handles user identity, authentication widgets, SMS OTP verification, Telegram Login Widget integration, JWT session management, and route protection guards.

---

## 📁 DIRECTORY STRUCTURE & FILES

```
src/features/auth/
├── README.md               # Module architecture & developer guidelines (this file)
├── components/             # Auth UI components & modals
│   ├── AuthModal.tsx       # Universal login & registration modal trigger
│   ├── LoginForm.tsx      # Phone number input & authentication launcher
│   └── OtpForm.tsx        # 6-digit SMS OTP verification code input form
└── hooks/
    └── useAuth.ts          # Client-side React hook for user state & session management
```

---

## 🛠️ KEY DEPENDENCIES & CONTRACTS

- **API Endpoints**:
  - `POST /api/auth/send-otp`: Dispatches SMS OTP via Eskiz adapter (`src/lib/sms/eskiz.ts`).
  - `POST /api/auth/verify-otp`: Validates OTP code against `otpCodes` table and sets JWT session cookie.
  - `POST /api/auth/telegram`: Verifies Telegram HMAC sha256 authentication data.
- **Validations**: `src/lib/validations/auth.ts` (`sendOtpSchema`, `verifyOtpSchema`, `telegramAuthSchema`).
- **Database Tables**: `users`, `userProfiles`, `otpCodes`, `sessions` (`src/db/schema.ts`).
- **Middleware Guard**: `src/middleware.ts` inspects JWT cookies for protected routes (`/kabinet/*`, `/admin/*`).

---

## 🛑 SCOPING DIRECTIVE FOR AI AGENTS

When modifying login forms, OTP flows, or session hooks, read **ONLY** files inside `src/features/auth/` and `src/lib/validations/auth.ts`. Do not scan unrelated feature directories.
