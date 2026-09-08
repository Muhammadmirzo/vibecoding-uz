"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Briefcase,
  Phone,
  User,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Globe,
} from "lucide-react";
import { applyJobSchema, ApplyJobInput } from "@/lib/validations/jobs";

interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id?: string;
    slug?: string;
    title: string;
    department: string;
  };
}

export function ApplyJobModal({ isOpen, onClose, job }: ApplyJobModalProps) {
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("+998");
  const [telegramUsername, setTelegramUsername] = React.useState("");
  const [resumeUrl, setResumeUrl] = React.useState("");
  const [portfolioUrl, setPortfolioUrl] = React.useState("");
  const [experience, setExperience] = React.useState("1-3 yil");
  const [coverLetter, setCoverLetter] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setErrors({});
    }
  }, [isOpen]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("+998")) {
      val = "+998";
    }
    // Only allow + and digits, limit to 13 characters (+998901234567)
    val = val.replace(/[^0-9+]/g, "").slice(0, 13);
    setPhone(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    // Client-side Zod validation
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

      setSuccess(true);
    } catch (err) {
      setErrors({ general: "Tarmoq xatosi. Iltimos aloqani tekshiring." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-150" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-cream border border-border-strong rounded-2xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-150 text-ink">
          
          <div className="flex items-start justify-between pb-4 border-b border-border">
            <div className="space-y-1 pr-6">
              <span className="text-xs font-mono font-bold text-accent uppercase">
                {job.department}
              </span>
              <Dialog.Title className="text-xl md:text-2xl font-bold text-ink leading-snug">
                {job.title}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-subtle hover:text-ink hover:bg-cream-warm transition-colors"
                aria-label="Yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {success ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-success-soft text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-extrabold text-ink">
                Arizangiz qabul qilindi!
              </h3>
              <p className="text-xs md:text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
                Rahmat, <strong className="text-ink">{fullName}</strong>. Bizning HR jamoamiz 24 soat ichida <strong className="text-ink">{phone}</strong> raqami yoki Telegram orqali siz bilan bog'lanadi.
              </p>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="btn-primary h-11 px-8 rounded-lg text-xs font-semibold"
                >
                  Tushunarli
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              {errors.general && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-accent" /> F.I.SH. (Ism va Familiya) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jamshid Alimov"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full h-11 px-3.5 rounded-lg border bg-cream-warm text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.fullName ? "border-red-500" : "border-border-strong"
                  }`}
                />
                {errors.fullName && (
                  <p className="text-[11px] text-red-500 font-mono">{errors.fullName}</p>
                )}
              </div>

              {/* Phone (Uzbek format +998...) */}
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
                  className={`w-full h-11 px-3.5 rounded-lg border bg-cream-warm text-ink text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.phone ? "border-red-500" : "border-border-strong"
                  }`}
                />
                <p className="text-[11px] text-ink-subtle">
                  Format: +998901234567 (qo'ng'iroq va SMS uchun)
                </p>
                {errors.phone && (
                  <p className="text-[11px] text-red-500 font-mono">{errors.phone}</p>
                )}
              </div>

              {/* Telegram Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-accent" /> Telegram foydalanuvchi nomi
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs font-mono text-ink-subtle">@</span>
                  <input
                    type="text"
                    placeholder="jamshid_dev"
                    value={telegramUsername.replace(/^@/, "")}
                    onChange={(e) => setTelegramUsername("@" + e.target.value.replace(/^@/, ""))}
                    className="w-full h-11 pl-8 pr-3.5 rounded-lg border border-border-strong bg-cream-warm text-ink text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Experience and Portfolio in 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">Tajriba darajasi</label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-border-strong bg-cream-warm text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="Boshlang'ich (0-1 yil)">Boshlang'ich (0-1 yil)</option>
                    <option value="1-3 yil">1-3 yil (O'rta daraja)</option>
                    <option value="3-5 yil">3-5 yil (Katta tajriba)</option>
                    <option value="5+ yil">5+ yil (Senior / Lead)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-accent" /> GitHub / Portfolio
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-border-strong bg-cream-warm text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Resume Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-accent" /> Rezyume / CV havolasi (Google Drive, Notion yoki PDF)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/..."
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className={`w-full h-11 px-3.5 rounded-lg border bg-cream-warm text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.resumeUrl ? "border-red-500" : "border-border-strong"
                  }`}
                />
                {errors.resumeUrl && (
                  <p className="text-[11px] text-red-500 font-mono">{errors.resumeUrl}</p>
                )}
              </div>

              {/* Cover Letter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">
                  O'zingiz haqingizda qisqacha (Nega aynan siz?)
                </label>
                <textarea
                  rows={3}
                  placeholder="Qanday loyihalarda ishlagansiz va qaysi AI vositalarini bilasiz..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full p-3 rounded-lg border border-border-strong bg-cream-warm text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary h-12 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 w-full disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ariza yuborilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Arizani topshirish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
