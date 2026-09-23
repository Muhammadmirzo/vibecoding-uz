"use client";
import { Search } from "lucide-react";
import type { BlogStatusFilter } from "./types";
interface Props { search: string; setSearch: (v: string) => void; statusFilter: BlogStatusFilter; setStatusFilter: (v: BlogStatusFilter) => void; }
export function BlogFilters({ search, setSearch, statusFilter, setStatusFilter }: Props) { return (<>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-cream-warm p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Maqola sarlavhasi yoki slug bo'yicha..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-ink-muted whitespace-nowrap">Holat:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent w-full sm:w-auto"
          >
            <option value="all">Barchasi</option>
            <option value="published">Chop etilgan</option>
            <option value="scheduled">Rejalashtirilgan</option>
            <option value="draft">Qoralama</option>
            <option value="archived">Arxivlangan</option>
          </select>
        </div>
      </div>
</>
); }
