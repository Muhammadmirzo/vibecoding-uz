"use client";

import * as React from "react";

/**
 * Shareable certificate link: Web Share API with clipboard fallback.
 * Self-contained (no UI kit imports) to keep this route's JS near zero.
 */
export function ShareCertButton({ code, title }: { code: string; title: string }) {
  const [copied, setCopied] = React.useState(false);

  async function share() {
    const url = `${window.location.origin}/shahodatnoma/${code}`;
    const text = `${title} — Naqsh sertifikati (${code})`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the code itself stays visible */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="btn-press inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-bg-elevated px-4 text-sm font-semibold text-ink transition hover:border-brand"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
      </svg>
      {copied ? "Havola nusxalandi" : "Ulashish"}
    </button>
  );
}
