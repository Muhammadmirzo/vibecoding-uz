"use client";
import * as React from "react";
import { useAuth } from "@/context/AuthContext";
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
    () => (user?.id ? user.id.slice(0, 8).toUpperCase() : "JAMSHID-77"),
    [user],
  );
  const referralUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/ref/${referralCode}`
      : `https://vibecoding.uz/ref/${referralCode}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  const stats: ReferralStats = {
    clicks: 42,
    registered: 9,
    paid: 3,
    balance: 1350000,
  };
  const referralList: ReferralLead[] = [
    {
      id: "ref-01",
      name: "Sardor Karimov",
      date: "02.09.2026",
      course: "Vibe Coding Express",
      status: "paid",
      bonusAmount: "+450,000 UZS",
    },
    {
      id: "ref-02",
      name: "Dilshod Matrasulov",
      date: "04.09.2026",
      course: "Vibe Coding Express",
      status: "paid",
      bonusAmount: "+450,000 UZS",
    },
    {
      id: "ref-03",
      name: "Anvar Temirov",
      date: "05.09.2026",
      course: "Vibe Coding Express",
      status: "paid",
      bonusAmount: "+450,000 UZS",
    },
    {
      id: "ref-04",
      name: "Farrux Zokirov",
      date: "06.09.2026",
      course: "AI Asoslari",
      status: "registered",
      bonusAmount: "Kutilmoqda",
    },
  ];
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
