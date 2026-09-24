# W8B-MCP

## Nima yetkazildi

- `/api/mcp` — stateless, Node runtime Streamable HTTP MCP endpoint. Har request uchun yangi SDK server/transport yaratiladi; session ID saqlanmaydi. `GET` faqat 405, `POST` MCP JSON-RPC va `OPTIONS` CORS preflight qo‘llaydi.
- Bitta registry — `src/features/mcp/registry/*`. Remote va yangilangan stdio transport shu tool/resource/prompt registry’dan foydalanadi. Eski `mcp-server/server.ts` va legacy tool unit testlari backcompat uchun saqlanadi, lekin production stdio entrypoint endi shared registry’ni register qiladi.
- Tool’lar: analytics overview/timeseries/acquisition/behaviour/funnel/realtime, students list/profile, course completion, lesson dropoff, cohort attendance, sales summary/by-course/payments/refunds, leads list/status update, chat open/thread/reply/mode, portfolio list/update, site settings.
- Barcha tool inputlari Zod bilan validate qilinadi; list toollari cursor/limit bilan 100 qatorgacha cheklangan. Output schema `summary`, `data`, `markdown`, `chartSpec`, `nextCursor` maydonlarini belgilaydi. Analytics toollari W8A service’lari va SVG fallback, Vega-Lite chartSpec, Markdown table qaytaradi.
- Annotations: read-only tool’larda `readOnlyHint: true`, yozuv tool’larida `false`, barcha tool’larda `destructiveHint: false`; delete/bulk destructive tool umuman yo‘q.
- MCP Apps: `ui://naqsh/dashboard` hamda line/bar/funnel/table/kpi chart resource’lari, `text/html;profile=mcp-app`, nested `_meta.ui.resourceUri` va `visibility: [model, app]`. Host capability’ga qarab oddiy text/structured/image fallback ishlaydi.
- Prompt’lar: `haftalik_hisobot`, `sotuv_tahlili`, `talabalar_holati`, `marketing_manbalari`. Resources: `naqsh://courses`, `naqsh://pricing`, `naqsh://metrics-glossary`.
- OAuth/OIDC-compatible discovery: `/.well-known/oauth-protected-resource` (RFC 9728), `/.well-known/oauth-authorization-server` (RFC 8414), RFC 7591 `/oauth/register`, admin session bilan Naqsh-branded `/oauth/authorize`, PKCE S256 `/oauth/token`, `/oauth/revoke`. Resource indicator `https://master-2-jade.vercel.app/api/mcp` tekshiriladi. 401/403 `WWW-Authenticate` bilan metadata URL’ni beradi.
- Tokenlar opaque random; DB’da faqat SHA-256 hash. Access 1 soat, refresh 30 kun, refresh rotation/reuse detection, revocation, PAT expiry/last-used/revoke. PAT’lar `/admin/settings` → “MCP ulanishlar” orqali yaratiladi. Telefon/email va chat kontaktlari `students:read:pii` flag’siz masklanadi. Lead status, chat reply/mode, portfolio update audit log qilinadi; DB rate-limit bucket 120 request/minute/token.
- `/admin/mcp` — Claude.ai, ChatGPT, Claude Code va Cursor ulash yo‘riqnomasi, live endpoint, copy buttonlar. `/api/v1/mcp/pats` va `/api/v1/mcp/clients` admin-only contract/register qilinadi.
- `siteConfig.siteUrl` canonical production origin’ni beradi.

## Protokol va SDK versiyalari

- MCP protocol maqsadi: `2026-07-28` (joriy spec holati).
- ishlatilgan monolithic TypeScript SDK: `@modelcontextprotocol/sdk@1.30.1` (joriy v1 package; mavjud stdio importlarining backward compatibility uchun).
- MCP Apps: `@modelcontextprotocol/ext-apps@1.7.5`, extension `io.modelcontextprotocol/ui`, UI spec `2026-01-26`.
- Streamable HTTP: Web Standard `Request`/`Response`, stateless fresh transport per request, JSON response mode va 1 MB body cap.
- OAuth: PKCE S256, authorization_code + refresh_token, RFC 8707 resource indicator, opaque DB hashes. Dynamic registration RFC 7591 compatibility endpoint sifatida saqlanadi; future client-ID-metadata document flow keyin almashtirilishi mumkin.

## Dependency va migration

- `@modelcontextprotocol/sdk` ^1.30.1’ga yangilandi.
- `@modelcontextprotocol/ext-apps@1.7.5` qo‘shildi.
- `vite` Vitest 5 runtime dependency sifatida qo‘shildi (lockfile/install muammosi tufayli typecheck uchun).
- `src/db/schema/mcp.ts`: `mcp_clients`, `mcp_authorization_codes`, `mcp_access_tokens`, `mcp_refresh_tokens`, `mcp_personal_access_tokens`.
- Migration: `drizzle/0011_clumsy_polaris.sql`, `db: w8b mcp migration` commit’ida. Faqat additive table/index/FK; live DB’ga apply qilinmagan.

## Tekshiruv

- `npx tsc --noEmit` — PASS.
- `npx vitest run` — PASS: 89 test fayli / 603 test.
- `scripts/waves/locked.sh npm run build` — PASS.
- Yangi `src/__tests__/mcp/w8b-mcp.test.ts`: shared registry tool/resource/prompt list, outputSchema/UI metadata, input validation, RFC 9728/8414 discovery, 401 `WWW-Authenticate`, PKCE/hash primitives.
- MCP Inspector manual run bajarilmadi: lokal DB/session/PAT environment’da tayyor credential yo‘q; xavfsiz stub token yaratib real DB’ga ulash made. Keyingi manual step: deploy migration’ni staging’da, admin session bilan `/admin/mcp` dan PAT yaratish, `npx @modelcontextprotocol/inspector` bilan `tools/list`, `resources/list`, `prompts/list`, `analytics_overview` va scope-missing `chat_reply` ni tekshirish.
- UI screenshot/E2E bu iteratsiyada bajarilmadi: MCP panel’i server-side route/build orqali tekshirildi, brauzer smoke alohida staging credential talab qiladi.

## Qolgan xavflar / keyingi qadam

- DB migration production’da deploy qilingandan keyin OAuth consent end-to-end smoke bajarilishi kerak.
- Stdio backward-compatible legacy `mcp-server/server.ts` exportlari test uchun saqlangan; yangi production entrypoint shared registry ishlatadi. Keyingi tozalashda legacy tool testlarini W8B testlariga ko‘chirib eski tool kodini olib tashlash mumkin.
- Analytics W8A’ning 60 soniyalik process-local cache’ini saqlaydi; `analytics_realtime` shu sabab maksimal 60 soniya kechikishi mumkin. Production DB aggregate smoke alohida bajarilishi kerak.
- OAuth consent HTML’da inline CSS/JS host CSP si bilan tekshirilishi kerak; hozir server-rendered, hech qanday secret yoki DB credential HTML’ga qo‘shilmaydi.
- W7 chat provider’ining external mode’da AI javob yuborish oqimi alohida staging integratsiyasi talab qiladi; `chat_reply` sender token/PAT’ning `ai|admin` qiymatidan foydalanadi.
