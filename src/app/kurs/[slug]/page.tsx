import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Award, Calendar, Clock, X, XCircle } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import { CourseCheckoutCard } from "../CourseCheckoutCard";

interface Props { params: Promise<{ slug: string }> }

const COURSES_DATA: Record<string, { title: string; subtitle: string; description: string; duration: string; level: string; price: string; oldPrice: string; installment: string; modules: string[] }> = {
  "vibe-coding-express": {
    title: "Vibe Coding Express", subtitle: "AI bilan real mahsulotlar (web, bot, MVP) qurish mentorlik kursi", description: "8 haftalik amaliy guruh kursi. Dasturchilarsiz, Claude Code va Cursor yordamida g'oyangizni ishlaydigan haqiqiy mahsulotga aylantirasiz.", duration: "8 hafta (Intensiv)", level: "Tadbirkorlar va Mutaxassislar", ...siteConfig.courses["vibe-coding-express"], modules: ["1-Modul: Vibe Coding va Prompt Injiniring asoslari", "2-Modul: Claude Code & Cursor muhitini sozlash", "3-Modul: Front-end va Tayyor UI Komponentlar yaratish", "4-Modul: Ma'lumotlar bazasi va Drizzle ORM PostgreSQL", "5-Modul: Telegram Bot API va Avtomatlashtirish", "6-Modul: Payme va Click To'lov Tizimlarini integratsiya qilish", "7-Modul: Xavfsizlik, Rate-limiting va High-Load tayyorgarligi", "8-Modul: Vercel / Cloudflare R2 ga real deploy qilish va Sertifikat"],
  },
  "ai-asoslari": {
    title: "AI Asoslari", subtitle: "Prompt-injiniring va AI vositalarini noldan o'rganing", description: "4 haftalik self-serve kurs. ChatGPT, Claude va Gemini orqali kundalik ishingiz va kontent tayyorlashni 90% ga avtomatlashtiring.", duration: "4 hafta", level: "Boshlang'ich", ...siteConfig.courses["ai-asoslari"], modules: ["1-Modul: Sun'iy intellekt turlari va to'g'ri topshiriq berish", "2-Modul: Matn va Kontent yaratish (ChatGPT & Claude)", "3-Modul: Media, Vizuallar va PDF tahlil (Midjourney & Gemini)", "4-Modul: Ish unumdorligini 10x ga oshirish"],
  },
};

export async function generateStaticParams() { return Object.keys(COURSES_DATA).map((slug) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const course = COURSES_DATA[slug];
  return course ? { title: `${course.title} — ${course.subtitle} | Mirzo Academy`, description: course.description } : { title: "Kurs Topilmadi" };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params; const course = COURSES_DATA[slug];
  if (!course) notFound();

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[var(--color-cream)]">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        <div className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              <span className="px-3 py-1 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-bold border border-[var(--color-accent-line)]">{course.level}</span>
              <span className="flex items-center gap-1.5 text-[var(--color-ink-muted)]"><Clock className="w-4 h-4 text-[var(--color-accent)]" /> {course.duration}</span>
              <span className="flex items-center gap-1.5 text-[var(--color-ink-muted)]"><Calendar className="w-4 h-4 text-[var(--color-accent)]" /> Keyingi guruh: {siteConfig.nextCohortShortDate}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--color-ink)] leading-tight">{course.title}</h1>
            <p className="text-base text-[var(--color-ink-muted)] leading-relaxed">{course.description}</p>
            <div className="space-y-4 pt-6">
              <h2 className="text-2xl font-bold text-[var(--color-ink)]">O&apos;quv Dasturi Modullari</h2>
              <div className="space-y-3">{course.modules.map((mod, index) => <div key={index} className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] flex items-center justify-between text-sm font-semibold text-[var(--color-ink)]"><span>{mod}</span><Award className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" /></div>)}</div>
            </div>
            <div className="pt-6 space-y-4">
              <div className="p-6 md:p-7 rounded-[var(--radius-xl)] bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] space-y-4">
                <h3 className="text-xl font-bold text-[var(--color-ink)] flex items-center gap-2"><XCircle className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0" />Bu kurs KIM UCHUN EMAS</h3>
                <ul className="space-y-3">{["Tayyor pullik video kurslarni kuzatib o'tirishni istaganlar — bizda har darsda o'zingiz qurasiz", "Dasturlashsiz AI ni imkoniyat deb biluvchilar — kod yozamiz, lekin AI bilan", "Bir kechada boy beradigan sir izlayotganlar — natija 8 hafta mehnat"].map((item, index) => <li key={index} className="flex items-start gap-2.5 text-sm text-[var(--color-ink-muted)] leading-relaxed"><X className="w-4 h-4 text-[var(--color-ink-subtle)] flex-shrink-0 mt-0.5" /><span>{item}</span></li>)}</ul>
              </div>
            </div>
          </div>
          <CourseCheckoutCard price={course.price} oldPrice={course.oldPrice} installment={course.installment} sessionFormat={siteConfig.sessionFormat} guaranteeText={siteConfig.guaranteeText} />
        </div>
      </div>
    </div>
  );
}
