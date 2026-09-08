import { HeroSection } from "@/components/sections/HeroSection";
import { ProofStats } from "@/components/sections/ProofStats";
import { CourseCards } from "@/components/sections/CourseCards";
import { siteConfig } from "@/lib/siteConfig";
import { Video, Users, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProofStats />

      {/* Halol Isbot Strip Section */}
      <section className="w-full py-6 bg-[var(--color-cream)] border-b border-[var(--color-border)]">
        <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
          <div className="bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] rounded-xl p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="p-2.5 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex-shrink-0">
                  <Video className="w-5 h-5 text-[var(--color-accent)]" />
                </div>
                <span className="text-sm font-semibold text-[var(--color-ink)]">
                  {siteConfig.sessionFormat}
                </span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3 border-t md:border-t-0 md:border-l border-[var(--color-border)] pt-3 md:pt-0 md:pl-6">
                <div className="p-2.5 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex-shrink-0">
                  <Users className="w-5 h-5 text-[var(--color-accent)]" />
                </div>
                <span className="text-sm font-semibold text-[var(--color-ink)]">
                  {siteConfig.stats.studentsCount} O'quvchi va Bitiruvchilar
                </span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3 border-t md:border-t-0 md:border-l border-[var(--color-border)] pt-3 md:pt-0 md:pl-6">
                <div className="p-2.5 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-success" />
                </div>
                <span className="text-sm font-semibold text-[var(--color-ink)]">
                  {siteConfig.guaranteeText}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CourseCards />
    </>
  );
}
