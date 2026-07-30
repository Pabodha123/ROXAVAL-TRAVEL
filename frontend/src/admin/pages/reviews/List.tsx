import React, { useState } from 'react';
import { CheckIcon, SearchIcon, StarIcon, TrashIcon, XIcon } from 'lucide-react';
import { useAdminList } from '../../hooks/useAdminList';
import { DataTable, Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { useConfirm } from '../../components/ConfirmDialog';
import { useToast } from '../../components/ToastProvider';
import { apiDelete, apiPatch, ApiRequestError } from '../../../lib/api';

interface AdminReview {
  _id: string;
  customer?: { user?: { fullName?: string } };
  tourPackage?: { name: string };
  rating: number;
  title?: string;
  text: string;
  status: string;
  createdAt: string;
}

export function AdminReviewsList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { items, meta, loading, error, page, setPage, refetch } = useAdminList<AdminReview>('/reviews/admin/all', {
    q: search || undefined,
    status: status || undefined
  });
  const confirm = useConfirm();
  const toast = useToast();

  const moderate = async (r: AdminReview, decision: 'approved' | 'rejected') => {
    try {
      await apiPatch(`/reviews/${r._id}/moderate`, { status: decision });
      toast(`Review ${decision}.`);
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to update review.', 'error');
    }
  };

  const remove = (r: AdminReview) => {
    confirm({
      title: 'Delete review?',
      message: 'This review will be permanently removed.',
      confirmLabel: 'Delete',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await apiDelete(`/reviews/${r._id}`);
          toast('Review deleted.');
          refetch();
        } catch (err) {
          toast(err instanceof ApiRequestError ? err.message : 'Failed to delete review.', 'error');
        }
      }
    });
  };

  const columns: Column<AdminReview>[] = [
  { header: 'Customer', render: (r) => r.customer?.user?.fullName || '—' },
  { header: 'Package', render: (r) => r.tourPackage?.name || '—' },
  { header: 'Rating', render: (r) => <span className="inline-flex items-center gap-1"><StarIcon className="h-3.5 w-3.5 fill-gold text-gold" /> {r.rating}</span> },
  { header: 'Review', className: 'max-w-xs truncate', render: (r) => r.text },
  { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  {
    header: 'Actions',
    render: (r) =>
    <div className="flex items-center gap-1.5">
          {r.status === 'pending' &&
      <>
              <button onClick={() => moderate(r, 'approved')} className="grid h-8 w-8 place-items-center rounded-lg text-emerald hover:bg-emerald/10"><CheckIcon className="h-4 w-4" /></button>
              <button onClick={() => moderate(r, 'rejected')} className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50"><XIcon className="h-4 w-4" /></button>
            </>
      }
          <button onClick={() => remove(r)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-red-50 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
        </div>

  }];


  return (
    <div>
      <PageHeader title="Reviews" subtitle="Moderate customer feedback before it goes live" />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews…" className="w-full rounded-xl border border-forest/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <DataTable columns={columns} rows={items} loading={loading} error={error} meta={meta} page={page} onPageChange={setPage} rowKey={(r) => r._id} emptyMessage="No reviews yet." />
    </div>);

}
