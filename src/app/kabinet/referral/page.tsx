"use client";

import * as React from "react";
import {
  Share2,
  Copy,
  Check,
  Users,
  DollarSign,
  TrendingUp,
  Gift,
  ArrowRight,
  Send,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { KabinetNav } from "@/features/lms/components/KabinetNav";
import { useAuth } from "@/context/AuthContext";
import { referralClaimBonusSchema } from "@/lib/validations/student";

interface ReferralLead {
  id: string;
  name: string;
  date: string;
  course: string;
  status: "paid" | "registered" | "consulting";
  bonusAmount: string;
}

export default function ReferralPage() {
  const { user } = useAuth();
  const [copied, setCopied] = React.useState(false);

  // Generate unique referral link based on user or fallback
  const referralCode = React.useMemo(() => {
    if (user?.id) {
      return user.id.slice(0, 8).toUpperCase();
    }
    return "JAMSHID-77";
  }, [user]);

  const referralUrl = typeof window !== "undefined"
    ? `${window.location.origin}/ref/${referralCode}`
    : `https://vibecoding.uz/ref/${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Referral Stats
  const stats = {
    clicks: 42,
    registered: 9,
    paid: 3,
    balance: 1350000, // UZS
  };

  // Invited friends mock list
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

  // Withdrawal modal state
  const [payoutModalOpen, setPayoutModalOpen] = React.useState(false);
  const [payoutMethod, setPayoutMethod] = React.useState<"uzcard_humo" | "course_balance">("uzcard_humo");
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardHolder, setCardHolder] = React.useState("");
  const [payoutLoading, setPayoutLoading] = React.useState(false);
  const [payoutSuccess, setPayoutSuccess] = React.useState(false);
  const [payoutError, setPayoutError] = React.useState<string | null>(null);

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError(null);

    const payload = {
      payoutMethod,
      cardNumber: payoutMethod === "uzcard_humo" ? cardNumber.replace(/\s+/g, "") : undefined,
      cardHolder: payoutMethod === "uzcard_humo" ? cardHolder : undefined,
      amountSum: stats.balance,
    };

    const parseResult = referralClaimBonusSchema.safeParse(payload);
    if (!parseResult.success) {
      setPayoutError(parseResult.error.errors[0]?.message || "Ma'lumotlar noto'g'ri");
      return;
    }

    setPayoutLoading(true);

    try {
      const res = await fetch("/api/referral/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parseResult.data),
      });

      const data = await res.json();

      if (!res.ok) {
        setPayoutError(data.error || "So'rov yuborishda xatolik yuz berdi");
        setPayoutLoading(false);
        return;
      }

      setPayoutSuccess(true);
    } catch (err) {
      setPayoutError("Tarmoq xatosi. Iltimos qayta urinib ko'ring.");
    } finally {
      setPayoutLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-cream">
      {/* Universal Student Navigation */}
      <KabinetNav />

      <div className="mx-auto w-full max-w-[1100px] px-5 md:px-8 space-y-8">
        
        {/* Header Block */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-mono font-bold">
            <Gift className="w-3.5 h-3.5" /> Hamkorlik va Bonus Dasturi
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink">
            Do'stlaringizni Taklif Qiling va Daromad Oling
          </h1>
          <p className="text-xs text-ink-muted">
            Do'stingiz kurs to'lovidan 10% chegirma oladi, siz esa har bir to'lovdan 15% (o'rtacha 450,000 UZS) bonus ishlab olasiz.
          </p>
        </div>

        {/* Affiliate Link Share Card */}
        <div className="bg-cream-warm border-2 border-accent-line rounded-2xl p-6 md:p-8 space-y-5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <Share2 className="w-5 h-5 text-accent" /> Shaxsiy Taklif Havolangiz
              </h2>
              <p className="text-xs text-ink-muted">
                Ushbu havolani do'stlaringiz, ijtimoiy tarmoqlar yoki Telegram kanalingizda ulashing.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-accent bg-accent-soft px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> 15% Keshbek Bonusi
            </div>
          </div>

          {/* Copy Box */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="w-full h-12 px-4 rounded-xl border border-border-strong bg-cream text-ink font-mono text-xs font-semibold select-all focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <button
              onClick={handleCopy}
              className="btn-primary h-12 px-6 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 shrink-0 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-success" />
                  <span>Nusxalandi!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Havolani nusxalash</span>
                </>
              )}
            </button>

            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(
                referralUrl
              )}&text=${encodeURIComponent(
                "Mirzo Academy (academy.mirzo.uz) da AI va Vibe Coding bo'yicha 8 haftalik intensiv kursga qo'shiling va 10% chegirmaga ega bo'ling!"
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary h-12 px-5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 text-telegram shrink-0"
              title="Telegram'da yuborish"
            >
              <Send className="w-4 h-4" />
              <span>Telegram'da ulashish</span>
            </a>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-cream-warm border border-border-strong rounded-xl p-5 space-y-1 shadow-sm">
            <div className="text-xs font-mono text-ink-muted flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-accent" /> Havolaga o'tishlar
            </div>
            <div className="text-2xl font-mono font-bold text-ink">
              {stats.clicks}
            </div>
            <div className="text-[10px] text-ink-subtle">Unikal tashriflar</div>
          </div>

          <div className="bg-cream-warm border border-border-strong rounded-xl p-5 space-y-1 shadow-sm">
            <div className="text-xs font-mono text-ink-muted flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-accent" /> Ro'yxatdan o'tganlar
            </div>
            <div className="text-2xl font-mono font-bold text-ink">
              {stats.registered} ta
            </div>
            <div className="text-[10px] text-ink-subtle">Kvizi yechgan leadlar</div>
          </div>

          <div className="bg-cream-warm border border-border-strong rounded-xl p-5 space-y-1 shadow-sm">
            <div className="text-xs font-mono text-ink-muted flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" /> To'lov qilganlar
            </div>
            <div className="text-2xl font-mono font-bold text-success">
              {stats.paid} nafar
            </div>
            <div className="text-[10px] text-ink-subtle">Muvaffaqiyatli xaridlar</div>
          </div>

          <div className="bg-cream-warm border border-accent-line rounded-xl p-5 space-y-1 shadow-sm relative overflow-hidden">
            <div className="text-xs font-mono font-bold text-accent flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Yechib olinadigan bonus
            </div>
            <div className="text-2xl font-mono font-bold text-accent">
              {stats.balance.toLocaleString("uz-UZ")} UZS
            </div>
            <button
              onClick={() => {
                setPayoutSuccess(false);
                setPayoutModalOpen(true);
              }}
              className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1 pt-1"
            >
              <span>Bonusni yechish</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* How Referral Works: 3 Steps */}
        <div className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-accent" /> Referral Dasturi Qanday Ishlaydi?
            </h3>
            <p className="text-xs text-ink-muted">
              Oddiy 3 qadam orqali qo'shimcha daromadga ega bo'ling.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-cream border border-border space-y-2 relative">
              <div className="w-8 h-8 rounded-full bg-accent text-white font-mono font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="text-sm font-bold text-ink">Havolani ulashing</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Shaxsiy taklif havolangizni do'stlaringizga, IT guruhlarga yoki blogingizga joylang.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-cream border border-border space-y-2 relative">
              <div className="w-8 h-8 rounded-full bg-accent text-white font-mono font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="text-sm font-bold text-ink">Do'stingiz 10% chegirma oladi</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Sizning havolangiz orqali kelgan har bir talaba kurs xaridida avtomatik 10% arzonroq to'laydi.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-cream border border-border space-y-2 relative">
              <div className="w-8 h-8 rounded-full bg-accent text-white font-mono font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="text-sm font-bold text-ink">Sizga 15% keshbek tushadi</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Har bir muvaffaqiyatli to'lovdan 450,000 UZS gacha shaxsiy hisobingizga yoki kartangizga yechib oling.
              </p>
            </div>
          </div>
        </div>

        {/* Invited Referrals Table */}
        <div className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" /> Taklif Qilingan Do'stlar Ro'yxati
              </h3>
              <p className="text-xs text-ink-muted">
                Sizning havolangiz orqali ro'yxatdan o'tgan foydalanuvchilar holati.
              </p>
            </div>
            <span className="text-xs font-mono text-ink-subtle">
              Jami takliflar: <strong className="text-ink">{referralList.length} ta</strong>
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
                  <th className="pb-3 pl-4 font-semibold text-right">Hisoblangan bonus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {referralList.map((ref) => (
                  <tr key={ref.id} className="hover:bg-cream transition-colors">
                    <td className="py-4 pr-4 font-semibold text-ink">
                      {ref.name}
                    </td>
                    <td className="py-4 px-4 text-ink-muted font-mono whitespace-nowrap">
                      {ref.date}
                    </td>
                    <td className="py-4 px-4 text-ink">
                      {ref.course}
                    </td>
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

      </div>

      {/* Payout Withdrawal Modal */}
      {payoutModalOpen && (
        <Dialog.Root open={payoutModalOpen} onOpenChange={setPayoutModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-150" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-cream border border-border-strong rounded-2xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-150 text-ink">
              
              <div className="pb-4 border-b border-border">
                <Dialog.Title className="text-xl font-bold text-ink">
                  Referral Bonusini Yechib Olish
                </Dialog.Title>
                <Dialog.Description className="text-xs text-ink-muted">
                  Mavjud balans: <strong className="text-accent font-mono">{stats.balance.toLocaleString("uz-UZ")} UZS</strong>
                </Dialog.Description>
              </div>

              {payoutSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-success-soft text-success flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-ink">So'rov qabul qilindi!</h4>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    24 soat ichida ko'rsatilgan kartangizga <strong>{stats.balance.toLocaleString("uz-UZ")} UZS</strong> mablag' o'tkazib beriladi.
                  </p>
                  <button
                    onClick={() => setPayoutModalOpen(false)}
                    className="btn-primary h-10 px-6 rounded-lg text-xs font-semibold mt-3"
                  >
                    Tushunarli
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePayoutSubmit} className="space-y-4 pt-4">
                  {payoutError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{payoutError}</span>
                    </div>
                  )}

                  {/* Payout method choice */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink">Qabul qilish usuli</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPayoutMethod("uzcard_humo")}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          payoutMethod === "uzcard_humo"
                            ? "border-accent bg-accent-soft text-accent shadow-sm"
                            : "border-border bg-cream-warm text-ink-muted"
                        }`}
                      >
                        <CreditCard className="w-4 h-4" /> Uzcard / Humo
                      </button>

                      <button
                        type="button"
                        onClick={() => setPayoutMethod("course_balance")}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          payoutMethod === "course_balance"
                            ? "border-accent bg-accent-soft text-accent shadow-sm"
                            : "border-border bg-cream-warm text-ink-muted"
                        }`}
                      >
                        <Gift className="w-4 h-4" /> Kurs to'loviga
                      </button>
                    </div>
                  </div>

                  {payoutMethod === "uzcard_humo" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-ink">Karta raqami (16 xonali) *</label>
                        <input
                          type="text"
                          required
                          placeholder="8600 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 16))}
                          className="w-full h-11 px-3.5 rounded-lg border border-border-strong bg-cream-warm text-ink text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-ink">Karta egasi ismi (F.I.SH.)</label>
                        <input
                          type="text"
                          placeholder="JAMSHID ALIMOV"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          className="w-full h-11 px-3.5 rounded-lg border border-border-strong bg-cream-warm text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </>
                  )}

                  <div className="p-3 rounded-lg bg-cream-warm border border-border text-xs flex items-center justify-between">
                    <span className="text-ink-muted">Yechilayotgan summa:</span>
                    <strong className="text-accent font-mono">{stats.balance.toLocaleString("uz-UZ")} UZS</strong>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutModalOpen(false)}
                      className="btn-secondary h-10 px-4 rounded-lg text-xs font-semibold"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="submit"
                      disabled={payoutLoading}
                      className="btn-primary h-10 px-6 rounded-lg text-xs font-semibold inline-flex items-center gap-2"
                    >
                      {payoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                      <span>Yechish so'rovini yuborish</span>
                    </button>
                  </div>
                </form>
              )}

            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}

    </div>
  );
}
