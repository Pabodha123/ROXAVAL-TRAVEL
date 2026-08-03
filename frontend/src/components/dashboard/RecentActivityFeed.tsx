import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon } from 'lucide-react';
import { apiGetList } from '../../lib/api';
import { notificationTypeMeta } from '../../lib/notificationTypes';

interface ActivityItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * "Recent Activity" feed — the same notification stream shown in the bell
 * dropdown, just the newest few with a checkmark for read items and the
 * type-colored dot (see notificationTypes.ts) for unread ones.
 */
export function RecentActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiGetList<ActivityItem>('/notifications', { limit: 6 }).
    then(({ data }) => {
      if (!cancelled) setItems(data);
    }).
    catch(() => {}).
    finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <div className="mt-8 rounded-2xl bg-white p-6 shadow-soft">
      <p className="font-display text-sm font-semibold text-forest">Recent Activity</p>
      <div className="mt-4 space-y-1">
        {items.map((n) => {
          const meta = notificationTypeMeta(n.type);
          const Icon = meta.icon;
          const row = (
            <div className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-cream">
              <span className="relative mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream text-forest/60">
                <Icon className="h-4 w-4" />
                {n.isRead ?
                <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-emerald text-white">
                    <CheckIcon className="h-2.5 w-2.5" />
                  </span> :

                <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${meta.dot}`} />
                }
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-forest">{n.title}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-forest/50">{n.message}</p>
              </div>
            </div>);

          return n.link ?
          <Link key={n._id} to={n.link} className="block">{row}</Link> :
          <div key={n._id}>{row}</div>;
        })}
      </div>
    </div>);

}
