import React from 'react';
import { Loader2Icon } from 'lucide-react';
import type { ApiMeta } from '../../lib/api';

interface PaginationProps {
  meta: ApiMeta | null;
  shown: number;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

export function Pagination({ meta, shown, hasMore, loading, onLoadMore }: PaginationProps) {
  if (!meta || meta.total === 0) return null;

  return (
    <div className="mt-12 flex flex-col items-center gap-4">
      <p className="text-sm text-forest/60">
        Showing {shown} of {meta.total} results
      </p>
      {hasMore &&
      <button
        onClick={onLoadMore}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-forest px-8 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-emerald disabled:opacity-60">

        {loading && <Loader2Icon className="h-4 w-4 animate-spin" />}
        {loading ? 'Loading…' : 'Load More'}
      </button>
      }
    </div>);

}
