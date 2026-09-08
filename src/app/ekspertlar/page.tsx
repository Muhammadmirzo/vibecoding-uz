import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Bitiruvchi Ekspertlar Reyestri | Mirzo Academy",
  description: "Mirzo Academy Vibe Coding Express kursi bitiruvchilari va sertifikatlangan AI mutaxassislari katalogi.",
};

export default function EkspertlarPage() {
  const experts = [
    {
      name: "Sardor Rahimov",
      tagline: "SaaS & AI Bot Developer",
      skills: ["Claude Code", "Next.js", "Telegram Bot API", "Payme"],
      badge: "Vibe Coding Express bitiruvchisi",
      bio: "Vibe Coding Express 1-guruh bitiruvchisi. EduBaza loyihasi uchun avtomatlashtirilgan Telegram bot va LMS modulini AI yordamida muvaffaqiyatli qurgan.",
    },
    {
      name: "Diyora Umarova",
      tagline: "Prompt Architect & Automation Specialist",
      skills: ["ChatGPT", "Make.com", "Cursor", "Zod Validation"],
      badge: "Vibe Coding Express bitiruvchisi",
      bio: "Marketing va SMM jarayonlarini AI yordamida 90% ga avtomatlashtirish bo'yicha ekspert. 5 dan ortiq biznes mijozlar uchun AI tizimlar qurgan.",
    },
  ];

  return (
    <div className="pt-28 pb-20 min-h-screen bg-cream">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        
        {/* Header */}
        <div className="text-center max-w-[680px] mx-auto mb-14 space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-accent-line bg-cream-warm text-[12px] tracking-wider text-accent uppercase font-mono font-bold">
            <BadgeCheck className="w-4 h-4" /> Verified Bitiruvchilar Reyestri
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-ink">
            AI bilan mahsulot qura oladigan <span className="accent-serif">amaliyotchi ekspertlar</span>
          </h1>
          <p className="text-sm text-ink-muted">
            Har bir bitiruvchi barcha modullardan o'tib, amaliy vazifalarni 100% bajargan va attestatsiyadan o'tgan.
          </p>
        </div>

        {/* Experts Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-[1000px] mx-auto">
          {experts.map((item, idx) => (
            <div
              key={idx}
              className="bg-cream-warm border border-border-strong rounded-xl p-7 space-y-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-ink">{item.name}</h3>
                    <BadgeCheck className="w-5 h-5 text-success" />
                  </div>
                  <div className="text-xs text-accent font-semibold">{item.tagline}</div>
                </div>
                <div className="px-3 py-1 rounded-full bg-accent-soft border border-accent-line text-xs font-mono font-bold text-accent flex items-center gap-1 shrink-0">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {item.badge}
                </div>
              </div>

              <p className="text-xs text-ink-muted leading-relaxed">
                {item.bio}
              </p>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-md bg-cream border border-border text-ink"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
