import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, PlusIcon, PowerIcon, SearchIcon, TrashIcon, UserIcon } from 'lucide-react';
import { useAdminList } from '../../hooks/useAdminList';
import { DataTable, Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { useConfirm } from '../../components/ConfirmDialog';
import { useToast } from '../../components/ToastProvider';
import { apiDelete, apiPatch, ApiRequestError } from '../../../lib/api';

interface AdminTourGuide {
  _id: string;
  name: string;
  photo?: string;
  languages: string[];
  yearsExperience: number;
  pricePerDay: number;
  status: 'active' | 'inactive';
}

export function AdminTourGuidesList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { items, meta, loading, error, page, setPage, refetch } = useAdminList<AdminTourGuide>('/tour-guides/admin/all', {
    q: search || undefined,
    status: status || undefined
  });
  const confirm = useConfirm();
  const toast = useToast();

  const toggleStatus = async (g: AdminTourGuide) => {
    const next = g.status === 'active' ? 'inactive' : 'active';
    try {
      await apiPatch(`/tour-guides/${g._id}`, { status: next });
      toast(`Guide ${next === 'active' ? 'activated' : 'deactivated'}.`);
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to update guide.', 'error');
    }
  };

  const remove = (g: AdminTourGuide) => {
    confirm({
      title: 'Delete guide?',
      message: `"${g.name}" will be permanently removed.`,
      confirmLabel: 'Delete',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await apiDelete(`/tour-guides/${g._id}`);
          toast('Guide deleted.');
          refetch();
        } catch (err) {
          toast(err instanceof ApiRequestError ? err.message : 'Failed to delete guide.', 'error');
        }
      }
    });
  };

  const columns: Column<AdminTourGuide>[] = [
  { header: 'Guide', render: (g) => <div className="flex items-center gap-3">{g.photo ? <img src={g.photo} alt="" className="h-10 w-10 rounded-full object-cover bg-cream" /> : <span className="grid h-10 w-10 place-items-center rounded-full bg-cream text-forest/40"><UserIcon className="h-4 w-4" /></span>}<span className="font-medium">{g.name}</span></div> },
  { header: 'Languages', render: (g) => g.languages?.join(', ') || '—' },
  { header: 'Experience', render: (g) => `${g.yearsExperience} yrs` },
  { header: 'Price / Day', render: (g) => `$${g.pricePerDay}` },
  { header: 'Status', render: (g) => <StatusBadge status={g.status} /> },
  {
    header: 'Actions',
    render: (g) =>
    <div className="flex items-center gap-1.5">
          <Link to={`/admin/tour-guides/${g._id}/edit`} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest"><PencilIcon className="h-4 w-4" /></Link>
          <button onClick={() => toggleStatus(g)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest"><PowerIcon className="h-4 w-4" /></button>
          <button onClick={() => remove(g)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-red-50 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
        </div>

  }];


  return (
    <div>
      <PageHeader
        title="Tour Guides"
        subtitle="Licensed guides available for custom itineraries"
        action={
        <Link to="/admin/tour-guides/new" className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-emerald">
            <PlusIcon className="h-4 w-4" /> Add Guide
          </Link>
        } />


      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search guides…" className="w-full rounded-xl border border-forest/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <DataTable columns={columns} rows={items} loading={loading} error={error} meta={meta} page={page} onPageChange={setPage} rowKey={(g) => g._id} emptyMessage="No tour guides yet." />
    </div>);

}
