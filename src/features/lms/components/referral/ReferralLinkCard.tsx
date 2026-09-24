import { Share2, Copy, Check, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form";
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
    <div className="rounded-2xl border border-border bg-bg-elevated p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <Share2 className="w-5 h-5 text-accent" /> Shaxsiy Taklif Havolangiz
          </h2>
          <p className="text-sm text-ink-muted sm:text-base">
            Ushbu havolani do'stlaringiz, ijtimoiy tarmoqlar yoki Telegram
            kanalingizda ulashing.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
          <Sparkles className="h-3.5 w-3.5" /> Bonus dasturi
        </div>
      </div>

      {/* Copy Box */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="flex-1 relative">
          <Input
            type="text"
            readOnly
            value={referralUrl}
            aria-label="Shaxsiy taklif havolasi"
            className="rounded-xl font-mono text-sm font-semibold sm:text-base"
          />
        </div>

        <Button
          type="button"
          onClick={handleCopy}
          size="lg"
          className="w-full shrink-0 text-base sm:w-auto"
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
        </Button>

        <Button asChild variant="telegram" size="lg" className="w-full shrink-0 text-base sm:w-auto">
          <a
          href={`https://t.me/share/url?url=${encodeURIComponent(
            referralUrl,
          )}&text=${encodeURIComponent(
            "Naqsh kursiga qo'shiling va o'rganishni davom ettiring!",
          )}`}
          target="_blank"
          rel="noreferrer"
          title="Telegram'da yuborish"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          <span>Telegram'da ulashish</span>
        </a>
        </Button>
      </div>
    </div>
  );
}
