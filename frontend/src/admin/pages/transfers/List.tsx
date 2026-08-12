import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRightIcon, PencilIcon, PlusIcon, PowerIcon, SearchIcon, TrashIcon } from 'lucide-react';
import { useAdminList } from '../../hooks/useAdminList';
import { DataTable, Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { useConfirm } from '../../components/ConfirmDialog';
import { useToast } from '../../components/ToastProvider';
import { apiDelete, apiPatch, ApiRequestError } from '../../../lib/api';

interface AdminTransfer {
  _id: string;
  name: string;
  destination?: { _id: string; name: string };
  supplier: string;
  type: string;
  vehicle?: { _id: string; name: string };
  costWithDriver: number;
  costWithoutDriver: number;
  currency: string;
  status: 'active' | 'inactive';
}

const TYPE_OPTIONS = ['Private (PVT)', 'Seat-in-Coach (SIC)'];

export function AdminTransfersList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const { items, meta, loading, error, page, setPage, refetch } = useAdminList<AdminTransfer>('/transfers/admin/all', {
    q: search || undefined,
    status: status || undefined,
    type: type || undefined
  });
  const confirm = useConfirm();
  const toast = useToast();

  const toggleStatus = async (t: AdminTransfer) => {
    const next = t.status === 'active' ? 'inactive' : 'active';
    try {
      await apiPatch(`/transfers/${t._id}`, { status: next });
      toast(`Transfer ${next === 'active' ? 'activated' : 'deactivated'}.`);
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to update transfer.', 'error');
    }
  };

  const remove = (t: AdminTransfer) => {
    confirm({
      title: 'Delete transfer?',
      message: `"${t.name}" will be permanently removed.`,
      confirmLabel: 'Delete',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await apiDelete(`/transfers/${t._id}`);
          toast('Transfer deleted.');
          refetch();
        } catch (err) {
          toast(err instanceof ApiRequestError ? err.message : 'Failed to delete transfer.', 'error');
        }
      }
    });
  };

  const columns: Column<AdminTransfer>[] = [
  { header: 'Transfer', render: (t) => <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-cream text-forest/40"><ArrowLeftRightIcon className="h-4 w-4" /></span><span className="font-medium">{t.name}</span></div> },
  { header: 'Destination', render: (t) => t.destination?.name || '-' },
  { header: 'Supplier', render: (t) => t.supplier || '-' },
  { header: 'Type', render: (t) => t.type },
  { header: 'Vehicle', render: (t) => t.vehicle?.name || '-' },
  { header: 'Cost (w/ driver)', render: (t) => `${t.currency} ${t.costWithDriver}` },
  { header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
  {
    header: 'Actions',
    render: (t) =>
    <div className="flex items-center gap-1.5">
          <Link to={`/admin/transfers/${t._id}/edit`} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest"><PencilIcon className="h-4 w-4" /></Link>
          <button onClick={() => toggleStatus(t)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest"><PowerIcon className="h-4 w-4" /></button>
          <button onClick={() => remove(t)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-red-50 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
        </div>

  }];


  return (
    <div>
      <PageHeader
        title="Transfers"
        subtitle="Point-to-point transfer costs used by the itinerary builder"
        action={
        <Link to="/admin/transfers/new" className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-emerald">
            <PlusIcon className="h-4 w-4" /> Add Transfer
          </Link>
        } />


      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transfers…" className="w-full rounded-xl border border-forest/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald" />
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

      <DataTable columns={columns} rows={items} loading={loading} error={error} meta={meta} page={page} onPageChange={setPage} rowKey={(t) => t._id} emptyMessage="No transfers yet." />
    </div>);

}
