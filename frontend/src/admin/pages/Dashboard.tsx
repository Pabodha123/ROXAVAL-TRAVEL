import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar } from
'recharts';
import {
  ClipboardListIcon,
  HourglassIcon,
  CheckCircle2Icon,
  FlagIcon,
  UsersIcon,
  DollarSignIcon,
  PackageIcon,
  MapPinIcon,
  TargetIcon,
  BedDoubleIcon,
  ArrowRightIcon } from
'lucide-react';
import { apiGetList, apiGetOne } from '../../lib/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { PageHeader } from '../components/PageHeader';

interface DashboardStats {
  totalBookings: number;
  monthlyRevenue: number;
  pendingInquiries: number;
  totalCustomers: number;
  popularDestinations: { _id: string; name: string; tag?: string; heroImage: string }[];
  popularPackages: { _id: string; name: string; price: number; rating: number; reviewsCount: number; heroImage: string }[];
  recentActivity: { bookingReference: string; customerName?: string; packageName: string; status: string; createdAt: string }[];
}

interface RevenuePoint {
  _id: string;
  revenue: number;
  bookings: number;
}

interface BookingsByStatus {
  _id: string;
  count: number;
}

const QUICK_ACTIONS = [
{ label: 'New Package', to: '/admin/packages/new', icon: PackageIcon },
{ label: 'New Destination', to: '/admin/destinations/new', icon: MapPinIcon },
{ label: 'New Activity', to: '/admin/activities/new', icon: TargetIcon },
{ label: 'New Hotel', to: '/admin/hotels/new', icon: BedDoubleIcon }];


export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [bookingsByStatus, setBookingsByStatus] = useState<Record<string, number>>({});
  const [counts, setCounts] = useState({ packages: 0, destinations: 0, activities: 0, hotels: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    const range = { from: from.toISOString(), to: to.toISOString() };

    Promise.all([
    apiGetOne<DashboardStats>('/reports/dashboard'),
    apiGetOne<RevenuePoint[]>('/reports/revenue', range).catch(() => []),
    apiGetOne<BookingsByStatus[]>('/reports/bookings', range).catch(() => []),
    apiGetList('/packages', { limit: 1 }),
    apiGetList('/destinations', { limit: 1 }),
    apiGetList('/activities', { limit: 1 }),
    apiGetList('/hotels', { limit: 1 })]
    ).
    then(([dashStats, revenueData, bookingsData, pkgs, dests, acts, hotels]) => {
      setStats(dashStats);
      setRevenue(revenueData || []);
      const map: Record<string, number> = {};
      (bookingsData || []).forEach((b) => {
        map[b._id] = b.count;
      });
      setBookingsByStatus(map);
      setCounts({
        packages: pkgs.meta.total,
        destinations: dests.meta.total,
        activities: acts.meta.total,
        hotels: hotels.meta.total
      });
    }).
    finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <div className="grid h-64 place-items-center text-forest/40">Loading dashboard…</div>;
  }

  const statusChartData = ['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((s) => ({ status: s, count: bookingsByStatus[s] || 0 }));

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Live snapshot of your business" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={ClipboardListIcon} label="Total Bookings" value={stats.totalBookings} index={0} />
        <StatCard icon={HourglassIcon} label="Pending Bookings" value={bookingsByStatus['Pending'] || 0} accent="gold" index={1} />
        <StatCard icon={CheckCircle2Icon} label="Confirmed Bookings" value={bookingsByStatus['Confirmed'] || 0} accent="emerald" index={2} />
        <StatCard icon={FlagIcon} label="Completed Tours" value={bookingsByStatus['Completed'] || 0} accent="emerald" index={3} />
        <StatCard icon={UsersIcon} label="Total Customers" value={stats.totalCustomers} index={4} />
        <StatCard icon={DollarSignIcon} label="Revenue (This Month)" value={`$${stats.monthlyRevenue.toLocaleString()}`} accent="gold" index={5} />
        <StatCard icon={PackageIcon} label="Active Packages" value={counts.packages} index={6} />
        <StatCard icon={MapPinIcon} label="Active Destinations" value={counts.destinations} index={7} />
        <StatCard icon={TargetIcon} label="Active Activities" value={counts.activities} index={8} />
        <StatCard icon={BedDoubleIcon} label="Hotels" value={counts.hotels} index={9} />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl bg-white p-5 shadow-soft lg:col-span-2">
          <p className="font-display text-sm font-semibold text-forest">Revenue — Last 30 Days</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a7a5e" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1a7a5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0f3d2e14" />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#0f3d2e88' }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: '#0f3d2e88' }} width={40} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #0f3d2e1a', fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#1a7a5e" strokeWidth={2} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-white p-5 shadow-soft">
          <p className="font-display text-sm font-semibold text-forest">Bookings by Status</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0f3d2e14" />
                <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#0f3d2e88' }} />
                <YAxis tick={{ fontSize: 11, fill: '#0f3d2e88' }} width={30} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #0f3d2e1a', fontSize: 12 }} />
                <Bar dataKey="count" fill="#c8a24c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Recent bookings */}
        <div className="rounded-2xl bg-white p-5 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-forest">Recent Bookings</p>
            <Link to="/admin/bookings" className="text-xs font-semibold text-emerald hover:underline">View all</Link>
          </div>
          <div className="mt-3 divide-y divide-forest/5">
            {stats.recentActivity.length === 0 && <p className="py-6 text-center text-sm text-forest/40">No bookings yet.</p>}
            {stats.recentActivity.map((b) =>
            <div key={b.bookingReference} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-forest">{b.customerName || 'Guest'}</p>
                  <p className="truncate text-xs text-forest/50">{b.packageName} · {b.bookingReference}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            )}
          </div>
        </div>

        {/* Popular packages */}
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <p className="font-display text-sm font-semibold text-forest">Popular Packages</p>
          <div className="mt-3 space-y-3">
            {stats.popularPackages.length === 0 && <p className="py-6 text-center text-sm text-forest/40">No data yet.</p>}
            {stats.popularPackages.map((p) =>
            <div key={p._id} className="flex items-center gap-3">
                <img src={p.heroImage} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-forest">{p.name}</p>
                  <p className="text-xs text-forest/50">★ {p.rating.toFixed(1)} · {p.reviewsCount} reviews</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-soft">
        <p className="font-display text-sm font-semibold text-forest">Quick Actions</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map((a) =>
          <Link
            key={a.to}
            to={a.to}
            className="group flex items-center justify-between rounded-xl border border-forest/10 px-4 py-3 text-sm font-medium text-forest transition-colors hover:border-emerald hover:bg-emerald/5">

              <span className="flex items-center gap-2"><a.icon className="h-4 w-4 text-emerald" /> {a.label}</span>
              <ArrowRightIcon className="h-3.5 w-3.5 text-forest/30 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>
    </div>);

}
