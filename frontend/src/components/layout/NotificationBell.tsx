import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BellIcon } from 'lucide-react';
import { apiGetList, apiPatch, ApiMeta } from '../../lib/api';
import { notificationTypeMeta } from '../../lib/notificationTypes';

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiGetList<NotificationItem>('/notifications', { limit: 8 }).
    then(({ data, meta }) => {
      setNotifications(data);
      setUnreadCount((meta as ApiMeta & { unreadCount?: number }).unreadCount || 0);
    }).
    catch(() => {});
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markRead = async (id: string) => {
    await apiPatch(`/notifications/${id}/read`).catch(() => {});
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const openNotification = (n: NotificationItem) => {
    if (!n.isRead) markRead(n._id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const markAllRead = async () => {
    await apiPatch('/notifications/read-all').catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2.5 rounded-full text-cream/90 hover:bg-white/10 hover:text-white transition-colors">

        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 &&
        <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-forest">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        }
      </button>
      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-lift p-2 overflow-hidden">

            <div className="flex items-center justify-between px-3 py-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-forest/50">Notifications</p>
              {unreadCount > 0 &&
            <button onClick={markAllRead} className="text-xs font-semibold text-emerald hover:underline">Mark all read</button>
            }
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && <p className="p-4 text-center text-xs text-forest/40">No notifications yet.</p>}
              {notifications.map((n) => {
            const meta = notificationTypeMeta(n.type);
            const Icon = meta.icon;
            return (
              <button
                key={n._id}
                onClick={() => openNotification(n)}
                className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-cream ${!n.isRead ? 'bg-cream/60' : ''}`}>

                  <span className="relative mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-forest/60">
                    <Icon className="h-3.5 w-3.5" />
                    {!n.isRead && <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-white ${meta.dot}`} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-forest">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-forest/60">{n.message}</p>
                  </span>
                </button>);

          })}
            </div>
            <Link to="/notifications" onClick={() => setOpen(false)} className="mt-1 block rounded-xl px-3 py-2 text-center text-xs font-semibold text-emerald hover:bg-cream">
              View all
            </Link>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}
