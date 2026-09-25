const esc = (value: string): string => value.replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[char] ?? char);
const field = (name: string, value: string): string => `<input type="hidden" name="${name}" value="${esc(value)}">`;

/** OAuth error/cancel redirect target, built server-side from an already allow-listed redirect_uri. */
export function oauthRedirectUrl(redirectUri: string, params: Record<string, string>): string {
  const target = new URL(redirectUri);
  for (const [key, value] of Object.entries(params)) target.searchParams.set(key, value);
  return target.toString();
}

/**
 * The site CSP has `form-action 'self'`, and Chrome applies it to redirects that follow a form
 * POST, so a 302 to the client's callback would be blocked. Navigate from a 200 page instead.
 */
export function redirectPage(target: string): string {
  return `<!doctype html><html lang="uz"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${esc(target)}"><meta name="referrer" content="no-referrer"><title>Naqsh MCP</title><p>Ulanish tasdiqlandi. <a href="${esc(target)}">Davom etish</a></p></html>`;
}

export function consentPage(input: { clientName: string; scopes: string; values: Record<string, string>; cancelUrl: string }): string {
  const scopeLabels: Record<string, string> = { "analytics:read": "Analitikani ko'rish", "students:read": "Talabalar ma'lumotini ko'rish", "students:read:pii": "Talabalar PII ko'rish", "sales:read": "Savdo va to'lovlarni ko'rish", "chat:read": "Suhbatlarni ko'rish", "chat:write": "Suhbatga javob yozish", "content:write": "Sayt kontentini yangilash", "leads:write": "Lead holatini o'zgartirish" };
  const labels = input.scopes.split(/\s+/).filter(Boolean).map((scope) => `<li>${esc(scopeLabels[scope] ?? scope)}</li>`).join("");
  const hidden = Object.entries(input.values).map(([name, value]) => field(name, value)).join("");
  return `<!doctype html><html lang="uz"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Naqsh MCP ulanishi</title><style>body{margin:0;background:#FAF7F0;color:#0E1A2B;font:17px/1.6 system-ui}.card{max-width:620px;margin:8vh auto;padding:32px;background:#fff;border:1px solid #E4DDCF;border-radius:20px;box-shadow:0 18px 60px #0e1a2b18}h1{line-height:1.2}ul{padding-left:24px}.actions{display:flex;gap:12px;margin-top:28px;flex-wrap:wrap}button{min-height:48px;padding:0 20px;border:0;border-radius:12px;font:inherit;font-weight:700;cursor:pointer}.allow{background:#E8A317;color:#0E1A2B}.cancel{background:#F1ECE1;color:#0E1A2B}@media(prefers-color-scheme:dark){body{background:#07111F;color:#EEF2F8}.card{background:#0E1B2E;border-color:#1D2B42}.cancel{background:#1D2B42;color:#EEF2F8}}</style><main class="card"><p>NAQSH · XAVFSIZ ULANISH</p><h1>${esc(input.clientName)} Naqsh ma'lumotlariga ulanmoqchi</h1><p>Faqat quyidagi ruxsatlarga kirish so'raladi. Ulanishni keyin admin sahifasidan uzishingiz mumkin.</p><ul>${labels}</ul><form method="post"><div>${hidden}<input type="hidden" name="decision" value="allow"></div><div class="actions"><button class="allow" type="submit">Ruxsat berish</button><a href="${esc(input.cancelUrl)}"><button class="cancel" type="button">Bekor qilish</button></a></div></form></main></html>`;
}
