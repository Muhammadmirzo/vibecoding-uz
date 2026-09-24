import type * as React from "react";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Button, Container } from "@/components/ui";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import "@/components/pages/w6c.css";

export default function NotFound() {
  return (
    <div className="bg-bg text-ink">
      <div className="w6c-hero">
        <div className="w6c-hero-mesh" aria-hidden="true" />
        <div className="w6c-hero-grain" aria-hidden="true" />
        <Container className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
          <p className="w6c-load font-mono text-7xl font-bold tracking-tight text-brand sm:text-8xl" style={{ "--i": 0 } as React.CSSProperties}>
            404
          </p>
          <h1 className="w6c-load mt-6 max-w-xl text-balance font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl" style={{ "--i": 1 } as React.CSSProperties}>
            Bu sahifa topilmadi
          </h1>
          <p className="w6c-load mt-4 max-w-md text-ink-muted" style={{ "--i": 2 } as React.CSSProperties}>
            Ehtimol havola o‘zgargan yoki noto‘g‘ri kiritilgan. Yo‘qolgan yo‘l o‘rniga — aniq yo‘nalish:
          </p>
          <div className="w6c-load mt-8 flex flex-wrap justify-center gap-3" style={{ "--i": 3 } as React.CSSProperties}>
            <Button href="/" size="lg"><ArrowLeft className="size-4" aria-hidden="true" /> Bosh sahifa</Button>
            <Button href="/diagnostika" size="lg" variant="outline"><Compass className="size-4" aria-hidden="true" /> Bepul diagnostika</Button>
          </div>
          <Link href="/blog" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-brand underline underline-offset-4">
            Maqolalar bo‘limiga o‘tish
          </Link>
        </Container>
      </div>
      <NextStepCTA />
    </div>
  );
}
