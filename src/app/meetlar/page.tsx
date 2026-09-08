import type { Metadata } from "next";
import { Calendar, Video, Play, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Jonli Meetlar va Vebinarlar Archive | Mirzo Academy",
  description: "Mirzo va AI ekspertlari bilan o'tkazilgan ochiq muloqotlar yozuvi.",
};

export default function MeetlarPage() {
  const meets = [
    {
      title: "Claude Code bilan 1 soatda Telegram Bot yaratish",
      date: "18-Oktyabr, 2026 · 20:00",
      status: "Yaqinlashayotgan jonli sessiya",
      isLive: true,
      description: "Jonli Efirda noldan boshlab to'lov qabul qiladigan bot loyihasini birga quramiz va savol-javob qilamiz.",
    },
    {
      title: "Cursor IDE vs VS Code: AI agentlarini to'g mezoniy sozlash",
      date: "28-Avgust, 2026",
      status: "Yozuv mavjud (Archive)",
      isLive: false,
      description: "Dasturchilar va tadbirkorlar uchun koddagi xatoliklarni 10x tezroq topish bo'yicha amaliy meet yozuvi.",
    },
  ];

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[var(--color-cream)]">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        
        <div className="text-center max-w-[680px] mx-auto mb-14 space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-accent-line)] bg-[var(--color-cream-warm)] text-[12px] tracking-wider text-[var(--color-accent)] uppercase font-mono font-bold">
            <Video className="w-4 h-4" /> Jonli Sessiyalar & Vebinarlar
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-ink)]">
            Haftalik <span className="accent-serif">jonli meetlar</span> va yozuvlar
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)]">
            O'quvchilar bilan birga jonli kodlash, loyihalar tahlili va dolzarb AI mavzulari.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-[1000px] mx-auto">
          {meets.map((meet, idx) => (
            <div
              key={idx}
              className="bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] rounded-[var(--radius-xl)] p-7 space-y-4 shadow-[var(--shadow-sm)] flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[var(--color-accent)] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {meet.date}
                  </span>
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded ${
                    meet.isLive
                      ? "bg-[#27C93F]/15 text-[#27C93F] border border-[#27C93F]/30"
                      : "bg-[var(--color-cream)] text-[var(--color-ink-muted)] border border-[var(--color-border)]"
                  }`}>
                    {meet.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[var(--color-ink)]">{meet.title}</h3>
                <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">{meet.description}</p>
              </div>

              <a href="https://t.me/m/ODAfK_QIMjky" target="_blank" rel="noreferrer" className="block pt-2">
                <button className="btn-secondary h-11 px-5 rounded-[var(--radius-md)] text-xs font-semibold inline-flex items-center justify-between w-full">
                  <span className="inline-flex items-center gap-2">
                    <Play className="w-4 h-4 text-[var(--color-accent)]" />
                    {meet.isLive ? "Qatnashish uchun ro'yxatdan o'tish" : "Yozuvni tomosha qilish"}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--color-ink-subtle)]" />
                </button>
              </a>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
