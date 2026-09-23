"use client";
import { Eye, Loader2 } from "lucide-react";
import type { AuditLogItem } from "./types";
interface Props { logs: AuditLogItem[]; loading: boolean; onDetails: (log: AuditLogItem) => void; }
export function AuditTable({ logs, loading, onDetails }: Props) { return (<>
          {/* Audit Logs Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 bg-cream-warm rounded-xl border border-border text-ink-muted">
              Hech qanday audit jurnali topilmadi.
            </div>
          ) : (
            <div className="bg-cream-warm border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-cream-deep border-b border-border text-xs uppercase text-ink-muted font-semibold tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Vaqt</th>
                      <th className="px-4 py-3.5">Amal kodi</th>
                      <th className="px-4 py-3.5">Xodim / IP</th>
                      <th className="px-4 py-3.5">Obyekt</th>
                      <th className="px-4 py-3.5 text-right">Tafsilotlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-cream/60 transition-colors">
                        <td className="px-4 py-3.5 text-xs text-ink-muted whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleDateString("uz-UZ", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-accent-soft text-accent border border-accent-line">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-ink text-xs">{log.userName || log.userEmail || "Tizim"}</div>
                          <div className="text-[11px] text-ink-muted font-mono">{log.ipAddress || "127.0.0.1"}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-ink-muted font-mono">
                          {log.entityType || "-"}: {log.entityId ? log.entityId.slice(0, 8) : "-"}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => onDetails(log)}
                            className="p-1.5 rounded-lg hover:bg-cream text-ink-muted hover:text-ink transition-colors"
                            title="Tafsilotlarni ko'rish"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
</>
); }
