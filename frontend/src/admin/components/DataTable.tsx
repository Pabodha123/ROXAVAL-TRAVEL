import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, Loader2Icon, InboxIcon, TriangleAlertIcon } from 'lucide-react';
import type { ApiMeta } from '../../lib/api';

export interface Column<T> {
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading: boolean;
  error?: string | null;
  meta: ApiMeta | null;
  page: number;
  onPageChange: (p: number) => void;
  emptyMessage?: string;
  rowKey: (row: T) => string;
}

export function DataTable<T>({ columns, rows, loading, error, meta, page, onPageChange, emptyMessage = 'No records found.', rowKey }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-forest/10 bg-cream/50">
              {columns.map((col) =>
              <th key={col.header} className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-forest/50">
                  {col.header}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading &&
            <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <Loader2Icon className="mx-auto h-6 w-6 animate-spin text-forest/40" />
                </td>
              </tr>
            }
            {!loading && error &&
            <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <TriangleAlertIcon className="mx-auto h-6 w-6 text-red-400" />
                  <p className="mt-2 text-sm text-forest/60">{error}</p>
                </td>
              </tr>
            }
            {!loading && !error && rows.length === 0 &&
            <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <InboxIcon className="mx-auto h-6 w-6 text-forest/30" />
                  <p className="mt-2 text-sm text-forest/50">{emptyMessage}</p>
                </td>
              </tr>
            }
            {!loading && !error && rows.map((row) =>
            <tr key={rowKey(row)} className="border-b border-forest/5 transition-colors last:border-0 hover:bg-cream/40">
                {columns.map((col) =>
              <td key={col.header} className={`whitespace-nowrap px-5 py-3.5 text-forest ${col.className || ''}`}>
                    {col.render(row)}
                  </td>
              )}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.total > 0 &&
      <div className="flex items-center justify-between border-t border-forest/10 px-5 py-3.5">
          <p className="text-xs text-forest/50">
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </p>
          <div className="flex gap-2">
            <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="grid h-8 w-8 place-items-center rounded-full border border-forest/15 text-forest transition-colors hover:bg-cream disabled:opacity-30">

              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
            disabled={page >= meta.totalPages}
            onClick={() => onPageChange(page + 1)}
            className="grid h-8 w-8 place-items-center rounded-full border border-forest/15 text-forest transition-colors hover:bg-cream disabled:opacity-30">

              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      }
    </div>);

}
