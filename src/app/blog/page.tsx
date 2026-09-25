import type * as React from "react";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { STATIC_BLOG_POST_SUMMARIES } from "@/features/blog/blogData";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/features/motion/ui/Reveal";
import { routeMetadata } from "@/lib/seo";
import { BlogExplorer } from "./BlogExplorer";
import "@/components/pages/w6c.css";

export const metadata = routeMetadata({
  title: "Blog — AI, vibe coding va mahsulot qurish haqida",
  description: "AI vositalari, vibe coding va mahsulot qurish bo'yicha amaliy maqolalar va qo'llanmalar.",
  path: "/blog",
});

export default function BlogListPage() {
  return (
    <div className="min-h-screen bg-bg pb-20 text-ink">
      <div className="w6c-hero">
        <div className="w6c-hero-mesh" aria-hidden="true" />
        <div className="mx-auto w-full max-w-container space-y-8 px-5 pt-28 sm:px-8 sm:pt-32">
          <header className="relative z-10 mx-auto max-w-[760px] space-y-4 text-center">
            <span className="w6c-load inline-flex items-center gap-2 rounded-md border border-border bg-bg-elevated px-3.5 py-1.5 text-xs font-semibold text-accent" style={{ "--i": 0 } as React.CSSProperties}>
              <BookOpen className="h-4 w-4" /> Naqsh maqolalari
            </span>
            <h1 className="w6c-load text-balance font-display text-[clamp(2rem,1.25rem+2.2vw,3.25rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-ink" style={{ "--i": 1 } as React.CSSProperties}>
              AI va Vibe Coding bo&apos;yicha zamonaviy bilimlar
            </h1>
            <p className="w6c-load text-base leading-relaxed text-ink-muted" style={{ "--i": 2 } as React.CSSProperties}>
              Claude Code, Cursor IDE, prompt muhandisligi va dasturchilarsiz real startaplar qurish bo&apos;yicha amaliy qo&apos;llanmalar.
            </p>
          </header>
        </div>
      </div>
      <div className="mx-auto w-full max-w-container space-y-8 px-5 sm:px-8">

        <BlogExplorer posts={STATIC_BLOG_POST_SUMMARIES} />

        <Reveal>
          <section className="card-glow flex flex-col items-center justify-between gap-8 rounded-2xl border border-border bg-bg-elevated p-8 shadow-sm md:flex-row md:p-12">
            <div className="max-w-xl space-y-3 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent"><Sparkles className="h-4 w-4" /> Vibe Coding Express</span>
              <h2 className="text-balance font-display text-[clamp(1.5rem,1.2rem+1vw,2.25rem)] font-semibold leading-tight tracking-[-0.03em] text-ink">Nazariyani tugatib, amaliyotga o&apos;ting</h2>
              <p className="text-sm text-ink-muted md:text-base">8 haftalik mentorlik kursida Claude Code va Cursor yordamida o&apos;z real loyihangizni quring.</p>
            </div>
            <Button href="/kurs/vibe-coding-express" size="lg" className="w-full md:w-auto">Kurs dasturini ko&apos;rish <ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>
          </section>
        </Reveal>
      </div>
      <NextStepCTA />
    </div>
  );
}
