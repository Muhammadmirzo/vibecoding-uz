"use client";

import { useEffect, useState, type FormEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Form";
import type { Cohort } from "./types";

interface CohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  initialData?: Cohort | null;
  courses: Array<{ id: string; title: string }>;
}

const inputClass = "min-h-11 w-full rounded-md border border-border bg-bg-sunken px-3 text-base text-ink focus:border-accent focus:outline-none";

export function CohortModal({ isOpen, onClose, onSave, initialData, courses }: CohortModalProps) {
  const [courseId, setCourseId] = useState("");
  const [name, setName] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [seats, setSeats] = useState(30);
  const [priceSum, setPriceSum] = useState("2990000");
  const [earlyPriceSum, setEarlyPriceSum] = useState("2490000");
  const [earlyDeadline, setEarlyDeadline] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setCourseId(initialData.courseId || "");
      setName(initialData.name || "");
      setStartsAt(initialData.startsAt ? new Date(initialData.startsAt).toISOString().slice(0, 10) : "");
      setEndsAt(initialData.endsAt ? new Date(initialData.endsAt).toISOString().slice(0, 10) : "");
      setSeats(initialData.seats || 30);
      setPriceSum(initialData.priceSum || "2990000");
      setEarlyPriceSum(initialData.earlyPriceSum || "");
      setEarlyDeadline(initialData.earlyDeadline ? new Date(initialData.earlyDeadline).toISOString().slice(0, 16) : "");
      setTelegramChatId(initialData.telegramChatId || "");
      setStatus(initialData.status || "active");
    } else {
      setCourseId(courses[0]?.id || "");
      setName("");
      setStartsAt("");
      setEndsAt("");
      setSeats(30);
      setPriceSum("2990000");
      setEarlyPriceSum("2490000");
      setEarlyDeadline("");
      setTelegramChatId("");
      setStatus("active");
    }
    setError(null);
  }, [initialData, isOpen, courses]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!courseId) return setError("Kursni tanlang");
    if (!name.trim()) return setError("Guruh nomini kiriting");
    if (!startsAt) return setError("Boshlanish sanasini kiriting");

    try {
      setLoading(true);
      setError(null);
      await onSave({
        ...(initialData ? { id: initialData.id } : {}),
        courseId,
        name: name.trim(),
        startsAt,
        endsAt: endsAt || null,
        seats: Number(seats),
        priceSum,
        earlyPriceSum: earlyPriceSum || null,
        earlyDeadline: earlyDeadline ? new Date(earlyDeadline).toISOString() : null,
        telegramChatId: telegramChatId || null,
        status,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-lg">
          <div className="flex items-center justify-between border-b border-border bg-bg-sunken px-5 py-4 sm:px-6">
            <div>
              <Dialog.Title className="text-lg font-bold text-ink">
                {initialData ? "Guruhni tahrirlash" : "Yangi Guruh Qo'shish"}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-ink-muted">
                Guruh ma&apos;lumotlarini kiriting va saqlang.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" aria-label="Guruh oynasini yopish" className="h-11 w-11 p-0">
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-5 sm:p-6">
            {error && <div role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</div>}

            <div>
              <Label htmlFor="cohort-course">Tegishli Kurs *</Label>
              <select id="cohort-course" required value={courseId} onChange={(event) => setCourseId(event.target.value)} className={inputClass}>
                <option value="">-- Kursni tanlang --</option>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="cohort-name">Guruh Nomi *</Label>
              <Input id="cohort-name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Masalan: Oktyabr Guruhi (8-hafta)" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cohort-start">Boshlanish sanasi *</Label>
                <Input id="cohort-start" required type="date" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
              </div>
              <div>
                <Label htmlFor="cohort-seats">O&apos;rinlar soni (Seats) *</Label>
                <Input id="cohort-seats" required type="number" min="1" max="500" value={seats} onChange={(event) => setSeats(Number(event.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cohort-price">Asosiy Narx (UZS) *</Label>
                <Input id="cohort-price" required value={priceSum} onChange={(event) => setPriceSum(event.target.value)} />
              </div>
              <div>
                <Label htmlFor="cohort-early-price">Early Bird Narxi (UZS)</Label>
                <Input id="cohort-early-price" value={earlyPriceSum} onChange={(event) => setEarlyPriceSum(event.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="cohort-deadline">Early Bird muddati</Label>
              <Input id="cohort-deadline" type="datetime-local" value={earlyDeadline} onChange={(event) => setEarlyDeadline(event.target.value)} />
              <p className="mt-1 text-sm text-ink-subtle">Muddat o&apos;tgach chegirma narx bekor bo&apos;ladi.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cohort-telegram">Telegram Chat ID</Label>
                <Input id="cohort-telegram" value={telegramChatId} onChange={(event) => setTelegramChatId(event.target.value)} placeholder="-100123456789" />
              </div>
              <div>
                <Label htmlFor="cohort-status">Status</Label>
                <select id="cohort-status" value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}>
                  <option value="active">Faol (Active)</option><option value="closed">Yopilgan (Closed)</option><option value="archived">Arxivlangan (Archived)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" disabled={loading} onClick={onClose} className="w-full sm:w-auto">Bekor qilish</Button>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {initialData ? "Saqlash" : "Yaratish"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
