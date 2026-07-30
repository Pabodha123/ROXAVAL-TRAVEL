import React from 'react';
import { SearchIcon } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: FilterConfig[];
  values: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  sortOptions: FilterOption[];
  sort: string;
  onSortChange: (value: string) => void;
}

const selectClass = 'rounded-full border border-forest/15 bg-white px-4 py-3 text-sm font-medium text-forest/80 outline-none transition-colors focus:border-emerald';

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  filters,
  values,
  onFilterChange,
  sortOptions,
  sort,
  onSortChange
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-soft sm:p-6">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-full border border-forest/15 bg-cream/60 py-3.5 pl-11 pr-4 text-sm text-forest outline-none transition-colors focus:border-emerald focus:bg-white" />

      </div>

      <div className="flex flex-wrap gap-3">
        {filters.map((f) =>
        <select
          key={f.key}
          value={values[f.key] || ''}
          onChange={(e) => onFilterChange(f.key, e.target.value)}
          className={selectClass}>

            <option value="">All {f.label}</option>
            {f.options.map((opt) =>
          <option key={opt.value} value={opt.value}>{opt.label}</option>
          )}
          </select>
        )}

        <select value={sort} onChange={(e) => onSortChange(e.target.value)} className={`${selectClass} ml-auto`}>
          {sortOptions.map((opt) =>
          <option key={opt.value} value={opt.value}>{opt.label}</option>
          )}
        </select>
      </div>
    </div>);

}
