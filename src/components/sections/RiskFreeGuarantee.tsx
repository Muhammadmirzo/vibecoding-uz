import { ShieldCheck, RefreshCw, Headphones } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

const guaranteeConditions = [
  `Kurs kirish havolasi ochilganidan keyin ${siteConfig.guaranteeDays} kun ichida ariza bering.`,
  "Birinchi 2 modulni yakunlang va barcha uy vazifalarini topshiring.",
  "Ariza operatsiya bo'limiga 24 soat ichida ko'rib chiqiladi; to'lov 3 bank kuni ichida qaytariladi.",
];

export function RiskFreeGuarantee() {
  return (
    <section className="w-full py-14 bg-cream border-b border-border">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        <div className="bg-gradient-to-br from-cream-warm via-cream to-cream-warm border-2 border-accent-line/80 rounded-2xl p-6 md:p-10 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-soft text-success text-xs font-mono font-bold uppercase tracking-wider mb-4 border border-success/20">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>Xavfsiz Kafolat</span>
            </div>

            <h2 className="text-2xl md:text-4xl font-extrabold text-ink tracking-tight mb-4">
              <span className="accent-serif">{siteConfig.guaranteeText}</span>
            </h2>

            <p className="text-sm md:text-base text-ink-muted leading-relaxed mb-6">
              {siteConfig.guaranteeSummary}{" "}
              <Link href={siteConfig.guaranteeTermsUrl} className="font-semibold text-accent hover:underline">
                To'liq shartlarni o'qing
              </Link>
              .
            </p>

            <ul className="space-y-3 mb-8" aria-label="Pul qaytarish shartlari va tartibi">
              {guaranteeConditions.map((condition) => (
                <li key={condition} className="flex items-start gap-3 text-sm text-ink">
                  <RefreshCw className="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{condition}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/kurs/vibe-coding-express" className="w-full sm:w-auto">
                <span className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-hover transition-colors shadow-sm">
                  <Headphones className="w-4 h-4" aria-hidden="true" />
                  Kafolat bilan boshlash
                </span>
              </Link>
              <span className="text-xs font-mono text-ink-subtle">
                Payme va Click orqali 3 oygacha foizsiz to&apos;lash mumkin
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
