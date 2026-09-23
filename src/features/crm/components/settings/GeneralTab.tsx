import type { Dispatch, SetStateAction } from "react";
import { Globe } from "lucide-react";
import { Field, Toggle } from "./SettingsFields";
import type { SettingsState } from "./types";

type Props = { settings: SettingsState; setSettings: Dispatch<SetStateAction<SettingsState>> };

export function GeneralTab({ settings, setSettings }: Props) {
  const text = (key: keyof SettingsState, value: string) => setSettings((current) => ({ ...current, [key]: value }));
  const toggle = (key: keyof SettingsState, value: boolean) => setSettings((current) => ({ ...current, [key]: value }));
  return <div className="space-y-8">
    <Heading title="Platforma asosiy parametrlari" />
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Platforma nomi" value={settings.siteTitle} onChange={(value) => text("siteTitle", value)} />
      <Field label="Qo‘llab-quvvatlash telefon" value={settings.supportPhone} onChange={(value) => text("supportPhone", value)} />
      <Field label="Qo‘llab-quvvatlash Telegram" value={settings.supportTelegram} onChange={(value) => text("supportTelegram", value)} mono />
      <Toggle label="Texnik tanaffus rejimi" description="Tizimni yangilashda kirishni vaqtincha cheklash" checked={settings.maintenanceMode} onChange={(value) => toggle("maintenanceMode", value)} />
    </div>
    <Heading title="Dinamik CTA, havolalar va e’lon banneri" />
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Header CTA matni" value={settings.headerCtaText} onChange={(value) => text("headerCtaText", value)} />
      <Field label="Header CTA havola" value={settings.headerCtaLink} onChange={(value) => text("headerCtaLink", value)} mono />
      <Field label="Kabinet / ro‘yxatdan o‘tish" value={settings.enrollmentUrl} onChange={(value) => text("enrollmentUrl", value)} mono />
      <Field label="Telegram maslahat havolasi" value={settings.telegramBotLink} onChange={(value) => text("telegramBotLink", value)} mono />
      <Field label="E’lon banner matni" value={settings.announcementBannerText} onChange={(value) => text("announcementBannerText", value)} />
      <Field label="E’lon banner havolasi" value={settings.announcementBannerLink} onChange={(value) => text("announcementBannerLink", value)} mono />
      <div className="md:col-span-2"><Toggle label="E’lon bannerini ko‘rsatish" description="Sayt yuqorisida e’lon tasmasini namoyish etish" checked={settings.enableAnnouncementBanner} onChange={(value) => toggle("enableAnnouncementBanner", value)} /></div>
    </div>
  </div>;
}

function Heading({ title }: { title: string }) {
  return <h2 className="flex items-center gap-2 border-b border-border pb-3 text-base font-bold text-ink"><Globe className="h-4 w-4 text-accent" />{title}</h2>;
}
