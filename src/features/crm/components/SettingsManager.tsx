"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Globe,
  CreditCard,
  ShieldCheck,
  Key,
  Save,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  UserCheck,
} from "lucide-react";

export function SettingsManager() {
  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "guarantee" | "integrations" | "features" | "security">("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Settings State
  const [siteTitle, setSiteTitle] = useState("Mirzo Academy");
  const [supportPhone, setSupportPhone] = useState("+998 71 200 00 00");
  const [supportTelegram, setSupportTelegram] = useState("@mirzo_academy_support_bot");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Dynamic CTA, URLs & Announcement Banner State
  const [headerCtaText, setHeaderCtaText] = useState("Kurs tanlash");
  const [headerCtaLink, setHeaderCtaLink] = useState("/#kurs-tanlash");
  const [enrollmentUrl, setEnrollmentUrl] = useState("/kabinet");
  const [telegramBotLink, setTelegramBotLink] = useState("https://t.me/m/ODAfK_QIMjky");
  const [announcementBannerText, setAnnouncementBannerText] = useState("Yangi Vibe Coding Express guruhiga qabul boshlandi! Mashg'ulotlar tez orada start oladi.");
  const [announcementBannerLink, setAnnouncementBannerLink] = useState("/kurs/vibe-coding-express");
  const [enableAnnouncementBanner, setEnableAnnouncementBanner] = useState(true);

  const [defaultCoursePrice, setDefaultCoursePrice] = useState("2990000.00");
  const [installmentRate3Months, setInstallmentRate3Months] = useState(0);
  const [installmentRate6Months, setInstallmentRate6Months] = useState(10);
  const [guaranteeRefundDays, setGuaranteeRefundDays] = useState(14);

  const [guaranteeTextUz, setGuaranteeTextUz] = useState(
    "14 kun davomida o'quv dasturi ma'qul kelmasa, to'lov 100% holatda hech qanday savollarsiz va ortiqcha shartlarsiz darhol qaytarib beriladi."
  );

  const [paymeMerchantId, setPaymeMerchantId] = useState("");
  const [paymeSecretKey, setPaymeSecretKey] = useState("");
  const [clickServiceId, setClickServiceId] = useState("");
  const [clickSecretKey, setClickSecretKey] = useState("");
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [smsApiKey, setSmsApiKey] = useState("");

  // Feature Flags & Plan Toggles State
  const [enableGamification, setEnableGamification] = useState(true);
  const [enableCommunityForum, setEnableCommunityForum] = useState(true);
  const [enableInteractiveQuizzes, setEnableInteractiveQuizzes] = useState(true);
  const [enableB2BEnterprise, setEnableB2BEnterprise] = useState(true);
  const [enableCardReferrals, setEnableCardReferrals] = useState(true);
  const [enableLevelGating, setEnableLevelGating] = useState(true);
  const [enableGuaranteeTrust, setEnableGuaranteeTrust] = useState(true);

  // Security / Credentials State
  const [credPhone, setCredPhone] = useState("");
  const [credEmail, setCredEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [credSaving, setCredSaving] = useState(false);
  const [credSuccess, setCredSuccess] = useState<string | null>(null);
  const [credError, setCredError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        if (s.siteTitle !== undefined) setSiteTitle(String(s.siteTitle));
        if (s.supportPhone !== undefined) setSupportPhone(String(s.supportPhone));
        if (s.supportTelegram !== undefined) setSupportTelegram(String(s.supportTelegram));
        if (s.maintenanceMode !== undefined) setMaintenanceMode(Boolean(s.maintenanceMode));
        if (s.defaultCoursePrice !== undefined) setDefaultCoursePrice(String(s.defaultCoursePrice));
        if (s.installmentRate3Months !== undefined) setInstallmentRate3Months(Number(s.installmentRate3Months));
        if (s.installmentRate6Months !== undefined) setInstallmentRate6Months(Number(s.installmentRate6Months));
        if (s.guaranteeRefundDays !== undefined) setGuaranteeRefundDays(Number(s.guaranteeRefundDays));
        if (s.guaranteeTextUz !== undefined) setGuaranteeTextUz(String(s.guaranteeTextUz));
        if (s.paymeMerchantId !== undefined) setPaymeMerchantId(String(s.paymeMerchantId));
        if (s.paymeSecretKey !== undefined) setPaymeSecretKey(String(s.paymeSecretKey));
        if (s.clickServiceId !== undefined) setClickServiceId(String(s.clickServiceId));
        if (s.clickSecretKey !== undefined) setClickSecretKey(String(s.clickSecretKey));
        if (s.telegramBotToken !== undefined) setTelegramBotToken(String(s.telegramBotToken));
        if (s.smsApiKey !== undefined) setSmsApiKey(String(s.smsApiKey));

        // Dynamic CTA, URLs & Announcement Banner
        if (s.headerCtaText !== undefined) setHeaderCtaText(String(s.headerCtaText));
        if (s.headerCtaLink !== undefined) setHeaderCtaLink(String(s.headerCtaLink));
        if (s.enrollmentUrl !== undefined) setEnrollmentUrl(String(s.enrollmentUrl));
        if (s.telegramBotLink !== undefined) setTelegramBotLink(String(s.telegramBotLink));
        if (s.announcementBannerText !== undefined) setAnnouncementBannerText(String(s.announcementBannerText ?? ""));
        if (s.announcementBannerLink !== undefined) setAnnouncementBannerLink(String(s.announcementBannerLink ?? ""));
        if (s.enableAnnouncementBanner !== undefined) setEnableAnnouncementBanner(Boolean(s.enableAnnouncementBanner));

        // Feature flags
        if (s.enableGamification !== undefined) setEnableGamification(Boolean(s.enableGamification));
        if (s.enableCommunityForum !== undefined) setEnableCommunityForum(Boolean(s.enableCommunityForum));
        if (s.enableInteractiveQuizzes !== undefined) setEnableInteractiveQuizzes(Boolean(s.enableInteractiveQuizzes));
        if (s.enableB2BEnterprise !== undefined) setEnableB2BEnterprise(Boolean(s.enableB2BEnterprise));
        if (s.enableCardReferrals !== undefined) setEnableCardReferrals(Boolean(s.enableCardReferrals));
        if (s.enableLevelGating !== undefined) setEnableLevelGating(Boolean(s.enableLevelGating));
        if (s.enableGuaranteeTrust !== undefined) setEnableGuaranteeTrust(Boolean(s.enableGuaranteeTrust));
      }
    } catch (err) {
      console.error("Fetch settings error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      if (data.user) {
        if (data.user.phone) setCredPhone(data.user.phone);
        if (data.user.email) setCredEmail(data.user.email);
      }
    } catch (err) {
      console.error("Fetch user profile error:", err);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchUserProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const payload = {
        siteTitle,
        supportPhone,
        supportTelegram,
        maintenanceMode,
        defaultCoursePrice,
        installmentRate3Months: Number(installmentRate3Months),
        installmentRate6Months: Number(installmentRate6Months),
        guaranteeRefundDays: Number(guaranteeRefundDays),
        guaranteeTextUz,
        paymeMerchantId,
        paymeSecretKey,
        clickServiceId,
        clickSecretKey,
        telegramBotToken,
        smsApiKey,
        headerCtaText,
        headerCtaLink,
        enrollmentUrl,
        telegramBotLink,
        announcementBannerText,
        announcementBannerLink,
        enableAnnouncementBanner,
        enableGamification,
        enableCommunityForum,
        enableInteractiveQuizzes,
        enableB2BEnterprise,
        enableCardReferrals,
        enableLevelGating,
        enableGuaranteeTrust,
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        alert(data.error || "Sozlamalarni saqlashda xatolik");
      }
    } catch (err) {
      console.error("Save settings error:", err);
      alert("Sozlamalarni saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredSaving(true);
    setCredError(null);
    setCredSuccess(null);

    if (newPassword && newPassword !== confirmPassword) {
      setCredError("Yangi parollar bir-biriga mos kelmadi");
      setCredSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: credPhone,
          email: credEmail,
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCredSuccess(data.message || "Parol va ma'lumotlar muvaffaqiyatli yangilandi");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setCredSuccess(null), 5000);
      } else {
        setCredError(data.error || "Ma'lumotlarni yangilashda xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Credentials submit error:", err);
      setCredError("Kutilmagan xatolik yuz berdi");
    } finally {
      setCredSaving(false);
    }
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { id: "general", label: "Platforma", icon: Globe },
    { id: "pricing", label: "Narxlar & Bo'lib To'lash", icon: CreditCard },
    { id: "guarantee", label: "Kafolat Shartlari", icon: ShieldCheck },
    { id: "integrations", label: "Integratsiya Kalitlari", icon: Key },
    { id: "features", label: "Rejalar & Modullarni Ishga Tushirish", icon: CheckCircle },
    { id: "security", label: "Parol & Login", icon: Lock },
  ] as const;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
            <Settings className="w-6 h-6 text-accent" />
            Tizim Sozlamalari & Konfiguratsiya
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Sayt parametrlari, tariflar, qaytarish kafolati, integratsiyalar va xavfsizlik sozlamalari.
          </p>
        </div>

        {activeTab !== "security" && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-all shadow-sm gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Sozlamalarni Saqlash
          </button>
        )}
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-success-soft border border-success/30 text-success text-sm font-medium">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
          Barcha tizim sozlamalari muvaffaqiyatli saqlandi!
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b border-border bg-cream-warm p-1 rounded-xl overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-accent text-white shadow-sm"
                  : "text-ink-muted hover:text-ink hover:bg-cream"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Form */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : activeTab === "security" ? (
        /* TAB 6: SECURITY & CREDENTIALS FORM */
        <form onSubmit={handleCredentialsSubmit} className="bg-cream-warm border border-border rounded-xl p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-ink border-b border-border pb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent" />
              Login (Email / Telefon) va Parolni O'zgartirish
            </h2>

            <p className="text-xs text-ink-muted">
              Ushbu bo'lim orqali admin/xodim tizimga kirish telefon raqami, email hamda parolini xavfsiz holatda yangilashi mumkin.
            </p>

            {credSuccess && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-success-soft border border-success/30 text-success text-sm font-medium">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                {credSuccess}
              </div>
            )}

            {credError && (
              <div className="p-4 rounded-xl bg-accent-soft border border-accent-line text-accent text-sm font-medium">
                {credError}
              </div>
            )}

            {/* Login Credentials Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Kirish Telefon Raqami</label>
                <input
                  type="text"
                  value={credPhone}
                  onChange={(e) => setCredPhone(e.target.value)}
                  placeholder="+998901234567"
                  className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">Kirish Email Adresi</label>
                <input
                  type="email"
                  value={credEmail}
                  onChange={(e) => setCredEmail(e.target.value)}
                  placeholder="admin@academy.mirzo.uz"
                  className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <h3 className="text-xs font-bold uppercase text-ink tracking-wider">Parolni Yangilash</h3>

              {/* Old Password */}
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Eski Parol (Tasdiqlash uchun)</label>
                <div className="relative">
                  <input
                    type={showOldPass ? "text" : "password"}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Eski parolingizni kiriting"
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password & Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Yangi Parol (Kamida 8 ta belgi)</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Yangi Parolni Tasdiqlash</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end border-t border-border pt-4">
            <button
              type="submit"
              disabled={credSaving}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors shadow-sm disabled:opacity-50 gap-2"
            >
              {credSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Parol va Loginni Yangilash
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSave} className="bg-cream-warm border border-border rounded-xl p-6 space-y-6">
          {/* TAB 1: General Site Settings */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-ink border-b border-border pb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent" />
                Platforma Asosiy Parametrlari
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Platforma Nomi (Site Title)</label>
                  <input
                    type="text"
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Qo'llab-quvvatlash Telefoni</label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Qo'llab-quvvatlash Telegram Bot / User</label>
                  <input
                    type="text"
                    value={supportTelegram}
                    onChange={(e) => setSupportTelegram(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-cream border border-border rounded-lg mt-auto">
                  <div>
                    <span className="block text-sm font-semibold text-ink">Texnik Tanaffus Rejimi (Maintenance Mode)</span>
                    <span className="block text-xs text-ink-muted">Tizimni yangilash paytida talabalar kirishini vaqtincha cheklash</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="w-5 h-5 accent-accent rounded cursor-pointer"
                  />
                </div>
              </div>

              <h2 className="text-base font-bold text-ink border-b border-border pt-4 pb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent" />
                Dinamik CTA, Havolalar va E'lon Banneri
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Header CTA Tugmasi Matni</label>
                  <input
                    type="text"
                    value={headerCtaText}
                    onChange={(e) => setHeaderCtaText(e.target.value)}
                    placeholder="Kurs tanlash"
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Header CTA Tugmasi Havolasi</label>
                  <input
                    type="text"
                    value={headerCtaLink}
                    onChange={(e) => setHeaderCtaLink(e.target.value)}
                    placeholder="/#kurs-tanlash"
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Ro'yxatdan O'tish / Kabinet Havolasi (Enrollment URL)</label>
                  <input
                    type="text"
                    value={enrollmentUrl}
                    onChange={(e) => setEnrollmentUrl(e.target.value)}
                    placeholder="/kabinet"
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Telegram Bot / Maslahat Havolasi</label>
                  <input
                    type="text"
                    value={telegramBotLink}
                    onChange={(e) => setTelegramBotLink(e.target.value)}
                    placeholder="https://t.me/m/ODAfK_QIMjky"
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">E'lon Banner Matni</label>
                  <input
                    type="text"
                    value={announcementBannerText}
                    onChange={(e) => setAnnouncementBannerText(e.target.value)}
                    placeholder="Yangi Vibe Coding Express guruhiga qabul boshlandi!"
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">E'lon Banner Havolasi</label>
                  <input
                    type="text"
                    value={announcementBannerLink}
                    onChange={(e) => setAnnouncementBannerLink(e.target.value)}
                    placeholder="/kurs/vibe-coding-express"
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-cream border border-border rounded-lg md:col-span-2">
                  <div>
                    <span className="block text-sm font-semibold text-ink">E'lon Bannerini Ko'rsatish (Announcement Banner)</span>
                    <span className="block text-xs text-ink-muted">Sayt yuqorisida e'lon tasmasini namoyish etish</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableAnnouncementBanner}
                    onChange={(e) => setEnableAnnouncementBanner(e.target.checked)}
                    className="w-5 h-5 accent-accent rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Pricing & Installments */}
          {activeTab === "pricing" && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-ink border-b border-border pb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-accent" />
                Standart Kurs Narxlari va Bo'lib To'lash Parametrlari
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Standart Kurs Narxi (so'mda)</label>
                  <input
                    type="text"
                    value={defaultCoursePrice}
                    onChange={(e) => setDefaultCoursePrice(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                  />
                  <span className="text-[11px] text-ink-muted mt-1 block">Yangi guruhlar uchun tavsiya etilgan standart narx</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">3 Oylik Bo mezon ustamasi (%)</label>
                  <input
                    type="number"
                    value={installmentRate3Months}
                    onChange={(e) => setInstallmentRate3Months(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">6 Oylik Bo'lib to'lash ustamasi (%)</label>
                  <input
                    type="number"
                    value={installmentRate6Months}
                    onChange={(e) => setInstallmentRate6Months(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Qaytarish Kafolati Muddati (kunlarda)</label>
                  <input
                    type="number"
                    value={guaranteeRefundDays}
                    onChange={(e) => setGuaranteeRefundDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Guarantee Text */}
          {activeTab === "guarantee" && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-ink border-b border-border pb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                100% Pulni Qaytarib Berish Kafolat Shartlari (Uzbek)
              </h2>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">Saytda ko'rinadigan kafolat matni</label>
                <textarea
                  rows={6}
                  value={guaranteeTextUz}
                  onChange={(e) => setGuaranteeTextUz(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-ink-muted mt-2">
                  Ushbu matn sayt landing page va checkout sahifasida talabalarga namoyish etiladi.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: Integration Keys */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-ink border-b border-border pb-3 flex items-center gap-2">
                <Key className="w-4 h-4 text-accent" />
                To'lov Tizimlari va Bot Integratsiya Kalitlari
              </h2>

              {/* Payme */}
              <div className="bg-cream p-4 rounded-xl border border-border space-y-3">
                <h3 className="text-xs font-bold uppercase text-ink tracking-wider">Payme Merchant API</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Payme Merchant ID</label>
                    <input
                      type="text"
                      value={paymeMerchantId}
                      onChange={(e) => setPaymeMerchantId(e.target.value)}
                      placeholder="64a8b...12"
                      className="w-full px-3 py-2 text-xs bg-cream-warm border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Payme Secret / Password Key</label>
                    <div className="relative">
                      <input
                        type={showKeys["payme"] ? "text" : "password"}
                        value={paymeSecretKey}
                        onChange={(e) => setPaymeSecretKey(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 text-xs bg-cream-warm border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-accent pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility("payme")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                      >
                        {showKeys["payme"] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Click */}
              <div className="bg-cream p-4 rounded-xl border border-border space-y-3">
                <h3 className="text-xs font-bold uppercase text-ink tracking-wider">Click Merchant API</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Click Service ID</label>
                    <input
                      type="text"
                      value={clickServiceId}
                      onChange={(e) => setClickServiceId(e.target.value)}
                      placeholder="31024"
                      className="w-full px-3 py-2 text-xs bg-cream-warm border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Click Secret Key</label>
                    <div className="relative">
                      <input
                        type={showKeys["click"] ? "text" : "password"}
                        value={clickSecretKey}
                        onChange={(e) => setClickSecretKey(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 text-xs bg-cream-warm border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-accent pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility("click")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                      >
                        {showKeys["click"] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Telegram & SMS */}
              <div className="bg-cream p-4 rounded-xl border border-border space-y-3">
                <h3 className="text-xs font-bold uppercase text-ink tracking-wider">Telegram Bot & SMS Gateway</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Telegram Bot Token</label>
                    <div className="relative">
                      <input
                        type={showKeys["tg"] ? "text" : "password"}
                        value={telegramBotToken}
                        onChange={(e) => setTelegramBotToken(e.target.value)}
                        placeholder="68192031:AAH..."
                        className="w-full px-3 py-2 text-xs bg-cream-warm border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-accent pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility("tg")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                      >
                        {showKeys["tg"] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Eskiz SMS API Bearer Token</label>
                    <div className="relative">
                      <input
                        type={showKeys["sms"] ? "text" : "password"}
                        value={smsApiKey}
                        onChange={(e) => setSmsApiKey(e.target.value)}
                        placeholder="eyJhbGciOi..."
                        className="w-full px-3 py-2 text-xs bg-cream-warm border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-accent pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility("sms")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                      >
                        {showKeys["sms"] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Feature Flags & Plan Toggles */}
          {activeTab === "features" && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-ink border-b border-border pb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                Biznes Rejalar & Strategik Modullarni Boshqarish (Feature Flags)
              </h2>

              <p className="text-xs text-ink-muted">
                Platformadagi yangi modullar va biznes rejalarni hohlagan vaqtingizda 1-bosing orqali yoqishingiz (Enable) yoki o'chirib qo'yishingiz (Disable) mumkin.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Gamification & XP */}
                <div className="p-4 bg-cream border border-border rounded-xl flex items-start justify-between gap-3">
                  <div>
                    <span className="block text-sm font-bold text-ink">🎮 Gamifikatsiya & XP Tizimi</span>
                    <span className="text-xs text-ink-muted block mt-0.5">
                      Talabalar uchun 9 darajali XP toplash, daily streaklar va leaderboard darajalarini faollashtirish.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableGamification}
                    onChange={(e) => setEnableGamification(e.target.checked)}
                    className="w-5 h-5 accent-accent rounded cursor-pointer mt-1"
                  />
                </div>

                {/* 2. Community Forum */}
                <div className="p-4 bg-cream border border-border rounded-xl flex items-start justify-between gap-3">
                  <div>
                    <span className="block text-sm font-bold text-ink">💬 Ichki LMS Community Forum</span>
                    <span className="text-xs text-ink-muted block mt-0.5">
                      Talabalar va mentorlar o'rtasida savol-javoblar hamda kanallar (#general, #prompts, #wins) forumi.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableCommunityForum}
                    onChange={(e) => setEnableCommunityForum(e.target.checked)}
                    className="w-5 h-5 accent-accent rounded cursor-pointer mt-1"
                  />
                </div>

                {/* 3. Interactive Quizzes */}
                <div className="p-4 bg-cream border border-border rounded-xl flex items-start justify-between gap-3">
                  <div>
                    <span className="block text-sm font-bold text-ink">📝 Interaktiv Dars Testlari</span>
                    <span className="text-xs text-ink-muted block mt-0.5">
                      Darslar oxirida avtomatik baholanuvchi tezkor testlar va bilimlarni sinash tizimini yoqish.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableInteractiveQuizzes}
                    onChange={(e) => setEnableInteractiveQuizzes(e.target.checked)}
                    className="w-5 h-5 accent-accent rounded cursor-pointer mt-1"
                  />
                </div>

                {/* 4. B2B Enterprise Billing */}
                <div className="p-4 bg-cream border border-border rounded-xl flex items-start justify-between gap-3">
                  <div>
                    <span className="block text-sm font-bold text-ink">🏢 B2B Korporativ Ta'lim & Soliq.uz</span>
                    <span className="text-xs text-ink-muted block mt-0.5">
                      Banklar va kompaniyalar uchun Didox / Factura orqali shartnoma tuzish va korporativ paketlar.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableB2BEnterprise}
                    onChange={(e) => setEnableB2BEnterprise(e.target.checked)}
                    className="w-5 h-5 accent-accent rounded cursor-pointer mt-1"
                  />
                </div>

                {/* 5. Card Referral Cashback */}
                <div className="p-4 bg-cream border border-border rounded-xl flex items-start justify-between gap-3">
                  <div>
                    <span className="block text-sm font-bold text-ink">💳 Uzcard/Humo Kartasiga Referral Cashback</span>
                    <span className="text-xs text-ink-muted block mt-0.5">
                      Do'stini taklif qilgan talabalarga 10% daromadni to'g'ridan-to'g'ri bank kartasiga o'tkazib berish.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableCardReferrals}
                    onChange={(e) => setEnableCardReferrals(e.target.checked)}
                    className="w-5 h-5 accent-accent rounded cursor-pointer mt-1"
                  />
                </div>

                {/* 6. Level-Gated Content Unlocks */}
                <div className="p-4 bg-cream border border-border rounded-xl flex items-start justify-between gap-3">
                  <div>
                    <span className="block text-sm font-bold text-ink">🔓 Level-Gated Kontent (Darajali Unlocks)</span>
                    <span className="text-xs text-ink-muted block mt-0.5">
                      Yuqori XP darajalariga erishgan talabalar uchun maxsus bonus darslar va promptlarni ochish.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableLevelGating}
                    onChange={(e) => setEnableLevelGating(e.target.checked)}
                    className="w-5 h-5 accent-accent rounded cursor-pointer mt-1"
                  />
                </div>

                {/* 7. Guarantee Trust Engine */}
                <div className="p-4 bg-cream border border-border rounded-xl flex items-start justify-between gap-3 col-span-1 md:col-span-2">
                  <div>
                    <span className="block text-sm font-bold text-ink">🛡️ 100% 7-Kunlik Pulni Qaytarish Kafolat Tizimi</span>
                    <span className="text-xs text-ink-muted block mt-0.5">
                      Landing va checkout sahifalarida 100% pulni qaytarib berish kafolat bejini va avtomatik refund tizimini yoqish.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableGuaranteeTrust}
                    onChange={(e) => setEnableGuaranteeTrust(e.target.checked)}
                    className="w-5 h-5 accent-accent rounded cursor-pointer mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Submit Footer */}
          <div className="flex items-center justify-end border-t border-border pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors shadow-sm disabled:opacity-50 gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Sozlamalarni Saqlash
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
