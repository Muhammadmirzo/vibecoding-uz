import * as React from "react";
import {
  Share2,
  Users,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import type { ReferralLead, ReferralStats } from "./referralTypes";

interface ReferralStatsProps {
  stats: ReferralStats;
  onPayout: () => void;
}

export function ReferralStats({ stats, onPayout }: ReferralStatsProps) {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-cream-warm border border-border-strong rounded-xl p-5 space-y-1 shadow-sm">
          <div className="text-xs font-mono text-ink-muted flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-accent" /> Havolaga o'tishlar
          </div>
          <div className="text-2xl font-mono font-bold text-ink">
            {stats.clicks}
          </div>
          <div className="text-[10px] text-ink-subtle">Unikal tashriflar</div>
        </div>

        <div className="bg-cream-warm border border-border-strong rounded-xl p-5 space-y-1 shadow-sm">
          <div className="text-xs font-mono text-ink-muted flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-accent" /> Ro'yxatdan o'tganlar
          </div>
          <div className="text-2xl font-mono font-bold text-ink">
            {stats.registered} ta
          </div>
          <div className="text-[10px] text-ink-subtle">
            Kvizi yechgan leadlar
          </div>
        </div>

        <div className="bg-cream-warm border border-border-strong rounded-xl p-5 space-y-1 shadow-sm">
          <div className="text-xs font-mono text-ink-muted flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" /> To'lov
            qilganlar
          </div>
          <div className="text-2xl font-mono font-bold text-success">
            {stats.paid} nafar
          </div>
          <div className="text-[10px] text-ink-subtle">
            Muvaffaqiyatli xaridlar
          </div>
        </div>

        <div className="bg-cream-warm border border-accent-line rounded-xl p-5 space-y-1 shadow-sm relative overflow-hidden">
          <div className="text-xs font-mono font-bold text-accent flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" /> Yechib olinadigan bonus
          </div>
          <div className="text-2xl font-mono font-bold text-accent">
            {stats.balance.toLocaleString("uz-UZ")} UZS
          </div>
          <button
            onClick={onPayout}
            className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1 pt-1"
          >
            <span>Bonusni yechish</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* How Referral Works: 3 Steps */}
      <div className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-ink flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-accent" /> Referral Dasturi
            Qanday Ishlaydi?
          </h3>
          <p className="text-xs text-ink-muted">
            Oddiy 3 qadam orqali qo'shimcha daromadga ega bo'ling.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-cream border border-border space-y-2 relative">
            <div className="w-8 h-8 rounded-full bg-accent text-white font-mono font-bold text-sm flex items-center justify-center">
              1
            </div>
            <h4 className="text-sm font-bold text-ink">Havolani ulashing</h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Shaxsiy taklif havolangizni do'stlaringizga, IT guruhlarga yoki
              blogingizga joylang.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-cream border border-border space-y-2 relative">
            <div className="w-8 h-8 rounded-full bg-accent text-white font-mono font-bold text-sm flex items-center justify-center">
              2
            </div>
            <h4 className="text-sm font-bold text-ink">
              Do'stingiz 10% chegirma oladi
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Sizning havolangiz orqali kelgan har bir talaba kurs xaridida
              avtomatik 10% arzonroq to'laydi.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-cream border border-border space-y-2 relative">
            <div className="w-8 h-8 rounded-full bg-accent text-white font-mono font-bold text-sm flex items-center justify-center">
              3
            </div>
            <h4 className="text-sm font-bold text-ink">
              Sizga 15% keshbek tushadi
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Har bir muvaffaqiyatli to'lovdan 450,000 UZS gacha shaxsiy
              hisobingizga yoki kartangizga yechib oling.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
