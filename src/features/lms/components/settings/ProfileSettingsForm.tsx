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
import type { SettingsProfileState } from "./settingsTypes";

export function ProfileSettingsForm({
  fullName,
  email,
  phone,
  city,
  profession,
  goal,
  bio,
  avatarUrl,
  profileLoading,
  profileSuccess,
  profileError,
  setFullName,
  setEmail,
  setCity,
  setProfession,
  setGoal,
  setBio,
  setAvatarUrl,
  handleProfileSubmit,
}: SettingsProfileState) {
  return (
    <div className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
      <div className="border-b border-border pb-3">
        <h2 className="text-lg font-bold text-ink">
          Shaxsiy Profil Ma'lumotlari
        </h2>
        <p className="text-xs text-ink-muted">
          Sizning sertifikatingiz va mentorlar bilan muloqotda ko'rinadigan
          ma'lumotlar.
        </p>
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
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-accent" /> F.I.SH. (Sertifikat
              uchun) *
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
            <p className="text-[10px] text-ink-subtle">
              Asosiy login identifikatori hisoblanadi.
            </p>
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
            <label className="text-xs font-semibold text-ink">
              Avatar / Rasm havolasi
            </label>
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
          <label className="text-xs font-semibold text-ink">
            O'zingiz haqingizda qisqacha bio
          </label>
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
            {profileLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>O'zgarishlarni saqlash</span>
          </button>
        </div>
      </form>
    </div>
  );
}
