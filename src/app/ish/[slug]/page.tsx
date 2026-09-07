"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Send,
  User,
  Phone,
  Globe,
  FileText,
  AlertCircle,
  Loader2,
  Calendar,
  Share2,
} from "lucide-react";
import {
  STATIC_JOB_OPENINGS,
  JobOpeningItem,
} from "@/features/jobs/jobsData";
import { applyJobSchema } from "@/lib/validations/jobs";

export default function JobDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const job = STATIC_JOB_OPENINGS.find((j) => j.slug === slug);

  if (!job) {
    notFound();
  }

  // State for direct on-page quick application form
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("+998");
  const [telegramUsername, setTelegramUsername] = React.useState("");
  const [resumeUrl, setResumeUrl] = React.useState("");
  const [portfolioUrl, setPortfolioUrl] = React.useState("");
  const [experience, setExperience] = React.useState("1-3 yil");
  const [coverLetter, setCoverLetter] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("+998")) val = "+998";
    val = val.replace(/[^0-9+]/g, "").slice(0, 13);
    setPhone(val);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      jobId: job.id,
      jobSlug: job.slug,
      jobTitle: job.title,
      fullName: fullName.trim(),
      phone: phone.trim(),
      telegramUsername: telegramUsername.trim() || undefined,
      resumeUrl: resumeUrl.trim() || undefined,
      portfolioUrl: portfolioUrl.trim() || undefined,
      experience,
      coverLetter: coverLetter.trim() || undefined,
    };

    const parseResult = applyJobSchema.safeParse(payload);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/ish/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parseResult.data),
      });

      const resData = await res.json();

      if (!res.ok) {
        setErrors({ general: resData.error || "Ariza yuborishda xatolik yuz berdi" });
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setErrors({ general: "Tarmoq xatoligi. Qayta urinib ko'ring." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-cream">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-ink-subtle">
          <Link href="/" className="hover:text-accent transition-colors">
            Bosh sahifa
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/ish" className="hover:text-accent transition-colors">
            Bo'sh ish o'rinlari
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ink font-semibold truncate max-w-xs md:max-w-md">
            {job.title}
          </span>
        </nav>

        {/* Back Link */}
        <div>
          <Link
            href="/ish"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-ink-muted hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Barcha vakansiyalarga qaytish
          </Link>
        </div>

        {/* Header Block */}
        <div className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-10 space-y-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-accent-soft text-accent border border-accent-line">
              {job.department}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono text-ink-subtle bg-cream border border-border flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent" /> {job.type}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono text-ink-subtle bg-cream border border-border flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-accent" /> {job.location}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono text-ink-subtle bg-cream border border-border flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-accent" /> E'lon qilindi: {job.postedDate}
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-extrabold text-ink tracking-tight">
              {job.title}
            </h1>
            <div className="text-xl md:text-2xl font-mono font-bold text-accent flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              <span>{job.salary}</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Job Details & Apply Flow */}
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Job Description, Requirements & Benefits */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Description */}
            <section className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
              <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-accent" /> Vakansiya haqida
              </h2>
              <p className="text-sm text-ink-muted leading-relaxed">
                {job.descriptionMd}
              </p>
              <div className="p-3.5 rounded-lg bg-cream border border-border text-xs font-mono text-ink-subtle">
                Kerakli tajriba: <strong className="text-ink">{job.experience}</strong>
              </div>
            </section>

            {/* Responsibilities */}
            <section className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
              <h2 className="text-xl font-bold text-ink">
                Sizning asosiy vazifalaringiz
              </h2>
              <ul className="space-y-3">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-ink-muted leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Requirements */}
            <section className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
              <h2 className="text-xl font-bold text-ink">
                Nomzodga qo'yiladigan talablar
              </h2>
              <ul className="space-y-3">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-ink-muted leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-[#27C93F] shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* What We Offer */}
            <section className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
              <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" /> Biz taklif qilamiz
              </h2>
              <ul className="space-y-3">
                {job.benefits.map((ben, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-ink-muted leading-relaxed">
                    <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2"></div>
                    <span>{ben}</span>
                  </li>
                ))}
              </ul>
            </section>

          </div>

          {/* Right Column: Apply Phone Flow Form (Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-cream-warm border-2 border-accent-line rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-accent uppercase">
                  Tezkor Ariza
                </span>
                <h3 className="text-2xl font-bold text-ink">
                  Vakansiyaga topshirish
                </h3>
                <p className="text-xs text-ink-muted">
                  Telefon raqamingiz va rezyumeingizni qoldiring. 24 soat ichida bog'lanamiz.
                </p>
              </div>

              {submitted ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#27C93F]/15 text-[#27C93F] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-extrabold text-ink">
                    Arizangiz qabul qilindi!
                  </h4>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Hurmatli <strong className="text-ink">{fullName}</strong>, ma'lumotlaringiz HR jamoamizga muvaffaqiyatli yetkazildi. Tez orada sizga qo'ng'iroq qilamiz.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFullName("");
                      setPhone("+998");
                      setCoverLetter("");
                      setResumeUrl("");
                    }}
                    className="btn-secondary h-10 px-6 rounded-lg text-xs font-semibold"
                  >
                    Boshqa ariza topshirish
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {errors.general && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errors.general}</span>
                    </div>
                  )}

                  {/* Candidate Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-accent" /> Ism va Familiya *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jamshid Alimov"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full h-11 px-3.5 rounded-lg border bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent ${
                        errors.fullName ? "border-red-500" : "border-border-strong"
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-red-500 font-mono">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Phone Flow (+998...) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-accent" /> Telefon raqami *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+998901234567"
                      value={phone}
                      onChange={handlePhoneChange}
                      className={`w-full h-11 px-3.5 rounded-lg border bg-cream text-ink text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent ${
                        errors.phone ? "border-red-500" : "border-border-strong"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-500 font-mono">{errors.phone}</p>
                    )}
                  </div>

                  {/* Telegram */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-accent" /> Telegram userni kiriting
                    </label>
                    <input
                      type="text"
                      placeholder="@foydalanuvchi"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg border border-border-strong bg-cream text-ink text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  {/* Resume URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-accent" /> Rezyume / CV havolasi
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      className={`w-full h-11 px-3.5 rounded-lg border bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent ${
                        errors.resumeUrl ? "border-red-500" : "border-border-strong"
                      }`}
                    />
                    {errors.resumeUrl && (
                      <p className="text-[11px] text-red-500 font-mono">{errors.resumeUrl}</p>
                    )}
                  </div>

                  {/* Portfolio / GitHub */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-accent" /> GitHub yoki Portfolio havolasi
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg border border-border-strong bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  {/* Note */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink">
                      Qo'shimcha izoh (ixtiyoriy)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Nega aynan siz bu lavozimga mos kelishingiz haqida..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="w-full p-3 rounded-lg border border-border-strong bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary h-12 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 w-full disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Yuborilmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Arizani yuborish</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-ink-subtle">
                    Tugmani bosish orqali shaxsiy ma'lumotlarni qayta ishlashga rozilik bildirasiz.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
