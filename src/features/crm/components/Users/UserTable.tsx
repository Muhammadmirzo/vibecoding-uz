"use client";
import { Edit, Eye, Loader2, ShieldCheck } from "lucide-react";
import type { UserItem } from "./types";
interface Props { users: UserItem[]; loading: boolean; onEdit: (user: UserItem) => void; }
export function UserTable({ users, loading, onEdit }: Props) { return (<>
          {/* Users Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 bg-cream-warm rounded-xl border border-border text-ink-muted">
              Hech qanday foydalanuvchi topilmadi.
            </div>
          ) : (
            <div className="bg-cream-warm border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-cream-deep border-b border-border text-xs uppercase text-ink-muted font-semibold tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Foydalanuvchi</th>
                      <th className="px-4 py-3.5">Telefon / Telegram</th>
                      <th className="px-4 py-3.5">Rol</th>
                      <th className="px-4 py-3.5">Kurslar</th>
                      <th className="px-4 py-3.5">Ro'yxatdan O'tgan</th>
                      <th className="px-4 py-3.5 text-right">Boshqaruv</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-cream/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent-soft text-accent font-bold flex items-center justify-center text-xs border border-accent-line">
                              {user.fullName.slice(0, 1)}
                            </div>
                            <div>
                              <div className="font-semibold text-ink">{user.fullName}</div>
                              {user.email && <div className="text-xs text-ink-muted">{user.email}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-mono text-xs text-ink">{user.phone}</div>
                          {user.tgUsername && (
                            <div className="text-xs text-accent font-mono">@{user.tgUsername}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              ROLE_COLORS[user.role] || "bg-cream text-ink border-border"
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            {ROLE_LABELS[user.role] || user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-ink-muted font-medium">
                          {user.enrolledCount > 0 ? `${user.enrolledCount} ta guruh` : "Enrolled yo'q"}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-ink-muted whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString("uz-UZ")}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => onEdit(user)}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-cream border border-border hover:border-accent text-xs font-medium text-ink hover:text-accent transition-all gap-1.5"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Rolni O'zgartirish
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
</>
); }
const ROLE_COLORS: Record<UserItem["role"], string> = { superadmin: "bg-purple-100 text-purple-800 border-purple-200", admin: "bg-rose-100 text-rose-800 border-rose-200", manager: "bg-blue-100 text-blue-800 border-blue-200", mentor: "bg-amber-100 text-amber-800 border-amber-200", student: "bg-emerald-100 text-emerald-800 border-emerald-200" };
const ROLE_LABELS: Record<UserItem["role"], string> = { superadmin: "Super Admin", admin: "Administrator", manager: "Menejer", mentor: "Mentor (Kurator)", student: "Talaba" };
