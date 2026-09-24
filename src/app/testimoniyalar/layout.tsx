import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isClosed } from "@/lib/features/closed";

/** W10: /testimoniyalar vaqtincha yopiq — 404 qaytaradi. Kod saqlanadi. */
export const dynamic = "force-dynamic";
export default function TestimonialsClosedLayout({ children }: { children: ReactNode }): ReactNode {
  if (isClosed("testimonials")) notFound();
  return children;
}
