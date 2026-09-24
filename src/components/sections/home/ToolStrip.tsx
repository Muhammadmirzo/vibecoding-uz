import type { ReactNode } from "react";
import { Container } from "@/components/ui";
import { Marquee } from "@/features/motion/ui/Marquee";

const tools: ReadonlyArray<{ name: string; mark: ReactNode }> = [
  { name: "Claude Code", mark: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" /></svg> },
  { name: "Next.js", mark: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5h3l10 14M14 5h6v14M8 15l3 4" /></svg> },
  { name: "Vercel", mark: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 5 8 14 8-14h-5L12 12 9 5Z" /></svg> },
  { name: "Supabase", mark: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 4-8 9h5l-1 7 8-10h-5l1-6Z" /></svg> },
  { name: "Telegram", mark: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 18-7-5 16-5-5-4 2 1-5 7-5-10 6-2-2Z" /></svg> },
];

function ToolList() {
  return (
    <>
      {tools.map((tool) => (
        <span key={tool.name} className="flex items-center gap-2.5 whitespace-nowrap font-medium text-ink-muted">
          <span className="flex size-5 items-center justify-center text-ink-subtle [&>svg]:size-5 [&>svg]:fill-none [&>svg]:stroke-current [&>svg]:stroke-[1.6]">{tool.mark}</span>
          {tool.name}
        </span>
      ))}
    </>
  );
}

export function ToolStrip() {
  return (
    <section aria-label="Ishlatiladigan texnologiyalar" className="border-y border-border bg-bg-sunken">
      <Container className="py-4 sm:py-5">
        <div className="hidden items-center justify-center gap-8 lg:flex xl:gap-10">
          <span className="mr-1 text-xs text-ink-subtle">Quyidagi vositalar bilan</span>
          <div className="flex items-center gap-8 xl:gap-10">
            <ToolList />
          </div>
        </div>
        <Marquee label="Ishlatiladigan texnologiyalar" className="-mx-5 px-5 lg:hidden">
          <ToolList />
        </Marquee>
      </Container>
    </section>
  );
}
