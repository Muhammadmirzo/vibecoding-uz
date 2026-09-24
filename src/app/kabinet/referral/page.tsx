"use client";

import { Gift } from "lucide-react";
import { KabinetNav } from "@/features/lms/components/KabinetNav";
import { useReferral } from "@/features/lms/components/referral/useReferral";
import { ReferralLinkCard } from "@/features/lms/components/referral/ReferralLinkCard";
import { ReferralStats } from "@/features/lms/components/referral/ReferralStats";
import { ReferralHistoryTable } from "@/features/lms/components/referral/ReferralHistoryTable";
import { PayoutModal } from "@/features/lms/components/referral/PayoutModal";

export default function ReferralPage() {
  const referral = useReferral();
  const {
    stats,
    referralList,
    payoutModalOpen,
    payoutMethod,
    setPayoutModalOpen,
    setPayoutMethod,
    payoutSuccess,
    setPayoutSuccess,
    payoutError,
    payoutLoading,
    cardNumber,
    setCardNumber,
    cardHolder,
    setCardHolder,
    handlePayoutSubmit,
  } = referral;

  return (
    <div className="min-h-screen bg-bg text-ink">
      <KabinetNav />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-5 pb-28 pt-24 md:px-8 md:pt-28 lg:pl-80 lg:pr-8">
        <header className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            <Gift className="w-3.5 h-3.5" aria-hidden="true" /> Hamkorlik dasturi
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink md:text-3xl">Do&apos;stingizni taklif qiling</h1>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">Shaxsiy havolangizni ulashing. Bonus va takliflar haqidagi ma&apos;lumotlar tizimda qayd etilgan holda ko&apos;rinadi.</p>
        </header>
        <ReferralLinkCard {...referral} />
        <ReferralStats
          stats={stats}
          onPayout={() => {
            setPayoutSuccess(false);
            setPayoutModalOpen(true);
          }}
        />
        <ReferralHistoryTable referralList={referralList} />
      </main>
      {payoutModalOpen ? <PayoutModal {...referral} /> : null}
    </div>
  );
}
