"use client";

import { AlertCircle, Send, User, Phone, FileText, Globe, Loader2 } from "lucide-react";
import type { ApplyFormState } from "./types";

export function ModalApplyFields({ form }: { form: ApplyFormState }) {
  const { errors } = form;
  return (
    <form onSubmit={form.handleSubmit} className="space-y-4 pt-4">
      {errors.general && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-danger/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-accent" /> F.I.SH. (Ism va Familiya) *
        </label>
        <input
          type="text"
          required
          placeholder="Jamshid Alimov"
          value={form.fullName}
          onChange={(e) => form.setFullName(e.target.value)}
          className={`w-full h-11 px-3.5 rounded-lg border bg-bg-sunken text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent ${errors.fullName ? "border-danger" : "border-border-strong"}`}
        />
        {errors.fullName && <p className="text-[11px] text-red-500 font-mono">{errors.fullName}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-accent" /> Telefon raqami *
        </label>
        <input
          type="tel"
          required
          placeholder="+998901234567"
          value={form.phone}
          onChange={form.handlePhoneChange}
          className={`w-full h-11 px-3.5 rounded-lg border bg-bg-sunken text-ink text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent ${errors.phone ? "border-danger" : "border-border-strong"}`}
        />
        <p className="text-[11px] text-ink-subtle">Format: +998901234567 (qo'ng'iroq va SMS uchun)</p>
        {errors.phone && <p className="text-[11px] text-red-500 font-mono">{errors.phone}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
          <Send className="w-3.5 h-3.5 text-accent" /> Telegram foydalanuvchi nomi
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-3 text-xs font-mono text-ink-subtle">@</span>
          <input
            type="text"
            placeholder="jamshid_dev"
            value={form.telegramUsername.replace(/^@/, "")}
            onChange={(e) => form.setTelegramUsername("@" + e.target.value.replace(/^@/, ""))}
            className="w-full h-11 pl-8 pr-3.5 rounded-lg border border-border-strong bg-bg-sunken text-ink text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink">Tajriba darajasi</label>
          <select
            value={form.experience}
            onChange={(e) => form.setExperience(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-border-strong bg-bg-sunken text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="Boshlang'ich (0-1 yil)">Boshlang'ich (0-1 yil)</option>
            <option value="1-3 yil">1-3 yil (O'rta daraja)</option>
            <option value="3-5 yil">3-5 yil (Katta tajriba)</option>
            <option value="5+ yil">5+ yil (Senior / Lead)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-accent" /> GitHub / Portfolio
          </label>
          <input type="url" placeholder="https://github.com/..." value={form.portfolioUrl} onChange={(e) => form.setPortfolioUrl(e.target.value)} className="w-full h-11 px-3 rounded-lg border border-border-strong bg-bg-sunken text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-accent" /> Rezyume / CV havolasi (Google Drive, Notion yoki PDF)
        </label>
        <input
          type="url"
          placeholder="https://drive.google.com/file/..."
          value={form.resumeUrl}
          onChange={(e) => form.setResumeUrl(e.target.value)}
          className={`w-full h-11 px-3.5 rounded-lg border bg-bg-sunken text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent ${errors.resumeUrl ? "border-danger" : "border-border-strong"}`}
        />
        {errors.resumeUrl && <p className="text-[11px] text-red-500 font-mono">{errors.resumeUrl}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink">O'zingiz haqingizda qisqacha (Nega aynan siz?)</label>
        <textarea
          rows={3}
          placeholder="Qanday loyihalarda ishlagansiz va qaysi AI vositalarini bilasiz..."
          value={form.coverLetter}
          onChange={(e) => form.setCoverLetter(e.target.value)}
          className="w-full p-3 rounded-lg border border-border-strong bg-bg-sunken text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
      </div>
      <div className="pt-2">
        <button type="submit" disabled={form.loading} className="min-h-12 rounded-full bg-gold text-xs font-semibold text-on-gold inline-flex items-center justify-center gap-2 w-full disabled:opacity-50">
          {form.loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Ariza yuborilmoqda...</span></> : <><Send className="w-4 h-4" /><span>Arizani topshirish</span></>}
        </button>
      </div>
    </form>
  );
}
