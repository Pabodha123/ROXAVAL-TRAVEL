import React, { useState } from 'react';
import { CheckIcon, ExternalLinkIcon, SearchIcon, XIcon } from 'lucide-react';
import { useAdminList } from '../../hooks/useAdminList';
import { DataTable, Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { useConfirm } from '../../components/ConfirmDialog';
import { useToast } from '../../components/ToastProvider';
import { apiPatch, ApiRequestError, API_ORIGIN } from '../../../lib/api';

interface AdminPayment {
  _id: string;
  paymentReference: string;
  customer?: { user?: { fullName?: string; email?: string } };
  booking?: { bookingReference: string };
  method: string;
  paymentType: string;
  amount: number;
  currency: string;
  receiptUrl?: string;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['Pending', 'Submitted', 'Verified', 'Rejected', 'Refunded'];

export function AdminPaymentsList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { items, meta, loading, error, page, setPage, refetch } = useAdminList<AdminPayment>('/payments', {
    q: search || undefined,
    status: status || undefined
  });
  const confirm = useConfirm();
  const toast = useToast();

  const verify = (p: AdminPayment, decision: 'Verified' | 'Rejected') => {
    confirm({
      title: `${decision === 'Verified' ? 'Verify' : 'Reject'} payment?`,
      message: `${p.paymentReference} for $${p.amount.toLocaleString()} will be marked as ${decision.toLowerCase()}.`,
      confirmLabel: decision,
      tone: decision === 'Rejected' ? 'danger' : 'default',
      onConfirm: async () => {
        try {
          await apiPatch(`/payments/${p._id}/verify`, { status: decision });
          toast(`Payment ${decision.toLowerCase()}.`);
          refetch();
        } catch (err) {
          toast(err instanceof ApiRequestError ? err.message : 'Failed to update payment.', 'error');
        }
      }
    });
  };

  const columns: Column<AdminPayment>[] = [
  { header: 'Reference', render: (p) => <span className="font-mono text-xs font-semibold">{p.paymentReference}</span> },
  { header: 'Customer', render: (p) => p.customer?.user?.fullName || '—' },
  { header: 'Booking', render: (p) => p.booking?.bookingReference || '—' },
  { header: 'Type', render: (p) => <span className="capitalize">{p.paymentType}</span> },
  { header: 'Method', render: (p) => <span className="capitalize">{p.method.replace('_', ' ')}</span> },
  { header: 'Amount', render: (p) => `$${p.amount.toLocaleString()}` },
  { header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  {
    header: 'Actions',
    render: (p) =>
    <div className="flex items-center gap-1.5">
          {p.receiptUrl &&
      <a href={`${API_ORIGIN}${p.receiptUrl}`} target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest">
              <ExternalLinkIcon className="h-4 w-4" />
            </a>
      }
          {(p.status === 'Pending' || p.status === 'Submitted') &&
      <>
              <button onClick={() => verify(p, 'Verified')} className="grid h-8 w-8 place-items-center rounded-lg text-emerald hover:bg-emerald/10"><CheckIcon className="h-4 w-4" /></button>
              <button onClick={() => verify(p, 'Rejected')} className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50"><XIcon className="h-4 w-4" /></button>
            </>
      }
        </div>

  }];


  return (
    <div>
      <PageHeader title="Payments" subtitle="Verify bank transfers and track payment status" />

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

      <DataTable columns={columns} rows={items} loading={loading} error={error} meta={meta} page={page} onPageChange={setPage} rowKey={(p) => p._id} emptyMessage="No payments yet." />
    </div>);

}
