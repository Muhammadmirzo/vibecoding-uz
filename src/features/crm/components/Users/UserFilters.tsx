"use client";
import { Search } from "lucide-react";
interface Props { search: string; setSearch: (value: string) => void; roleFilter: string; setRoleFilter: (value: string) => void; }
export function UserFilters({ search, setSearch, roleFilter, setRoleFilter }: Props) { return (<>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-cream-warm p-4 rounded-xl border border-border">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Ism, telefon yoki email bo'yicha..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-medium text-ink-muted whitespace-nowrap">Rol filtri:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent w-full sm:w-auto"
              >
                <option value="all">Barcha rollar</option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Administrator</option>
                <option value="manager">Menejer</option>
                <option value="mentor">Mentor (Kurator)</option>
                <option value="student">Talaba</option>
              </select>
            </div>
          </div>
</>
); }
