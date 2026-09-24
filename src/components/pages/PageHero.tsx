import * as React from "react";
import { cn } from "@/components/ui/utils";
import { Container, Eyebrow, Heading } from "@/components/ui/Layout";
import "./w6c.css";

interface PageHeroProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: "editorial" | "compact" | "dark";
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
}

/**
 * W6C page hero — one of three variants (editorial / compact / dark).
 * Server-rendered, zero JS. Above-fold load entrance is CSS-gated
 * (`w6c-load` + `--i`), so no-JS and motion-off show finished content.
 */
export function PageHero({
  variant = "editorial",
  eyebrow,
  title,
  lede,
  meta,
  actions,
  aside,
  className,
  children,
  ...props
}: PageHeroProps) {
  if (variant === "compact") {
    return (
      <div className={cn("w6c-hero bg-bg", className)} {...props}>
        <div className="w6c-hero-mesh" aria-hidden="true" />
        <Container className="relative z-10 pb-10 pt-28 sm:pt-32">
          <div className="max-w-3xl">
            {eyebrow && <Eyebrow className="w6c-load" style={{ "--i": 0 } as React.CSSProperties}>{eyebrow}</Eyebrow>}
            <Heading as="h1" className="w6c-load mt-3 text-[clamp(1.9rem,1.2rem+2.4vw,2.9rem)]" style={{ "--i": 1 } as React.CSSProperties}>
              {title}
            </Heading>
            {lede && <p className="w6c-load mt-4 text-lg leading-relaxed text-ink-muted" style={{ "--i": 2 } as React.CSSProperties}>{lede}</p>}
            {meta}
            {actions && <div className="w6c-load mt-6 flex flex-col gap-3 sm:flex-row" style={{ "--i": 3 } as React.CSSProperties}>{actions}</div>}
          </div>
          {children}
        </Container>
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <div className={cn("w6c-hero w6c-hero-dark", className)} {...props}>
        <div className="w6c-hero-mesh" aria-hidden="true" />
        <Container className="relative z-10 pb-16 pt-28 sm:pb-20 sm:pt-36">
          <div className={cn("grid items-center gap-10", aside && "lg:grid-cols-[1.2fr_.8fr]")}>
            <div>
              {eyebrow && <p className="w6c-load font-mono text-xs font-semibold uppercase tracking-[0.14em] text-gold" style={{ "--i": 0 } as React.CSSProperties}>{eyebrow}</p>}
              <h1 className="w6c-load w6c-dark-title mt-3 max-w-4xl text-balance font-display text-[clamp(2.1rem,1.2rem+3.4vw,3.6rem)] font-semibold leading-[1.1] tracking-[-0.04em]" style={{ "--i": 1 } as React.CSSProperties}>
                {title}
              </h1>
              {lede && <p className="w6c-load w6c-lede mt-5 max-w-2xl text-lg leading-relaxed" style={{ "--i": 2 } as React.CSSProperties}>{lede}</p>}
              {meta}
              {actions && <div className="w6c-load mt-7 flex flex-col gap-3 sm:flex-row" style={{ "--i": 3 } as React.CSSProperties}>{actions}</div>}
            </div>
            {aside}
          </div>
          {children}
        </Container>
      </div>
    );
  }

  return (
    <div className={cn("w6c-hero bg-bg", className)} {...props}>
      <div className="w6c-hero-mesh" aria-hidden="true" />
      <div className="w6c-hero-grain" aria-hidden="true" />
      <Container className="relative z-10 pb-14 pt-28 sm:pb-20 sm:pt-36">
        <div className={cn("grid items-start gap-10", aside && "lg:grid-cols-[1fr_minmax(320px,400px)]")}>
          <div>
            {eyebrow && <Eyebrow className="w6c-load" style={{ "--i": 0 } as React.CSSProperties}>{eyebrow}</Eyebrow>}
            <Heading as="h1" className="w6c-load mt-3 text-[clamp(2.25rem,1.2rem+3.6vw,4rem)]" style={{ "--i": 1 } as React.CSSProperties}>
              {title}
            </Heading>
            {lede && <p className="w6c-load mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl" style={{ "--i": 2 } as React.CSSProperties}>{lede}</p>}
            {meta}
            {actions && <div className="w6c-load mt-7 flex flex-col gap-3 sm:flex-row" style={{ "--i": 3 } as React.CSSProperties}>{actions}</div>}
          </div>
          {aside}
        </div>
        {children}
      </Container>
    </div>
  );
}
