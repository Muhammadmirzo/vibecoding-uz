import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-5 md:p-8 text-center">
      <div className="max-w-md w-full space-y-6">
        {/* Visual 404 Badge with >_ in font-mono */}
        <div className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-cream-warm border border-border-strong shadow-sm">
          <span className="font-mono text-4xl font-extrabold text-accent leading-none">&gt;_</span>
          <span className="font-mono text-4xl font-extrabold text-ink leading-none">404</span>
        </div>

        {/* Title & Body */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
            Bu sahifa hali yasalmagan
          </h1>
          <p className="text-sm md:text-base text-ink-muted leading-relaxed">
            Ehtimol siz ham shu sahifani vibe coding bilan qurasiz — bizga yozing
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="btn-primary w-full sm:w-auto px-6 py-3 rounded-lg text-xs md:text-sm font-semibold inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Bosh sahifaga</span>
          </Link>
          <Link
            href="/#kurs-tanlash"
            className="btn-secondary w-full sm:w-auto px-6 py-3 rounded-lg text-xs md:text-sm font-semibold inline-flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-accent" />
            <span>Kurslarni ko'rish</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
