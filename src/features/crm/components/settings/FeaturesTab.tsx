import type { Dispatch, SetStateAction } from "react";
import { CheckCircle } from "lucide-react";
import { Toggle } from "./SettingsFields";
import type { SettingsState } from "./types";

type Props = { settings: SettingsState; setSettings: Dispatch<SetStateAction<SettingsState>> };
type Flag = "enableGamification" | "enableCommunityForum" | "enableInteractiveQuizzes" | "enableB2BEnterprise" | "enableCardReferrals" | "enableLevelGating" | "enableGuaranteeTrust";

const flags: Array<{ key: Flag; label: string; description: string }> = [
  { key: "enableGamification", label: "Gamifikatsiya va XP", description: "Darajalar, streak va reyting tizimini yoqish." },
  { key: "enableCommunityForum", label: "Ichki community forum", description: "Savol-javob va guruh kanallarini yoqish." },
  { key: "enableInteractiveQuizzes", label: "Interaktiv testlar", description: "Darsdagi bilimni tekshirish testlarini yoqish." },
  { key: "enableB2BEnterprise", label: "B2B korporativ ta’lim", description: "Kompaniyalar uchun korporativ funksiyalarni yoqish." },
  { key: "enableCardReferrals", label: "Referral naqd pul", description: "Do‘st taklifini karta orqali rag‘batlantirish." },
  { key: "enableLevelGating", label: "Darajali kontent", description: "Bonus kontentni XP darajasiga bog‘lash." },
  { key: "enableGuaranteeTrust", label: "7 kunlik kafolat tizimi", description: "Landing va checkout sahifalarida kafolat matnini ko‘rsatish." },
];

export function FeaturesTab({ settings, setSettings }: Props) {
  return <div className="space-y-6">
    <h2 className="flex items-center gap-2 border-b border-border pb-3 text-base font-bold text-ink"><CheckCircle className="h-4 w-4 text-accent" />Rejalar va modullarni boshqarish</h2>
    <p className="text-xs text-ink-muted">Platforma funksiyalarini yoqish yoki o‘chirish uchun tegishli kalitni tanlang.</p>
    <div className="grid gap-4 md:grid-cols-2">{flags.map(({ key, label, description }) => <Toggle key={key} label={label} description={description} checked={settings[key]} onChange={(value) => setSettings((current) => ({ ...current, [key]: value }))} />)}</div>
  </div>;
}
