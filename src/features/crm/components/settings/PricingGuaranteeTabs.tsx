import type { Dispatch, SetStateAction } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";
import { Field } from "./SettingsFields";
import type { SettingsState } from "./types";

type Props = { settings: SettingsState; setSettings: Dispatch<SetStateAction<SettingsState>> };

export function PricingTab({ settings, setSettings }: Props) {
  const setText = (key: "defaultCoursePrice", value: string) => setSettings((current) => ({ ...current, [key]: value }));
  const setNumber = (key: "installmentRate3Months" | "installmentRate6Months" | "guaranteeRefundDays", value: string) => setSettings((current) => ({ ...current, [key]: Number(value) }));
  return <div className="space-y-4">
    <Heading icon={<CreditCard />} title="Standart kurs narxlari va bo‘lib to‘lash" />
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Standart kurs narxi (so‘mda)" value={settings.defaultCoursePrice} onChange={(value) => setText("defaultCoursePrice", value)} mono />
      <p className="self-end pb-2 text-xs text-ink-muted">Joriy standart narx: 550 000 so‘m</p>
      <Field label="3 oylik bo‘lib to‘lash ustamasi (%)" value={String(settings.installmentRate3Months)} onChange={(value) => setNumber("installmentRate3Months", value)} type="number" />
      <Field label="6 oylik bo‘lib to‘lash ustamasi (%)" value={String(settings.installmentRate6Months)} onChange={(value) => setNumber("installmentRate6Months", value)} type="number" />
      <Field label="Kafolat muddati (kun)" value={String(settings.guaranteeRefundDays)} onChange={(value) => setNumber("guaranteeRefundDays", value)} type="number" />
    </div>
  </div>;
}

export function GuaranteeTab({ settings, setSettings }: Props) {
  return <div className="space-y-4">
    <Heading icon={<ShieldCheck />} title="7 kunlik pul qaytarish kafolati matni" />
    <label className="block text-xs font-medium text-ink">Saytda ko‘rinadigan kafolat matni<textarea rows={7} value={settings.guaranteeTextUz} onChange={(event) => setSettings((current) => ({ ...current, guaranteeTextUz: event.target.value }))} className="mt-1 w-full rounded-lg border border-border bg-cream px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent" /></label>
  </div>;
}

function Heading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <h2 className="flex items-center gap-2 border-b border-border pb-3 text-base font-bold text-ink"><span className="text-accent">{icon}</span>{title}</h2>;
}
