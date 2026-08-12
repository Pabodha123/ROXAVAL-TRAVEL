import React, { useState } from 'react';
import { DownloadIcon, SearchIcon } from 'lucide-react';
import { useAdminList } from '../../hooks/useAdminList';
import { DataTable, Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { API_ORIGIN } from '../../../lib/api';
import { formatDate } from '../../../lib/date';

interface AdminDocument {
  _id: string;
  type: string;
  referenceNumber: string;
  fileName: string;
  fileUrl: string;
  booking?: { bookingReference: string };
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  itinerary: 'Itinerary',
  hotel_voucher: 'Hotel Voucher',
  booking_confirmation: 'Booking Confirmation',
  invoice: 'Invoice',
  payment_receipt: 'Payment Receipt',
  quotation: 'Quotation'
};

export function AdminDocumentsList() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const { items, meta, loading, error, page, setPage } = useAdminList<AdminDocument>('/documents', {
    q: search || undefined,
    type: type || undefined
  });

  const columns: Column<AdminDocument>[] = [
  { header: 'Reference', render: (d) => <span className="font-mono text-xs font-semibold">{d.referenceNumber}</span> },
  { header: 'Type', render: (d) => TYPE_LABELS[d.type] || d.type },
  { header: 'Booking', render: (d) => d.booking?.bookingReference || '-' },
  { header: 'Generated', render: (d) => formatDate(d.createdAt) },
  {
    header: '', render: (d) =>
    <a href={`${API_ORIGIN}${d.fileUrl}`} target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest">
        <DownloadIcon className="h-4 w-4" />
      </a>

  }];


  return (
    <div>
      <PageHeader title="Documents" subtitle="Every itinerary, voucher, invoice and receipt generated for customers" />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by reference or file name…" className="w-full rounded-xl border border-forest/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald" />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Types</option>
          {Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      <DataTable columns={columns} rows={items} loading={loading} error={error} meta={meta} page={page} onPageChange={setPage} rowKey={(d) => d._id} emptyMessage="No documents generated yet." />
    </div>);

}
