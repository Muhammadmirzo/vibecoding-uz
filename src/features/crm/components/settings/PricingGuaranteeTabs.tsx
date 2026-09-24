import type { Dispatch, SetStateAction } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";
import { Field } from "./SettingsFields";
import type { SettingsState } from "./types";

type Props = { settings: SettingsState; setSettings: Dispatch<SetStateAction<SettingsState>> };

export function PricingTab({ settings, setSettings }: Props) {
  const setText = (key: "defaultCoursePrice", value: string) => setSettings((current) => ({ ...current, [key]: value }));
  const setNumber = (key: "installmentRate3Months" | "installmentRate6Months", value: string) => setSettings((current) => ({ ...current, [key]: Number(value) }));
  return <div className="space-y-4">
    <Heading icon={<CreditCard />} title="Standart kurs narxlari va bo‘lib to‘lash" />
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Standart kurs narxi (so‘mda)" value={settings.defaultCoursePrice} onChange={(value) => setText("defaultCoursePrice", value)} mono />
      <p className="self-end pb-2 text-xs text-ink-muted">Joriy standart narx: 550 000 so‘m</p>
      <Field label="3 oylik bo‘lib to‘lash ustamasi (%)" value={String(settings.installmentRate3Months)} onChange={(value) => setNumber("installmentRate3Months", value)} type="number" />
      <Field label="6 oylik bo‘lib to‘lash ustamasi (%)" value={String(settings.installmentRate6Months)} onChange={(value) => setNumber("installmentRate6Months", value)} type="number" />
      <p className="rounded-lg border border-border bg-bg-sunken px-4 py-3 text-sm text-ink-muted">Kafolat muddati: {settings.guaranteeRefundDays} kun. Bu siyosat barcha ochiq sahifalarda bir manba orqali ko&apos;rsatiladi.</p>
    </div>
  </div>;
}

export function GuaranteeTab({ settings }: Props) {
  return <div className="space-y-4">
    <Heading icon={<ShieldCheck />} title="Pul qaytarish kafolati" />
    <div className="rounded-lg border border-border bg-bg-elevated p-4 text-sm leading-relaxed text-ink-muted">{settings.guaranteeTextUz}</div>
    <p className="text-xs text-ink-subtle">Matn va muddat sayt konfiguratsiyasidan o&apos;qiladi; alohida admin maydonida saqlanmaydi.</p>
  </div>;
}

function Heading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <h2 className="flex items-center gap-2 border-b border-border pb-3 text-base font-bold text-ink"><span className="text-accent">{icon}</span>{title}</h2>;
}
