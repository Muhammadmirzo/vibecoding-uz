import * as React from "react";
import { Share2, Copy, Check, Send, Sparkles } from "lucide-react";
import type { ReferralLead, ReferralStats } from "./referralTypes";

interface ReferralLinkCardProps {
  referralUrl: string;
  handleCopy: () => void;
  copied: boolean;
}

export function ReferralLinkCard({
  referralUrl,
  handleCopy,
  copied,
}: ReferralLinkCardProps) {
  return (
    <div className="bg-cream-warm border-2 border-accent-line rounded-2xl p-6 md:p-8 space-y-5 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <Share2 className="w-5 h-5 text-accent" /> Shaxsiy Taklif Havolangiz
          </h2>
          <p className="text-xs text-ink-muted">
            Ushbu havolani do'stlaringiz, ijtimoiy tarmoqlar yoki Telegram
            kanalingizda ulashing.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-accent bg-accent-soft px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" /> 15% Keshbek Bonusi
        </div>
      </div>

      {/* Copy Box */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            readOnly
            value={referralUrl}
            className="w-full h-12 px-4 rounded-xl border border-border-strong bg-cream text-ink font-mono text-xs font-semibold select-all focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <button
          onClick={handleCopy}
          className="btn-primary h-12 px-6 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 shrink-0 shadow-sm"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-success" />
              <span>Nusxalandi!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Havolani nusxalash</span>
            </>
          )}
        </button>

        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(
            referralUrl,
          )}&text=${encodeURIComponent(
            "Mirzo Academy (academy.mirzo.uz) da AI va Vibe Coding bo'yicha 8 haftalik intensiv kursga qo'shiling va 10% chegirmaga ega bo'ling!",
          )}`}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary h-12 px-5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 text-telegram shrink-0"
          title="Telegram'da yuborish"
        >
          <Send className="w-4 h-4" />
          <span>Telegram'da ulashish</span>
        </a>
      </div>
    </div>
  );
}
