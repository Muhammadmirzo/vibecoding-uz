import Link from "next/link";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProofStats } from "@/components/sections/ProofStats";
import { CourseCards } from "@/components/sections/CourseCards";
import { PortfolioSection } from "@/components/sections/PortfolioSection";
import { TeaserBanner } from "@/components/sections/TeaserBanner";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FaqSection } from "@/components/sections/FaqSection";
import { siteConfig } from "@/lib/siteConfig";
import { Video, Users, ShieldCheck, HelpCircle } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProofStats />

      {/* Halol Isbot Strip Section */}
      <section className="w-full py-6 bg-cream border-b border-border">
        <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
          <div className="bg-cream-warm border border-border-strong rounded-xl p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="p-2.5 rounded-lg bg-accent-soft text-accent flex-shrink-0">
                  <Video className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm font-semibold text-ink">
                  {siteConfig.sessionFormat}
                </span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-6">
                <div className="p-2.5 rounded-lg bg-accent-soft text-accent flex-shrink-0">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm font-semibold text-ink">
                  {siteConfig.stats.studentsCount} O'quvchi va Bitiruvchilar
                </span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-6">
                <div className="p-2.5 rounded-lg bg-accent-soft text-accent flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-success" />
                </div>
                <span className="text-sm font-semibold text-ink">
                  {siteConfig.guaranteeText}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CourseCards />
      <PortfolioSection />

      {/* Quiz tie-in bar ostida */}
      <div className="w-full py-4 bg-cream border-t border-b border-border">
        <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 text-center">
          <Link
            href="/diagnostika"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-accent hover:underline decoration-accent underline-offset-4 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-accent flex-shrink-0" />
            <span>Qaysi kurs sizga mos? 2 daqiqalik diagnostika bilan aniqlang</span>
          </Link>
        </div>
      </div>

      <TeaserBanner />
      <HowItWorks />
      <FaqSection />
    </>
  );
}
