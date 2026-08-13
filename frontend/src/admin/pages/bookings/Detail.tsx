import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarIcon, DownloadIcon, Loader2Icon, UsersIcon } from 'lucide-react';
import { apiGetOne, apiPatch, apiPost, ApiRequestError, API_ORIGIN } from '../../../lib/api';
import { formatDate, formatDateTime } from '../../../lib/date';
import { useToast } from '../../components/ToastProvider';
import { useConfirm } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { TextAreaField } from '../../components/fields/Fields';
import { HotelVouchersPanel } from '../../components/HotelVouchersPanel';

interface BookingDetail {
  _id: string;
  bookingReference: string;
  customer?: { user?: { fullName?: string; email?: string; phone?: string } };
  sourceType: string;
  tourPackage?: { name: string; heroImage?: string };
  itinerary?: { pricing?: { totalPrice?: number } };
  travelDate: string;
  returnDate?: string;
  travelers: { adults: number; children: number; infants: number };
  pricing: { subtotal: number; discount: number; totalAmount: number; advanceAmount: number; balanceAmount: number; amountPaid: number; currency: string };
  status: string;
  specialRequests: string;
  statusHistory: { status: string; note: string; at: string }[];
  createdAt: string;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  'Pending': ['Awaiting Approval', 'Cancelled'],
  'Awaiting Approval': ['Approved', 'Cancelled'],
  'Approved': ['Payment Pending', 'Cancelled'],
  'Payment Pending': ['Payment Verification', 'Cancelled'],
  'Payment Verification': ['Confirmed', 'Payment Pending', 'Cancelled'],
  'Confirmed': ['Completed', 'Cancelled'],
  'Completed': [],
  'Cancelled': []
};

const DOCUMENT_TYPES = [
{ label: 'Confirmation', path: 'confirmation' },
{ label: 'Invoice', path: 'invoice' },
{ label: 'Itinerary', path: 'itinerary' }];

