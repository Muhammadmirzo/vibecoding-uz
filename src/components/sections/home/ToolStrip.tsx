import { Container } from "@/components/ui";

const tools = ["Claude Code", "Next.js", "Vercel", "Supabase", "Telegram"];

export function ToolStrip() {
  return (
    <section aria-label="Ishlatiladigan texnologiyalar" className="border-y border-border bg-bg-sunken">
      <Container className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 text-sm font-medium text-ink-muted">
        <span className="w-full text-center text-xs text-ink-subtle sm:w-auto sm:text-left">Quyidagi vositalar bilan</span>
        {tools.map((tool) => <span key={tool}>{tool}</span>)}
      </Container>
    </section>
  );
}
