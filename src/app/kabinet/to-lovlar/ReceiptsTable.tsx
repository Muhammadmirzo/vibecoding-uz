import { CheckCircle2, Receipt } from "lucide-react";
import {
  formatDate,
  formatUzs,
  statusLabel,
  type PaymentRecord,
} from "@/features/payments/format";

interface ReceiptsTableProps {
  payments: PaymentRecord[];
}

const providerLabels = {
  payme: "Payme",
  click: "Click",
  manual: "Qo'lda",
} as const;

export function ReceiptsTable({ payments }: ReceiptsTableProps) {
  return (
    <section className="rounded-2xl border border-border-strong bg-cream-warm p-6 shadow-sm md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
            <Receipt className="h-5 w-5 text-accent" aria-hidden="true" />
            To'lovlar tarixi
          </h2>
          <p className="mt-1 text-xs text-ink-muted">Faqat tizimda qayd etilgan to'lovlar ko'rsatiladi.</p>
        </div>
        <span className="font-mono text-xs text-ink-subtle">Jami: {payments.length} ta</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">Hisobingizdagi to'lovlar ro'yxati</caption>
          <thead>
            <tr className="border-b border-border font-mono text-[11px] uppercase text-ink-subtle">
              <th scope="col" className="pb-3 pr-4 font-semibold">To'lov ID</th>
              <th scope="col" className="px-4 pb-3 font-semibold">Sana</th>
              <th scope="col" className="px-4 pb-3 font-semibold">Summa</th>
              <th scope="col" className="px-4 pb-3 font-semibold">Tizim</th>
              <th scope="col" className="px-4 pb-3 font-semibold">Holat</th>
              <th scope="col" className="pl-4 pb-3 text-right font-semibold">Chek</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-cream">
                <th scope="row" className="max-w-44 truncate py-4 pr-4 font-mono font-bold text-ink" title={payment.providerTxnId ?? payment.id}>
                  {payment.providerTxnId ?? payment.id.slice(0, 8)}
                </th>
                <td className="whitespace-nowrap px-4 py-4 font-mono text-ink-muted">
                  {formatDate(payment.paidAt ?? payment.createdAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-mono font-bold text-accent">
                  {formatUzs(payment.amountSum)}
                </td>
                <td className="px-4 py-4 font-semibold text-ink">{providerLabels[payment.provider]}</td>
                <td className="whitespace-nowrap px-4 py-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                    payment.status === "paid" ? "bg-success-soft text-success" : "bg-accent-soft text-accent"
                  }`}>
                    {payment.status === "paid" && <CheckCircle2 className="h-3 w-3" aria-hidden="true" />}
                    {statusLabel(payment.status)}
                  </span>
                </td>
                <td className="whitespace-nowrap py-4 pl-4 text-right">
                  {payment.receiptUrl ? (
                    <a href={payment.receiptUrl} target="_blank" rel="noreferrer" className="btn-secondary inline-flex h-8 items-center rounded-md px-3 text-[11px] font-semibold">
                      Chekni ochish
                    </a>
                  ) : (
                    <span className="inline-flex cursor-not-allowed items-center rounded-md bg-cream-deep px-3 py-2 text-[11px] text-ink-subtle" title="Chek tez orada" aria-disabled="true">
                      Chek tez orada
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
