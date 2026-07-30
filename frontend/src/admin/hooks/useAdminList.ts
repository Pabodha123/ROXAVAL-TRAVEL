import { useCallback, useEffect, useState } from 'react';
import { apiGetList, ApiMeta, QueryParams } from '../../lib/api';

interface UseAdminListResult<T> {
  items: T[];
  meta: ApiMeta | null;
  loading: boolean;
  error: string | null;
  page: number;
  setPage: (p: number) => void;
  refetch: () => void;
}

/**
 * Page-based (not accumulating) list fetch for admin data tables: search/filter/sort
 * changes reset to page 1; refetch() re-runs the current query, used after mutations.
 */
export function useAdminList<T>(path: string, params: QueryParams, limit = 10): UseAdminListResult<T> {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiGetList<T>(path, { ...params, page, limit }).
    then(({ data, meta: nextMeta }) => {
      if (cancelled) return;
      setItems(data);
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
  }, [path, paramsKey, page, limit, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { items, meta, loading, error, page, setPage, refetch };
}
