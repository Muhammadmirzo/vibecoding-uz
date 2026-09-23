"use client";
import { Search } from "lucide-react";
interface Props { auditSearch: string; setAuditSearch: (v: string) => void; actionFilter: string; setActionFilter: (v: string) => void; }
export function AuditFilters({ auditSearch, setAuditSearch, actionFilter, setActionFilter }: Props) { return (<>
          {/* Audit Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-cream-warm p-4 rounded-xl border border-border">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Amal, entity yoki email bo'yicha..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-medium text-ink-muted whitespace-nowrap">Amal filtri:</span>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent w-full sm:w-auto"
              >
                <option value="all">Barcha amallar</option>
                <option value="user.role_change">Rol o'zgarishi</option>
                <option value="user.create">Xodim yaratilishi</option>
                <option value="auth.change_password">Parol/Login yangilanishi</option>
                <option value="blog.create">Blog yaratish</option>
                <option value="blog.update">Blog tahrirlash</option>
                <option value="blog.delete">Blog o'chirish</option>
                <option value="settings.update">Sozlamalar saqlash</option>
                <option value="notification.broadcast">Xabarnoma yuborish</option>
              </select>
            </div>
          </div>
</>
); }
