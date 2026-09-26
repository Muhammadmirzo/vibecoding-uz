import Link from "next/link";
import { ArrowRight, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PaymentRecord } from "@/features/payments/format";
import { ReceiptsTable } from "./ReceiptsTable";

interface PaymentHistorySectionProps {
  payments: PaymentRecord[];
  courseSlug: string;
}

export function PaymentHistorySection({ payments, courseSlug }: PaymentHistorySectionProps) {
  if (payments.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border-strong bg-bg-elevated px-6 py-12 text-center">
        <ReceiptText className="mx-auto h-10 w-10 text-ink-subtle" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-bold text-ink">Hali to'lov topilmadi</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
          Bu yerda tizimda qayd etilgan to'lovlar va haqiqiy cheklar ko'rinadi.
        </p>
        <Button asChild size="md" className="mt-6">
          <Link href={`/kurs/${courseSlug}`}>
            Kurs sahifasini ko&apos;rish <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </section>
    );
  }

  return <ReceiptsTable payments={payments} />;
}
