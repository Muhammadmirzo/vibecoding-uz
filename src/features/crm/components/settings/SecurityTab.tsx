import { useState, type Dispatch, type SetStateAction } from "react";
import { Lock, Save } from "lucide-react";
import { Field } from "./SettingsFields";
import type { SettingsState } from "./types";

type Props = { settings: SettingsState; setSettings: Dispatch<SetStateAction<SettingsState>> };

export function SecurityTab({ settings, setSettings }: Props) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const set = (key: keyof SettingsState, value: string) => setSettings((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage(null);
    if (settings.newPassword && settings.newPassword !== settings.confirmPassword) { setMessage("Yangi parollar mos kelmadi"); setSaving(false); return; }
    try {
      const response = await fetch("/api/auth/change-password", { method: "POST", headers: { "Contents-Type": "application/json" }, body: JSON.stringify({ phone: settings.credPhone, email: settings.credEmail, oldPassword: settings.oldPassword, newPassword: settings.newPassword, confirmPassword: settings.confirmPassword }) });
      const payload: unknown = await response.json();
      const success = typeof payload === "object" && payload !== null && "success" in payload && payload.success === true;
      setMessage(success ? "Login va parol yangilandi" : "Ma’lumotni yangilashda xatolik yuz berdi");
    } finally { setSaving(false); }
  }
  return <form onSubmit={submit} className="space-y-6 rounded-xl border border-border bg-cream-warm p-6">
    <h2 className="flex items-center gap-2 border-b border-border pb-3 text-base font-bold text-ink"><Lock className="h-4 w-4 text-accent" />Login va parolni o‘zgartirish</h2>
    <p className="text-xs text-ink-muted">Telefon, email va parolni yangilash uchun ma’lumotlarni kiriting.</p>
    {message && <p role="status" className="rounded-lg border border-accent-line bg-accent-soft p-3 text-sm text-accent">{message}</p>}
    <div className="grid gap-4 md:grid-cols-2"><Field label="Telefon" value={settings.credPhone} onChange={(value) => set("credPhone", value)} mono /><Field label="Email" value={settings.credEmail} onChange={(value) => set("credEmail", value)} type="email" /></div>
    <div className="grid gap-4 border-t border-border pt-4 md:grid-cols-2"><Field label="Eski parol" value={settings.oldPassword} onChange={(value) => set("oldPassword", value)} type="password" /><Field label="Yangi parol" value={settings.newPassword} onChange={(value) => set("newPassword", value)} type="password" /><Field label="Yangi parolni tasdiqlash" value={settings.confirmPassword} onChange={(value) => set("confirmPassword", value)} type="password" /></div>
    <button type="submit" disabled={saving} className="ml-auto flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Saqlanmoqda…" : "Login va parolni yangilash"}</button>
  </form>;
}
