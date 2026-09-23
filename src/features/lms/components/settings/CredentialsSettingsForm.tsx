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
import type { CredentialsState } from "./settingsTypes";

export function CredentialsSettingsForm({
  currentPassword,
  newPassword,
  confirmPassword,
  passwordLoading,
  passwordSuccess,
  passwordError,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  handlePasswordSubmit,
}: CredentialsState) {
  return (
    <div className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 shadow-sm space-y-6 max-w-xl">
      <div className="border-b border-border pb-3">
        <h2 className="text-lg font-bold text-ink">Parolni O'zgartirish</h2>
        <p className="text-xs text-ink-muted">
          Xavfsizlik uchun kamida 8 ta belgidan iborat murakkab paroldan
          foydalaning.
        </p>
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
          <label className="text-xs font-semibold text-ink">
            Joriy parol *
          </label>
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
          <label className="text-xs font-semibold text-ink">
            Yangi parol (min. 8 ta belgi) *
          </label>
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
          <label className="text-xs font-semibold text-ink">
            Yangi parolni tasdiqlash *
          </label>
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
            {passwordLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            <span>Parolni yangilash</span>
          </button>
        </div>
      </form>
    </div>
  );
}
