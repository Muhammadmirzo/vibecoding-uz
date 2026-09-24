You are a senior backend/API architect who has shipped APIs for iOS and Android apps at scale. Work autonomously until fully done.

FIRST read `docs/waves/PHASE2-RULES.md` (mandatory rules) and `docs/waves/API-CONTRACT.md` (you own its auth part), then:
- `src/lib/auth/**` (sessions, `require-auth.ts` gate, password, Telegram login flow);
- `src/app/api/**` (auth, me, lms, payments, telegram), `src/db/schema/*`;
- every `src/features/*/contracts.ts` that exists (chat, analytics).

Wave id: W9. Branch `wave/w9-mobile-api`. Your dev port: **3308**. Report: `docs/waves/reports/W9-MOBILE-API.md`.

OWNER REQUEST: "Make the project ready NOW so an iOS/Android app can be built any time and connected easily. World-class, flawless."

BUILD:
1. **Token auth for native clients**:
   - New tables in `src/db/schema/mobile.ts`: `api_refresh_tokens` (hashed, device_id, device_name, platform ios|android|web, last_used_at, revoked_at, rotated_from) and `push_devices` (user_id, platform, push token (Expo/FCM/APNs), app_version, locale, last_seen, disabled_at).
   - Endpoints:
     - `POST /api/v1/auth/token` (phone + password → access + refresh; same lockout and rate limits as web login);
     - `POST /api/v1/auth/telegram/start` + `/status` (the existing deep-link Telegram login, returning tokens instead of a cookie);
     - `POST /api/v1/auth/refresh` (rotation, reuse detection → revoke the family);
     - `POST /api/v1/auth/logout` (revoke), `GET /api/v1/auth/sessions` + `DELETE` (manage devices).
   - Access tokens are short-lived (15 min): signed JWT (HS256 with `API_JWT_SECRET`, or EdDSA) with sub, role, sid, and aud "naqsh-mobile".
   - Extend the shared gate in `require-auth.ts` to accept `Authorization: Bearer <access>`. CSRF is skipped for bearer requests. Roles work identically. Every existing and new v1 route gains mobile support automatically. Fully test the gate changes, because web login must not regress.
2. **Mobile resource endpoints** under `/api/v1` (thin wrappers over existing services; add service functions where logic lives in routes today):
   - `GET /me`, `PATCH /me`, `GET /me/enrollments`, `GET /courses`, `GET /courses/{slug}`, `GET /courses/{slug}/lessons` (locked or unlocked by enrollment), `GET /lessons/{id}` (content + video playback info exactly as the web player gets it), `POST /lessons/{id}/progress`;
   - `GET/POST /homework...`, `GET /me/payments`, `GET /me/certificates`, `GET /me/referral`;
   - `POST /push-devices`, `DELETE /push-devices/{id}`;
   - `GET /app/config` (min supported app version, feature flags from the closed-features registry if present, support links, chat enabled).
   - Chat and analytics v1 endpoints from W7/W8A are included in the spec if merged.
3. **OpenAPI 3.1**, generated from the Zod contracts (use `@asteasolutions/zod-to-openapi` or an equivalent maintained lib) at `GET /api/v1/openapi.json`, plus a docs page `/api/v1/docs` (Scalar or Redoc from CDN, noindex).
   - Named schemas, examples, error envelope, security schemes (bearer + cookie), and tags.
   - Add a CI-style vitest that fails if a v1 route has no registered contract.
4. **App-readiness plumbing**:
   - `public/.well-known/apple-app-site-association` and `public/.well-known/assetlinks.json`, generated from env (`IOS_TEAM_ID`, `IOS_BUNDLE_ID`, `ANDROID_PACKAGE`, `ANDROID_SHA256`). Served with the correct content-type, and empty-safe when env is missing.
   - Universal-link routes documented: `/kurs/{slug}`, `/kabinet`, `/ref/{code}`.
   - ETag/`Cache-Control` on public GETs, `Accept-Language` uz|ru|en passthrough (content stays Uzbek for now), request-id header on every v1 response, and API deprecation policy text (`Sunset` header support).
5. **Developer guide** `docs/MOBILE_API.md` for a future app developer (Expo/React Native recommended, with Swift/Kotlin notes): auth flow diagrams (text), token storage (Keychain/Keystore), refresh strategy, push registration, deep links, error handling, pagination, offline caching hints, and a curl example for every endpoint.

TESTS: gate (cookie still works; bearer works; expired/forged/wrong-aud tokens → 401; CSRF skipped only for bearer), refresh rotation + reuse detection, per-endpoint authz (a user cannot read another user's data), OpenAPI completeness, and the well-known files.
SECURITY: rate-limit token endpoints, constant-time comparisons, never return password hashes, and log token ids, never tokens.
REPORT must list the env vars the owner must set.
GATE: see PHASE2-RULES "Definition of done".
