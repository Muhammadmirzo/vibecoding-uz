import * as React from "react";
import { ShieldCheck, RefreshCw, Headphones, Award } from "lucide-react";
import Link from "next/link";

export function RiskFreeGuarantee() {
  return (
    <section className="w-full py-14 bg-cream border-b border-border">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        <div className="bg-gradient-to-br from-cream-warm via-cream to-cream-warm border-2 border-accent-line/80 rounded-2xl p-6 md:p-10 shadow-sm relative overflow-hidden">
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-soft text-success text-xs font-mono font-bold uppercase tracking-wider mb-4 border border-success/20">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>100% Xavfsiz Kafolat</span>
            </div>

            <h2 className="text-2xl md:text-4xl font-extrabold text-ink tracking-tight mb-4">
              14 kunlik sinov davri: Yo birinchi mahsulotingizni chiqarasiz,{" "}
              <span className="accent-serif">yo pulingizni 100% qaytaramiz</span>.
            </h2>

            <p className="text-sm md:text-base text-ink-muted leading-relaxed mb-8">
              Biz metodologiyamizga to'liq ishonamiz. Agar darslarga qatnashib, 14 kun ichida AI yordamida dastur qurish natijasini his qilmasangiz yoki kurs sizga ma'qul kelmasa — ortiqcha savollarsiz to'langan har bir so'm 24 soat ichida kartangizga qaytariladi.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-cream border border-border">
                <RefreshCw className="w-5 h-5 text-accent shrink-0" />
                <span className="text-xs md:text-sm font-semibold text-ink">
                  24 soatda so'zsiz qaytarish
                </span>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-cream border border-border">
                <Headphones className="w-5 h-5 text-accent shrink-0" />
                <span className="text-xs md:text-sm font-semibold text-ink">
                  Shaxsiy mentorlik va yordam
                </span>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-cream border border-border">
                <Award className="w-5 h-5 text-accent shrink-0" />
                <span className="text-xs md:text-sm font-semibold text-ink">
                  Tayyor jonli portfolio kafolati
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/kurs/vibe-coding-express" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-hover transition-colors shadow-sm">
                  Kafolat bilan boshlash
                </button>
              </Link>
              <span className="text-xs font-mono text-ink-subtle">
                Payme & Click orqali 3 oygacha foizsiz bo'lib to'lash mumkin
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
