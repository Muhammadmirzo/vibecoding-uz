"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Copy, FileText, Send, VideoOff } from "lucide-react";
import { VideoPlayer } from "@/features/lms/components/VideoPlayer";

type Lesson = { id: string; title: string; videoUrl: string | null; videoHlsUrl: string | null; contentMd: string | null; promptsJson: unknown; materialsJson: unknown; durationSec: number };
type LessonRow = { id: string; title: string; sortOrder: number; durationSec: number };
type ResponseData = { course: { slug: string; title: string }; section: { title: string }; lesson: Lesson; lessons: LessonRow[]; error?: string; reason?: string };
type Tab = "prompts" | "konspekt" | "materials" | "homework";

function textItems(value: unknown): Array<{ title: string; content: string }> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === "string") return [{ title: "Material", content: item }];
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const content = typeof record.content === "string" ? record.content : typeof record.text === "string" ? record.text : typeof record.url === "string" ? record.url : "";
    return content ? [{ title: typeof record.title === "string" ? record.title : "Material", content }] : [];
  });
}

export default function LessonPlayerView({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const [data, setData] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("prompts");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let active = true;
    fetch(`/api/lms/lessons/${encodeURIComponent(lessonId)}`, { cache: "no-store" })
      .then(async (res) => { const body: ResponseData = await res.json(); if (!res.ok) throw new Error(body.error || "Darsni yuklab bo'lmadi"); if (active) setData(body); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Xatolik yuz berdi"); });
    return () => { active = false; };
  }, [lessonId]);
  if (error) return <div role="alert" className="min-h-screen bg-cream px-5 pt-24 text-sm text-danger">Darsni ko'rishda xatolik: {error}</div>;
  if (!data) return <div className="min-h-screen bg-cream px-5 pt-24 text-sm text-ink-muted">Dars yuklanmoqda...</div>;
  const { lesson, course, section, lessons } = data;
  const videoUrl = lesson.videoHlsUrl || lesson.videoUrl;
  const prompts = textItems(lesson.promptsJson);
  const materials = textItems(lesson.materialsJson);
  const tabs: Array<[Tab, string]> = [["prompts", "Promptlar"], ["konspekt", "Konspekt"], ["materials", "Materiallar"], ["homework", "Uy ishi"]];
  const copyPrompt = async (text: string) => { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  return <div className="min-h-screen bg-cream px-5 pb-16 pt-24 md:px-8">
    <main className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex items-center justify-between text-xs font-mono"><Link href="/kabinet" className="inline-flex items-center gap-1 font-semibold text-accent"><ArrowLeft className="h-3.5 w-3.5" /> Kabinetga qaytish</Link><span className="text-ink-subtle">{course.title} · {section.title}</span></div>
      <h1 className="text-2xl font-extrabold text-ink md:text-3xl">{lesson.title}</h1>
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {videoUrl ? <VideoPlayer videoUrl={videoUrl} title={lesson.title} /> : <div className="flex aspect-video flex-col items-center justify-center rounded-xl border border-border-strong bg-cream-warm p-6 text-center"><VideoOff className="mb-3 h-7 w-7 text-ink-muted" /><h2 className="font-bold text-ink">Video tez orada qo'shiladi</h2><p className="mt-1 text-xs text-ink-muted">Dars matni va materiallari mavjud.</p></div>}
          <div className="flex gap-1 overflow-x-auto border-b border-border text-sm font-semibold">{tabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`whitespace-nowrap border-b-2 px-4 py-2.5 ${tab === id ? "border-accent text-accent" : "border-transparent text-ink-muted"}`}>{label}</button>)}</div>
          {tab === "prompts" && <PromptList prompts={prompts} copied={copied} onCopy={copyPrompt} />}
          {tab === "konspekt" && <TextPanel text={lesson.contentMd || "Konspekt hozircha mavjud emas."} />}
          {tab === "materials" && <TextList title="Materiallar" items={materials} />}
          {tab === "homework" && <HomeworkPanel assignment={section.title} />}
        </div>
        <aside className="rounded-xl border border-border-strong bg-cream-warm p-5"><h2 className="text-xs font-bold uppercase tracking-wider text-ink">Kurs darslari</h2><div className="mt-4 space-y-2">{lessons.map((item) => <Link key={item.id} href={`/kabinet/kurs/${courseId}/dars/${item.id}`} className={`block rounded-md border p-3 text-xs ${item.id === lesson.id ? "border-accent bg-accent-soft font-bold text-ink" : "border-border text-ink-muted"}`}><span className="block">{item.title}</span><span className="font-mono text-[10px]">{Math.round(item.durationSec / 60)} daq</span></Link>)}</div></aside>
      </div>
    </main>
  </div>;
}

function PromptList({ prompts, copied, onCopy }: { prompts: Array<{ title: string; content: string }>; copied: boolean; onCopy: (text: string) => void }) {
  if (!prompts.length) return <TextPanel text="Bu dars uchun promptlar hozircha mavjud emas." />;
  return <div className="space-y-4">{prompts.map((prompt, index) => <div key={`${prompt.title}-${index}`} className="space-y-2 rounded-lg border border-border-strong bg-cream-warm p-4"><div className="flex items-center justify-between gap-3"><span className="text-xs font-bold text-ink">{prompt.title}</span><button onClick={() => onCopy(prompt.content)} className="btn-secondary inline-flex h-8 items-center gap-1.5 rounded px-3 text-xs font-semibold">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Nusxalandi" : "Nusxalash"}</button></div><pre className="whitespace-pre-wrap rounded border border-border bg-cream p-3 font-mono text-xs text-ink-muted">{prompt.content}</pre></div>)}</div>;
}

function TextPanel({ text }: { text: string }) { return <div className="whitespace-pre-wrap rounded-xl border border-border-strong bg-cream-warm p-5 text-sm leading-relaxed text-ink-muted">{text}</div>; }
function TextList({ title, items }: { title: string; items: Array<{ title: string; content: string }> }) { return <div className="space-y-3"><h2 className="font-bold text-ink">{title}</h2>{items.length ? items.map((item, index) => <div key={`${item.title}-${index}`} className="rounded-lg border border-border-strong bg-cream-warm p-4"><h3 className="text-sm font-semibold text-ink">{item.title}</h3><p className="mt-2 break-all text-xs text-ink-muted">{item.content}</p></div>) : <TextPanel text="Materiallar hozircha mavjud emas." />}</div>; }
function HomeworkPanel({ assignment }: { assignment: string }) { return <div className="space-y-4 rounded-xl border border-border-strong bg-cream-warm p-6"><h2 className="font-bold text-ink">Uy vazifasi: {assignment}</h2><p className="text-sm leading-relaxed text-ink-muted">Topshirish funksiyasi hozircha ishlab turmaydi. Ishni tayyorlab, loyiha havolasini mentor bilan Telegram orqali yuboring.</p><button disabled className="btn-secondary inline-flex h-10 items-center gap-2 rounded-lg px-4 text-xs font-semibold opacity-60"><Send className="h-4 w-4" /> Tez orada</button></div>; }
