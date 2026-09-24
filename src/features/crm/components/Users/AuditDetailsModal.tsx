"use client";
import { X } from "lucide-react";
import type { AuditLogItem } from "./types";
interface Props { log: AuditLogItem; onClose: () => void; }
export function AuditDetailsModal({ log, onClose }: Props) { return (<>
      {/* Audit Log Details Modal */}
      {log && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-bg-sunken border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-ink font-mono">
                Audit Jurnali ID: {log.id.slice(0, 8)}
              </h3>
              <button
                onClick={() => onClose()}
                className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-bg-elevated"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-ink-muted">Amal: </span>
                <span className="font-mono font-bold text-accent">{log.action}</span>
              </div>
              <div>
                <span className="text-ink-muted">Vaqt: </span>
                <span className="font-mono">{new Date(log.createdAt).toLocaleString("uz-UZ")}</span>
              </div>
              <div>
                <span className="text-ink-muted">IP Manzil: </span>
                <span className="font-mono">{log.ipAddress || "127.0.0.1"}</span>
              </div>
              <div>
                <span className="text-ink-muted">Bajaruvchi Email: </span>
                <span className="font-mono">{log.userEmail || "Tizim"}</span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-ink mb-1">Details (JSON):</span>
              <pre className="p-3 bg-bg-elevated border border-border rounded-lg text-[11px] font-mono overflow-x-auto text-ink">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => onClose()}
                className="px-4 py-2 bg-accent text-ink text-xs font-medium rounded-lg hover:bg-accent/90"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
</>
); }
