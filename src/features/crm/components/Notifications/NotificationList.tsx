"use client";
import { Clock, Loader2 } from "lucide-react";
import { audienceLabels } from "./types";
import type { BroadcastItem } from "./types";
export function NotificationList({ broadcasts, loading }: { broadcasts: BroadcastItem[]; loading: boolean }) { return (<>
      {/* History Table */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-ink flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          Yuborilgan Xabarnomalar Tarixi
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="text-center py-10 bg-cream-warm rounded-xl border border-border text-xs text-ink-muted">
            Hali yuborilgan xabarnomalar mavjud emas.
          </div>
        ) : (
          <div className="bg-cream-warm border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-cream-deep border-b border-border text-xs uppercase text-ink-muted font-semibold tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Nomi</th>
                    <th className="px-4 py-3.5">Kanal</th>
                    <th className="px-4 py-3.5">Auditoriya</th>
                    <th className="px-4 py-3.5">Qabul qiluvchilar</th>
                    <th className="px-4 py-3.5">Holat</th>
                    <th className="px-4 py-3.5">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {broadcasts.map((b) => (
                    <tr key={b.id} className="hover:bg-cream/60 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-ink max-w-xs truncate">{b.title}</td>
                      <td className="px-4 py-3.5 uppercase text-xs font-bold text-accent font-mono">{b.channel}</td>
                      <td className="px-4 py-3.5 text-xs text-ink-muted">
                        {audienceLabels[b.targetAudience] || b.targetAudience}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-ink">{b.recipientsCount} ta</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            b.status === "sent"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-amber-100 text-amber-800 border-amber-200"
                          }`}
                        >
                          {b.status === "sent" ? "Yuborilgan" : "Qoralama"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-ink-muted whitespace-nowrap">
                        {new Date(b.createdAt).toLocaleDateString("uz-UZ", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
</>
); }
