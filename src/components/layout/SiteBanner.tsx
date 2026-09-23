"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SiteBannerProps {
  text: string;
  link?: string;
}

export function SiteBanner({ text, link }: SiteBannerProps) {
  if (!text) return null;

  const content = (
    <>
      <span>{text}</span>
      {link ? <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
    </>
  );

  return (
    <div className="relative z-[51] flex items-center justify-center gap-2 bg-accent px-4 py-2 text-center text-xs font-semibold text-white">
      {link ? (
        <Link href={link} className="inline-flex items-center gap-1 hover:underline">
          {content}
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1">{content}</span>
      )}
    </div>
  );
}
