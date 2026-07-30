import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, PlusIcon, PowerIcon, SearchIcon, TrashIcon } from 'lucide-react';
import { useAdminList } from '../../hooks/useAdminList';
import { DataTable, Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { useConfirm } from '../../components/ConfirmDialog';
import { useToast } from '../../components/ToastProvider';
import { apiDelete, apiPatch, ApiRequestError } from '../../../lib/api';
import type { TourPackage } from '../../../types/tourPackage';

export function AdminPackagesList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { items, meta, loading, error, page, setPage, refetch } = useAdminList<TourPackage>('/packages/admin/all', {
    q: search || undefined,
    status: status || undefined
  });
  const confirm = useConfirm();
  const toast = useToast();

  const toggleStatus = async (pkg: TourPackage) => {
    const next = pkg.status === 'published' ? 'draft' : 'published';
    try {
      await apiPatch(`/packages/${pkg._id}`, { status: next });
      toast(`Package ${next === 'published' ? 'activated' : 'deactivated'}.`);
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to update package.', 'error');
    }
  };

  const remove = (pkg: TourPackage) => {
    confirm({
      title: 'Delete package?',
      message: `"${pkg.name}" will be permanently removed.`,
      confirmLabel: 'Delete',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await apiDelete(`/packages/${pkg._id}`);
          toast('Package deleted.');
          refetch();
        } catch (err) {
          toast(err instanceof ApiRequestError ? err.message : 'Failed to delete package.', 'error');
        }
      }
    });
  };

  const columns: Column<TourPackage>[] = [
  { header: 'Package', render: (p) => <div className="flex items-center gap-3"><img src={p.heroImage} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="font-medium">{p.name}</span></div> },
  { header: 'Category', render: (p) => p.category },
  { header: 'Duration', render: (p) => `${p.durationDays}D / ${p.durationNights}N` },
  { header: 'Price', render: (p) => `$${p.price.toLocaleString()}` },
  { header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  {
    header: 'Actions',
    render: (p) =>
    <div className="flex items-center gap-1.5">
          <Link to={`/admin/packages/${p._id}/edit`} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest"><PencilIcon className="h-4 w-4" /></Link>
          <button onClick={() => toggleStatus(p)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest"><PowerIcon className="h-4 w-4" /></button>
          <button onClick={() => remove(p)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-red-50 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
        </div>

  }];


  return (
    <div>
      <PageHeader
        title="Tour Packages"
        subtitle="Manage every itinerary, gallery and price point"
        action={
        <Link to="/admin/packages/new" className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-emerald">
            <PlusIcon className="h-4 w-4" /> Add Package
          </Link>
        } />


      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search packages…" className="w-full rounded-xl border border-forest/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <DataTable columns={columns} rows={items} loading={loading} error={error} meta={meta} page={page} onPageChange={setPage} rowKey={(p) => p._id} emptyMessage="No packages yet." />
    </div>);

}
