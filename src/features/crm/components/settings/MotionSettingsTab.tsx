"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader2, RotateCcw, Save, Sparkles } from "lucide-react";
import { DEFAULT_MOTION, type MotionSettings, type MotionLevel } from "@/features/motion/domain/settings";

const levels: Array<{ value: MotionLevel; label: string; description: string }> = [
  { value: "off", label: "O'chiq", description: "Barcha animatsiyalar o'chiriladi." },
  { value: "subtle", label: "Yengil", description: "Faqat ochilish va kichik mikro-interaktivliklar." },
  { value: "full", label: "To'liq", description: "Barcha motion effektlari yoqilgan holda ishlaydi." },
];
const flags: Array<{ key: keyof Omit<MotionSettings, "level">; label: string; description: string }> = [
  { key: "heroIntro", label: "Hero kirish animatsiyasi", description: "Bosh sarlavha va terminal qatori sahifa ochilganda jonlanadi." },
  { key: "scrollReveal", label: "Scroll reveal", description: "Bo'limlar ko'rinishga kirganda paydo bo'ladi." },
  { key: "pointerEffects", label: "Pointer effektlari", description: "Tugma va kartalarda kursor bilan ta'sir." },
  { key: "ambient", label: "Ambient effektlar", description: "Girih shimmer va sekin gradient harakati." },
  { key: "pageTransitions", label: "Sahifa o'tishlari", description: "Sahifalar orasida View Transitions." },
];

function isMotionSettings(value: unknown): value is MotionSettings {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.level === "string" && Object.values(candidate).every((item) => typeof item === "boolean" || typeof item === "string");
}

export function MotionSettingsTab() {
  const [settings, setSettings] = useState<MotionSettings>(DEFAULT_MOTION);
  const [saved, setSaved] = useState<MotionSettings>(DEFAULT_MOTION);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    void fetch("/api/admin/settings/motion").then(async (response) => {
      const payload: unknown = await response.json();
      if (response.ok && typeof payload === "object" && payload !== null && "settings" in payload && isMotionSettings(payload.settings)) setSettings(payload.settings);
    }).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  function update<K extends keyof MotionSettings>(key: K, value: MotionSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function save(next = settings) {
    const previous = settings;
    setSettings(next);
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/settings/motion", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
      const payload: unknown = await response.json();
      if (!response.ok || typeof payload !== "object" || payload === null || !("settings" in payload) || !isMotionSettings(payload.settings)) throw new Error("save");
      setSettings(payload.settings);
      setSaved(payload.settings);
      setMessage({ type: "success", text: "Animatsiya sozlamalari saqlandi." });
    } catch {
      setSettings(previous);
      setMessage({ type: "error", text: "Sozlamalarni saqlashda xatolik yuz berdi." });
    } finally { setSaving(false); }
  }

  const reset = () => { setSettings(DEFAULT_MOTION); setMessage(null); void save(DEFAULT_MOTION); };
  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;

  return <section className="space-y-6" aria-labelledby="motion-settings-title">
    <div><h2 id="motion-settings-title" className="flex items-center gap-2 text-lg font-bold text-ink"><Sparkles className="h-5 w-5 text-accent" />Animatsiyalar</h2><p className="mt-1 text-sm text-ink-muted">Sayt harakatini sezilarli darajada o'zgartiring.</p></div>
    <fieldset><legend className="mb-3 text-sm font-semibold text-ink">Umumiy daraja</legend><div className="grid gap-2 md:grid-cols-3">{levels.map((item) => <button key={item.value} type="button" aria-pressed={settings.level === item.value} onClick={() => update("level", item.value)} className={`min-h-11 rounded-xl border p-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${settings.level === item.value ? "border-accent bg-accent-soft text-ink" : "border-border bg-bg-elevated text-ink-muted hover:border-accent-line"}`}><span className="block font-semibold">{item.label}</span><span className="mt-1 block text-xs leading-relaxed">{item.description}</span></button>)}</div></fieldset>
    <fieldset disabled={settings.level === "off"}><legend className="mb-3 text-sm font-semibold text-ink">Animatsiya turlari</legend><div className="grid gap-3 md:grid-cols-2">{flags.map((flag) => <label key={flag.key} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-bg-elevated p-4"><span><span className="block text-sm font-semibold text-ink">{flag.label}</span><span className="mt-1 block text-xs leading-relaxed text-ink-muted">{flag.description}</span></span><input type="checkbox" checked={settings[flag.key]} onChange={(event) => update(flag.key, event.target.checked)} disabled={settings.level === "off"} className="h-5 w-5 shrink-0 accent-accent" /></label>)}</div></fieldset>
    <div className="rounded-xl border border-border bg-bg-elevated p-4"><h3 className="text-sm font-semibold text-ink">Jonli preview</h3><div className={`mt-3 rounded-lg border border-border bg-bg-sunken p-5 ${settings.level === "off" ? "" : settings.level === "full" ? "animate-pulse" : "transition-transform"}`}><p className="text-base font-semibold text-ink">Yangi g'oya — tayyor.</p><p className="mt-1 text-sm text-ink-muted">Bu kartaning animatsiyasi joriy sozlamani ko'rsatadi.</p></div></div>
    {message && <div role="status" className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${message.type === "success" ? "border-success/30 bg-success-soft text-success" : "border-danger/30 bg-danger-soft text-danger"}`}>{message.type === "success" && <CheckCircle className="h-5 w-5" />}{message.text}</div>}
    <div className="flex flex-wrap gap-3"><button type="button" onClick={() => void save()} disabled={saving} className="flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-ink disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Saqlash</button><button type="button" onClick={reset} disabled={saving || JSON.stringify(settings) === JSON.stringify(saved)} className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-5 text-sm font-semibold text-ink disabled:opacity-50"><RotateCcw className="h-4 w-4" />Standartga qaytarish</button></div>
  </section>;
}
