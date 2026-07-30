import { useEffect, useState } from 'react';
import { apiGetList } from '../lib/api';

/**
 * Polls the unread notification count, optionally scoped to a
 * `relatedModel` (e.g. 'CustomTourRequest'), so nav badges (admin sidebar,
 * customer navbar) stay reasonably fresh without a websocket.
 */
export function useUnreadCount(relatedModel?: string, enabled = true, pollMs = 20000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setCount(0);
      return;
    }
    let cancelled = false;

    const fetchCount = () => {
      apiGetList<unknown>('/notifications', { isRead: false, limit: 1, ...(relatedModel ? { relatedModel } : {}) }).
      then(({ meta }) => {
        if (!cancelled) setCount(meta?.total || 0);
      }).
      catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, pollMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [relatedModel, enabled, pollMs]);

  return count;
}
