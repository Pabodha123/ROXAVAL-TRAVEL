import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, Loader2Icon, PlusIcon, SearchIcon, UserCheckIcon } from 'lucide-react';
import { useAdminList } from '../../hooks/useAdminList';
import { DataTable, Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { useToast } from '../../components/ToastProvider';
import { apiPatch, ApiRequestError } from '../../../lib/api';
import { formatDate } from '../../../lib/date';

interface AdminCustomRequest {
  _id: string;
  referenceNumber: string;
  customer?: { user?: { fullName?: string; email?: string } };
  travelDates: { startDate: string; endDate: string };
  travelers: { adults: number; children: number };
  estimatedBudget: { amount: number; currency: string };
  status: string;
  priority: string;
  assignedAdmin?: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['Pending', 'Under Review', 'Awaiting Customer Approval', 'Approved', 'Rejected', 'Booking Confirmed'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];
const SORT_OPTIONS = [
{ value: '-createdAt', label: 'Newest Submitted' },
{ value: 'createdAt', label: 'Oldest Submitted' },
{ value: 'travelDates.startDate', label: 'Arrival Date (soonest)' },
{ value: '-travelDates.startDate', label: 'Arrival Date (latest)' }];


function tripDays(r: AdminCustomRequest) {
  const ms = new Date(r.travelDates.endDate).getTime() - new Date(r.travelDates.startDate).getTime();
  return Math.max(1, Math.round(ms / 86400000));
}

export function AdminCustomRequestsList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const toast = useToast();
  const { items, meta, loading, error, page, setPage, refetch } = useAdminList<AdminCustomRequest>('/custom-tours', {
    q: search || undefined,
    status: status || undefined,
    priority: priority || undefined,
    sort
  });

  const assignToMe = async (id: string) => {
    setAssigningId(id);
    try {
      await apiPatch(`/custom-tours/${id}/assign`, {});
      toast('Request assigned to you.');
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to assign request.', 'error');
    } finally {
      setAssigningId(null);
    }
  };

  const columns: Column<AdminCustomRequest>[] = [
  { header: 'Inquiry ID', render: (r) => <span className="font-mono text-xs font-semibold">{r.referenceNumber}</span> },
  { header: 'Customer', render: (r) => r.customer?.user?.fullName || '-' },
  { header: 'Submitted', render: (r) => formatDate(r.createdAt) },
  { header: 'Arrival Date', render: (r) => formatDate(r.travelDates.startDate) },
  { header: 'Days', render: (r) => tripDays(r) },
  { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { header: 'Priority', render: (r) => <PriorityBadge priority={r.priority} /> },
  {
    header: 'Quick Actions',
    render: (r) =>
    <div className="flex items-center gap-1.5">
          {!r.assignedAdmin &&
      <button
        onClick={() => assignToMe(r._id)}
        disabled={assigningId === r._id}
        title="Assign to me"
        className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest disabled:opacity-50">

              {assigningId === r._id ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <UserCheckIcon className="h-4 w-4" />}
            </button>
      }
          <Link to={`/admin/custom-requests/${r._id}`} title="View" className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest">
            <EyeIcon className="h-4 w-4" />
          </Link>
        </div>

  }];


  return (
    <div>
      <PageHeader
        title="Custom Tour Requests"
        subtitle="Review inquiries and craft personalized itineraries"
        action={
        <Link to="/admin/custom-requests/new" className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-emerald">
            <PlusIcon className="h-4 w-4" /> New Query
          </Link>
        } />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by reference…" className="w-full rounded-xl border border-forest/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Priorities</option>
          {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald">
          {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <DataTable columns={columns} rows={items} loading={loading} error={error} meta={meta} page={page} onPageChange={setPage} rowKey={(r) => r._id} emptyMessage="No custom tour requests yet." />
    </div>);

}
