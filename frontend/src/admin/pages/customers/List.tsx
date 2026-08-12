import React from 'react';
import { Link } from 'react-router-dom';
import { BanIcon, CheckCircle2Icon, EyeIcon, PlusIcon } from 'lucide-react';
import { useAdminList } from '../../hooks/useAdminList';
import { DataTable, Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { useConfirm } from '../../components/ConfirmDialog';
import { useToast } from '../../components/ToastProvider';
import { apiPatch, ApiRequestError } from '../../../lib/api';

interface AdminCustomer {
  _id: string;
  user?: { fullName?: string; email?: string; phone?: string; active?: boolean };
  country?: string;
  totalBookings: number;
  totalSpend: number;
}

export function AdminCustomersList() {
  const { items, meta, loading, error, page, setPage, refetch } = useAdminList<AdminCustomer>('/customers', {});
  const confirm = useConfirm();
  const toast = useToast();

  const toggleActive = (c: AdminCustomer) => {
    const nextActive = !(c.user?.active ?? true);
    confirm({
      title: nextActive ? 'Unblock customer?' : 'Block customer?',
      message: `${c.user?.fullName} will be ${nextActive ? 're-enabled' : 'blocked from signing in'}.`,
      confirmLabel: nextActive ? 'Unblock' : 'Block',
      tone: nextActive ? 'default' : 'danger',
      onConfirm: async () => {
        try {
          await apiPatch(`/customers/${c._id}/active`, { active: nextActive });
          toast(`Customer ${nextActive ? 'unblocked' : 'blocked'}.`);
          refetch();
        } catch (err) {
          toast(err instanceof ApiRequestError ? err.message : 'Failed to update customer.', 'error');
        }
      }
    });
  };

  const columns: Column<AdminCustomer>[] = [
  { header: 'Customer', render: (c) => <span className="font-medium">{c.user?.fullName || '-'}</span> },
  { header: 'Email', render: (c) => c.user?.email || '-' },
  { header: 'Country', render: (c) => c.country || '-' },
  { header: 'Bookings', render: (c) => c.totalBookings },
  { header: 'Total Spend', render: (c) => `$${(c.totalSpend || 0).toLocaleString()}` },
  { header: 'Status', render: (c) => c.user?.active === false ? <span className="text-xs font-semibold text-red-600">Blocked</span> : <span className="text-xs font-semibold text-emerald">Active</span> },
  {
    header: 'Actions',
    render: (c) =>
    <div className="flex items-center gap-1.5">
          <Link to={`/admin/customers/${c._id}`} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest"><EyeIcon className="h-4 w-4" /></Link>
          <button onClick={() => toggleActive(c)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest">
            {c.user?.active === false ? <CheckCircle2Icon className="h-4 w-4" /> : <BanIcon className="h-4 w-4" />}
          </button>
        </div>

  }];


  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="View profiles, booking history and account status"
        action={
        <Link to="/admin/customers/new" className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-emerald">
            <PlusIcon className="h-4 w-4" /> Add Customer
          </Link>
        } />

      <DataTable columns={columns} rows={items} loading={loading} error={error} meta={meta} page={page} onPageChange={setPage} rowKey={(c) => c._id} emptyMessage="No customers yet." />
    </div>);

}
