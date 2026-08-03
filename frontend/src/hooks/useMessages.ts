import { useCallback, useEffect, useState } from 'react';
import { apiGetList, apiPost } from '../lib/api';
import type { Message } from '../types/message';

/**
 * Fetches a custom tour request's conversation thread and polls for new
 * messages, mirroring useUnreadCount's poll-not-websocket precedent.
 */
export function useMessages(requestId: string | undefined, pollMs = 15000) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const refetch = useCallback(() => {
    if (!requestId) return Promise.resolve();
    return apiGetList<Message>(`/custom-tours/${requestId}/messages`).
    then(({ data }) => setMessages(data)).
    catch(() => {});
  }, [requestId]);

  useEffect(() => {
    if (!requestId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    refetch().finally(() => {
      if (!cancelled) setLoading(false);
    });
    const interval = setInterval(refetch, pollMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [requestId, pollMs, refetch]);

  const send = async (text: string) => {
    if (!requestId || !text.trim()) return;
    setSending(true);
    try {
      const message = await apiPost<Message>(`/custom-tours/${requestId}/messages`, { text: text.trim() });
      setMessages((prev) => [...prev, message]);
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, sending, send, refetch };
}
