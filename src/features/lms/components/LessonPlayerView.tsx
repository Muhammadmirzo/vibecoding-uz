"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, Check, Copy, FileText, Send, VideoOff } from "lucide-react";
import { Button } from "@/components/ui";
import { VideoPlayer } from "@/features/lms/components/VideoPlayer";
import { KabinetNav } from "@/features/lms/components/KabinetNav";

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
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  useEffect(() => {
    let active = true;
    fetch(`/api/lms/lessons/${encodeURIComponent(lessonId)}`, { cache: "no-store" })
      .then(async (res) => { const body: ResponseData = await res.json(); if (!res.ok) throw new Error(body.error || "Darsni yuklab bo'lmadi"); if (active) setData(body); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Xatolik yuz berdi"); });
    return () => { active = false; };
  }, [lessonId]);

  if (error) return <div className="min-h-screen bg-bg px-5 pt-28 text-danger"><div role="alert" className="mx-auto max-w-xl rounded-xl border border-danger bg-bg-elevated p-8">Darsni ko&apos;rishda xatolik: {error}</div></div>;
  if (!data) return <div className="min-h-screen bg-bg px-5 pt-28"><div className="mx-auto max-w-6xl animate-pulse space-y-4" role="status" aria-label="Dars yuklanmoqda"><div className="h-12 w-2/3 rounded bg-bg-sunken" /><div className="aspect-video rounded-xl bg-bg-sunken" /><div className="h-64 rounded-xl bg-bg-sunken" /></div></div>;
  const { lesson, course, section, lessons } = data;
  const videoUrl = lesson.videoHlsUrl || lesson.videoUrl;
  const prompts = textItems(lesson.promptsJson);
  const materials = textItems(lesson.materialsJson);
  const tabs: Array<[Tab, string]> = [["prompts", "Promptlar"], ["konspekt", "Konspekt"], ["materials", "Materiallar"], ["homework", "Uy ishi"]];
  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) { let next: number | undefined; if (event.key === "ArrowRight") next = (index + 1) % tabs.length; if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length; if (event.key === "Home") next = 0; if (event.key === "End") next = tabs.length - 1; if (next === undefined) return; event.preventDefault(); setTab(tabs[next][0]); tabRefs.current[next]?.focus(); }
  const copyPrompt = async (text: string) => { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };

  return <div className="min-h-screen bg-bg text-ink"><KabinetNav /><main className="mx-auto w-full max-w-7xl space-y-6 px-5 pb-28 pt-24 md:px-8 md:pt-28 lg:pl-80 lg:pr-8">
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><Link href="/kabinet" className="inline-flex min-h-11 items-center gap-1 font-semibold text-brand"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Kabinetga qaytish</Link><span className="max-w-full truncate text-ink-muted">{course.title} · {section.title}</span></div>
    <h1 className="break-words font-display text-2xl font-semibold text-ink md:text-3xl">{lesson.title}</h1>
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-6">
        {videoUrl ? <VideoPlayer videoUrl={videoUrl} title={lesson.title} /> : <div className="flex aspect-video flex-col items-center justify-center rounded-xl border border-border bg-bg-elevated p-6 text-center"><VideoOff className="mb-3 h-7 w-7 text-ink-muted" aria-hidden="true" /><h2 className="font-semibold text-ink">Video tez orada qo&apos;shiladi</h2><p className="mt-1 text-sm text-ink-muted">Dars matni va materiallari mavjud.</p></div>}
        <div role="tablist" aria-label="Dars bo&apos;limlari" className="flex gap-1 overflow-x-auto border-b border-border text-sm font-semibold">{tabs.map(([id, label], index) => <button key={id} id={`lesson-tab-${id}`} ref={(element) => { tabRefs.current[index] = element; }} type="button" role="tab" aria-selected={tab === id} aria-controls={`lesson-panel-${id}`} tabIndex={tab === id ? 0 : -1} onKeyDown={(event) => handleTabKeyDown(event, index)} onClick={() => setTab(id)} className={`min-h-11 shrink-0 border-b-2 px-4 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${tab === id ? "border-accent text-accent" : "border-transparent text-ink-muted"}`}>{label}</button>)}</div>
        <div role="tabpanel" id={`lesson-panel-${tab}`} aria-labelledby={`lesson-tab-${tab}`} tabIndex={0} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
         {tab === "prompts" ? <PromptList prompts={prompts} copied={copied} onCopy={copyPrompt} /> : null}
        {tab === "konspekt" ? <TextPanel text={lesson.contentMd || "Konspekt hozircha mavjud emas."} /> : null}
        {tab === "materials" ? <TextList items={materials} /> : null}
        {tab === "homework" ? <HomeworkPanel assignment={section.title} /> : null}
         </div>
      </div>
      <aside className="rounded-xl border border-border bg-bg-elevated p-5"><h2 className="font-display text-base font-semibold text-ink">Kurs darslari</h2><div className="mt-4 space-y-2">{lessons.map((item) => <Link key={item.id} href={`/kabinet/kurs/${courseId}/dars/${item.id}`} aria-current={item.id === lesson.id ? "page" : undefined} className={`block min-h-11 rounded-lg border p-3 text-sm ${item.id === lesson.id ? "border-accent bg-accent-soft font-semibold text-ink" : "border-border text-ink-muted hover:border-brand"}`}><span className="block">{item.title}</span><span className="font-mono text-xs">{Math.round(item.durationSec / 60)} daq</span></Link>)}</div><NextLessonButton lessons={lessons} currentId={lesson.id} courseId={courseId} /></aside>
    </div>
  </main></div>;
}

