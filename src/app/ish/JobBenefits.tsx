import { Award, DollarSign, Laptop, Sparkles } from "lucide-react";

const BENEFITS = [
  {
    icon: Laptop,
    title: "Erkin Tartib & Remote",
    description: "Masofadan yoki Toshkentdagi qulay kovorking ofisimizdan gibrid tartibda ishlash.",
  },
  {
    icon: Sparkles,
    title: "Bepul AI Obunalari",
    description: "Claude Code Max, Cursor Pro, ChatGPT Plus va Midjourney hisoblari kompaniya hisobidan.",
  },
  {
    icon: DollarSign,
    title: "Bozoriy Maosh & Bonus",
    description: "Raqobatbardosh maosh va har bir muvaffaqiyatli kurs kohortasi uchun alohida bonuslar.",
  },
  {
    icon: Award,
    title: "Tezkor O'sish",
    description: "Real-world arxitektura va xalqaro startaplar ekotizimida bevosita ishtirok etish.",
  },
];

export function JobBenefits() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {BENEFITS.map(({ icon: Icon, title, description }) => (
        <div key={title} className="space-y-2 rounded-xl border border-border-strong bg-cream-warm p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-bold text-ink">{title}</h2>
          <p className="text-xs leading-relaxed text-ink-muted">{description}</p>
        </div>
      ))}
    </div>
  );
}
