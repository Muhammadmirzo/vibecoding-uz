import type { ReactNode } from "react";
import { ScrollFillText } from "@/features/motion/ui/ScrollFillText";
import { parseMarkdown, type MarkdownBlock } from "./markdown";
import "@/components/pages/w6c.css";

function boldText(text: string): ReactNode[] {
  return text.split("**").map((part, index) =>
    index % 2 === 1 ? <strong key={index} className="text-ink font-bold">{part}</strong> : part
  );
}

function ListBlock({ block }: { block: Extract<MarkdownBlock, { type: "list" }> }) {
  if (block.ordered) {
    return (
      <div className="flex items-start gap-3 my-2 text-sm text-ink-muted leading-relaxed">
        <span className="w-6 h-6 rounded-full bg-bg-sunken text-accent font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
          {block.marker}
        </span>
        <span>{boldText(block.text)}</span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5 my-2 text-sm text-ink-muted leading-relaxed">
      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
      <span>{boldText(block.text)}</span>
    </div>
  );
}

function renderBlock(block: MarkdownBlock) {
  switch (block.type) {
    case "paragraph":
      return <p key={`p-${block.line}`} className="my-4 text-sm md:text-base text-ink-muted leading-relaxed">{boldText(block.text)}</p>;
    case "heading":
      return block.level === 2 ? (
        <h2 key={`h2-${block.line}`} id={block.id} className="scroll-mt-24 text-2xl md:text-3xl font-extrabold text-ink mt-10 mb-4 tracking-tight">{block.text}</h2>
      ) : (
        <h3 key={`h3-${block.line}`} id={block.id} className="scroll-mt-24 text-lg md:text-xl font-bold text-ink mt-6 mb-3">{block.text}</h3>
      );
    case "list":
      return <ListBlock key={`list-${block.line}`} block={block} />;
    case "code":
      return (
        <div key={`code-${block.line}`} className="my-6 overflow-hidden rounded-xl border border-border-strong bg-ink p-4 font-mono text-xs text-bg">
          {block.language && <div className="text-[11px] text-ink-subtle uppercase pb-2 mb-2 border-b border-white/10 font-bold">{block.language}</div>}
          <pre className="overflow-x-auto whitespace-pre leading-relaxed text-gray-200"><code>{block.text}</code></pre>
        </div>
      );
    case "quote":
      return (
        <blockquote key={`quote-${block.line}`} className="my-8 border-l-[3px] border-gold py-1 pl-5 font-display text-xl font-medium leading-snug md:text-2xl">
          <ScrollFillText text={block.text} />
        </blockquote>
      );
  }
}

export function ArticleBody({ contentMd }: { contentMd: string }) {
  return <div className="article-body">{parseMarkdown(contentMd).map(renderBlock)}</div>;
}
