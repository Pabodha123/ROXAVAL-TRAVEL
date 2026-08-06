import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BellIcon, LogOutIcon, MenuIcon, UserCircleIcon } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { apiGetList, apiPatch } from '../../lib/api';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export function Topbar({ onOpenMobile }: {onOpenMobile: () => void;}) {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiGetList<NotificationItem>('/notifications', { limit: 8 }).
    then(({ data, meta }) => {
      setNotifications(data);
      setUnreadCount((meta as unknown as { unreadCount?: number }).unreadCount || 0);
    }).
    catch(() => {});
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
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
    setNotifOpen(false);
    if (n.link) navigate(n.link);
  };

  const markAllRead = async () => {
    await apiPatch('/notifications/read-all').catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-forest/10 bg-white px-4 sm:px-6">
      <button onClick={onOpenMobile} className="grid h-9 w-9 place-items-center rounded-lg text-forest lg:hidden">
        <MenuIcon className="h-5 w-5" />
      </button>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative grid h-10 w-10 place-items-center rounded-full text-forest/70 transition-colors hover:bg-cream hover:text-forest">

            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 &&
            <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-forest">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            }
          </button>
          <AnimatePresence>
            {notifOpen &&
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-[26rem] rounded-2xl bg-white p-2 shadow-lift">

                <div className="flex items-center justify-between px-2 py-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-forest/50">Notifications</p>
                  {unreadCount > 0 &&
                <button onClick={markAllRead} className="text-xs font-semibold text-emerald hover:underline">Mark all read</button>
                }
                </div>
                <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto">
                  {notifications.length === 0 && <p className="col-span-2 p-4 text-center text-xs text-forest/40">No notifications yet.</p>}
                  {notifications.map((n) =>
                <button
                  key={n._id}
                  onClick={() => openNotification(n)}
                  className={`block w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-cream ${!n.isRead ? 'bg-cream/60' : ''}`}>

                      <p className="truncate text-sm font-semibold text-forest">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-forest/60">{n.message}</p>
                    </button>
                )}
                </div>
                <Link to="/admin/notifications" onClick={() => setNotifOpen(false)} className="mt-1 block rounded-xl px-3 py-2 text-center text-xs font-semibold text-emerald hover:bg-cream">
                  View all
                </Link>
              </motion.div>
            }
          </AnimatePresence>
        </div>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen((v) => !v)} className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-cream">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-xs font-bold text-white">
              {user?.fullName?.[0]?.toUpperCase() || 'A'}
            </span>
            <span className="hidden text-sm font-medium text-forest sm:block">{user?.fullName}</span>
          </button>
          <AnimatePresence>
            {profileOpen &&
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-52 rounded-2xl bg-white p-2 shadow-lift">

                <Link to="/admin/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-forest hover:bg-cream">
                  <UserCircleIcon className="h-4 w-4" /> My Profile
                </Link>
                <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50">
                  <LogOutIcon className="h-4 w-4" /> Logout
                </button>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>
    </header>);

}
