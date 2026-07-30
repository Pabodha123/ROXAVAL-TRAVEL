import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2Icon, SaveIcon } from 'lucide-react';
import { apiGetList, apiGetOne, apiPatch, ApiRequestError } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { TextAreaField } from '../../components/fields/Fields';

interface CustomerDetail {
  _id: string;
  user?: { fullName?: string; email?: string; phone?: string; active?: boolean };
  country?: string;
  address?: string;
  dateOfBirth?: string;
  preferredLanguage?: string;
  totalBookings: number;
  totalSpend: number;
  notes: string;
}

interface CustomerBooking {
  _id: string;
  bookingReference: string;
  tourPackage?: { name: string };
  travelDate: string;
  pricing: { totalAmount: number };
  status: string;
}

export function AdminCustomerDetail() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const toast = useToast();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
    apiGetOne<CustomerDetail>(`/customers/${id}`),
    apiGetList<CustomerBooking>('/bookings', { customer: id, limit: 20 })]
    ).
    then(([c, b]) => {
      setCustomer(c);
      setNotes(c.notes || '');
      setBookings(b.data);
    }).
    finally(() => setLoading(false));
  }, [id]);

  const saveNotes = async () => {
    setSaving(true);
    try {
      await apiPatch(`/customers/${id}/notes`, { notes });
      toast('Notes saved.');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to save notes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !customer) return <div className="grid h-64 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;

  return (
    <div>
      <PageHeader
        title={customer.user?.fullName || 'Customer'}
        subtitle={customer.user?.email}
        action={<button onClick={() => navigate('/admin/customers')} className="rounded-full border border-forest/15 px-5 py-2.5 text-sm font-semibold text-forest hover:bg-cream">Back to list</button>} />


      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <p className="font-display text-sm font-semibold text-forest">Booking History</p>
            <div className="mt-3 divide-y divide-forest/5">
              {bookings.length === 0 && <p className="py-6 text-center text-sm text-forest/40">No bookings yet.</p>}
              {bookings.map((b) =>
              <div key={b._id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-forest">{b.tourPackage?.name || 'Customized Tour'}</p>
                    <p className="text-xs text-forest/50">{b.bookingReference} · {new Date(b.travelDate).toLocaleDateString()} · ${b.pricing.totalAmount.toLocaleString()}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <p className="mb-3 font-display text-sm font-semibold text-forest">Internal Notes</p>
            <TextAreaField label="Notes (visible to admins only)" value={notes} onChange={setNotes} rows={4} />
            <button onClick={saveNotes} disabled={saving} className="mt-3 flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-70">
              {saving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
              Save Notes
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <p className="font-display text-sm font-semibold text-forest">Contact Details</p>
            <div className="mt-3 space-y-2 text-sm">
              <p><span className="text-forest/50">Phone:</span> {customer.user?.phone || '—'}</p>
              <p><span className="text-forest/50">Country:</span> {customer.country || '—'}</p>
              <p><span className="text-forest/50">Address:</span> {customer.address || '—'}</p>
              <p><span className="text-forest/50">Language:</span> {customer.preferredLanguage || '—'}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <p className="font-display text-sm font-semibold text-forest">Stats</p>
            <div className="mt-3 space-y-2 text-sm">
              <p><span className="text-forest/50">Total Bookings:</span> {customer.totalBookings}</p>
              <p><span className="text-forest/50">Total Spend:</span> ${(customer.totalSpend || 0).toLocaleString()}</p>
              <p><span className="text-forest/50">Account:</span> {customer.user?.active === false ? 'Blocked' : 'Active'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>);

}
