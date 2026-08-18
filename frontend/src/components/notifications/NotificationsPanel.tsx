import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApiList } from '../../hooks/useApiList';
import { apiPatch } from '../../lib/api';
import { Pagination } from '../ui/Pagination';
import { LoadingState, EmptyState, ErrorState } from '../ui/StatusState';
import { notificationTypeMeta } from '../../lib/notificationTypes';
import { formatDateTime } from '../../lib/date';

interface NotificationItem {
  _id: string;
  type: string;
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
  const { t } = useTranslation('dashboard');
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

  if (loading && items.length === 0) return <LoadingState title={t('notifications.loading')} />;
  if (error) return <ErrorState message={error} />;
  if (items.length === 0) return <EmptyState title={t('notifications.empty')} message={t('notifications.emptyHint')} />;

  return (
    <div>
      {anyUnread &&
      <div className="mb-4 flex justify-end">
          <button onClick={markAllRead} className="text-sm font-semibold text-emerald hover:underline">{t('notifications.markAllRead')}</button>
        </div>
      }
      <div className="space-y-3">
        {items.map((n) => {
          const meta = notificationTypeMeta(n.type);
          const Icon = meta.icon;
          const content = (
            <div className={`flex gap-3 rounded-2xl border p-5 shadow-soft transition-colors ${isRead(n) ? 'border-forest/10 bg-white' : 'border-emerald/30 bg-emerald/5'}`}>
              <span className="relative mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream text-forest/60">
                <Icon className="h-4 w-4" />
                {!isRead(n) && <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${meta.dot}`} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-forest">{n.title}</p>
                <p className="mt-1.5 text-sm text-forest/60">{n.message}</p>
                <p className="mt-2 text-xs text-forest/40">{formatDateTime(n.createdAt)}</p>
              </div>
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
