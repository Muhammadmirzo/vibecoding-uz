"use client";

import { User, Lock, Bell, Sparkles } from "lucide-react";
import { KabinetNav } from "@/features/lms/components/KabinetNav";
import { useSettingsProfile } from "@/features/lms/components/settings/useSettingsProfile";
import { ProfileSettingsForm } from "@/features/lms/components/settings/ProfileSettingsForm";
import { CredentialsSettingsForm } from "@/features/lms/components/settings/CredentialsSettingsForm";
import { NotificationSettingsForm } from "@/features/lms/components/settings/NotificationSettingsForm";

export default function SozlamalarPage() {
  const settings = useSettingsProfile();
  const { activeTab, setActiveTab, fullName, phone, email } = settings;

  return (
    <div className="pt-24 pb-16 min-h-screen bg-cream">
      <KabinetNav />
      <div className="mx-auto w-full max-w-[1000px] px-5 md:px-8 space-y-8">
        <div className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xl shadow-md">
              {fullName ? fullName.slice(0, 2).toUpperCase() : "JA"}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-ink">{fullName}</h1>
              <p className="text-xs font-mono text-ink-muted">
                {phone} · {email}
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-accent bg-accent-soft px-2.5 py-0.5 rounded-full border border-accent-line">
                <Sparkles className="w-3 h-3" /> Faol Talaba: Vibe Coding
                Express
              </span>
            </div>
          </div>
          <div className="flex md:flex-col items-end gap-1 text-xs font-mono text-ink-subtle">
            <div>
              Rol: <strong className="text-ink">Talaba</strong>
            </div>
            <div>
              Guruh: <strong className="text-accent">Oktyabr 2026</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-border pb-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold inline-flex items-center gap-2 transition-all ${activeTab === "profile" ? "bg-accent text-white shadow-sm" : "text-ink-muted hover:text-ink hover:bg-cream-warm"}`}
          >
            <User className="w-4 h-4" /> Shaxsiy Ma'lumotlar
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold inline-flex items-center gap-2 transition-all ${activeTab === "password" ? "bg-accent text-white shadow-sm" : "text-ink-muted hover:text-ink hover:bg-cream-warm"}`}
          >
            <Lock className="w-4 h-4" /> Parol & Xavfsizlik
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold inline-flex items-center gap-2 transition-all ${activeTab === "notifications" ? "bg-accent text-white shadow-sm" : "text-ink-muted hover:text-ink hover:bg-cream-warm"}`}
          >
            <Bell className="w-4 h-4" /> Bildirishnomalar & Telegram
          </button>
        </div>

        {activeTab === "profile" && <ProfileSettingsForm {...settings} />}
        {activeTab === "password" && <CredentialsSettingsForm {...settings} />}
        {activeTab === "notifications" && (
          <NotificationSettingsForm {...settings} />
        )}
      </div>
    </div>
  );
}
