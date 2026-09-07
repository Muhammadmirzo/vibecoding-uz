"use client";

import { useState, useEffect } from "react";
import { Lead, LeadSource, LeadStatus } from "../types";
import { X, Loader2 } from "lucide-react";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Lead>) => Promise<void>;
  initialData?: Lead | null;
  courses?: Array<{ id: string; title: string }>;
}

export function LeadModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  courses = [],
}: LeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState<LeadSource>("manual");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [recommendedCourseId, setRecommendedCourseId] = useState<string>("");
  const [nextContactAt, setNextContactAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setPhone(initialData.phone || "");
      setSource(initialData.source || "manual");
      setStatus(initialData.status || "new");
      setRecommendedCourseId(initialData.recommendedCourseId || "");
      setNextContactAt(
        initialData.nextContactAt
          ? new Date(initialData.nextContactAt).toISOString().slice(0, 16)
          : ""
      );
    } else {
      setName("");
      setPhone("+998");
      setSource("manual");
      setStatus("new");
      setRecommendedCourseId("");
      setNextContactAt("");
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Mijoz ismini kiriting");
      return;
    }
    if (!phone.trim()) {
      setError("Telefon raqamini kiriting");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave({
        ...(initialData ? { id: initialData.id } : {}),
        name: name.trim(),
        phone: phone.trim(),
        source,
        status,
        recommendedCourseId: recommendedCourseId || null,
        nextContactAt: nextContactAt ? new Date(nextContactAt).toISOString() : null,
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
      <div className="bg-cream border border-border rounded-xl shadow-lg max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-cream-warm">
          <h3 className="text-lg font-bold text-ink">
            {initialData ? "Leadni tahrirlash" : "Yangi lead qo'shish"}
          </h3>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink transition-colors p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              F.I.SH. / Ismi *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Sardor Rahimov"
              className="w-full px-3 py-2 bg-cream-warm border border-border rounded-md text-sm text-ink focus:outline-none focus:border-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Telefon raqami *
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998901234567"
              className="w-full px-3 py-2 bg-cream-warm border border-border rounded-md text-sm text-ink focus:outline-none focus:border-accent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Manba (Source)
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full px-3 py-2 bg-cream-warm border border-border rounded-md text-sm text-ink focus:outline-none focus:border-accent"
              >
                <option value="manual">Manual (Qo'lda)</option>
                <option value="quiz">Diagnostika Quiz</option>
                <option value="free_lesson">Bepul dars</option>
                <option value="form">Veb-sayt formasi</option>
                <option value="telegram">Telegram bot</option>
                <option value="expert">Ekspert sahifasi</option>
                <option value="referral">Referral</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full px-3 py-2 bg-cream-warm border border-border rounded-md text-sm text-ink focus:outline-none focus:border-accent"
              >
                <option value="new">Yangi (New)</option>
                <option value="contacted">Bog'lanildi (Contacted)</option>
                <option value="consultation">Konsultatsiya (Consultation)</option>
                <option value="paid">To'langan (Paid)</option>
                <option value="rejected">Rad etildi (Rejected)</option>
                <option value="cancelled">Bekor qilindi (Cancelled)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Tavsiya etilgan Kurs
            </label>
            <select
              value={recommendedCourseId}
              onChange={(e) => setRecommendedCourseId(e.target.value)}
              className="w-full px-3 py-2 bg-cream-warm border border-border rounded-md text-sm text-ink focus:outline-none focus:border-accent"
            >
              <option value="">-- Kursni tanlang --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Keyingi bog'lanish vaqti
            </label>
            <input
              type="datetime-local"
              value={nextContactAt}
              onChange={(e) => setNextContactAt(e.target.value)}
              className="w-full px-3 py-2 bg-cream-warm border border-border rounded-md text-sm text-ink focus:outline-none focus:border-accent"
            />
          </div>

          {/* Footer Buttons */}
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
