/**
 * Cron authorization helper (fail-closed).
 *
 * SECURITY: when CRON_SECRET is not configured the request is DENIED.
 * An earlier implementation returned `true` here, which exposed the mass
 * Telegram/SMS sender to anyone. Never restore fail-open behaviour.
 */
export function isCronAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = request.headers.get("authorization");
  const secretHeader = request.headers.get("x-cron-secret");
  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, "") : secretHeader;
  return token === cronSecret;
}
