import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CarIcon, PencilIcon, PlusIcon, PowerIcon, SearchIcon, TrashIcon } from 'lucide-react';
import { useAdminList } from '../../hooks/useAdminList';
import { DataTable, Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { useConfirm } from '../../components/ConfirmDialog';
import { useToast } from '../../components/ToastProvider';
import { apiDelete, apiPatch, ApiRequestError } from '../../../lib/api';

interface AdminVehicle {
  _id: string;
  name: string;
  type: string;
  capacity: number;
  images: string[];
  pricePerDay: number;
  status: 'active' | 'inactive';
}

const TYPE_OPTIONS = ['Car', 'Van', 'SUV', 'Minibus', 'Bus'];

export function AdminVehiclesList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const { items, meta, loading, error, page, setPage, refetch } = useAdminList<AdminVehicle>('/vehicles/admin/all', {
    q: search || undefined,
    status: status || undefined,
    type: type || undefined
  });
  const confirm = useConfirm();
  const toast = useToast();

  const toggleStatus = async (v: AdminVehicle) => {
    const next = v.status === 'active' ? 'inactive' : 'active';
    try {
      await apiPatch(`/vehicles/${v._id}`, { status: next });
      toast(`Vehicle ${next === 'active' ? 'activated' : 'deactivated'}.`);
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to update vehicle.', 'error');
    }
  };

  const remove = (v: AdminVehicle) => {
    confirm({
      title: 'Delete vehicle?',
      message: `"${v.name}" will be permanently removed.`,
      confirmLabel: 'Delete',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await apiDelete(`/vehicles/${v._id}`);
          toast('Vehicle deleted.');
          refetch();
        } catch (err) {
          toast(err instanceof ApiRequestError ? err.message : 'Failed to delete vehicle.', 'error');
        }
      }
    });
  };

  const columns: Column<AdminVehicle>[] = [
  { header: 'Vehicle', render: (v) => <div className="flex items-center gap-3">{v.images?.[0] ? <img src={v.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover bg-cream" /> : <span className="grid h-10 w-10 place-items-center rounded-lg bg-cream text-forest/40"><CarIcon className="h-4 w-4" /></span>}<span className="font-medium">{v.name}</span></div> },
  { header: 'Type', render: (v) => v.type },
  { header: 'Capacity', render: (v) => `${v.capacity} pax` },
  { header: 'Price / Day', render: (v) => `$${v.pricePerDay}` },
  { header: 'Status', render: (v) => <StatusBadge status={v.status} /> },
  {
    header: 'Actions',
    render: (v) =>
    <div className="flex items-center gap-1.5">
          <Link to={`/admin/vehicles/${v._id}/edit`} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest"><PencilIcon className="h-4 w-4" /></Link>
          <button onClick={() => toggleStatus(v)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest"><PowerIcon className="h-4 w-4" /></button>
          <button onClick={() => remove(v)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-red-50 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
        </div>

  }];


  return (
    <div>
      <PageHeader
        title="Vehicles"
        subtitle="Transport fleet available for custom itineraries"
        action={
        <Link to="/admin/vehicles/new" className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-emerald">
            <PlusIcon className="h-4 w-4" /> Add Vehicle
          </Link>
        } />


      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vehicles…" className="w-full rounded-xl border border-forest/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald" />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Types</option>
          {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <DataTable columns={columns} rows={items} loading={loading} error={error} meta={meta} page={page} onPageChange={setPage} rowKey={(v) => v._id} emptyMessage="No vehicles yet." />
    </div>);

}
