"use client";

import { AlertCircle, Send, User, Phone, Globe, FileText, Loader2 } from "lucide-react";
import type { ApplyFormState } from "./types";

export function InlineApplyFields({ form }: { form: ApplyFormState }) {
  const { errors } = form;
  return (
    <form onSubmit={form.handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-accent" /> Ism va Familiya *</label>
        <input
          type="text"
          required
          placeholder="Jamshid Alimov"
          value={form.fullName}
          onChange={(e) => form.setFullName(e.target.value)}
          className={`w-full h-11 px-3.5 rounded-lg border bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent ${errors.fullName ? "border-red-500" : "border-border-strong"}`}
        />
        {errors.fullName && <p className="text-[11px] text-red-500 font-mono">{errors.fullName}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-accent" /> Telefon raqami *</label>
        <input
          type="tel"
          required
          placeholder="+998901234567"
          value={form.phone}
          onChange={form.handlePhoneChange}
          className={`w-full h-11 px-3.5 rounded-lg border bg-cream text-ink text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent ${errors.phone ? "border-red-500" : "border-border-strong"}`}
        />
        {errors.phone && <p className="text-[11px] text-red-500 font-mono">{errors.phone}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink flex items-center gap-1.5"><Send className="w-3.5 h-3.5 text-accent" /> Telegram userni kiriting</label>
        <input
          type="text"
          placeholder="@foydalanuvchi"
          value={form.telegramUsername}
          onChange={(e) => form.setTelegramUsername(e.target.value)}
          className="w-full h-11 px-3.5 rounded-lg border border-border-strong bg-cream text-ink text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-accent" /> Rezyume / CV havolasi</label>
        <input
          type="url"
          placeholder="https://drive.google.com/..."
          value={form.resumeUrl}
          onChange={(e) => form.setResumeUrl(e.target.value)}
          className={`w-full h-11 px-3.5 rounded-lg border bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent ${errors.resumeUrl ? "border-red-500" : "border-border-strong"}`}
        />
        {errors.resumeUrl && <p className="text-[11px] text-red-500 font-mono">{errors.resumeUrl}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-accent" /> GitHub yoki Portfolio havolasi</label>
        <input
          type="url"
          placeholder="https://github.com/..."
          value={form.portfolioUrl}
          onChange={(e) => form.setPortfolioUrl(e.target.value)}
          className="w-full h-11 px-3.5 rounded-lg border border-border-strong bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink">Qo'shimcha izoh (ixtiyoriy)</label>
        <textarea
          rows={2}
          placeholder="Nega aynan siz bu lavozimga mos kelishingiz haqida..."
          value={form.coverLetter}
          onChange={(e) => form.setCoverLetter(e.target.value)}
          className="w-full p-3 rounded-lg border border-border-strong bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
      </div>
      <button type="submit" disabled={form.loading} className="btn-primary h-12 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 w-full disabled:opacity-50">
        {form.loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Yuborilmoqda...</span></> : <><Send className="w-4 h-4" /><span>Arizani yuborish</span></>}
      </button>
      <p className="text-[11px] text-center text-ink-subtle">Tugmani bosish orqali shaxsiy ma'lumotlarni qayta ishlashga rozilik bildirasiz.</p>
    </form>
  );
}
