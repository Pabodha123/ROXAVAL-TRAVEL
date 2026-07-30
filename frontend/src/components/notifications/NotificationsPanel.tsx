import React from 'react';
import { Link } from 'react-router-dom';
import { useApiList } from '../../hooks/useApiList';
import { apiPatch } from '../../lib/api';
import { Pagination } from '../ui/Pagination';
import { LoadingState, EmptyState, ErrorState } from '../ui/StatusState';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * Full notification history for whichever role is logged in — notifications
 * are scoped server-side by `recipient`, so this is reused by both the
 * customer notification center and the admin notifications page.
 */
export function NotificationsPanel() {
  const { items, meta, loading, error, hasMore, loadMore } = useApiList<NotificationItem>('/notifications', {}, 15);
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set());

  const markRead = async (id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
    await apiPatch(`/notifications/${id}/read`).catch(() => {});
  };

  const markAllRead = async () => {
    setReadIds(new Set(items.map((n) => n._id)));
    await apiPatch('/notifications/read-all').catch(() => {});
  };

  const isRead = (n: NotificationItem) => n.isRead || readIds.has(n._id);
  const anyUnread = items.some((n) => !isRead(n));

  if (loading && items.length === 0) return <LoadingState title="Loading notifications…" />;
  if (error) return <ErrorState message={error} />;
  if (items.length === 0) return <EmptyState title="No notifications yet" message="We'll let you know as soon as something needs your attention." />;

  return (
    <div>
      {anyUnread &&
      <div className="mb-4 flex justify-end">
          <button onClick={markAllRead} className="text-sm font-semibold text-emerald hover:underline">Mark all as read</button>
        </div>
      }
      <div className="space-y-3">
        {items.map((n) => {
          const content = (
            <div className={`rounded-2xl border p-5 shadow-soft transition-colors ${isRead(n) ? 'border-forest/10 bg-white' : 'border-emerald/30 bg-emerald/5'}`}>
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-sm font-semibold text-forest">{n.title}</p>
                {!isRead(n) && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald" />}
              </div>
              <p className="mt-1.5 text-sm text-forest/60">{n.message}</p>
              <p className="mt-2 text-xs text-forest/40">{new Date(n.createdAt).toLocaleString()}</p>
            </div>);

          return n.link ?
          <Link key={n._id} to={n.link} onClick={() => !isRead(n) && markRead(n._id)} className="block">
              {content}
            </Link> :

          <button key={n._id} onClick={() => !isRead(n) && markRead(n._id)} className="block w-full text-left">
              {content}
            </button>;

        })}
      </div>
      <Pagination meta={meta} shown={items.length} hasMore={hasMore} loading={loading} onLoadMore={loadMore} />
    </div>);

}
