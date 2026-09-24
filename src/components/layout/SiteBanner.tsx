import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

export function SiteBanner() {
  return <div className="relative z-[51] bg-brand text-white"><Link href="/kurs/vibe-coding-express" className="mx-auto flex max-w-container items-center justify-center gap-2 px-5 py-2 text-center text-xs font-semibold">Keyingi guruh: {siteConfig.nextCohortShortDate} · o&apos;rni band qiling <ArrowRight className="size-3.5" aria-hidden="true" /></Link></div>;
}
