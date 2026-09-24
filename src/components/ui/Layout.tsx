import * as React from "react";
import { cn } from "./utils";

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("mx-auto w-full max-w-container px-5 sm:px-8", className)} {...props} />; }
export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) { return <p className={cn("text-sm font-semibold tracking-wide text-accent", className)} {...props} />; }
export function Heading({ className, as: Tag = "h2", ...props }: React.HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" }) { return <Tag className={cn("font-display text-3xl font-semibold leading-tight tracking-tight text-ink", className)} {...props} />; }
export function Section({ className, eyebrow, title, subtitle, pattern = true, children, ...props }: React.HTMLAttributes<HTMLElement> & { eyebrow?: string; title?: React.ReactNode; subtitle?: React.ReactNode; pattern?: boolean }) {
  return <section className={cn("relative overflow-hidden py-20 sm:py-28", pattern && "bg-[radial-gradient(circle_at_15%_20%,var(--accent-soft),transparent_35%)]")} {...props}><div className="relative z-10"><Container>{eyebrow && <Eyebrow className="mb-5">{eyebrow}</Eyebrow>}{title && <Heading>{title}</Heading>}{subtitle && <p className="mt-4 max-w-2xl text-lg text-ink-muted">{subtitle}</p>}{children}</Container></div></section>;
}
