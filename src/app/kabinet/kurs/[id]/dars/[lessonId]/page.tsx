"use client";

import * as React from "react";
import Link from "next/link";
import { CirclePlay, Copy, Check, FileText, Download, Send, ArrowLeft, ArrowRight, ShieldCheck, Video, Youtube, VideoOff } from "lucide-react";
import { VideoPlayer } from "@/features/lms/components/VideoPlayer";

type TabType = "konspekt" | "prompts" | "materials" | "homework";

export default function LessonPlayerPage() {
  const [activeTab, setActiveTab] = React.useState<TabType>("prompts");
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [submissionLink, setSubmissionLink] = React.useState("");
  const [submissionSuccess, setSubmissionSuccess] = React.useState(false);
  const [videoSource, setVideoSource] = React.useState<"youtube" | "direct">("youtube");

  const sampleVideoUrls = {
    youtube: "",
    direct: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  };

  const prompts = [
    {
      title: "Drizzle ORM PostgreSQL Schema Generator",
      prompt: `You are a PostgreSQL expert. Create a Drizzle ORM schema file for a SaaS learning platform with tables: users, courses, cohorts, and payments. Use uuid primary keys and strict TypeScript types.`,
    },
    {
      title: "Payme JSON-RPC 2.0 Webhook Handler",
      prompt: `Write a Next.js App Router POST handler for Payme JSON-RPC 2.0. Handle method CheckPerformTransaction, CreateTransaction, and PerformTransaction with authorization header check.`,
    },
  ];

  const handleCopyPrompt = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSubmitHomework = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionSuccess(true);
  };

  const currentVideoUrl = sampleVideoUrls[videoSource];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-cream">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs font-mono">
          <Link href="/kabinet" className="inline-flex items-center gap-1 text-accent font-semibold hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Kabinetga qaytish
          </Link>
          <span className="text-ink-subtle">Vibe Coding Express · 4-Modul (4-Dars)</span>
        </div>

        {/* Lesson Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink">
            4-Dars: PostgreSQL & Drizzle ORM Sxemasini Qurish
          </h1>
          {/* Hybrid Video Source Switcher */}
          <div className="inline-flex items-center gap-1.5 p-1 rounded-lg bg-cream-warm border border-border text-xs font-semibold">
            <button
              onClick={() => setVideoSource("youtube")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                videoSource === "youtube"
                  ? "bg-accent text-white shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>YouTube Embed</span>
            </button>
            <button
              onClick={() => setVideoSource("direct")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                videoSource === "direct"
                  ? "bg-accent text-white shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Direct MP4 Stream</span>
            </button>
          </div>
        </div>

        {/* Main Player & Tabs Layout */}
        <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">
          
          {/* Video Player Container */}
          <div className="space-y-6">
            {currentVideoUrl ? (
              <VideoPlayer
                videoUrl={currentVideoUrl}
                title="4-Dars: PostgreSQL & Drizzle ORM Sxemasini Qurish"
              />
            ) : (
              <div className="relative aspect-video rounded-xl bg-cream-warm border border-border-strong flex flex-col items-center justify-center p-6 text-center shadow-sm">
                <div className="w-14 h-14 rounded-full bg-cream-deep flex items-center justify-center mb-3">
                  <VideoOff className="w-7 h-7 text-ink-muted" />
                </div>
                <h3 className="text-base font-bold text-ink mb-1">
                  Bu darsning videosi tez orada qo'shiladi
                </h3>
                <p className="text-xs md:text-sm text-ink-muted max-w-md">
                  Dars matni va vazifasi bilan tanishingiz mumkin
                </p>
              </div>
            )}

            {/* Lesson Tabs Navigation */}
            <div className="border-b border-border flex items-center gap-2 font-semibold text-sm">
              {[
                { id: "prompts" as const, label: "Promptlar Kutubxonasi" },
                { id: "konspekt" as const, label: "Konspekt" },
                { id: "materials" as const, label: "Materiallar" },
                { id: "homework" as const, label: "Uy Ishi" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-accent text-accent font-bold"
                      : "border-transparent text-ink-muted hover:text-ink"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content: Prompts */}
            {activeTab === "prompts" && (
              <div className="space-y-4">
                <p className="text-xs text-ink-muted">
                  Ushbu darsda ko'rsatilgan tayyor promptlarni bitta bosish bilan nusxalang (copy-paste):
                </p>
                {prompts.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-cream-warm border border-border-strong space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-ink">{p.title}</span>
                      <button
                        onClick={() => handleCopyPrompt(p.prompt, idx)}
                        className="btn-secondary h-8 px-3 rounded text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-success" /> Nusxalandi
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-accent" /> Nusxalash
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 rounded bg-cream text-xs font-mono text-ink-muted whitespace-pre-wrap border border-border">
                      {p.prompt}
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {/* Tab Content: Homework */}
            {activeTab === "homework" && (
              <div className="p-6 rounded-xl bg-cream-warm border border-border-strong space-y-4">
                <h3 className="text-base font-bold text-ink">
                  4-Modul Uy Vazifasi: PostgreSQL Schema va Drizzle Migratsiyasi
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Loyiha ildizida `schema.ts` yaratib, `npm run db:generate` va `npm run db:seed` buyruqlarini bajaring. Tayyor kod yoki GitHub repozitoriyasi havolasini yuboring.
                </p>

                {submissionSuccess ? (
                  <div className="p-4 rounded-lg bg-success-soft border border-success-line text-xs font-semibold text-success flex items-center gap-2">
                    <Check className="w-4 h-4" /> Uy vazifangiz topshirildi va tekshirilmoqda. Mentor tez orada baholaydi!
                  </div>
                ) : (
                  <form onSubmit={handleSubmitHomework} className="space-y-3">
                    <input
                      type="url"
                      required
                      placeholder="GitHub yoki Vercel loyihangiz havolasi (URL)"
                      value={submissionLink}
                      onChange={(e) => setSubmissionLink(e.target.value)}
                      className="w-full h-11 px-4 rounded-md border border-border-strong bg-cream text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <button type="submit" className="btn-primary h-11 px-6 rounded-md text-xs font-semibold inline-flex items-center gap-2">
                      <Send className="w-4 h-4" /> Vazifani Topshirish
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>

          {/* Right Sidebar: Curriculum Lessons Selector */}
          <div className="bg-cream-warm border border-border-strong rounded-xl p-5 space-y-4">
            <div className="text-xs font-mono font-bold uppercase text-ink tracking-wider">
              4-Modul Darslari Listi
            </div>
            <div className="space-y-2 text-xs">
              {[
                { title: "1. PostgreSQL va Drizzle ORM haqida", time: "15:00", done: true },
                { title: "2. Database Tables va Enumlarni yaratish", time: "22:00", done: true },
                { title: "3. Drizzle Kit & Seed skriptini yozish", time: "18:00", done: true },
                { title: "4. Schema va API route integratsiyasi", time: "42:00", active: true },
                { title: "5. Real Deploy & Cloud Database (Neon)", time: "30:00", locked: true },
              ].map((l, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-md border flex items-center justify-between cursor-pointer ${
                    l.active
                      ? "border-accent bg-accent-soft font-bold text-ink"
                      : l.done
                      ? "border-border bg-cream text-ink-muted"
                      : "border-transparent text-ink-subtle opacity-60"
                  }`}
                >
                  <span className="truncate pr-2">{l.title}</span>
                  <span className="font-mono text-[10px]">{l.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