function NextLessonButton({ lessons, currentId, courseId }: { lessons: LessonRow[]; currentId: string; courseId: string }) {
  const ordered = [...lessons].sort((a, b) => a.sortOrder - b.sortOrder);
  const next = ordered[ordered.findIndex((item) => item.id === currentId) + 1];
  if (!next) return <p className="mt-4 rounded-lg bg-success-soft px-4 py-3 text-center text-sm font-semibold text-success">Bu bo&apos;limning oxirgi darsi</p>;
  return <Button href={`/kabinet/kurs/${courseId}/dars/${next.id}`} className="mt-4 w-full">Keyingi dars: {next.title}</Button>;
}

function PromptList({ prompts, copied, onCopy }: { prompts: Array<{ title: string; content: string }>; copied: boolean; onCopy: (text: string) => void }) {
  if (!prompts.length) return <TextPanel text="Bu dars uchun promptlar hozircha mavjud emas." />;
  return <div className="space-y-4">{prompts.map((prompt, index) => <div key={`${prompt.title}-${index}`} className="space-y-3 rounded-lg border border-border bg-bg-elevated p-4"><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-ink">{prompt.title}</span><span className="sr-only" aria-live="polite">{copied ? "Prompt nusxalandi" : ""}</span><Button type="button" variant="outline" size="sm" onClick={() => onCopy(prompt.content)}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Nusxalandi" : "Nusxalash"}</Button></div><pre className="whitespace-pre-wrap rounded-lg border border-border bg-bg-sunken p-3 font-mono text-sm text-ink-muted">{prompt.content}</pre></div>)}</div>;
}
function TextPanel({ text }: { text: string }) { return <div className="whitespace-pre-wrap rounded-xl border border-border bg-bg-elevated p-5 text-base leading-relaxed text-ink-muted">{text}</div>; }
function TextList({ items }: { items: Array<{ title: string; content: string }> }) { return <div className="space-y-3">{items.length ? items.map((item, index) => <div key={`${item.title}-${index}`} className="rounded-lg border border-border bg-bg-elevated p-4"><h3 className="font-semibold text-ink">{item.title}</h3><p className="mt-2 break-all text-sm text-ink-muted">{item.content}</p></div>) : <TextPanel text="Materiallar hozircha mavjud emas." />}</div>; }
function HomeworkPanel({ assignment }: { assignment: string }) { return <div className="space-y-4 rounded-xl border border-border bg-bg-elevated p-6"><h2 className="font-display text-lg font-semibold text-ink">Uy vazifasi: {assignment}</h2><p className="text-base leading-relaxed text-ink-muted">Platformada topshiriq yuklash oynasi hozircha yoq. Ishni tayyorlab, loyiha havolasini mentor bilan Telegram orqali yuboring.</p><Button href="https://t.me/m/ODAfK_QIMjky" variant="telegram"><Send className="h-4 w-4" /> Mentor bilan bog&apos;lanish</Button></div>; }
