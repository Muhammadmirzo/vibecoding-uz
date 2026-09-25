import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import type { TocItem } from "./types";
import { ActiveToc } from "./ActiveToc";

export function BlogSidebar({ toc }: { toc: TocItem[] }) {
  return (
    <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
      <div className="bg-bg-elevated border border-border-strong rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border text-xs font-mono font-bold uppercase tracking-wider text-ink">
          <BookOpen className="w-4 h-4 text-accent" /> Mundarija (TOC)
        </div>
        <ActiveToc toc={toc} />
      </div>
      <div className="bg-bg-elevated border-2 border-border rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden">
        <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
        <div className="space-y-1.5">
          <div className="text-xs font-mono font-bold text-accent uppercase">8 Haftalik Mentorlik</div>
          <h4 className="text-lg font-bold text-ink leading-tight">Vibe Coding Express</h4>
          <p className="text-xs text-ink-muted leading-relaxed">O'z g'oyangizdan ishlaydigan MVPgacha. Claude Code va Cursor bilan professional loyihalar qurishni o'rganing.</p>
        </div>
        <Link href="/kurs/vibe-coding-express" className="block">
          <button className="min-h-11 bg-gold px-4 rounded-full text-xs font-semibold text-on-gold inline-flex items-center justify-center gap-2 w-full hover:bg-gold-hover">
            <span>Kurs Dasturi bilan tanishish</span><ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </aside>
  );
}
