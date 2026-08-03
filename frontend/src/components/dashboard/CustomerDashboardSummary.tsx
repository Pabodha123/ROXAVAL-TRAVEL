import React, { useEffect, useState } from 'react';
import { BriefcaseIcon, ClockIcon, CheckCircle2Icon, BellIcon } from 'lucide-react';
import { StatCard } from '../../admin/components/StatCard';
import { apiGetList } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useUnreadCount } from '../../hooks/useUnreadCount';

/**
 * "Welcome {name}!" + 4 stat cards summarizing the customer's current
 * tours/inquiries, shown at the top of /my-tours. Reuses StatCard from
 * admin/components — the same cross-cutting-reuse precedent StatusBadge
 * already set on this page.
 */
export function CustomerDashboardSummary() {
  const { user } = useAuth();
  const unreadNotifications = useUnreadCount();
  const [upcomingTours, setUpcomingTours] = useState(0);
  const [pendingInquiries, setPendingInquiries] = useState(0);
  const [confirmedBookings, setConfirmedBookings] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const today = new Date().toISOString();

    Promise.all([
      apiGetList('/bookings/my-bookings', { status: 'Confirmed', 'travelDate[gte]': today, limit: 1 }),
      apiGetList('/custom-tours/my-requests', { status: 'Pending', limit: 1 }),
      apiGetList('/bookings/my-bookings', { status: 'Confirmed', limit: 1 }),
    ]).then(([upcoming, pending, confirmed]) => {
      if (cancelled) return;
      setUpcomingTours(upcoming.meta?.total || 0);
      setPendingInquiries(pending.meta?.total || 0);
      setConfirmedBookings(confirmed.meta?.total || 0);
    }).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-forest">Welcome, {user?.fullName?.split(' ')[0] || 'Traveler'}!</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BriefcaseIcon} label="Upcoming Tours" value={upcomingTours} accent="emerald" index={0} />
        <StatCard icon={ClockIcon} label="Pending Inquiries" value={pendingInquiries} accent="gold" index={1} />
        <StatCard icon={CheckCircle2Icon} label="Confirmed Bookings" value={confirmedBookings} accent="emerald" index={2} />
        <StatCard icon={BellIcon} label="Unread Notifications" value={unreadNotifications} accent="forest" index={3} />
      </div>
    </div>);

}
