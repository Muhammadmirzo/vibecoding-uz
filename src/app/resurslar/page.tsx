import type { Metadata } from "next";
import { Download, ExternalLink, Briefcase, Megaphone, GraduationCap, Calculator } from "lucide-react";

export const metadata: Metadata = {
  title: "Bepul AI Resurslar Hubi | Vibecoding.uz",
  description: "Sohangiz bo'yicha tayyor promptlar to'plami, checklistlar va qo'llanmalarni bepul yuklab oling.",
};

export default function ResurslarPage() {
  const professions = [
    {
      title: "Tadbirkor va Asoschilar",
      icon: Briefcase,
      count: "12 ta prompt + MVP checklist",
      description: "Biznes jarayonlarni avtomatlashtirish va g'oyadan mahsulot yaratish promptlari.",
    },
    {
      title: "Marketologlar va Kontentchilar",
      icon: Megaphone,
      count: "18 ta prompt + SMM starter",
      description: "Kontent-reja, reklama matnlari va target tahlili uchun AI yo'riqnomalar.",
    },
    {
      title: "O'qituvchi va Murabbiylar",
      icon: GraduationCap,
      count: "8 ta prompt + Dars rejalari",
      description: "O'quv dasturlarini tezkor tuzish va interaktiv mashqlar tayyorlash.",
    },
    {
      title: "Buxgalter va Moliya mutaxassislari",
      icon: Calculator,
      count: "10 ta prompt + Excel/CSV prompts",
      description: "Moliyaviy hisobotlarni tahlil qilish va formulalarni avtomatlashtirish.",
    },
  ];

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[var(--color-cream)]">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        
        {/* Section Title */}
        <div className="text-center max-w-[680px] mx-auto mb-14 space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-accent-line)] bg-[var(--color-cream-warm)] text-[12px] tracking-wider text-[var(--color-accent)] uppercase font-mono font-bold">
            Bepul Resurslar Kutubxonasi
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-ink)]">
            Sohangizga mos <span className="accent-serif">AI promptlar to'plami</span>
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)]">
            O'zingizga tegishli yo'nalishni tanlang va bir necha soniyada Telegram orqali yuklab oling.
          </p>
        </div>

        {/* Profession Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-[1000px] mx-auto">
          {professions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] rounded-[var(--radius-xl)] p-7 space-y-4 hover:border-[var(--color-accent-line)] hover:shadow-[var(--shadow-md)] transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--color-accent)] bg-[var(--color-cream)] px-3 py-1 rounded-full border border-[var(--color-border)]">
                    {item.count}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[var(--color-ink)]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <a
                  href="https://t.me/m/ODAfK_QIMjky"
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <button className="btn-secondary h-11 px-5 rounded-[var(--radius-md)] text-xs font-semibold inline-flex items-center justify-between w-full">
                    <span className="inline-flex items-center gap-2">
                      <Download className="w-4 h-4 text-[var(--color-accent)]" />
                      Telegram'da bepul olish
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--color-ink-subtle)]" />
                  </button>
                </a>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
