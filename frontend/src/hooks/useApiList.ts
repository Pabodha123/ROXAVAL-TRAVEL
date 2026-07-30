import { useEffect, useMemo, useState } from 'react';
import { apiGetList, ApiMeta, QueryParams } from '../lib/api';

interface UseApiListResult<T> {
  items: T[];
  meta: ApiMeta | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
}

/**
 * Fetches a paginated list endpoint and accumulates pages as `page` grows,
 * refetching from page 1 whenever the query params (search/filters/sort)
 * change. Shared by the Activities and Tour Packages list pages.
 */
export function useApiList<T>(path: string, params: QueryParams, limit = 9): UseApiListResult<T> {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    setPage(1);
  }, [paramsKey]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiGetList<T>(path, { ...params, page, limit }).
    then(({ data, meta: nextMeta }) => {
      if (cancelled) return;
      setItems((prev) => page === 1 ? data : [...prev, ...data]);
      setMeta(nextMeta);
    }).
    catch((err: Error) => {
      if (cancelled) return;
      setError(err.message);
    }).
    finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, paramsKey, page, limit]);

  const hasMore = useMemo(() => !!meta && meta.page < meta.totalPages, [meta]);

  return { items, meta, loading, error, hasMore, loadMore: () => setPage((p) => p + 1) };
}
