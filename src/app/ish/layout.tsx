import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isClosed } from "@/lib/features/closed";

/** W10: /ish oilasi vaqtincha yopiq — sahifa va [slug] 404 qaytaradi. Kod saqlanadi. */
export const dynamic = "force-dynamic";
export default function IshClosedLayout({ children }: { children: ReactNode }): ReactNode {
  if (isClosed("jobs")) notFound();
  return children;
}
