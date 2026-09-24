"use client";
import { Loader2, ShieldCheck, X } from "lucide-react";
import type { UserItem, UserRole } from "./types";
interface Props { user: UserItem; role: UserRole; setRole: (role: UserRole) => void; onClose: () => void; onSave: () => void; updating: boolean; }
export function RoleEditor({ user, role, setRole, onClose, onSave, updating }: Props) { return (<>
      {user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-bg-sunken border border-border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent" />
                Xodimlarga Rol Biriktirish
              </h3>
              <button
                onClick={() => onClose()}
                className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-bg-elevated"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-bg-elevated p-3 rounded-lg border border-border">
                <div className="text-xs text-ink-muted">Tanlangan Foydalanuvchi:</div>
                <div className="text-sm font-bold text-ink">{user.fullName}</div>
                <div className="text-xs text-ink-muted font-mono">{user.phone}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">Yangi Rolni Tanlang:</label>
                <select
                  value={role}
                  onChange={(e) => { if (isUserRole(e.target.value)) setRole(e.target.value); }}
                  className="w-full px-3.5 py-2.5 text-sm bg-bg-elevated border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="student">Talaba (Student) - LMS o'quvchi</option>
                  <option value="mentor">Mentor (Kurator) - Uy vazifasini baholovchi</option>
                  <option value="manager">Menejer - Leads Kanban & Sotuv</option>
                  <option value="admin">Administrator - To'liq CRM kirishi</option>
                  <option value="superadmin">Super Admin - Tizim va Sozlamalar</option>
                </select>
              </div>
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
                type="button"
                disabled={updating}
                onClick={onSave}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-ink bg-accent rounded-lg hover:bg-accent/90 transition-colors shadow-sm disabled:opacity-50 gap-2"
              >
                {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Rolni Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
</>
); }
export function isUserRole(value: string): value is UserRole { return ["superadmin", "admin", "manager", "mentor", "student"].includes(value); }