export function AdminBookingDetail() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  const load = () => {
    if (!id) return;
    apiGetOne<BookingDetail>(`/bookings/${id}`).then(setBooking).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const changeStatus = (nextStatus: string) => {
    const isCancel = nextStatus === 'Cancelled';
    confirm({
      title: `${isCancel ? 'Cancel' : 'Update'} booking?`,
      message: `Move booking ${booking?.bookingReference} to "${nextStatus}"?`,
      confirmLabel: 'Confirm',
      tone: isCancel ? 'danger' : 'default',
      onConfirm: async () => {
        setTransitioning(true);
        try {
          await apiPatch(`/bookings/${id}/status`, { status: nextStatus, note });
          toast(`Booking updated to ${nextStatus}.`);
          setNote('');
          load();
        } catch (err) {
          toast(err instanceof ApiRequestError ? err.message : 'Failed to update status.', 'error');
        } finally {
          setTransitioning(false);
        }
      }
    });
  };

  const generateDocument = async (docPath: string, label: string) => {
    setGenerating(docPath);
    try {
      const result = await apiPost<{ fileUrl: string } | { fileUrl: string }[]>(`/documents/bookings/${id}/${docPath}`);
      const first = Array.isArray(result) ? result[0] : result;
      if (first?.fileUrl) {
        window.open(`${API_ORIGIN}${first.fileUrl}`, '_blank');
        toast(`${label} generated.`);
      }
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : `Failed to generate ${label}.`, 'error');
    } finally {
      setGenerating(null);
    }
  };

  if (loading || !booking) return <div className="grid h-64 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;

  const nextStatuses = VALID_TRANSITIONS[booking.status] || [];

  return (
    <div>
      <PageHeader
        title={`Booking ${booking.bookingReference}`}
        subtitle={`Created ${formatDateTime(booking.createdAt)}`}
        action={<button onClick={() => navigate('/admin/bookings')} className="rounded-full border border-forest/15 px-5 py-2.5 text-sm font-semibold text-forest hover:bg-cream">Back to list</button>} />


      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm font-semibold text-forest">Trip Details</p>
              <StatusBadge status={booking.status} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-forest/50">Package</p>
                <p className="mt-1 text-sm text-forest">{booking.tourPackage?.name || 'Customized Tour'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-forest/50">Source</p>
                <p className="mt-1 text-sm capitalize text-forest">{booking.sourceType}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-forest/50">Travel Date</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-forest"><CalendarIcon className="h-3.5 w-3.5" /> {formatDate(booking.travelDate)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-forest/50">Travelers</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-forest"><UsersIcon className="h-3.5 w-3.5" /> {booking.travelers.adults} Adults, {booking.travelers.children} Children, {booking.travelers.infants} Infants</p>
              </div>
            </div>
            {booking.specialRequests &&
            <div className="mt-4">
                <p className="text-xs font-semibold uppercase text-forest/50">Special Requests</p>
                <p className="mt-1 text-sm text-forest/70">{booking.specialRequests}</p>
              </div>
            }
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <p className="font-display text-sm font-semibold text-forest">Pricing</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-forest/60">Subtotal</span><span className="text-forest">${booking.pricing.subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-forest/60">Discount</span><span className="text-forest">-${booking.pricing.discount.toLocaleString()}</span></div>
              <div className="flex justify-between border-t border-forest/10 pt-2 font-semibold"><span className="text-forest">Total</span><span className="text-forest">${booking.pricing.totalAmount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-forest/60">Required Advance (30%)</span><span className="text-forest">${booking.pricing.advanceAmount.toLocaleString()}</span></div>
              <div className="flex justify-between border-t border-forest/10 pt-2"><span className="text-forest/60">Paid so far</span><span className="font-semibold text-emerald">${(booking.pricing.amountPaid || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-forest/60">Remaining</span><span className="font-semibold text-forest">${Math.max(Math.round((booking.pricing.totalAmount - (booking.pricing.amountPaid || 0)) * 100) / 100, 0).toLocaleString()}</span></div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <p className="font-display text-sm font-semibold text-forest">Status History</p>
            <div className="mt-3 space-y-3">
              {booking.statusHistory.length === 0 && <p className="text-sm text-forest/40">No history yet.</p>}
              {booking.statusHistory.map((h, i) =>
              <div key={i} className="flex items-start justify-between gap-3 border-b border-forest/5 pb-2.5 last:border-0">
                  <div>
                    <StatusBadge status={h.status} />
                    {h.note && <p className="mt-1 text-xs text-forest/60">{h.note}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-forest/40">{formatDateTime(h.at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <p className="font-display text-sm font-semibold text-forest">Customer</p>
            <p className="mt-3 text-sm font-medium text-forest">{booking.customer?.user?.fullName}</p>
            <p className="text-xs text-forest/60">{booking.customer?.user?.email}</p>
            <p className="text-xs text-forest/60">{booking.customer?.user?.phone}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <p className="font-display text-sm font-semibold text-forest">Update Status</p>
            {nextStatuses.length === 0 ?
            <p className="mt-3 text-sm text-forest/40">This booking is in a final state.</p> :

            <>
                <div className="mt-3"><TextAreaField label="Note (optional)" value={note} onChange={setNote} rows={2} /></div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {nextStatuses.map((s) =>
                <button
                  key={s}
                  disabled={transitioning}
                  onClick={() => changeStatus(s)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
                  s === 'Cancelled' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-forest text-cream hover:bg-emerald'}`
                  }>

                      {s}
                    </button>
                )}
                </div>
              </>
            }
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <p className="font-display text-sm font-semibold text-forest">Documents</p>
            <div className="mt-3 space-y-2">
              {DOCUMENT_TYPES.map((d) =>
              <button
                key={d.path}
                disabled={generating === d.path}
                onClick={() => generateDocument(d.path, d.label)}
                className="flex w-full items-center justify-between rounded-xl border border-forest/10 px-4 py-2.5 text-sm text-forest transition-colors hover:border-emerald hover:bg-emerald/5 disabled:opacity-60">

                  {d.label}
                  {generating === d.path ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <DownloadIcon className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <HotelVouchersPanel bookingId={id!} bookingStatus={booking.status} />
      </div>
    </div>);

}
