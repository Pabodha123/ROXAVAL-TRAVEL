import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, SearchIcon } from 'lucide-react';
import { useAdminList } from '../../hooks/useAdminList';
import { DataTable, Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate } from '../../../lib/date';

interface AdminBooking {
  _id: string;
  bookingReference: string;
  customer?: { user?: { fullName?: string; email?: string } };
  tourPackage?: { name: string };
  travelDate: string;
  pricing: { totalAmount: number; currency: string };
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['Pending', 'Awaiting Approval', 'Approved', 'Payment Pending', 'Payment Verification', 'Confirmed', 'Completed', 'Cancelled'];

export function AdminBookingsList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { items, meta, loading, error, page, setPage } = useAdminList<AdminBooking>('/bookings', {
    q: search || undefined,
    status: status || undefined
  });

  const columns: Column<AdminBooking>[] = [
  { header: 'Reference', render: (b) => <span className="font-mono text-xs font-semibold">{b.bookingReference}</span> },
  { header: 'Customer', render: (b) => b.customer?.user?.fullName || '-' },
  { header: 'Package', render: (b) => b.tourPackage?.name || 'Customized Tour' },
  { header: 'Travel Date', render: (b) => formatDate(b.travelDate) },
  { header: 'Amount', render: (b) => `$${b.pricing.totalAmount.toLocaleString()}` },
  { header: 'Status', render: (b) => <StatusBadge status={b.status} /> },
  { header: '', render: (b) => <Link to={`/admin/bookings/${b._id}`} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest"><EyeIcon className="h-4 w-4" /></Link> }];


  return (
    <div>
      <PageHeader title="Bookings" subtitle="Review, confirm and track every trip" />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by reference…" className="w-full rounded-xl border border-forest/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <DataTable columns={columns} rows={items} loading={loading} error={error} meta={meta} page={page} onPageChange={setPage} rowKey={(b) => b._id} emptyMessage="No bookings yet." />
    </div>);

}
