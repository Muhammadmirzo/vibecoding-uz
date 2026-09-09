"use client";

import * as React from "react";
import { Sparkles, ArrowRight, CheckCircle2, Zap, DollarSign, Clock, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface IdeaPlan {
  idea: string;
  category: string;
  tools: string[];
  days: number;
  traditionalCost: string;
  vibeCost: string;
  savedAmount: string;
  roadmap: string[];
}

const PRESET_IDEAS: IdeaPlan[] = [
  {
    idea: "Telegram do'kon va Click/Payme to'lov boti",
    category: "E-commerce & Bot",
    tools: ["Cursor IDE", "Next.js", "Telegraf", "Click/Payme API"],
    days: 4,
    traditionalCost: "1 500$",
    vibeCost: "0$ (o'zingiz yozasiz)",
    savedAmount: "1 500$",
    roadmap: [
      "1-kun: Telegram bot token va Webhook arxitekturasini Cursor orqali qurish",
      "2-kun: Mahsulotlar katalogi va savatcha (Cart) bazasini ulash",
      "3-kun: Click va Payme to'lov integratsiyasi va MD5 tekshiruvini kiritish",
      "4-kun: Serverga (Vercel/VPS) bepul deploy qilish va ishga tushirish",
    ],
  },
  {
    idea: "O'quv markaz yoki klinika uchun CRM va mijozlar navbati",
    category: "SaaS & Web App",
    tools: ["Claude Code", "Next.js 15", "Supabase", "Tailwind CSS"],
    days: 7,
    traditionalCost: "3 000$",
    vibeCost: "0$ (o'zingiz yozasiz)",
    savedAmount: "3 000$",
    roadmap: [
      "1-2 kun: Baza sxemasi va Drizzle ORM munosabatlarini generatsiya qilish",
      "3-4 kun: Admin paneli, mijozlar jadvali va statuslar kanbanini qurish",
      "5-kun: SMS eslatmalar (Eskiz.uz) va Telegram bildirishnomalarni ulash",
      "6-7 kun: Rollar (Admin, Menajer) va mobil versiya moslashuvini tugallash",
    ],
  },
  {
    idea: "AI asosidagi kontent va ijtimoiy tarmoqlar avtomatizatsiyasi",
    category: "AI Agent & Tool",
    tools: ["Cursor IDE", "Gemini API", "Python / Node.js", "Telegram API"],
    days: 3,
    traditionalCost: "1 200$",
    vibeCost: "0$ (o'zingiz yozasiz)",
    savedAmount: "1 200$",
    roadmap: [
      "1-kun: Gemini yoki Claude API ga prompt shablonlarini kiritish",
      "2-kun: Telegram va Instagramga avto-post qiluvchi bot logikasini yozish",
      "3-kun: Jadval bo'yicha (Cron) ishga tushirish va monitoring o'rnatish",
    ],
  },
];

export function IdeaSimulator() {
  const [selectedIdx, setSelectedIdx] = React.useState<number>(0);
  const [customIdea, setCustomIdea] = React.useState("");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [activePlan, setActivePlan] = React.useState<IdeaPlan>(PRESET_IDEAS[0]);

  const handleSelectPreset = (idx: number) => {
    setSelectedIdx(idx);
    setActivePlan(PRESET_IDEAS[idx]);
    setCustomIdea("");
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIdea.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      setActivePlan({
        idea: customIdea,
        category: "Maxsus Loyiha",
        tools: ["Claude Code", "Cursor IDE", "Next.js", "Supabase"],
        days: 5,
        traditionalCost: "2 000$ - 3 500$",
        vibeCost: "0$ (Kursda o'rganib o'zingiz qurasiz)",
        savedAmount: "2 500$+",
        roadmap: [
          "1-kun: Loyiha arxitekturasi va AI uchun AGENTS.md qoidalarini tuzish",
          "2-kun: Ma'lumotlar bazasi va asosiy API yo'nalishlarini generatsiya qilish",
          "3-kun: Frontend interfeysini Tailwind tokenlari bilan yaratish",
          "4-kun: Tashqi xizmatlar (to'lov, SMS yoki bot) integratsiyasini ulash",
          "5-kun: Jonli domen va serverga deploy qilish",
        ],
      });
      setIsAnalyzing(false);
    }, 600);
  };

  return (
    <section className="w-full py-14 md:py-20 bg-cream-warm border-b border-border">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-accent-soft text-accent border border-accent-line mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interaktiv Kalkulyator</span>
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-ink tracking-tight mb-4">
            G'oyangizni kiritib ko'ring: Vibe Coding bilan{" "}
            <span className="accent-serif">qancha pul va vaqt</span> tejaladi?
          </h2>
          <p className="text-sm md:text-base text-ink-muted leading-relaxed">
            Dasturchilarga oylab navbat kutish va minglab dollar sarflash shart emas.
            Haqiqiy loyihalar misolida qanday natijaga erishishingizni ko'ring.
          </p>
        </div>

        {/* Input & Preset Buttons */}
        <div className="max-w-3xl mx-auto mb-8">
          <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-2.5 mb-4">
            <input
              type="text"
              value={customIdea}
              onChange={(e) => setCustomIdea(e.target.value)}
              placeholder="O'z biznes g'oyangizni yozing (masalan: Mebel do'koni uchun katalog sayt)..."
              className="flex-1 px-4 py-3.5 text-sm bg-cream border border-border-strong rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-ink placeholder:text-ink-subtle"
            />
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-6 py-3.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors shrink-0 shadow-sm flex items-center justify-center gap-2"
            >
              {isAnalyzing ? "Hisoblanmoqda..." : "Hisoblash"}
              <Zap className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-mono text-ink-subtle shrink-0">Tayyor misollar:</span>
            {PRESET_IDEAS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectPreset(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                  selectedIdx === i && !customIdea
                    ? "bg-ink text-white border-ink"
                    : "bg-cream text-ink-muted border-border hover:border-accent-line"
                }`}
              >
                {p.category}
              </button>
            ))}
          </div>
        </div>

        {/* Result Card */}
        <div className="max-w-4xl mx-auto bg-cream border border-border-strong rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-border">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-accent-soft text-accent shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono text-ink-subtle block">Ishlab chiqish muddati</span>
                <span className="text-xl md:text-2xl font-bold text-ink">
                  {activePlan.days} kunda tayyor
                </span>
                <span className="text-xs text-ink-muted block mt-0.5">An'anaviy yo'l bilan: 2-3 oy</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-error-soft text-error shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono text-ink-subtle block">Dasturchilar so'raydigan narx</span>
                <span className="text-xl md:text-2xl font-bold text-error line-through">
                  {activePlan.traditionalCost}
                </span>
                <span className="text-xs text-ink-muted block mt-0.5">Doimiy xarajat va qaramlik</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-success-soft text-success shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono text-ink-subtle block">Siz tejaydigan summa</span>
                <span className="text-xl md:text-2xl font-extrabold text-success">
                  {activePlan.savedAmount}
                </span>
                <span className="text-xs text-success block font-semibold mt-0.5">Faqat kurs narxi evaziga</span>
              </div>
            </div>
          </div>

          {/* Roadmap Steps */}
          <div className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-subtle font-semibold">
                Vibe Coding bilan bosqichma-bosqich yo'l:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {activePlan.tools.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-cream-warm text-ink-muted border border-border"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {activePlan.roadmap.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-cream-warm border border-border/70 text-xs md:text-sm text-ink leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
              <p className="text-xs text-ink-muted text-center sm:text-left">
                Aynan shunday loyihalarni 8 haftalik amaliy mentorlikda birga quramiz.
              </p>
              <Link href="/diagnostika" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors shadow-sm">
                  <span>Menga mos yo'lni aniqlash</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
