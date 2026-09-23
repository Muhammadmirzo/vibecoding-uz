"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, Copy, Send } from "lucide-react";

interface ShareState {
  copied: boolean;
  shareUrl: string;
  copyLink: () => void;
}

const ShareContext = createContext<ShareState | null>(null);

export function ShareProvider({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => setShareUrl(window.location.href), []);

  const value = useMemo<ShareState>(() => ({
    copied,
    shareUrl,
    copyLink: () => {
      const url = shareUrl || window.location.href;
      if (navigator.clipboard) {
        void navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
  }), [copied, shareUrl]);

  return <ShareContext.Provider value={value}>{children}</ShareContext.Provider>;
}

function useShare(): ShareState {
  const value = useContext(ShareContext);
  if (!value) throw new Error("ShareProvider is missing");
  return value;
}

export function HeaderShareActions({ title }: { title: string }) {
  const { copied, shareUrl, copyLink } = useShare();
  return (
    <div className="flex items-center gap-2">
      <button onClick={copyLink} className="btn-secondary h-9 px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5" title="Havolani nusxalash">
        {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}<span>{copied ? "Nusxalandi!" : "Havola"}</span>
      </button>
      <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noreferrer" className="btn-secondary h-9 px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 text-telegram" title="Telegram'da ulashish">
        <Send className="w-3.5 h-3.5" /><span>Telegram</span>
      </a>
    </div>
  );
}

export function BottomShareAction() {
  const { copied, copyLink } = useShare();
  return (
    <button onClick={copyLink} className="btn-secondary h-9 px-4 rounded-md text-xs font-semibold inline-flex items-center gap-1.5">
      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}<span>{copied ? "Nusxalandi!" : "Nusxalash"}</span>
    </button>
  );
}
