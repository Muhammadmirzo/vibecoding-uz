import * as React from "react";
import { Save } from "lucide-react";
import type { NotificationState } from "./settingsTypes";

export function NotificationToggles({
  telegramNotify,
  emailNotify,
  smsNotify,
  homeworkDeadlines,
  mentorReviews,
  liveMeetReminders,
  setTelegramNotify,
  setEmailNotify,
  setSmsNotify,
  setHomeworkDeadlines,
  setMentorReviews,
  setLiveMeetReminders,
  handleSaveNotifications,
}: NotificationState) {
  return (
    <>
      {/* Toggles List */}
      <div className="space-y-4 pt-2">
        <div className="font-bold text-xs font-mono uppercase text-ink-subtle">
          Kanal turlari
        </div>

        <div className="grid gap-3">
          <label className="p-4 rounded-xl bg-cream border border-border flex items-center justify-between cursor-pointer hover:border-accent-line transition-colors">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-ink">
                Telegram xabarnomalari
              </div>
              <div className="text-[11px] text-ink-muted">
                Bot orqali barcha muhim hodisalar haqida zudlik bilan xabar
                olish.
              </div>
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
              <div className="text-xs font-bold text-ink">
                Email orqali eslatmalar
              </div>
              <div className="text-[11px] text-ink-muted">
                Haftalik reja va dars xulosalarini pochtaga yuborish.
              </div>
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
              <div className="text-[11px] text-ink-muted">
                Jonli vebinarga 15 daqiqa qolganda SMS yuborish.
              </div>
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
              <div className="text-xs font-bold text-ink">
                Uy vazifalari deadline eslatmasi
              </div>
              <div className="text-[11px] text-ink-muted">
                Vazifa topshirish muddati tugashiga 24 soat qolganda eslatish.
              </div>
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
              <div className="text-xs font-bold text-ink">
                Mentor bahosi va izohi
              </div>
              <div className="text-[11px] text-ink-muted">
                Uy vazifangiz tekshirilib baho qo'yilganda xabar berish.
              </div>
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
              <div className="text-xs font-bold text-ink">
                Haftalik jonli meetlar (Zoom / Meet)
              </div>
              <div className="text-[11px] text-ink-muted">
                Jonli efirlar boshlanishidan oldin havola bilan xabardor qilish.
              </div>
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
    </>
  );
}
