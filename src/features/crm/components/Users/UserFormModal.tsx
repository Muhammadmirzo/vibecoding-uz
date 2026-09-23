"use client";
import { Loader2, UserPlus, X } from "lucide-react";
import type { CreateStaffForm, UserRole } from "./types";
interface Props { form: CreateStaffForm; setForm: (form: CreateStaffForm) => void; onClose: () => void; onSubmit: (e: React.FormEvent) => void; creating: boolean; error: string | null; }
export function UserFormModal({ form, setForm, onClose, onSubmit, creating, error }: Props) { return (<>
      {true && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-cream-warm border border-border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-accent" />
                Yangi Xodim Accounti Yaratish
              </h3>
              <button
                onClick={() => onClose()}
                className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">F.I.SH. (To'liq Ism)</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Jamshid Alimov"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">Telefon Raqam (+998)</label>
                <input
                  type="text"
                  required
                  placeholder="+998901234567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">Email Adres (Ixtiyoriy)</label>
                <input
                  type="email"
                  placeholder="jamshid@academy.mirzo.uz"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">Parol (kamida 8 ta belgi)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">Xodimlarga Rol Biriktirish</label>
                <select
                  value={form.role}
                  onChange={(e) => { if (isUserRole(e.target.value)) setForm({ ...form, role: e.target.value }); }}
                  className="w-full px-3.5 py-2.5 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="superadmin">Super Admin - To'liq tizim va sozlamalar</option>
                  <option value="admin">Administrator - To'liq CRM kirishi</option>
                  <option value="mentor">Mentor (Kurator) - Uy vazifalarini baholash</option>
                  <option value="manager">Menejer - Leads Kanban & Sotuvlar</option>
                  <option value="student">Talaba - Oddiy LMS o'quvchi</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors shadow-sm disabled:opacity-50 gap-2"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Xodim Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
</>
); }
export function isUserRole(value: string): value is UserRole { return ["superadmin", "admin", "manager", "mentor", "student"].includes(value); }
