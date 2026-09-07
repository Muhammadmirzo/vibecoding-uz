"use client";

import { useState, useEffect } from "react";
import { Cohort } from "../types";
import { X, Loader2 } from "lucide-react";

interface CohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  initialData?: Cohort | null;
  courses: Array<{ id: string; title: string }>;
}

export function CohortModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  courses,
}: CohortModalProps) {
  const [courseId, setCourseId] = useState("");
  const [name, setName] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [seats, setSeats] = useState<number>(30);
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
      setStartsAt(
        initialData.startsAt
          ? new Date(initialData.startsAt).toISOString().slice(0, 10)
          : ""
      );
      setEndsAt(
        initialData.endsAt
          ? new Date(initialData.endsAt).toISOString().slice(0, 10)
          : ""
      );
      setSeats(initialData.seats || 30);
      setPriceSum(initialData.priceSum || "2990000");
      setEarlyPriceSum(initialData.earlyPriceSum || "");
      setEarlyDeadline(
        initialData.earlyDeadline
          ? new Date(initialData.earlyDeadline).toISOString().slice(0, 16)
          : ""
      );
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) {
      setError("Kursni tanlang");
      return;
    }
    if (!name.trim()) {
      setError("Guruh nomini kiriting");
      return;
    }
    if (!startsAt) {
      setError("Boshlanish sanasini kiriting");
      return;
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-cream border border-border rounded-xl shadow-lg max-w-xl w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-cream-warm">
          <h3 className="text-lg font-bold text-ink">
            {initialData ? "Guruhni tahrirlash" : "Yangi Guruh Qo'shish"}
          </h3>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink transition-colors p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Tegishli Kurs *
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3 py-2 bg-cream-warm border border-border rounded-md text-sm text-ink focus:outline-none focus:border-accent"
              required
            >
              <option value="">-- Kursni tanlang --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Guruh Nomi *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Oktyabr Guruhi (8-hafta)"
              className="w-full px-3 py-2 bg-cream-warm border border-border rounded-md text-sm text-ink focus:outline-none focus:border-accent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Boshlanish sanasi *
              </label>
              <input
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full px-3 py-2 bg-cream-warm border border-border rounded-md text-sm text-ink focus:outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                O'rinlar soni (Seats) *
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full px-3 py-2 bg-cream-warm border border-border rounded-md text-sm text-ink focus:outline-none focus:border-accent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Asosiy Narx (UZS) *
              </label>
              <input
                type="text"
                value={priceSum}
                onChange={(e) => setPriceSum(e.target.value)}
                placeholder="2990000"
                className="w-full px-3 py-2 bg-cream-warm border border-border rounded-md text-sm text-ink focus:outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Early Bird Narxi (UZS)
              </label>
              <input
                type="text"
                value={earlyPriceSum}
                onChange={(e) => setEarlyPriceSum(e.target.value)}
                placeholder="2490000"
                className="w-full px-3 py-2 bg-cream-warm border border-border rounded-md text-sm text-ink focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Early Bird Chegirma Muddati Expiration Date
            </label>
            <input
              type="datetime-local"
              value={earlyDeadline}
              onChange={(e) => setEarlyDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-cream-warm border border-border rounded-md text-sm text-ink focus:outline-none focus:border-accent"
            />
            <p className="text-[11px] text-ink-subtle mt-1">
              Ushbu muddat o'tgandan so'ng, chegirma narx avtomatik ravishda bekor bo'ladi va asosiy narx amalda bo'ladi.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Telegram Chat ID
              </label>
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="-100123456789"
                className="w-full px-3 py-2 bg-cream-warm border border-border rounded-md text-sm text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-cream-warm border border-border rounded-md text-sm text-ink focus:outline-none focus:border-accent"
              >
                <option value="active">Faol (Active)</option>
                <option value="closed">Yopilgan (Closed)</option>
                <option value="archived">Arxivlangan (Archived)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium btn-secondary"
              disabled={loading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium btn-primary flex items-center"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {initialData ? "Saqlash" : "Yaratish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
