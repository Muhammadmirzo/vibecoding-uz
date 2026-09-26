import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isClosed } from "@/lib/features/closed";

/**
 * G1b: /ekspertlar vaqtincha yopiq — faqat "Namuna profil 1/2" ma'lumotlari
 * bor, haqiqiy mentor profillari ega tomonidan berilmaguncha 404 qaytaradi.
 * `closed.ts` dagi `experts.closed = false` bayrog'i sahifani qayta ochadi.
 */
export const dynamic = "force-dynamic";
export default function ExpertsClosedLayout({ children }: { children: ReactNode }): ReactNode {
  if (isClosed("experts")) notFound();
  return children;
}
