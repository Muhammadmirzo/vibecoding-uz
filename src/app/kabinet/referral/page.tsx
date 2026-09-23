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
    <div className="pt-24 pb-16 min-h-screen bg-cream">
      <KabinetNav />
      <div className="mx-auto w-full max-w-[1100px] px-5 md:px-8 space-y-8">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-mono font-bold">
            <Gift className="w-3.5 h-3.5" /> Hamkorlik va Bonus Dasturi
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink">
            Do'stlaringizni Taklif Qiling va Daromad Oling
          </h1>
          <p className="text-xs text-ink-muted">
            Do'stingiz kurs to'lovidan 10% chegirma oladi, siz esa har bir
            to'lovdan 15% (o'rtacha 450,000 UZS) bonus ishlab olasiz.
          </p>
        </div>
        <ReferralLinkCard {...referral} />
        <ReferralStats
          stats={stats}
          onPayout={() => {
            setPayoutSuccess(false);
            setPayoutModalOpen(true);
          }}
        />
        <ReferralHistoryTable referralList={referralList} />
      </div>
      {payoutModalOpen && <PayoutModal {...referral} />}
    </div>
  );
}
