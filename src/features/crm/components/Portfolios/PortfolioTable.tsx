"use client";

import { ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react";
import type { PortfolioItem } from "@/features/portfolio/portfolioData";

type Props = { items: PortfolioItem[]; isLoading: boolean; onEdit: (item: PortfolioItem) => void; onDelete: (id: string, title: string) => void; onToggleFeatured: (item: PortfolioItem) => void; };

export function PortfolioTable({ items, isLoading, onEdit, onDelete, onToggleFeatured }: Props) {
  return (
      <>
      <div className="bg-cream border border-border rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 text-center text-ink-muted flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span>Portfoliolar yuklanmoqda...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-cream-warm border-b border-border text-xs font-mono text-ink-muted uppercase">
                  <th className="py-3.5 px-4 font-semibold">Loyiha</th>
                  <th className="py-3.5 px-4 font-semibold">Domen / Havola</th>
                  <th className="py-3.5 px-4 font-semibold">Kategoriya</th>
                  <th className="py-3.5 px-4 font-semibold">Foydalanuvchilar</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Bosh Sahifa</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-cream-warm/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-ink">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cream-deep overflow-hidden border border-border shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-ink">{item.title}</div>
                          <div className="text-xs text-ink-muted font-normal line-clamp-1 max-w-[200px]">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-xs text-accent">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:underline"
                      >
                        <span>{item.domain}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-soft text-accent">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs font-mono text-ink-muted">
                      {item.userCount || "Ko'rsatilmadi"}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => onToggleFeatured(item)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          item.isFeatured
                            ? "bg-success/15 text-success hover:bg-success/25"
                            : "bg-cream-deep text-ink-subtle hover:bg-cream-warm"
                        }`}
                      >
                        {item.isFeatured ? "Faol (Top 6)" : "Oddiy"}
                      </button>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 rounded-lg bg-cream-warm text-ink hover:text-accent hover:bg-cream-deep transition-colors"
                          title="Tahrirlash"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDelete(item.id, item.title)}
                          className="p-2 rounded-lg bg-cream-warm text-error hover:bg-error-soft transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="py-12 text-center text-ink-muted text-sm">
            Hech qanday portfolio loyihasi topilmadi.
          </div>
        )}
      </div>
    </>
  );
}
