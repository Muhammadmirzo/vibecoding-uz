"use client";

import * as React from "react";
import { siteConfig } from "@/lib/siteConfig";
import { ChevronDown, Send } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FaqSection = React.memo(function FaqSection() {
  const [openId, setOpenId] = React.useState<string | null>("faq-1");

  const installmentText = siteConfig.courses["vibe-coding-express"]?.installment || "3 oyga bo'lib to'lash";

  const faqs: FaqItem[] = [
    {
      id: "faq-1",
      question: "Dasturlash tajribasi kerakmi?",
      answer: "Yo'q — noldan boshlaymiz. Kurslarimiz tayyor dasturlash bilimi bo'lmaganlar uchun mo'ljallangan. Sun'iy intellekt vositalaridan foydalanib mahsulot qurishni 1-darsdanoq o'rganasiz.",
    },
    {
      id: "faq-2",
      question: "Kurslar online mi?",
      answer: `Ha — jonli sessiyalar va yozuvlar. O'quv formati: ${siteConfig.sessionFormat}. Barcha jonli sessiyalar yozib olinadi va shaxsiy kabinetingizda saqlanadi.`,
    },
    {
      id: "faq-3",
      question: "To'lovni bo'lib to'lasam bo'ladimi?",
      answer: `Ha — 3 oyga bo'lib to mezonli to'lashingiz mumkin (${installmentText}). Boshlang'ich to'lovsiz, halol va shaffof shartlar asosida bo'lib to'lash imkoniyati bor.`,
    },
    {
      id: "faq-4",
      question: "Pul qaytarish kafolati bormi?",
      answer: `Ha — ${siteConfig.guaranteeDays} kun 100% pul qaytarish kafolati beriladi (${siteConfig.guaranteeText}). Agar birinchi haftada kurs ma'qul kelmasa, to'lovingiz to'liq qaytariladi.`,
    },
    {
      id: "faq-5",
      question: "Darslar qaysi tilda?",
      answer: "Darslar to'liq O'zbek tilida olib boriladi. Barcha atamalar, promptlar va topshiriqlar o'zbek tilida sodda va tushunarli tushuntiriladi.",
    },
    {
      id: "faq-6",
      question: "Kim o'qitadi?",
      answer: "Mirzo — EduBaza (27 000+ o'qituvchi) va Chatla (500+ biznes) loyihalari muallifi hamda tajribali vibe coding mentori.",
    },
  ];

  const toggleFaq = React.useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <section id="faq" className="relative w-full py-16 md:py-24 bg-cream-deep border-b border-border">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-[680px] mx-auto mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-accent-line bg-cream-warm text-[12px] tracking-wider text-accent uppercase font-mono font-bold mb-3 shadow-sm">
            <span>Savollaringiz bormi?</span>
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-ink mb-4">
            Savolingiz bormi? Javobi shu yerda.
          </h2>
          <p className="text-base md:text-lg text-ink-muted">
            Kurs, to'lov va o'quv jarayoni bo'yicha eng muhim savollarga ochiq va aniq javoblar.
          </p>
        </div>

        {/* FAQ Accordion Grid (Responsive: Mobile 1 column, Desktop 2 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-[1140px] mx-auto mb-14 md:mb-20">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-xl border border-border-strong bg-cream-warm overflow-hidden shadow-sm transition-all duration-200 hover:border-accent-line"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4 font-bold text-ink text-base md:text-lg focus:outline-none"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    {faq.question}
                  </span>
                  <div className={`p-1.5 rounded-md bg-cream text-accent transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 md:px-6 md:pb-6 text-sm text-ink-muted leading-relaxed border-t border-border pt-4">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Shaxsiy aloqa kartasi (Personal Contact Card) */}
        <div className="max-w-[720px] mx-auto rounded-xl border border-border-strong bg-cream p-6 md:p-8 shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* Instructor Profile & Online Status */}
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-accent-soft border-2 border-accent flex items-center justify-center text-accent font-bold text-xl font-serif">
                  M
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-success border-2 border-cream flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </span>
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-lg font-bold text-ink">Mirzo</h4>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-soft text-success text-[11px] font-mono font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                    online
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-0.5 font-medium">
                  EduBaza va Chatla muallifi
                </p>
                <p className="text-xs text-ink-subtle font-mono mt-1">
                  bot emas — o'zim javob beraman
                </p>
              </div>
            </div>

            {/* Telegram Button */}
            <a
              href="https://t.me/m/ODAfK_QIMjky"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md font-semibold bg-telegram text-white hover:opacity-95 transition-opacity h-12 px-6 text-sm shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Telegramda yozing</span>
              </button>
            </a>

          </div>
        </div>

      </div>
    </section>
  );
});
