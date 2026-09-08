"use client";

import * as React from "react";
import {
  User,
  Lock,
  Bell,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Smartphone,
  Mail,
  MapPin,
  Briefcase,
  Target,
  Sparkles,
} from "lucide-react";
import { KabinetNav } from "@/features/lms/components/KabinetNav";
import { useAuth } from "@/context/AuthContext";
import {
  updateStudentProfileSchema,
  studentChangePasswordSchema,
  studentNotificationSettingsSchema,
} from "@/lib/validations/student";

export default function SozlamalarPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = React.useState<"profile" | "password" | "notifications">("profile");

  // Profile form state
  const [fullName, setFullName] = React.useState(user?.fullName || "Jamshid Alimov");
  const [email, setEmail] = React.useState(user?.email || "jamshid@example.uz");
  const [phone, setPhone] = React.useState(user?.phone || "+998901234567");
  const [city, setCity] = React.useState("Toshkent");
  const [profession, setProfession] = React.useState("Startap asoschisi");
  const [goal, setGoal] = React.useState("AI vositalari orqali 1 oyda SaaS mahsulotimni yaratish");
  const [bio, setBio] = React.useState("Vibe coding bilan qiziqaman, mahsulotlarni tezroq bozorga chiqarishni xohlayman.");
  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatarUrl || "");

  // Password form state
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Notifications state
  const [telegramNotify, setTelegramNotify] = React.useState(true);
  const [emailNotify, setEmailNotify] = React.useState(true);
  const [smsNotify, setSmsNotify] = React.useState(false);
  const [homeworkDeadlines, setHomeworkDeadlines] = React.useState(true);
  const [mentorReviews, setMentorReviews] = React.useState(true);
  const [liveMeetReminders, setLiveMeetReminders] = React.useState(true);

  // Status feedback
  const [profileLoading, setProfileLoading] = React.useState(false);
  const [profileSuccess, setProfileSuccess] = React.useState(false);
  const [profileError, setProfileError] = React.useState<string | null>(null);

  const [passwordLoading, setPasswordLoading] = React.useState(false);
  const [passwordSuccess, setPasswordSuccess] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);

  const [notifSaved, setNotifSaved] = React.useState(false);

  // Sync state if user auth data arrives
  React.useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
    }
  }, [user]);

  // Handle Profile Save
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    const payload = {
      fullName: fullName.trim(),
      email: email.trim() || undefined,
      phone: phone.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
      city: city.trim(),
      profession: profession.trim(),
      goal: goal.trim(),
      bio: bio.trim(),
    };

    const parseResult = updateStudentProfileSchema.safeParse(payload);
    if (!parseResult.success) {
      setProfileError(parseResult.error.errors[0]?.message || "Ma'lumotlar noto'g'ri kiritildi");
      return;
    }

    setProfileLoading(true);

    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parseResult.data),
      });

      const data = await res.json();

      if (!res.ok) {
        setProfileError(data.error || "Profilni saqlashda xatolik yuz berdi");
        setProfileLoading(false);
        return;
      }

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError("Tarmoq xatosi. Iltimos qayta urinib ko'ring.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    const payload = {
      currentPassword,
      newPassword,
      confirmPassword,
    };

    const parseResult = studentChangePasswordSchema.safeParse(payload);
    if (!parseResult.success) {
      setPasswordError(parseResult.error.errors[0]?.message || "Parollar bir-biriga mos kelmadi");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Parolni o'zgartirishda xatolik yuz berdi");
        setPasswordLoading(false);
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError("Server bilan aloqa uzildi.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Notifications Save
  const handleSaveNotifications = () => {
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 3000);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-cream">
      {/* Universal Student Navigation */}
      <KabinetNav />

      <div className="mx-auto w-full max-w-[1000px] px-5 md:px-8 space-y-8">
        
        {/* Page Title & User Header */}
        <div className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xl shadow-md">
              {fullName ? fullName.slice(0, 2).toUpperCase() : "JA"}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-ink">{fullName}</h1>
              <p className="text-xs font-mono text-ink-muted">{phone} · {email}</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-accent bg-accent-soft px-2.5 py-0.5 rounded-full border border-accent-line">
                <Sparkles className="w-3 h-3" /> Faol Talaba: Vibe Coding Express
              </span>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex md:flex-col items-end gap-1 text-xs font-mono text-ink-subtle">
            <div>Rol: <strong className="text-ink">Talaba</strong></div>
            <div>Guruh: <strong className="text-accent">Oktyabr 2026</strong></div>
          </div>
        </div>

        {/* Settings Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold inline-flex items-center gap-2 transition-all ${
              activeTab === "profile"
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:text-ink hover:bg-cream-warm"
            }`}
          >
            <User className="w-4 h-4" /> Shaxsiy Ma'lumotlar
          </button>

          <button
            onClick={() => setActiveTab("password")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold inline-flex items-center gap-2 transition-all ${
              activeTab === "password"
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:text-ink hover:bg-cream-warm"
            }`}
          >
            <Lock className="w-4 h-4" /> Parol & Xavfsizlik
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold inline-flex items-center gap-2 transition-all ${
              activeTab === "notifications"
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:text-ink hover:bg-cream-warm"
            }`}
          >
            <Bell className="w-4 h-4" /> Bildirishnomalar & Telegram
          </button>
        </div>

        {/* TAB 1: Profile Settings */}
        {activeTab === "profile" && (
          <div className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="border-b border-border pb-3">
              <h2 className="text-lg font-bold text-ink">Shaxsiy Profil Ma'lumotlari</h2>
              <p className="text-xs text-ink-muted">Sizning sertifikatingiz va mentorlar bilan muloqotda ko'rinadigan ma'lumotlar.</p>
            </div>

            {profileSuccess && (
              <div className="p-3.5 rounded-lg bg-success-soft border border-success-line text-success text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profilingiz muvaffaqiyatli saqlandi!</span>
              </div>
            )}

            {profileError && (
              <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-accent" /> F.I.SH. (Sertifikat uchun) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-border-strong bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-accent" /> Telefon raqam
                  </label>
                  <input
                    type="text"
                    disabled
                    value={phone}
                    className="w-full h-11 px-3.5 rounded-lg border border-border bg-cream-deep text-ink-subtle text-xs font-mono cursor-not-allowed"
                    title="Telefon raqamini o'zgartirish uchun ma'muriyat bilan bog'laning"
                  />
                  <p className="text-[10px] text-ink-subtle">Asosiy login identifikatori hisoblanadi.</p>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-accent" /> Email manzil
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-border-strong bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent" /> Yashash shahri
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-border-strong bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* Profession */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-accent" /> Kasbi yoki Soha
                  </label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-border-strong bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* Avatar URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Avatar / Rasm havolasi</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-border-strong bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

              </div>

              {/* Goal */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-accent" /> Kursdan asosiy maqsad
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border-strong bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">O'zingiz haqingizda qisqacha bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 rounded-lg border border-border-strong bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn-primary h-11 px-6 rounded-lg text-xs font-semibold inline-flex items-center gap-2"
                >
                  {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>O'zgarishlarni saqlash</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Password & Security */}
        {activeTab === "password" && (
          <div className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 shadow-sm space-y-6 max-w-xl">
            <div className="border-b border-border pb-3">
              <h2 className="text-lg font-bold text-ink">Parolni O'zgartirish</h2>
              <p className="text-xs text-ink-muted">Xavfsizlik uchun kamida 8 ta belgidan iborat murakkab paroldan foydalaning.</p>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 rounded-lg bg-success-soft border border-success-line text-success text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Parolingiz muvaffaqiyatli yangilandi!</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Joriy parol *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border-strong bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Yangi parol (min. 8 ta belgi) *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border-strong bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Yangi parolni tasdiqlash *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border-strong bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-primary h-11 px-6 rounded-lg text-xs font-semibold inline-flex items-center gap-2 w-full justify-center"
                >
                  {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Parolni yangilash</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: Notifications & Telegram */}
        {activeTab === "notifications" && (
          <div className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="border-b border-border pb-3">
              <h2 className="text-lg font-bold text-ink">Bildirishnomalar va Telegram Integratsiyasi</h2>
              <p className="text-xs text-ink-muted">Darslar, topshiriq muddatlari va mentor javoblarini qanday qabul qilishni sozlang.</p>
            </div>

            {notifSaved && (
              <div className="p-3.5 rounded-lg bg-success-soft border border-success-line text-success text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Bildirishnoma sozlamalari saqlandi!</span>
              </div>
            )}

            {/* Telegram Bot Card */}
            <div className="p-5 rounded-xl bg-cream border border-accent-line flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-telegram-soft text-telegram flex items-center justify-center shrink-0">
                  <Send className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-ink flex items-center gap-2">
                    Telegram Bot Ulanishi
                    <span className="text-[11px] font-mono font-bold text-success bg-success-soft px-2 py-0.5 rounded-full">
                      Faol Ulangan
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted">
                    Uy vazifangiz mentor tomonidan tekshirilganda Telegram orqali bildirishnoma olasiz.
                  </p>
                </div>
              </div>

              <a
                href="https://t.me/m/ODAfK_QIMjky"
                target="_blank"
                rel="noreferrer"
                className="shrink-0"
              >
                <button className="btn-secondary h-10 px-4 rounded-lg text-xs font-semibold inline-flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-telegram" />
                  <span>Bot sozlamalarini yangilash</span>
                </button>
              </a>
            </div>

            {/* Toggles List */}
            <div className="space-y-4 pt-2">
              <div className="font-bold text-xs font-mono uppercase text-ink-subtle">
                Kanal turlari
              </div>

              <div className="grid gap-3">
                <label className="p-4 rounded-xl bg-cream border border-border flex items-center justify-between cursor-pointer hover:border-accent-line transition-colors">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-ink">Telegram xabarnomalari</div>
                    <div className="text-[11px] text-ink-muted">Bot orqali barcha muhim hodisalar haqida zudlik bilan xabar olish.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={telegramNotify}
                    onChange={(e) => setTelegramNotify(e.target.checked)}
                    className="w-5 h-5 accent-accent cursor-pointer"
                  />
                </label>

                <label className="p-4 rounded-xl bg-cream border border-border flex items-center justify-between cursor-pointer hover:border-accent-line transition-colors">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-ink">Email orqali eslatmalar</div>
                    <div className="text-[11px] text-ink-muted">Haftalik reja va dars xulosalarini pochtaga yuborish.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotify}
                    onChange={(e) => setEmailNotify(e.target.checked)}
                    className="w-5 h-5 accent-accent cursor-pointer"
                  />
                </label>

                <label className="p-4 rounded-xl bg-cream border border-border flex items-center justify-between cursor-pointer hover:border-accent-line transition-colors">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-ink">SMS eslatmalar</div>
                    <div className="text-[11px] text-ink-muted">Jonli vebinarga 15 daqiqa qolganda SMS yuborish.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsNotify}
                    onChange={(e) => setSmsNotify(e.target.checked)}
                    className="w-5 h-5 accent-accent cursor-pointer"
                  />
                </label>
              </div>

              <div className="font-bold text-xs font-mono uppercase text-ink-subtle pt-3">
                Eslatma mavzulari
              </div>

              <div className="grid gap-3">
                <label className="p-4 rounded-xl bg-cream border border-border flex items-center justify-between cursor-pointer hover:border-accent-line transition-colors">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-ink">Uy vazifalari deadline eslatmasi</div>
                    <div className="text-[11px] text-ink-muted">Vazifa topshirish muddati tugashiga 24 soat qolganda eslatish.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={homeworkDeadlines}
                    onChange={(e) => setHomeworkDeadlines(e.target.checked)}
                    className="w-5 h-5 accent-accent cursor-pointer"
                  />
                </label>

                <label className="p-4 rounded-xl bg-cream border border-border flex items-center justify-between cursor-pointer hover:border-accent-line transition-colors">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-ink">Mentor bahosi va izohi</div>
                    <div className="text-[11px] text-ink-muted">Uy vazifangiz tekshirilib baho qo'yilganda xabar berish.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={mentorReviews}
                    onChange={(e) => setMentorReviews(e.target.checked)}
                    className="w-5 h-5 accent-accent cursor-pointer"
                  />
                </label>

                <label className="p-4 rounded-xl bg-cream border border-border flex items-center justify-between cursor-pointer hover:border-accent-line transition-colors">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-ink">Haftalik jonli meetlar (Zoom / Meet)</div>
                    <div className="text-[11px] text-ink-muted">Jonli efirlar boshlanishidan oldin havola bilan xabardor qilish.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={liveMeetReminders}
                    onChange={(e) => setLiveMeetReminders(e.target.checked)}
                    className="w-5 h-5 accent-accent cursor-pointer"
                  />
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveNotifications}
                  className="btn-primary h-11 px-6 rounded-lg text-xs font-semibold inline-flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Sozlamalarni saqlash</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
