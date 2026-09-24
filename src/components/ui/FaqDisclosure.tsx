import { ChevronDown } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqDisclosure({ items }: { items: FaqItem[] }) {
  return (
    <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-xl border border-border bg-bg-elevated px-6">
      {items.map((faq) => (
        <details key={faq.question} className="group border-b border-border last:border-b-0">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold text-ink transition-colors hover:text-brand [&::-webkit-details-marker]:hidden">
            {faq.question}
            <ChevronDown className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="faq-answer"><div><p className="pb-5 leading-relaxed text-ink-muted">{faq.answer}</p></div></div>
        </details>
      ))}
    </div>
  );
}
