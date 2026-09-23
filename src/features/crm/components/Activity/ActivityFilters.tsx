"use client";
import { Filter, Search } from "lucide-react";
import type { ActivityStatus } from "./types";
interface Props { search: string; setSearch: (v: string) => void; statusFilter: ActivityStatus | "all"; setStatusFilter: (v: ActivityStatus | "all") => void; }
export function ActivityFilters({ search, setSearch, statusFilter, setStatusFilter }: Props) { return (<>
      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-cream-warm border border-border flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ism, telefon yoki email bo'yicha qidiruv..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-cream border border-border text-xs text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-ink-muted hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="w-full sm:w-44 px-3 py-2 rounded-lg bg-cream border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">Barcha Holatlar</option>
            <option value="active">Faol Talabalar</option>
            <option value="at_risk">Xavf Ostida (Passiv)</option>
            <option value="completed">Bitirganlar</option>
            <option value="inactive">Nofaol</option>
          </select>
        </div>
      </div>
</>
); }
