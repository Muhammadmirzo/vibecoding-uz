"use client";

import * as React from "react";
import { Check, Send, Sparkles } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface ProcessDemoProps {
  kind: "prompt" | "toggle";
}

/** Tiny, meaningful demo island: inspect a prompt or toggle the result state. */
export function ProcessDemo({ kind }: ProcessDemoProps) {
  const [enabled, setEnabled] = React.useState(true);
  if (kind === "prompt") {
    return (
      <div className="demo-prompt" aria-label="AI prompt namunasi">
        <Sparkles className="size-4 shrink-0 text-accent" aria-hidden="true" />
        <span className="demo-typing">
          <span className="demo-typing-text">Vazifani aniq yozing.<span className="demo-caret" aria-hidden="true" /></span>
        </span>
        <Send className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
      </div>
    );
  }
  return (
    <button type="button" className="demo-toggle-row" aria-pressed={enabled} onClick={() => setEnabled((value) => !value)}>
      <span className={cn("demo-toggle", enabled && "is-on")}><span /></span>
      <span className="text-left"><strong>{enabled ? "Tasdiqlash tayyor" : "Tasdiqlash kutilmoqda"}</strong><small>{enabled ? "Siz qaror qabul qilasiz" : "Savolni aniqlashtiring"}</small></span>
      {enabled ? <Check className="ml-auto size-5 text-success" aria-hidden="true" /> : null}
    </button>
  );
}
