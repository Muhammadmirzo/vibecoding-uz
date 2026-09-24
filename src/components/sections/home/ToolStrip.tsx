import type { ReactNode } from "react";
import { Marquee } from "@/features/motion/ui/Marquee";

const tools: ReadonlyArray<{ name: string; note: string; mark: ReactNode }> = [
  { name: "Claude Code", note: "kod bilan ishlash", mark: <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" /> },
  { name: "Next.js", note: "ilova interfeysi", mark: <path d="M4 19V5h3l10 14M14 5h6v14M8 15l3 4" /> },
  { name: "Vercel", note: "yayilash", mark: <path d="m4 5 8 14 8-14h-5L12 12 9 5Z" /> },
  { name: "Supabase", note: "ma'lumot saqlash", mark: <path d="m14 4-8 9h5l-1 7 8-10h-5l1-6Z" /> },
  { name: "Telegram", note: "xabarnoma va bot", mark: <path d="m3 11 18-7-5 16-5-5-4 2 1-5 7-5-10 6-2-2Z" /> },
];

function ToolList() {
  return tools.map((tool) => (
    <span key={tool.name} className="tool-chip">
      <span className="tool-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor">{tool.mark}</svg></span>
      <span><strong>{tool.name}</strong><small>{tool.note}</small></span>
    </span>
  ));
}

export function ToolStrip() {
  return (
    <section className="tool-strip border-y border-border bg-bg-sunken py-8" aria-label="Kursda ishlatiladigan texnologiyalar">
      <div className="tool-veil" aria-hidden="true" />
      <Marquee label="Texnologiyalar — birinchi qator" className="tool-marquee">
        <ToolList />
      </Marquee>
      <Marquee label="Texnologiyalar — ikkinchi qator" className="tool-marquee tool-marquee-reverse">
        <ToolList />
      </Marquee>
      <div className="relative z-10 mt-7 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">G'oya → prompt → dastur → tekshiruv</div>
    </section>
  );
}
