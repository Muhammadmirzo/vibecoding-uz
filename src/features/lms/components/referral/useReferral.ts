"use client";
import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import { BRAND } from "@/config/brand";
import { referralClaimBonusSchema } from "@/lib/validations/student";
import type {
  PayoutMethod,
  ReferralLead,
  ReferralStats,
} from "./referralTypes";
export function useReferral() {
  const { user } = useAuth();
  const [copied, setCopied] = React.useState(false);
  const referralCode = React.useMemo(
    () => (user?.id ? user.id.slice(0, 8).toUpperCase() : "KODNI KIRITING"),
    [user],
  );
  const referralUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/ref/${referralCode}`
      : `${BRAND.url}/ref/${referralCode}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  const stats: ReferralStats = { clicks: 0, registered: 0, paid: 0, balance: 0 };
  const referralList: ReferralLead[] = [];
  const [payoutModalOpen, setPayoutModalOpen] = React.useState(false);
  const [payoutMethod, setPayoutMethod] =
    React.useState<PayoutMethod>("uzcard_humo");
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardHolder, setCardHolder] = React.useState("");
  const [payoutLoading, setPayoutLoading] = React.useState(false);
  const [payoutSuccess, setPayoutSuccess] = React.useState(false);
  const [payoutError, setPayoutError] = React.useState<string | null>(null);
  const handlePayoutSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPayoutError(null);
    const payload = {
      payoutMethod,
      cardNumber:
        payoutMethod === "uzcard_humo"
          ? cardNumber.replace(/\s+/g, "")
          : undefined,
      cardHolder: payoutMethod === "uzcard_humo" ? cardHolder : undefined,
      amountSum: stats.balance,
    };
    const parseResult = referralClaimBonusSchema.safeParse(payload);
    if (!parseResult.success) {
      setPayoutError(
        parseResult.error.errors[0]?.message || "Ma'lumotlar noto'g'ri",
      );
      return;
    }
    setPayoutLoading(true);
    try {
      const res = await fetch("/api/referral/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parseResult.data),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        setPayoutError(data.error || "So'rov yuborishda xatolik yuz berdi");
        return;
      }
      setPayoutSuccess(true);
    } catch {
      setPayoutError("Tarmoq xatosi. Iltimos qayta urinib ko'ring.");
    } finally {
      setPayoutLoading(false);
    }
  };
  return {
    referralUrl,
    handleCopy,
    copied,
    stats,
    referralList,
    payoutModalOpen,
    setPayoutModalOpen,
    payoutMethod,
    setPayoutMethod,
    cardNumber,
    setCardNumber,
    cardHolder,
    setCardHolder,
    payoutLoading,
    payoutSuccess,
    setPayoutSuccess,
    payoutError,
    handlePayoutSubmit,
  };
}
