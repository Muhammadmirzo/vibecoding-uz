import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { Key } from "lucide-react";
import { Field, SecretField } from "./SettingsFields";
import type { SettingsState } from "./types";

type Props = { settings: SettingsState; setSettings: Dispatch<SetStateAction<SettingsState>> };
type KeyName = "payme" | "click" | "tg" | "sms";

export function IntegrationsTab({ settings, setSettings }: Props) {
  const [visible, setVisible] = useState<Record<KeyName, boolean>>({ payme: false, click: false, tg: false, sms: false });
  const set = (key: keyof SettingsState, value: string) => setSettings((current) => ({ ...current, [key]: value }));
  const toggle = (key: KeyName) => setVisible((current) => ({ ...current, [key]: !current[key] }));
  return <div className="space-y-6">
    <h2 className="flex items-center gap-2 border-b border-border pb-3 text-base font-bold text-ink"><Key className="h-4 w-4 text-accent" />To‘lov tizimlari va bot kalitlari</h2>
    <div className="space-y-3 rounded-xl border border-border bg-cream p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Payme merchant API</h3>
      <div className="grid gap-3 md:grid-cols-2"><Field label="Merchant ID" value={settings.paymeMerchantId} onChange={(value) => set("paymeMerchantId", value)} mono /><SecretField label="Secret / password" value={settings.paymeSecretKey} onChange={(value) => set("paymeSecretKey", value)} visible={visible.payme} onToggle={() => toggle("payme")} /></div>
    </div>
    <div className="space-y-3 rounded-xl border border-border bg-cream p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Click merchant API</h3>
      <div className="grid gap-3 md:grid-cols-2"><Field label="Service ID" value={settings.clickServiceId} onChange={(value) => set("clickServiceId", value)} mono /><SecretField label="Secret key" value={settings.clickSecretKey} onChange={(value) => set("clickSecretKey", value)} visible={visible.click} onToggle={() => toggle("click")} /></div>
    </div>
    <div className="space-y-3 rounded-xl border border-border bg-cream p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Telegram bot va SMS</h3>
      <div className="grid gap-3 md:grid-cols-2"><SecretField label="Telegram bot token" value={settings.telegramBotToken} onChange={(value) => set("telegramBotToken", value)} visible={visible.tg} onToggle={() => toggle("tg")} /><SecretField label="SMS API token" value={settings.smsApiKey} onChange={(value) => set("smsApiKey", value)} visible={visible.sms} onToggle={() => toggle("sms")} /></div>
    </div>
  </div>;
}
