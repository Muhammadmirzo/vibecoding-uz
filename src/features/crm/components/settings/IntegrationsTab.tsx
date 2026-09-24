import type { Dispatch, SetStateAction } from "react";
import { CheckCircle2, Key, Settings2, XCircle } from "lucide-react";
import { Field } from "./SettingsFields";
import type { SettingsState } from "./types";

type Props = { settings: SettingsState; setSettings: Dispatch<SetStateAction<SettingsState>> };
type Provider = "payme" | "click" | "telegram" | "sms";

const labels: Record<Provider, string> = {
  payme: "Payme",
  click: "Click",
  telegram: "Telegram bot",
  sms: "Eskiz SMS",
};

export function IntegrationsTab({ settings, setSettings }: Props) {
  const providers = Object.keys(labels) as Provider[];
  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 border-b border-border pb-3 text-base font-bold text-ink">
        <Key className="h-4 w-4 text-accent" aria-hidden="true" />To&apos;lov tizimlari va xabar yuborish
      </h2>
      <div className="rounded-xl border border-border bg-bg-sunken p-4 text-sm leading-relaxed text-ink-muted">
        <Settings2 className="mr-2 inline size-4 text-accent" aria-hidden="true" />
        Maxfiy kalitlar faqat server muhitida saqlanadi. Admin panel ularni ko&apos;rsatmaydi, yozmaydi va API orqali qaytarmaydi.
      </div>
      <div className="space-y-3 rounded-xl border border-border bg-bg-elevated p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Payme merchant</h3>
        <Field label="Merchant ID" value={settings.paymeMerchantId} onChange={(value) => setSettings((current) => ({ ...current, paymeMerchantId: value }))} mono />
      </div>
      <div className="space-y-3 rounded-xl border border-border bg-bg-elevated p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Click merchant</h3>
        <Field label="Service ID" value={settings.clickServiceId} onChange={(value) => setSettings((current) => ({ ...current, clickServiceId: value }))} mono />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {providers.map((provider) => {
          const configured = settings.integrationStatus[provider] === "sozlangan";
          return (
            <div key={provider} className="flex min-h-16 items-center justify-between gap-3 rounded-lg border border-border bg-bg-elevated p-4">
              <span className="font-semibold text-ink">{labels[provider]}</span>
              <span className={configured ? "inline-flex items-center gap-1.5 text-sm font-semibold text-success" : "inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted"}>
                {configured ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <XCircle className="size-4" aria-hidden="true" />}
                {settings.integrationStatus[provider]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
