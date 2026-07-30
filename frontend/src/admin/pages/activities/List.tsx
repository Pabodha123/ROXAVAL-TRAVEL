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
import type { Activity } from '../../../types/activity';

export function AdminActivitiesList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { items, meta, loading, error, page, setPage, refetch } = useAdminList<Activity>('/activities/admin/all', {
    q: search || undefined,
    status: status || undefined
  });
  const confirm = useConfirm();
  const toast = useToast();

  const toggleStatus = async (a: Activity) => {
    const next = a.status === 'published' ? 'draft' : 'published';
    try {
      await apiPatch(`/activities/${a._id}`, { status: next });
      toast(`Activity ${next === 'published' ? 'activated' : 'deactivated'}.`);
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to update activity.', 'error');
    }
  };

  const remove = (a: Activity) => {
    confirm({
      title: 'Delete activity?',
      message: `"${a.name}" will be permanently removed.`,
      confirmLabel: 'Delete',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await apiDelete(`/activities/${a._id}`);
          toast('Activity deleted.');
          refetch();
        } catch (err) {
          toast(err instanceof ApiRequestError ? err.message : 'Failed to delete activity.', 'error');
        }
      }
    });
  };

  const columns: Column<Activity>[] = [
  { header: 'Activity', render: (a) => <div className="flex items-center gap-3"><img src={a.image} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="font-medium">{a.name}</span></div> },
  { header: 'Category', render: (a) => a.category },
  { header: 'Difficulty', render: (a) => a.difficultyLevel },
  { header: 'Price', render: (a) => `$${a.priceFrom}` },
  { header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
  {
    header: 'Actions',
    render: (a) =>
    <div className="flex items-center gap-1.5">
          <Link to={`/admin/activities/${a._id}/edit`} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest"><PencilIcon className="h-4 w-4" /></Link>
          <button onClick={() => toggleStatus(a)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest"><PowerIcon className="h-4 w-4" /></button>
          <button onClick={() => remove(a)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-red-50 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
        </div>

  }];


  return (
    <div>
      <PageHeader
        title="Activities"
        subtitle="Manage bookable experiences across the island"
        action={
        <Link to="/admin/activities/new" className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-emerald">
            <PlusIcon className="h-4 w-4" /> Add Activity
          </Link>
        } />


      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search activities…" className="w-full rounded-xl border border-forest/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <DataTable columns={columns} rows={items} loading={loading} error={error} meta={meta} page={page} onPageChange={setPage} rowKey={(a) => a._id} emptyMessage="No activities yet." />
    </div>);

}
