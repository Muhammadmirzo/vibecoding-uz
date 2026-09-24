# API v1 contract — web, admin, MCP and the future iOS/Android app share it

Every NEW endpoint lives under `/api/v1/<resource>`. Existing routes stay as they are; W9 adds v1 wrappers where the mobile app needs them.

## Shape
- JSON only. Success returns `{ "data": <payload>, "meta"?: { "nextCursor"?: string, "total"?: number } }` with status 200 or 201.
- Error returns `{ "error": { "code": "snake_case", "message": "<Uzbek, user-safe>", "details"?: ... } }` with the right status: 400 validation, 401, 403, 404, 409, 422, 429 (plus `Retry-After`), 503 when a provider or the DB is down.
- Build responses with the shared helpers `src/lib/api/v1/respond.ts`: `ok(data, meta?)`, `created(data)` and `fail(error)`. `fail` wraps `errorResponse` and maps it to the envelope above. It already exists on main (tests in `src/__tests__/api-v1/`). Reuse it and do not fork it.
- Lists use cursor pagination: `?cursor=<opaque>&limit=<1..100, default 20>`, newest first unless documented otherwise.
- Timestamps are ISO-8601 UTC strings. IDs are UUID strings. Money is integer so'm plus a `currency: "UZS"` field.
- Every request and response body has a Zod schema exported from `src/features/<feature>/contracts.ts`. W9 generates OpenAPI 3.1 from these, so keep them complete and named.

## Auth
- Web uses the existing session cookie through `requireAuth`/`requireAdmin`. Mutations need CSRF.
- Mobile/MCP: W9 extends the same gate to accept `Authorization: Bearer <token>`. For bearer requests CSRF is skipped, because there is no ambient cookie. Handlers MUST call the gate and never read cookies directly, so they gain mobile support automatically.
- Anonymous visitor endpoints (analytics events, chat widget) identify the browser by an opaque httpOnly cookie token. The DB stores only its SHA-256 hash. The mobile app can send the same token in the `X-Visitor-Token` header.

## Behaviour
- Endpoints are idempotent where it matters: clients may send `Idempotency-Key` on POST, and chat message send and event ingest dedupe on a client-generated id.
- No endpoint returns another user's data, secrets, password hashes or raw IPs.
- Rate-limit every public write with `checkRateLimit`.
