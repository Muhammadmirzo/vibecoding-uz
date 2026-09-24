"use client";

import { Bell, Lock, User } from "lucide-react";
import { KabinetNav } from "@/features/lms/components/KabinetNav";
import { useSettingsProfile } from "@/features/lms/components/settings/useSettingsProfile";
import { ProfileSettingsForm } from "@/features/lms/components/settings/ProfileSettingsForm";
import { CredentialsSettingsForm } from "@/features/lms/components/settings/CredentialsSettingsForm";
import { NotificationSettingsForm } from "@/features/lms/components/settings/NotificationSettingsForm";

const tabs = [
  { id: "profile" as const, label: "Profil", icon: User },
  { id: "password" as const, label: "Xavfsizlik", icon: Lock },
  { id: "notifications" as const, label: "Bildirishnomalar", icon: Bell },
];

export default function SozlamalarPage() {
  const settings = useSettingsProfile();
  const { activeTab, setActiveTab, fullName, phone, email } = settings;
  const contact = [phone, email].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen bg-bg text-ink">
      <KabinetNav />
      <main className="mx-auto w-full max-w-5xl space-y-8 px-5 pb-28 pt-24 md:px-8 md:pt-28 lg:pl-80 lg:pr-8">
        <header className="flex flex-col gap-5 rounded-2xl border border-border bg-bg-elevated p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-soft font-display text-lg font-semibold text-brand">
              {fullName ? fullName.slice(0, 2).toUpperCase() : "—"}
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-semibold text-ink">{fullName || "Profilingizni to&apos;ldiring"}</h1>
              <p className="mt-1 break-words text-sm text-ink-muted">{contact || "Kontakt ma&apos;lumotlari kiritilmagan"}</p>
            </div>
          </div>
          <p className="rounded-lg bg-bg-sunken px-3 py-2 text-sm text-ink-muted">Rol: talaba</p>
        </header>

        <div role="tablist" aria-label="Sozlamalar bo&apos;limlari" className="grid grid-cols-3 gap-2 border-b border-border pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold ${active ? "bg-brand text-bg" : "text-ink-muted hover:bg-bg-sunken hover:text-ink"}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div role="tabpanel">
          {activeTab === "profile" ? <ProfileSettingsForm {...settings} /> : null}
          {activeTab === "password" ? <CredentialsSettingsForm {...settings} /> : null}
          {activeTab === "notifications" ? <NotificationSettingsForm {...settings} /> : null}
        </div>
      </main>
    </div>
  );
}
