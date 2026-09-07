"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";

export function ProofStats() {
  const stats = [
    { number: "7 yil", label: "TADBIRKORLIK · 2016'DAN", action: "yo'lni ko'rish" },
    { number: "3", label: "JONLI STARTUP BOZORDA", action: "hoziroq oching" },
    { number: "100+", label: "IT YECHIM VA LOYIHA", action: "portfelni ko'rish" },
    { number: "1 000+", label: "O'QUVCHI VA ISHTIROKCHI", action: "natijalarni ko'rish" },
  ];

  return (
    <div className="w-full bg-[var(--color-cream-deep)] border-b border-[var(--color-border)] py-8 md:py-10">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-cream)] p-5 md:p-6 overflow-hidden shadow-[var(--shadow-sm)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] hover:border-[var(--color-accent-line)] transition-all duration-200"
            >
              <span aria-hidden="true" className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--color-accent)] opacity-70 group-hover:opacity-100 transition-opacity"></span>
              <div className="font-serif italic text-3xl md:text-4xl text-[var(--color-accent)] font-bold">
                {item.number}
              </div>
              <div className="font-mono text-xs text-[var(--color-ink-subtle)] tracking-wider mt-2 font-semibold">
                {item.label}
              </div>
              <div className="font-mono text-xs text-[var(--color-accent)] mt-3 inline-flex items-center gap-1 font-medium">
                {item.action}
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
