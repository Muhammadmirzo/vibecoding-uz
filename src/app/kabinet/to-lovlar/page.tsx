import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { listCourseOffers } from "@/features/courses/offers";
import { resolveCourseOffer, WAITLIST_TARGET } from "@/features/payments/domain/checkout-target";
import { resolveCheckoutTargetForCourse } from "@/features/payments/server/checkout-target.service";
import { loadStudentPaymentsFeed } from "@/features/payments/server/payments-feed";
import type { PaymentsResponse } from "@/features/payments/format";
import { getAuthSession } from "@/lib/auth/session";
import { PaymentsClient } from "./PaymentsClient";

interface ToLovlarPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = "force-dynamic";

/**
 * The pay page resolves the chosen course and the next OPEN cohort on the
 * server: a new student has no enrollment, so the cohort id is what makes
 * checkout work (the client never prices anything).
 */
export default async function ToLovlarPage({ searchParams }: ToLovlarPageProps) {
  const params = await searchParams;
  const requested = params.course;
  const offer = resolveCourseOffer(
    typeof requested === "string" ? requested : undefined,
    listCourseOffers(),
  );
  const session = await getAuthSession();
  if (!session) return <GuestView courseSlug={offer.slug} />;

  let target = WAITLIST_TARGET;
  let payableAmount: number | null = null;
  let targetError = false;
  let initialData: PaymentsResponse | null = null;
  try {
    const resolved = await resolveCheckoutTargetForCourse({
      userId: session.userId,
      courseSlug: offer.slug,
    });
    target = resolved;
    payableAmount = resolved.amountTiyin === null ? null : resolved.amountTiyin / 100;
  } catch {
    // A failed cohort lookup is NOT "no open cohort": say so honestly.
    targetError = true;
  }
  try {
    // Server prefetch: the pay button / waitlist state is in the first HTML.
    // On failure the client falls back to its own fetch (never a blank page).
    initialData = await loadStudentPaymentsFeed(session.userId);
  } catch {
    initialData = null;
  }

  return (
    <PaymentsClient
      offer={offer}
      target={target}
      payableAmount={payableAmount}
      targetError={targetError}
      initialData={initialData}
    />
  );
}

function GuestView({ courseSlug }: { courseSlug: string }) {
  const redirect = encodeURIComponent(`/kabinet/to-lovlar?course=${courseSlug}`);
  return (
    <div className="min-h-screen bg-bg text-ink">
      <section className="mx-auto flex min-h-[calc(100vh-16rem)] w-full max-w-2xl flex-col items-center justify-center px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold leading-tight text-ink md:text-3xl">
          To&apos;lov qilish uchun tizimga kiring
        </h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-ink-muted md:text-[17px]">
          Kursga yozilish va to&apos;lovni rasmiylashtirish uchun avval hisobingizga kiring.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href={`/?auth=1&redirect=${redirect}`} prefetch={false}>Kirish</Link>
        </Button>
      </section>
    </div>
  );
}
