import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, PlusIcon, PowerIcon, SearchIcon, StarIcon, TrashIcon } from 'lucide-react';
import { useAdminList } from '../../hooks/useAdminList';
import { DataTable, Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { useConfirm } from '../../components/ConfirmDialog';
import { useToast } from '../../components/ToastProvider';
import { apiDelete, apiPatch, ApiRequestError } from '../../../lib/api';

interface AdminHotel {
  _id: string;
  name: string;
  category: string;
  starRating: number;
  images: string[];
  status: 'active' | 'inactive';
  destination?: { name: string };
}

export function AdminHotelsList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { items, meta, loading, error, page, setPage, refetch } = useAdminList<AdminHotel>('/hotels/admin/all', {
    q: search || undefined,
    status: status || undefined
  });
  const confirm = useConfirm();
  const toast = useToast();

  const toggleStatus = async (h: AdminHotel) => {
    const next = h.status === 'active' ? 'inactive' : 'active';
    try {
      await apiPatch(`/hotels/${h._id}`, { status: next });
      toast(`Hotel ${next === 'active' ? 'activated' : 'deactivated'}.`);
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to update hotel.', 'error');
    }
  };

  const remove = (h: AdminHotel) => {
    confirm({
      title: 'Delete hotel?',
      message: `"${h.name}" will be permanently removed.`,
      confirmLabel: 'Delete',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await apiDelete(`/hotels/${h._id}`);
          toast('Hotel deleted.');
          refetch();
        } catch (err) {
          toast(err instanceof ApiRequestError ? err.message : 'Failed to delete hotel.', 'error');
        }
      }
    });
  };

  const columns: Column<AdminHotel>[] = [
  { header: 'Hotel', render: (h) => <div className="flex items-center gap-3"><img src={h.images?.[0]} alt="" className="h-10 w-10 rounded-lg object-cover bg-cream" /><span className="font-medium">{h.name}</span></div> },
  { header: 'Destination', render: (h) => h.destination?.name || '—' },
  { header: 'Category', render: (h) => h.category },
  { header: 'Rating', render: (h) => <span className="inline-flex items-center gap-1"><StarIcon className="h-3.5 w-3.5 fill-gold text-gold" /> {h.starRating}</span> },
  { header: 'Status', render: (h) => <StatusBadge status={h.status} /> },
  {
    header: 'Actions',
    render: (h) =>
    <div className="flex items-center gap-1.5">
          <Link to={`/admin/hotels/${h._id}/edit`} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest"><PencilIcon className="h-4 w-4" /></Link>
          <button onClick={() => toggleStatus(h)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest"><PowerIcon className="h-4 w-4" /></button>
          <button onClick={() => remove(h)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-red-50 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
        </div>

  }];


  return (
    <div>
      <PageHeader
        title="Hotels"
        subtitle="Partner accommodations and room inventory"
        action={
        <Link to="/admin/hotels/new" className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-emerald">
            <PlusIcon className="h-4 w-4" /> Add Hotel
          </Link>
        } />


      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search hotels…" className="w-full rounded-xl border border-forest/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <DataTable columns={columns} rows={items} loading={loading} error={error} meta={meta} page={page} onPageChange={setPage} rowKey={(h) => h._id} emptyMessage="No hotels yet." />
    </div>);

}
