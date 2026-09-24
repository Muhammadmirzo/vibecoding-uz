"use client";

import { useState } from "react";
import { CheckCircle, CreditCard, Globe, Key, Loader2, Lock, Save, Settings, ShieldCheck, Sparkles } from "lucide-react";
import { GeneralTab } from "./settings/GeneralTab";
import { PricingTab, GuaranteeTab } from "./settings/PricingGuaranteeTabs";
import { IntegrationsTab } from "./settings/IntegrationsTab";
import { FeaturesTab } from "./settings/FeaturesTab";
import { SecurityTab } from "./settings/SecurityTab";
import { MotionSettingsTab } from "./settings/MotionSettingsTab";
import { useSettings } from "./settings/useSettings";
import type { SettingsTab } from "./settings/types";
import { isClosed } from "@/lib/features/closed";

const tabs: Array<{ id: SettingsTab; label: string; icon: typeof Globe }> = [
  { id: "general", label: "Platforma", icon: Globe }, { id: "pricing", label: "Narxlar", icon: CreditCard },
  { id: "guarantee", label: "Kafolat", icon: ShieldCheck }, { id: "integrations", label: "Kalitlar", icon: Key },
  // W10: Funksiyalar tabidagi kalitlar hech narsani boshqarmedi — registr ochilmaguncha yashirilgan.
  ...(!isClosed("adminFeatureFlags") ? [{ id: "features", label: "Funksiyalar", icon: CheckCircle }] as const : []),
  { id: "motion", label: "Animatsiyalar", icon: Sparkles }, { id: "security", label: "Xavfsizlik", icon: Lock },
];

export function SettingsManager() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const { settings, setSettings, loading, saving, saved, save } = useSettings();
  return <div className="mx-auto max-w-5xl space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div><h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-ink"><Settings className="h-6 w-6 text-accent" />Tizim sozlamalari</h1><p className="mt-1 text-sm text-ink-muted">Sayt parametrlari, narxlar, integratsiyalar va xavfsizlik.</p></div>
      {activeTab !== "security" && activeTab !== "motion" && <button onClick={() => void save()} disabled={saving} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-ink disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Sozlamalarni saqlash</button>}
    </div>
    {saved && <div role="status" className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft p-4 text-sm font-medium text-success"><CheckCircle className="h-5 w-5" />Sozlamalar saqlandi.</div>}
    <nav aria-label="Sozlamalar bo'limlari" className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-bg-sunken p-1">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${activeTab === id ? "bg-brand-soft text-brand" : "text-ink-muted hover:bg-bg-elevated hover:text-ink"}`}><Icon className="h-4 w-4" />{label}</button>)}</nav>
    {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div> : activeTab === "security" ? <SecurityTab settings={settings} setSettings={setSettings} /> : <form onSubmit={(event) => { event.preventDefault(); void save(); }} className="rounded-xl border border-border bg-bg-sunken p-4 sm:p-6">
      {activeTab === "general" && <GeneralTab settings={settings} setSettings={setSettings} />}
      {activeTab === "pricing" && <PricingTab settings={settings} setSettings={setSettings} />}
      {activeTab === "guarantee" && <GuaranteeTab settings={settings} setSettings={setSettings} />}
      {activeTab === "integrations" && <IntegrationsTab settings={settings} setSettings={setSettings} />}
      {activeTab === "features" && <FeaturesTab settings={settings} setSettings={setSettings} />}
      {activeTab === "motion" && <MotionSettingsTab />}
      <button type="submit" disabled={saving} className="mt-8 ml-auto flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-ink disabled:opacity-50"><Save className="h-4 w-4" />Sozlamalarni saqlash</button>
    </form>}
  </div>;
}
