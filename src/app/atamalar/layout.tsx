import type { ReactNode } from "react";
import { routeMetadata } from "@/lib/seo";

export const metadata = routeMetadata({
  title: "Atamalar lug'ati — AI va vibe coding",
  description: "Vibe coding, prompt engineering va AI vositalariga oid asosiy atamalarning sodda o'zbekcha izohi.",
  path: "/atamalar",
});

export default function AtamalarLayout({ children }: { children: ReactNode }) {
  return children;
}
