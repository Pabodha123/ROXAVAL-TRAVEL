import React, { useState } from 'react';
import { EyeIcon, MailIcon, SearchIcon, TrashIcon } from 'lucide-react';
import { useAdminList } from '../../hooks/useAdminList';
import { DataTable, Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { useConfirm } from '../../components/ConfirmDialog';
import { useToast } from '../../components/ToastProvider';
import { apiDelete, apiPatch, ApiRequestError } from '../../../lib/api';
import { formatDate } from '../../../lib/date';

interface AdminContact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'New' | 'Read' | 'Responded';
  createdAt: string;
}

const STATUS_OPTIONS = ['New', 'Read', 'Responded'];

export function AdminContactList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { items, meta, loading, error, page, setPage, refetch } = useAdminList<AdminContact>('/contact/admin/all', {
    q: search || undefined,
    status: status || undefined
  });
  const confirm = useConfirm();
  const toast = useToast();

  const updateStatus = async (c: AdminContact, next: AdminContact['status']) => {
    try {
      await apiPatch(`/contact/${c._id}/status`, { status: next });
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to update status.', 'error');
    }
  };

  const view = (c: AdminContact) => {
    setExpandedId(expandedId === c._id ? null : c._id);
    if (c.status === 'New') updateStatus(c, 'Read');
  };

  const remove = (c: AdminContact) => {
    confirm({
      title: 'Delete inquiry?',
      message: 'This contact inquiry will be permanently removed.',
      confirmLabel: 'Delete',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await apiDelete(`/contact/${c._id}`);
          toast('Inquiry deleted.');
          refetch();
        } catch (err) {
          toast(err instanceof ApiRequestError ? err.message : 'Failed to delete inquiry.', 'error');
        }
      }
    });
  };

  const columns: Column<AdminContact>[] = [
  { header: 'Name', render: (c) => c.name },
  { header: 'Email', render: (c) => <a href={`mailto:${c.email}`} className="text-emerald hover:underline">{c.email}</a> },
  { header: 'Subject', className: 'max-w-xs truncate', render: (c) => c.subject },
  { header: 'Submitted', render: (c) => formatDate(c.createdAt) },
  { header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
  {
    header: 'Actions',
    render: (c) =>
    <div className="flex items-center gap-1.5">
          <button onClick={() => view(c)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest"><EyeIcon className="h-4 w-4" /></button>
          {c.status !== 'Responded' &&
      <button onClick={() => updateStatus(c, 'Responded')} title="Mark as Responded" className="grid h-8 w-8 place-items-center rounded-lg text-emerald hover:bg-emerald/10"><MailIcon className="h-4 w-4" /></button>
      }
          <button onClick={() => remove(c)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-red-50 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
        </div>

  }];


  const expanded = items.find((c) => c._id === expandedId);

  return (
    <div>
      <PageHeader title="Contact Inquiries" subtitle="Messages submitted through the public Contact Us form" />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inquiries…" className="w-full rounded-xl border border-forest/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {expanded &&
      <div className="mb-4 rounded-2xl bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-forest">{expanded.subject}</p>
            <StatusBadge status={expanded.status} />
          </div>
          <p className="mt-1 text-xs text-forest/50">{expanded.name} &middot; {expanded.email}{expanded.phone ? ` · ${expanded.phone}` : ''}</p>
          <p className="mt-3 whitespace-pre-wrap text-sm text-forest/70">{expanded.message}</p>
        </div>
      }

      <DataTable columns={columns} rows={items} loading={loading} error={error} meta={meta} page={page} onPageChange={setPage} rowKey={(c) => c._id} emptyMessage="No contact inquiries yet." />
    </div>);

}
