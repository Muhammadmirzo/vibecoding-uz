"use client";

import * as React from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Receipt,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { KabinetNav } from "@/features/lms/components/KabinetNav";

interface Invoice {
  id: string;
  number: string;
  date: string;
  description: string;
  amount: string;
  provider: "Payme" | "Click" | "Bank";
  status: "paid" | "pending";
}

export default function ToLovlarPage() {
  const [selectedProvider, setSelectedProvider] = React.useState<"payme" | "click">("payme");
  const [paying, setPaying] = React.useState(false);
  const [payMessage, setPayMessage] = React.useState<string | null>(null);

  const invoices: Invoice[] = [
    {
      id: "inv-01",
      number: "CHK-2026-0941",
      date: "01.09.2026, 14:32",
      description: "Vibe Coding Express — 1/3 qism (Boshlang'ich to'lov)",
      amount: "996,667 UZS",
      provider: "Payme",
      status: "paid",
    },
    {
      id: "inv-02",
      number: "CHK-2026-1022",
      date: "15.09.2026, 11:15",
      description: "Vibe Coding Express — 2/3 qism",
      amount: "996,667 UZS",
      provider: "Click",
      status: "paid",
    },
  ];

  const handlePay = async () => {
    setPaying(true);
    setPayMessage(null);

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          amountSum: 996667,
          installmentMonth: 3,
        }),
      });

      const data = await res.json();

      if (res.ok && data.checkoutUrl) {
        setPayMessage("To'lov oynasiga yo'naltirilmoqda...");
        window.open(data.checkoutUrl, "_blank");
      } else {
        setPayMessage(data.error || "To'lov jarayonini boshlashda xatolik");
      }
    } catch (err) {
      setPayMessage("Tarmoq xatosi. Iltimos qayta urinib ko'ring.");
    } finally {
      setPaying(false);
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
            <CreditCard className="w-3.5 h-3.5" /> Moliya va To'lovlar Markazi
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink">
            To'lovlar, Grafiki va Cheklar
          </h1>
          <p className="text-xs text-ink-muted">
            Kurs uchun to'lov holati, bo'lib to'lash jadvali va rasmiy elektron kvitansiyalar.
          </p>
        </div>

        {/* Top Summary Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Card 1: Active Installment Status */}
          <div className="md:col-span-2 bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-accent uppercase">
                  Faol Ta'lim Kursi
                </span>
                <h2 className="text-xl font-bold text-ink">
                  Vibe Coding Express (8 hafta)
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-success-soft text-success border border-success-line">
                Bo'lib to'lash (2/3 to'landi)
              </span>
            </div>

            {/* Installment Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
                <span>To'langan summa: <strong className="text-ink">1,993,334 UZS</strong> (67%)</span>
                <span>Jami kurs qiymati: 2,990,000 UZS</span>
              </div>
              <div className="w-full h-3 bg-cream-deep rounded-full overflow-hidden">
                <div className="h-full bg-accent w-[67%] rounded-full transition-all duration-500"></div>
              </div>
            </div>

            {/* Next Installment Due Box */}
            <div className="p-4 rounded-xl bg-cream border border-accent-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-accent" /> Keyingi (yakuniy) 3-to'lov
                </div>
                <div className="text-xs text-ink-muted">
                  Muddati: <strong className="text-ink">15-Oktyabr, 2026</strong> ga qadar
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-mono font-bold text-accent">
                  996,666 UZS
                </div>
                <div className="text-[11px] font-mono text-ink-subtle">
                  Foizsiz bo'lib to'lash
                </div>
              </div>
            </div>

            {/* Payment Selector and Trigger */}
            <div className="pt-2 space-y-3">
              <div className="text-xs font-semibold text-ink">
                To'lov tizimini tanlang:
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProvider("payme")}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-semibold text-xs transition-all ${
                    selectedProvider === "payme"
                      ? "border-accent bg-accent-soft text-accent shadow-sm"
                      : "border-border bg-cream text-ink-muted hover:bg-cream-deep"
                  }`}
                >
                  <span className="font-bold text-sm">Payme</span>
                  <span className="text-[10px] font-mono text-ink-subtle">(0% komissiya)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProvider("click")}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-semibold text-xs transition-all ${
                    selectedProvider === "click"
                      ? "border-accent bg-accent-soft text-accent shadow-sm"
                      : "border-border bg-cream text-ink-muted hover:bg-cream-deep"
                  }`}
                >
                  <span className="font-bold text-sm">Click Up</span>
                  <span className="text-[10px] font-mono text-ink-subtle">(0% komissiya)</span>
                </button>
              </div>

              {payMessage && (
                <div className="p-3 rounded-lg bg-accent-soft border border-accent-line text-xs text-ink flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent shrink-0" />
                  <span>{payMessage}</span>
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={paying}
                className="btn-primary h-12 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 w-full mt-2"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>To'lov tizimi ochilmoqda...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>
                      {selectedProvider === "payme" ? "Payme" : "Click"} orqali 996,666 UZS to'lash
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: 7-Day Guarantee Policy */}
          <div className="bg-cream-warm border border-border-strong rounded-2xl p-6 space-y-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-success-soft text-success flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-ink">
                100% Pul Qaytarish Kafolati
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Mirzo Academy (academy.mirzo.uz) har bir talabaga rasmiy oferta asosida 7 kunlik to'liq qaytarish kafolatini taqdim etadi. Agar o'quv dasturi sizga to'g'ri kelmasa, hech qanday ortiqcha savollarsiz to'lovingiz to'liq qaytariladi.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cream border border-border space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ink-subtle">Kafolat holati:</span>
                <span className="text-success font-bold">Faol (yana 5 kun)</span>
              </div>
              <Link href="/pul-qaytarish" className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1">
                <span>Kafolat shartlari bilan tanishish</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="pt-2 border-t border-border text-[11px] text-ink-subtle">
              Savollaringiz bormi? <a href="https://t.me/m/ODAfK_QIMjky" target="_blank" rel="noreferrer" className="text-accent font-semibold hover:underline">Telegram buxgalteriya</a>
            </div>
          </div>

        </div>

        {/* Payment Receipts History Table */}
        <div className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                <Receipt className="w-5 h-5 text-accent" /> Cheklar va Kvitansiyalar Tarixi
              </h3>
              <p className="text-xs text-ink-muted">
                Barcha to'lovlaringiz bo'yicha rasmiy fiskal cheklar va PDF kvitansiyalar.
              </p>
            </div>
            <span className="text-xs font-mono text-ink-subtle">
              Jami to'lovlar: <strong className="text-ink">{invoices.length} ta</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-ink-subtle font-mono uppercase text-[11px]">
                  <th className="pb-3 pr-4 font-semibold">Chek raqami</th>
                  <th className="pb-3 px-4 font-semibold">Sana</th>
                  <th className="pb-3 px-4 font-semibold">Tavsif</th>
                  <th className="pb-3 px-4 font-semibold">Summa</th>
                  <th className="pb-3 px-4 font-semibold">Tizim</th>
                  <th className="pb-3 px-4 font-semibold">Holat</th>
                  <th className="pb-3 pl-4 font-semibold text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-cream transition-colors">
                    <td className="py-4 pr-4 font-mono font-bold text-ink">
                      {inv.number}
                    </td>
                    <td className="py-4 px-4 text-ink-muted font-mono whitespace-nowrap">
                      {inv.date}
                    </td>
                    <td className="py-4 px-4 text-ink font-medium max-w-xs truncate">
                      {inv.description}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-accent whitespace-nowrap">
                      {inv.amount}
                    </td>
                    <td className="py-4 px-4 font-semibold text-ink">
                      {inv.provider}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-success-soft text-success inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> To'langan
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => alert(`${inv.number} cheki PDF shaklida yuklab olinmoqda...`)}
                        className="btn-secondary h-8 px-3 rounded-md text-[11px] font-semibold inline-flex items-center gap-1.5"
                        title="PDF yuklab olish"
                      >
                        <Download className="w-3.5 h-3.5 text-accent" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
