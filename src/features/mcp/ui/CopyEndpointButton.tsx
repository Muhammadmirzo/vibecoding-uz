"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
export function CopyEndpointButton({ value }: { value: string }) { const [copied, setCopied] = useState(false); return <button type="button" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1800); }} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-bg-elevated px-4 text-sm font-semibold text-ink">{copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}{copied ? "Nusxalandi" : "Nusxalash"}</button>; }
