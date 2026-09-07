"use client";

import * as React from "react";
import Link from "next/link";
import {
  Star,
  Play,
  CheckCircle2,
  Video,
  FileText,
  Filter,
  Sparkles,
  ArrowRight,
  Quote,
  Clock,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  STATIC_TESTIMONIALS,
  TestimonialItem,
} from "@/features/testimonials/testimonialsData";

export default function TestimoniyalarPage() {
  const [selectedType, setSelectedType] = React.useState<"all" | "video" | "text">("all");
  const [selectedRating, setSelectedRating] = React.useState<"all" | "5" | "4">("all");
  const [selectedCourse, setSelectedCourse] = React.useState<string>("all");

  const [activeVideoModal, setActiveVideoModal] = React.useState<TestimonialItem | null>(null);

  const filteredReviews = React.useMemo(() => {
    return STATIC_TESTIMONIALS.filter((item) => {
      const matchType = selectedType === "all" || item.type === selectedType;
      const matchRating =
        selectedRating === "all" || item.rating.toString() === selectedRating;
      const matchCourse =
        selectedCourse === "all" || item.courseTitle === selectedCourse;

      return matchType && matchRating && matchCourse;
    });
  }, [selectedType, selectedRating, selectedCourse]);

  return (
    <div className="pt-28 pb-20 min-h-screen bg-cream">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10 space-y-12">
        
        {/* Header Section */}
        <div className="text-center max-w-[760px] mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-accent-line bg-cream-warm text-[12px] tracking-wider text-accent uppercase font-mono font-bold">
            <Star className="w-4 h-4 fill-current" /> Bitiruvchilar Natijalari
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-ink tracking-tight">
            O'quvchilarimiz erishgan{" "}
            <span className="accent-serif">haqiqiy natijalar</span>
          </h1>
          <p className="text-sm md:text-base text-ink-muted leading-relaxed">
            Vibe Coding Express va AI Asoslari kurslari bitiruvchilarining jonli video intervyulari, yaratilgan MVP tizimlari va samimiy fikrlari.
          </p>
        </div>

        {/* Stats Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-cream-warm border border-border-strong rounded-xl p-5 text-center space-y-1 shadow-sm">
            <div className="text-2xl md:text-3xl font-extrabold text-ink font-mono flex items-center justify-center gap-1">
              4.95 <Star className="w-5 h-5 fill-current text-accent" />
            </div>
            <div className="text-xs text-ink-muted">O'rtacha baholash</div>
          </div>

          <div className="bg-cream-warm border border-border-strong rounded-xl p-5 text-center space-y-1 shadow-sm">
            <div className="text-2xl md:text-3xl font-extrabold text-ink font-mono">
              250+
            </div>
            <div className="text-xs text-ink-muted">Mamnun bitiruvchilar</div>
          </div>

          <div className="bg-cream-warm border border-border-strong rounded-xl p-5 text-center space-y-1 shadow-sm">
            <div className="text-2xl md:text-3xl font-extrabold text-accent font-mono">
              89%
            </div>
            <div className="text-xs text-ink-muted">Ishida AI integratsiya qilgan</div>
          </div>

          <div className="bg-cream-warm border border-border-strong rounded-xl p-5 text-center space-y-1 shadow-sm">
            <div className="text-2xl md:text-3xl font-extrabold text-[#27C93F] font-mono">
              45+
            </div>
            <div className="text-xs text-ink-muted">Jonli MVP & Startaplar</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-cream-warm border border-border-strong rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-ink-subtle uppercase flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Format:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedType("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedType === "all"
                      ? "bg-accent text-white"
                      : "bg-cream text-ink border border-border hover:bg-cream-deep"
                  }`}
                >
                  Barchasi
                </button>
                <button
                  onClick={() => setSelectedType("video")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                    selectedType === "video"
                      ? "bg-accent text-white"
                      : "bg-cream text-ink border border-border hover:bg-cream-deep"
                  }`}
                >
                  <Video className="w-3.5 h-3.5" /> Video sharhlar
                </button>
                <button
                  onClick={() => setSelectedType("text")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                    selectedType === "text"
                      ? "bg-accent text-white"
                      : "bg-cream text-ink border border-border hover:bg-cream-deep"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Matnli sharhlar
                </button>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-ink-subtle uppercase">
                Baho:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedRating("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedRating === "all"
                      ? "bg-accent text-white"
                      : "bg-cream text-ink border border-border hover:bg-cream-deep"
                  }`}
                >
                  Barchasi
                </button>
                <button
                  onClick={() => setSelectedRating("5")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all ${
                    selectedRating === "5"
                      ? "bg-accent text-white"
                      : "bg-cream text-ink border border-border hover:bg-cream-deep"
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current text-yellow-400" /> 5 Yulduz
                </button>
                <button
                  onClick={() => setSelectedRating("4")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all ${
                    selectedRating === "4"
                      ? "bg-accent text-white"
                      : "bg-cream text-ink border border-border hover:bg-cream-deep"
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current text-yellow-400" /> 4 Yulduz
                </button>
              </div>
            </div>

            {/* Course Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-ink-subtle uppercase">
                Kurs:
              </span>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="h-9 px-3 rounded-lg border border-border-strong bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">Barcha kurslar</option>
                <option value="Vibe Coding Express">Vibe Coding Express</option>
                <option value="AI Asoslari">AI Asoslari</option>
              </select>
            </div>

          </div>
        </div>

        {/* Reviews List Counter */}
        <div className="flex items-center justify-between text-xs font-mono text-ink-muted border-b border-border pb-3">
          <span>
            Sharhlar soni: <strong className="text-accent">{filteredReviews.length} ta</strong>
          </span>
          <span className="flex items-center gap-1.5 text-[#27C93F]">
            <ShieldCheck className="w-4 h-4" /> Barcha sharhlar haqiqiy bitiruvchilar tomonidan qoldirilgan
          </span>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((item) => {
            const isVideo = item.type === "video";

            return (
              <div
                key={item.id}
                className="bg-cream-warm border border-border-strong rounded-2xl overflow-hidden hover:border-accent-line hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                {/* Video Card Top Thumbnail (if video) */}
                {isVideo && item.thumbnailUrl ? (
                  <div
                    onClick={() => setActiveVideoModal(item)}
                    className="relative h-48 w-full bg-cream-deep cursor-pointer group overflow-hidden"
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={item.fullName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-white bg-black/70 backdrop-blur-md flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.videoDuration}
                    </div>
                  </div>
                ) : null}

                {/* Review Body */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Stars and Result Tag */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < item.rating
                                ? "text-yellow-400 fill-current"
                                : "text-border"
                            }`}
                          />
                        ))}
                      </div>

                      {item.resultMetric && (
                        <span className="text-[11px] font-mono font-bold text-accent bg-accent-soft px-2.5 py-0.5 rounded-full border border-accent-line">
                          {item.resultMetric}
                        </span>
                      )}
                    </div>

                    {/* Review Text */}
                    <p className="text-xs md:text-sm text-ink-muted leading-relaxed italic">
                      "{item.body}"
                    </p>
                  </div>

                  {/* Student Details Card Footer */}
                  <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt={item.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-accent text-white font-bold flex items-center justify-center text-xs">
                          {item.fullName[0]}
                        </div>
                      )}
                      <div>
                        <div className="text-xs md:text-sm font-bold text-ink flex items-center gap-1">
                          {item.fullName}
                          {item.verified && (
                            <span title="Tasdiqlangan bitiruvchi">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#27C93F]" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-ink-muted">
                          {item.role} {item.company ? `· ${item.company}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] font-mono font-semibold text-accent">
                        {item.courseTitle}
                      </div>
                      {item.cohortName && (
                        <div className="text-[10px] font-mono text-ink-subtle">
                          {item.cohortName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Video Play Button (if video) */}
                {isVideo && (
                  <button
                    onClick={() => setActiveVideoModal(item)}
                    className="w-full py-2.5 bg-accent/10 hover:bg-accent text-accent hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-t border-border"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Video intervyuni tomosha qilish</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Big Bottom Action Card */}
        <div className="bg-cream-warm border border-accent-line rounded-2xl p-8 md:p-12 text-center max-w-3xl mx-auto space-y-6 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-extrabold text-ink">
              Siz ham o'z natijangizni yaratishga{" "}
              <span className="accent-serif">tayyormisiz?</span>
            </h3>
            <p className="text-xs md:text-sm text-ink-muted max-w-lg mx-auto">
              5 daqiqalik diagnostika testidan o'ting va qaysi yo'nalish sizga mos kelishini aniqlang.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/diagnostika">
              <button className="btn-primary h-12 px-8 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                <span>Diagnostika Kvizi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/kurs/vibe-coding-express">
              <button className="btn-secondary h-12 px-8 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                <span>Vibe Coding Express dasturi</span>
              </button>
            </Link>
          </div>
        </div>

      </div>

      {/* Video Modal Player */}
      {activeVideoModal && (
        <Dialog.Root open={!!activeVideoModal} onOpenChange={(open) => !open && setActiveVideoModal(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-150" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl bg-cream border border-border-strong rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
              
              <div className="p-4 bg-cream-warm border-b border-border flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-ink">{activeVideoModal.fullName} — Video Intervyu</h4>
                  <p className="text-xs text-ink-muted">{activeVideoModal.courseTitle} · {activeVideoModal.cohortName}</p>
                </div>
                <Dialog.Close asChild>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-subtle hover:text-ink hover:bg-cream">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>

              {/* Video Embed Player */}
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title={activeVideoModal.fullName}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video Modal Description */}
              <div className="p-5 bg-cream space-y-2">
                <div className="flex items-center gap-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="text-xs font-mono font-bold text-ink ml-2">5.0</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  "{activeVideoModal.body}"
                </p>
              </div>

            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}

    </div>
  );
}
