import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { STATIC_BLOG_POST_SUMMARIES } from "@/features/blog/blogData";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import { Button } from "@/components/ui/Button";
import { BlogExplorer } from "./BlogExplorer";

export default function BlogListPage() {
  return (
    <div className="min-h-screen bg-bg pb-20 pt-28 text-ink">
      <div className="mx-auto w-full max-w-container space-y-8 px-5 sm:px-8">
        <header className="mx-auto max-w-[760px] space-y-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-bg-elevated px-3.5 py-1.5 text-xs font-semibold text-accent">
            <BookOpen className="h-4 w-4" /> Naqsh maqolalari
          </span>
          <h1 className="text-balance font-display text-[clamp(2rem,1.25rem+2.2vw,3.25rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-ink">
            AI va Vibe Coding bo&apos;yicha zamonaviy bilimlar
          </h1>
          <p className="text-base leading-relaxed text-ink-muted">
            Claude Code, Cursor IDE, prompt muhandisligi va dasturchilarsiz real startaplar qurish bo&apos;yicha amaliy qo&apos;llanmalar.
          </p>
        </header>

        <BlogExplorer posts={STATIC_BLOG_POST_SUMMARIES} />

        <section className="flex flex-col items-center justify-between gap-8 rounded-2xl border border-border bg-bg-elevated p-8 shadow-sm md:flex-row md:p-12">
          <div className="max-w-xl space-y-3 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent"><Sparkles className="h-4 w-4" /> Vibe Coding Express</span>
            <h2 className="text-balance font-display text-[clamp(1.5rem,1.2rem+1vw,2.25rem)] font-semibold leading-tight tracking-[-0.03em] text-ink">Nazariyani tugatib, amaliyotga o&apos;ting</h2>
            <p className="text-sm text-ink-muted md:text-base">8 haftalik mentorlik kursida Claude Code va Cursor yordamida o&apos;z real loyihangizni quring.</p>
          </div>
          <Button href="/kurs/vibe-coding-express" size="lg" className="w-full md:w-auto">Kurs dasturini ko&apos;rish <ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>
        </section>
      </div>
      <NextStepCTA />
    </div>
  );
}
