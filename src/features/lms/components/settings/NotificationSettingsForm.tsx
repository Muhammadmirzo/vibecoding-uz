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
import type { NotificationState } from "./settingsTypes";
import { NotificationToggles } from "./NotificationToggles";

export function NotificationSettingsForm({
  telegramNotify,
  emailNotify,
  smsNotify,
  homeworkDeadlines,
  mentorReviews,
  liveMeetReminders,
  notifSaved,
  setTelegramNotify,
  setEmailNotify,
  setSmsNotify,
  setHomeworkDeadlines,
  setMentorReviews,
  setLiveMeetReminders,
  handleSaveNotifications,
}: NotificationState) {
  return (
    <div className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
      <div className="border-b border-border pb-3">
        <h2 className="text-lg font-bold text-ink">
          Bildirishnomalar va Telegram Integratsiyasi
        </h2>
        <p className="text-xs text-ink-muted">
          Darslar, topshiriq muddatlari va mentor javoblarini qanday qabul
          qilishni sozlang.
        </p>
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
              Uy vazifangiz mentor tomonidan tekshirilganda Telegram orqali
              bildirishnoma olasiz.
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

      <NotificationToggles
        telegramNotify={telegramNotify}
        emailNotify={emailNotify}
        smsNotify={smsNotify}
        homeworkDeadlines={homeworkDeadlines}
        mentorReviews={mentorReviews}
        liveMeetReminders={liveMeetReminders}
        notifSaved={notifSaved}
        setTelegramNotify={setTelegramNotify}
        setEmailNotify={setEmailNotify}
        setSmsNotify={setSmsNotify}
        setHomeworkDeadlines={setHomeworkDeadlines}
        setMentorReviews={setMentorReviews}
        setLiveMeetReminders={setLiveMeetReminders}
        handleSaveNotifications={handleSaveNotifications}
      />
    </div>
  );
}
