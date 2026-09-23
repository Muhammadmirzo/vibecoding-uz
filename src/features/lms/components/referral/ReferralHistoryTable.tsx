import * as React from "react";
import { Users, CheckCircle2 } from "lucide-react";
import type { ReferralLead, ReferralStats } from "./referralTypes";

interface ReferralHistoryTableProps {
  referralList: ReferralLead[];
}

export function ReferralHistoryTable({
  referralList,
}: ReferralHistoryTableProps) {
  return (
    <div className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-ink flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" /> Taklif Qilingan Do'stlar
            Ro'yxati
          </h3>
          <p className="text-xs text-ink-muted">
            Sizning havolangiz orqali ro'yxatdan o'tgan foydalanuvchilar holati.
          </p>
        </div>
        <span className="text-xs font-mono text-ink-subtle">
          Jami takliflar:{" "}
          <strong className="text-ink">{referralList.length} ta</strong>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-ink-subtle font-mono uppercase text-[11px]">
              <th className="pb-3 pr-4 font-semibold">Do'stingiz</th>
              <th className="pb-3 px-4 font-semibold">Sana</th>
              <th className="pb-3 px-4 font-semibold">Kurs</th>
              <th className="pb-3 px-4 font-semibold">Holat</th>
              <th className="pb-3 pl-4 font-semibold text-right">
                Hisoblangan bonus
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {referralList.map((ref) => (
              <tr key={ref.id} className="hover:bg-cream transition-colors">
                <td className="py-4 pr-4 font-semibold text-ink">{ref.name}</td>
                <td className="py-4 px-4 text-ink-muted font-mono whitespace-nowrap">
                  {ref.date}
                </td>
                <td className="py-4 px-4 text-ink">{ref.course}</td>
                <td className="py-4 px-4 whitespace-nowrap">
                  {ref.status === "paid" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-success-soft text-success inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> To'lov qilindi
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-ink-muted bg-cream border border-border">
                      Ro'yxatdan o'tdi
                    </span>
                  )}
                </td>
                <td className="py-4 pl-4 text-right font-mono font-bold text-accent whitespace-nowrap">
                  {ref.bonusAmount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
