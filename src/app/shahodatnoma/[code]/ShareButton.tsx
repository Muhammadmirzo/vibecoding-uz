"use client";

import * as React from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Shareable certificate link: Web Share API with clipboard fallback. */
export function ShareCertButton({ code, title }: { code: string; title: string }) {
  const [copied, setCopied] = React.useState(false);

  async function share() {
    const url = `${window.location.origin}/shahodatnoma/${code}`;
    const text = `${title} — Naqsh sertifikati (${code})`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the code itself stays visible */
    }
  }

  return (
    <Button type="button" variant="outline" onClick={share}>
      <Share2 className="size-4" aria-hidden="true" />
      {copied ? "Havola nusxalandi" : "Ulashish"}
    </Button>
  );
}
