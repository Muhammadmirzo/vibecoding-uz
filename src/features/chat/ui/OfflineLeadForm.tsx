"use client";

import * as React from "react";
import { Send } from "lucide-react";

export interface OfflineLeadValues {
  name: string;
  phone?: string;
  telegram?: string;
}

export function OfflineLeadForm({
  offlineText,
  body,
  sending,
  onBodyChange,
  onSubmit,
}: {
  offlineText: string;
  body: string;
  sending: boolean;
  onBodyChange: (value: string) => void;
  onSubmit: (values: OfflineLeadValues) => Promise<void>;
}) {
  const [name, setName] = React.useState("");
  const [contactType, setContactType] = React.useState<"phone" | "telegram">("phone");
  const [contact, setContact] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2 || contact.trim().length < 3) {
      setError("Ism va telefon yoki Telegram username kiriting.");
      return;
    }
    setError(null);
    await onSubmit({
      name: name.trim(),
      ...(contactType === "phone" ? { phone: contact.trim() } : { telegram: contact.trim().replace(/^@/, "") }),
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3 border-t border-border bg-bg-elevated p-4">
      <div>
        <p className="font-display text-base font-semibold text-ink">Hozir oflaynmiz</p>
        <p className="mt-1 text-sm text-ink-muted">{offlineText}</p>
      </div>
      <label className="block text-sm font-medium text-ink">
        Xabaringiz <span className="font-normal text-ink-subtle">(ixtiyoriy)</span>
        <textarea value={body} onChange={(event) => onBodyChange(event.target.value)} rows={2} maxLength={2000} placeholder="Nima haqida yordam kerak?" className="mt-1 w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft" />
      </label>
      <label className="block text-sm font-medium text-ink">
        Ismingiz
        <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="mt-1 min-h-11 w-full rounded-lg border border-border bg-bg px-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft" />
      </label>
      <div className="flex gap-2">
        <select value={contactType} onChange={(event) => setContactType(event.target.value === "telegram" ? "telegram" : "phone")} className="min-h-11 rounded-lg border border-border bg-bg px-3 text-base text-ink">
          <option value="phone">Telefon</option>
          <option value="telegram">Telegram</option>
        </select>
        <input value={contact} onChange={(event) => setContact(event.target.value)} inputMode={contactType === "phone" ? "tel" : "text"} autoComplete={contactType === "phone" ? "tel" : "username"} placeholder={contactType === "phone" ? "+998 __ ___ __ __" : "@username"} className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft" />
      </div>
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      <button disabled={sending} className="btn-press flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gold px-4 font-semibold text-on-gold disabled:opacity-60">
        <Send className="size-4" aria-hidden="true" />{sending ? "Yuborilmoqda…" : "Xabar qoldirish"}
      </button>
    </form>
  );
}
