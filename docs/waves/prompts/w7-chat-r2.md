You are continuing wave W7 (chat centre) in this worktree, branch `wave/w7-chat`. Read `docs/waves/PHASE2-RULES.md`, `docs/waves/prompts/w7-chat.md` (the FULL spec — every item is required), and your report `docs/waves/reports/W7-CHAT.md`.

ORCHESTRATOR REVIEW: the previous run stopped at about 50%. It left all work UNCOMMITTED and listed core features as "remaining". **The wave is not done until every BUILD item in `w7-chat.md` works.** Do not stop early. Do not hand work to "the next merge pass": there is none, you are it.

1. First commit the current work in logical commits. The migration goes in its own commit named `db: w7 migration`.
2. Then finish, each with tests:
   - AI orchestration wired into the visitor message flow:
     - `auto` mode generates a reply through `AnthropicChatAgent`;
     - `assist` mode stores an admin-only draft with a "Yuborish" button in the inbox;
     - the handoff flag notifies a human;
     - daily caps are persisted (per conversation + global), with no key or provider failure → silent off plus human notified;
     - `external` provider mode.
   - Telegram outgoing notification: store the returned message_id on the message/conversation so the admin's Telegram reply maps back. Include the admin-activity check (no notification if an admin was active in the inbox in the last 2 min).
   - Office hours in Asia/Tashkent: an honest "reply time" line and the offline "xabar qoldirish" form that creates/links a `leads` row.
   - `data-chat-open` / `#chat` deep-link opening, the unread badge on the launcher, the typing indicator, and read receipts.
   - Audit log for every admin action. Service functions `listConversations`, `getThread`, `postReply(actor)` ready for MCP (W8B).
   - The admin inbox UI complete: filters, search, context panel, quick replies, AI mode switch, and a mobile stack view.
3. The `src/features/analytics/` directory you created must contain ONLY the `trackServerEvent` no-op stub (`track.ts`) with the signature from `docs/waves/prompts/w8a-analytics.md` §5. Another agent builds the real analytics; delete anything else you put there.
4. Visual quality: viewport screenshots of the widget (closed, open, conversation, offline form) and of the admin inbox at 390 and 1440, light + dark. It must look world-class and on-brand (Naqsh), with no collisions with `StickyBuyBar`. Iterate.
5. The full gate from PHASE2-RULES, a Playwright test for the widget → inbox round trip, a Lighthouse mobile run on `/` (CLS 0, LCP ≤ 2.5 s), and the First Load JS delta per page (budget ≤ 1.5 kB).
6. Update the report: every spec item → done, with where the code is and which test proves it.
