"use client";

import { useEffect, useState } from "react";
import type { SettingsState } from "./types";
import { siteConfig } from "@/lib/siteConfig";

const initialSettings: SettingsState = {
  siteTitle: "Naqsh", supportPhone: "+998 71 200 00 00", supportTelegram: "@mirzo_academy_support_bot", maintenanceMode: false,
  headerCtaText: "Kurs tanlash", headerCtaLink: "/#kurs-tanlash", enrollmentUrl: "/kabinet", telegramBotLink: "https://t.me/m/ODAfK_QIMjky",
  announcementBannerText: "Yangi Vibe Coding Express guruhiga qabul boshlandi! Mashg'ulotlar tez orada start oladi.", announcementBannerLink: "/kurs/vibe-coding-express", enableAnnouncementBanner: true,
  defaultCoursePrice: "550000.00", installmentRate3Months: 0, installmentRate6Months: 10, guaranteeRefundDays: siteConfig.guaranteeDays,
  guaranteeTextUz: siteConfig.guaranteeSummary,
  paymeMerchantId: "", paymeSecretKey: "", clickServiceId: "", clickSecretKey: "", telegramBotToken: "", smsApiKey: "",
  enableGamification: true, enableCommunityForum: true, enableInteractiveQuizzes: true, enableB2BEnterprise: true, enableCardReferrals: true, enableLevelGating: true, enableGuaranteeTrust: true,
  credPhone: "", credEmail: "", oldPassword: "", newPassword: "", confirmPassword: "",
  integrationStatus: { payme: "sozlanmagan", click: "sozlanmagan", telegram: "sozlanmagan", sms: "sozlanmagan" },
};

const boolKeys = ["maintenanceMode", "enableAnnouncementBanner", "enableGamification", "enableCommunityForum", "enableInteractiveQuizzes", "enableB2BEnterprise", "enableCardReferrals", "enableLevelGating", "enableGuaranteeTrust"] as const;
const numberKeys = ["installmentRate3Months", "installmentRate6Months", "guaranteeRefundDays"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetch("/api/admin/settings").then(async (response) => {
        const payload: unknown = await response.json();
        if (!isRecord(payload) || payload.success !== true || !isRecord(payload.settings)) return;
        const remote = payload.settings;
        setSettings((current) => Object.fromEntries(Object.entries(current).map(([key, fallback]) => {
          const value = remote[key];
          if (value === undefined) return [key, fallback];
          if (key === "integrationStatus" && isRecord(value)) return [key, value];
          if ((boolKeys as readonly string[]).includes(key)) return [key, Boolean(value)];
          if ((numberKeys as readonly string[]).includes(key)) return [key, Number(value)];
          return [key, String(value)];
        })) as SettingsState);
      }),
      fetch("/api/me").then(async (response) => {
        const payload: unknown = await response.json();
        if (!isRecord(payload) || !isRecord(payload.user)) return;
        const user = payload.user;
        setSettings((current) => ({ ...current, credPhone: String(user.phone ?? current.credPhone), credEmail: String(user.email ?? current.credEmail) }));
      }),
    ]).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      const payload: unknown = await response.json();
      if (isRecord(payload) && payload.success) { setSaved(true); window.setTimeout(() => setSaved(false), 4000); }
      else window.alert(isRecord(payload) ? String(payload.error ?? "Sozlamalarni saqlashda xatolik") : "Sozlamalarni saqlashda xatolik");
    } finally { setSaving(false); }
  }

  return { settings, setSettings, loading, saving, saved, save };
}
