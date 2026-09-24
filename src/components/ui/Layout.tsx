import * as React from "react";
import { cn } from "./utils";

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("mx-auto w-full max-w-container px-5 sm:px-8", className)} {...props} />; }
export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) { return <p className={cn("text-sm font-semibold tracking-wide text-accent", className)} {...props} />; }
export function Heading({ className, as: Tag = "h2", ...props }: React.HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" }) {
  const scale = Tag === "h1" ? "text-[clamp(2.25rem,1rem+3.6vw,4rem)] leading-[1.1] tracking-[-0.04em]" : Tag === "h2" ? "text-[clamp(1.75rem,1.2rem+1.8vw,2.75rem)] leading-[1.16] tracking-[-0.035em]" : "text-2xl leading-tight tracking-[-0.025em]";
  return <Tag className={cn("max-w-4xl text-balance font-display font-semibold text-ink", scale, className)} {...props} />;
}
export function Section({ className, eyebrow, title, titleAs = "h2", subtitle, pattern = true, children, ...props }: React.HTMLAttributes<HTMLElement> & { eyebrow?: string; title?: React.ReactNode; titleAs?: "h1" | "h2"; subtitle?: React.ReactNode; pattern?: boolean }) {
  return <section className={cn("relative overflow-hidden py-16 sm:py-24", pattern && "bg-[radial-gradient(circle_at_15%_20%,var(--accent-soft),transparent_35%)]", className)} {...props}><div className="relative z-10"><Container>{eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}{title && <Heading as={titleAs}>{title}</Heading>}{subtitle && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">{subtitle}</p>}{children}</Container></div></section>;
}
