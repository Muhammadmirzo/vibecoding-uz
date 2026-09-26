/**
 * Output hygiene for ops scripts: connection strings and passwords must never reach a terminal,
 * CI log or shell history. Everything printed by move-db / backup / drill goes through these.
 */

/** `postgres://user:secret@host:6543/db?x=y` → `postgres://user:***@host:6543/db`. Never throws. */
export function maskUrl(raw: string | undefined | null): string {
  if (!raw) return "(unset)";
  try {
    const url = new URL(raw);
    const user = url.username ? decodeURIComponent(url.username) : "";
    const auth = user ? `${user}${url.password ? ":***" : ""}@` : "";
    return `${url.protocol}//${auth}${url.host}${url.pathname}`;
  } catch {
    return "(unparseable connection string, hidden)";
  }
}

/** Replaces every occurrence of each secret (and its URL-encoded form) with `***`. */
export function redact(text: string, secrets: ReadonlyArray<string | undefined | null>): string {
  let out = text;
  const needles = new Set<string>();
  for (const secret of secrets) {
    if (!secret || secret.length < 4) continue;
    needles.add(secret);
    needles.add(encodeURIComponent(secret));
  }
  // Longest first so a URL is replaced before the password inside it.
  for (const needle of [...needles].sort((a, b) => b.length - a.length)) {
    out = out.split(needle).join("***");
  }
  // Belt and braces: any leftover `scheme://user:pass@` credentials.
  return out.replace(/(postgres(?:ql)?:\/\/[^:\s/@]+):[^@\s]+@/gi, "$1:***@");
}

/** Secrets worth redacting for a connection string: the URL itself and its password. */
export function secretsOf(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const url = new URL(raw);
    return [raw, url.password ? decodeURIComponent(url.password) : ""].filter(Boolean);
  } catch {
    return [raw];
  }
}
