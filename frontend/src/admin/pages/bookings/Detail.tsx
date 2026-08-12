import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CalendarIcon, ChevronDownIcon, ChevronUpIcon, DownloadIcon, Loader2Icon,
  MailIcon, PencilIcon, RefreshCwIcon, SparklesIcon, UsersIcon } from
'lucide-react';
import { apiGetOne, apiPatch, apiPost, ApiRequestError, API_ORIGIN } from '../../../lib/api';
import { formatDate, formatDateTime } from '../../../lib/date';
import { useToast } from '../../components/ToastProvider';
import { useConfirm } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { TextField, TextAreaField, NumberField, SelectField } from '../../components/fields/Fields';

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

const MEAL_PLAN_OPTIONS = ['Room Only', 'BB', 'HB', 'FB', 'AI'].map((v) => ({ label: v, value: v }));

interface HotelVoucherItem {
  _id: string;
  voucherNumber: string;
  hotel?: { _id: string; name: string };
  hotelSnapshot: { name: string; address?: string; contactEmail?: string };
  sequence: number;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  roomType: string;
  numberOfRooms: number;
  mealPlan: string;
  ratePerNight?: number;
  specialRequests: string;
  arrivalTime: string;
  departureTime: string;
  emergencyContact: string;
  customerEmail: string;
  status: 'Draft' | 'Generated' | 'Sent' | 'Superseded';
  document?: { _id: string; fileUrl: string; fileName: string };
  sentToHotelAt?: string;
  sentToCustomerAt?: string;
}


function VoucherCard({
  voucher,
  onSave,
  onEmailHotel,
  onEmailCustomer,
  emailingHotel,
  emailingCustomer
}: {
  voucher: HotelVoucherItem;
  onSave: (patch: Partial<HotelVoucherItem>) => Promise<void>;
  onEmailHotel: () => void;
  onEmailCustomer: () => void;
  emailingHotel: boolean;
  emailingCustomer: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roomType, setRoomType] = useState(voucher.roomType);
  const [numberOfRooms, setNumberOfRooms] = useState(voucher.numberOfRooms);
  const [mealPlan, setMealPlan] = useState(voucher.mealPlan);
  const [ratePerNight, setRatePerNight] = useState(voucher.ratePerNight || 0);
  const [specialRequests, setSpecialRequests] = useState(voucher.specialRequests);
  const [arrivalTime, setArrivalTime] = useState(voucher.arrivalTime);
  const [departureTime, setDepartureTime] = useState(voucher.departureTime);
  const [emergencyContact, setEmergencyContact] = useState(voucher.emergencyContact);

  const save = async () => {
    setSaving(true);
    try {
      await onSave({ roomType, numberOfRooms, mealPlan: mealPlan as HotelVoucherItem['mealPlan'], ratePerNight: ratePerNight || undefined, specialRequests, arrivalTime, departureTime, emergencyContact });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-forest/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-semibold text-forest/60">{voucher.voucherNumber}</p>
          <p className="mt-1 text-sm font-semibold text-forest">{voucher.hotelSnapshot.name}</p>
          <p className="mt-0.5 text-xs text-forest/50">
            {formatDate(voucher.checkInDate)} → {formatDate(voucher.checkOutDate)} · {voucher.nights} night{voucher.nights === 1 ? '' : 's'}
          </p>
          <p className="mt-0.5 text-xs text-forest/50">{voucher.numberOfRooms} × {voucher.roomType || 'Room'} · {voucher.mealPlan}</p>
        </div>
        <StatusBadge status={voucher.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {voucher.document &&
        <a href={`${API_ORIGIN}${voucher.document.fileUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-forest/10 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-cream">
            <DownloadIcon className="h-3.5 w-3.5" /> Preview / Download
          </a>
        }
        <button onClick={() => setEditing((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-forest/10 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-cream">
          <PencilIcon className="h-3.5 w-3.5" /> {editing ? 'Cancel' : 'Edit'}
        </button>
        <button onClick={onEmailHotel} disabled={emailingHotel} className="flex items-center gap-1.5 rounded-lg border border-forest/10 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-cream disabled:opacity-60">
          {emailingHotel ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <MailIcon className="h-3.5 w-3.5" />} Email Hotel
        </button>
        <button onClick={onEmailCustomer} disabled={emailingCustomer} className="flex items-center gap-1.5 rounded-lg border border-forest/10 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-cream disabled:opacity-60">
          {emailingCustomer ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <MailIcon className="h-3.5 w-3.5" />} Email Customer
        </button>
      </div>

      {editing &&
      <div className="mt-4 space-y-3 border-t border-forest/10 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Room Type" value={roomType} onChange={setRoomType} placeholder="e.g. Superior Sea View" />
            <NumberField label="Number of Rooms" value={numberOfRooms} onChange={setNumberOfRooms} min={1} />
            <SelectField label="Meal Plan" value={mealPlan} onChange={setMealPlan} options={MEAL_PLAN_OPTIONS} />
            <NumberField label="Rate Per Night (USD)" value={ratePerNight} onChange={setRatePerNight} min={0} />
            <TextField label="Arrival Time" value={arrivalTime} onChange={setArrivalTime} placeholder="e.g. 14:00" />
            <TextField label="Departure Time" value={departureTime} onChange={setDepartureTime} placeholder="e.g. 11:00" />
            <TextField label="Emergency Contact" value={emergencyContact} onChange={setEmergencyContact} />
          </div>
          <TextAreaField label="Special Requests" value={specialRequests} onChange={setSpecialRequests} rows={2} />
          <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-emerald disabled:opacity-60">
            {saving && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />} Save Changes
          </button>
        </div>
      }
    </div>);

}

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

  const [vouchers, setVouchers] = useState<{ current: HotelVoucherItem[]; history: HotelVoucherItem[] }>({ current: [], history: [] });
  const [vouchersLoading, setVouchersLoading] = useState(true);
  const [generatingVouchers, setGeneratingVouchers] = useState(false);
  const [emailingVoucher, setEmailingVoucher] = useState<string | null>(null);
  const [showVoucherHistory, setShowVoucherHistory] = useState(false);

  const load = () => {
    if (!id) return;
    apiGetOne<BookingDetail>(`/bookings/${id}`).then(setBooking).finally(() => setLoading(false));
  };

  const loadVouchers = () => {
    if (!id) return;
    setVouchersLoading(true);
    apiGetOne<{ current: HotelVoucherItem[]; history: HotelVoucherItem[] }>(`/bookings/${id}/hotel-vouchers`).
    then(setVouchers).
    finally(() => setVouchersLoading(false));
  };

  useEffect(load, [id]);
  useEffect(loadVouchers, [id]);

  const generateVouchers = () => {
    const isRegenerate = vouchers.current.length > 0;
    confirm({
      title: isRegenerate ? 'Regenerate hotel vouchers?' : 'Generate hotel vouchers?',
      message: isRegenerate ?
      'This marks all current vouchers as Superseded and creates a fresh set from the current itinerary. Superseded vouchers stay available in history.' :
      "This reads the confirmed itinerary day-by-day and creates one voucher per hotel stay.",
      confirmLabel: isRegenerate ? 'Regenerate' : 'Generate',
      onConfirm: async () => {
        setGeneratingVouchers(true);
        try {
          await apiPost(`/bookings/${id}/hotel-vouchers/generate`);
          toast('Hotel vouchers generated.');
          loadVouchers();
        } catch (err) {
          toast(err instanceof ApiRequestError ? err.message : 'Failed to generate hotel vouchers.', 'error');
        } finally {
          setGeneratingVouchers(false);
        }
      }
    });
  };

  const saveVoucher = async (voucherId: string, patch: Partial<HotelVoucherItem>) => {
    try {
      await apiPatch(`/hotel-vouchers/${voucherId}`, patch);
      toast('Voucher updated.');
      loadVouchers();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to update voucher.', 'error');
    }
  };

  const emailVoucher = async (voucherId: string, audience: 'hotel' | 'customer') => {
    setEmailingVoucher(`${voucherId}-${audience}`);
    try {
      await apiPost(`/hotel-vouchers/${voucherId}/email-${audience}`);
      toast(`Voucher emailed to ${audience}.`);
      loadVouchers();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : `Failed to email voucher to ${audience}.`, 'error');
    } finally {
      setEmailingVoucher(null);
    }
  };

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

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-sm font-semibold text-forest">Hotel Vouchers</p>
            <p className="mt-0.5 text-xs text-forest/50">One voucher is generated automatically per consecutive hotel stay in the itinerary.</p>
          </div>
          {['Confirmed', 'Completed'].includes(booking.status) &&
          <button
            onClick={generateVouchers}
            disabled={generatingVouchers}
            className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald disabled:opacity-60">

              {generatingVouchers ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : vouchers.current.length > 0 ? <RefreshCwIcon className="h-3.5 w-3.5" /> : <SparklesIcon className="h-3.5 w-3.5" />}
              {vouchers.current.length > 0 ? 'Regenerate All Vouchers' : 'Generate Hotel Vouchers'}
            </button>
          }
        </div>

        {!['Confirmed', 'Completed'].includes(booking.status) &&
        <p className="mt-4 text-sm text-forest/40">Vouchers become available once this booking is Confirmed.</p>
        }

        {['Confirmed', 'Completed'].includes(booking.status) &&
        <div className="mt-4">
            {vouchersLoading ?
          <div className="grid h-24 place-items-center"><Loader2Icon className="h-5 w-5 animate-spin text-forest/40" /></div> :
          vouchers.current.length === 0 ?
          <p className="text-sm text-forest/40">No vouchers generated yet.</p> :

          <div className="grid gap-4 lg:grid-cols-2">
                {vouchers.current.map((v) =>
            <VoucherCard
              key={v._id}
              voucher={v}
              onSave={(patch) => saveVoucher(v._id, patch)}
              onEmailHotel={() => emailVoucher(v._id, 'hotel')}
              onEmailCustomer={() => emailVoucher(v._id, 'customer')}
              emailingHotel={emailingVoucher === `${v._id}-hotel`}
              emailingCustomer={emailingVoucher === `${v._id}-customer`} />

            )}
              </div>
          }

            {vouchers.history.length > 0 &&
          <div className="mt-5 border-t border-forest/10 pt-4">
                <button onClick={() => setShowVoucherHistory((v) => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-forest/60 hover:text-forest">
                  {showVoucherHistory ? <ChevronUpIcon className="h-3.5 w-3.5" /> : <ChevronDownIcon className="h-3.5 w-3.5" />}
                  Voucher History ({vouchers.history.length})
                </button>
                {showVoucherHistory &&
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    {vouchers.history.map((v) =>
              <div key={v._id} className="rounded-xl border border-forest/10 bg-cream/30 p-4 opacity-70">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-mono text-xs font-semibold text-forest/50">{v.voucherNumber}</p>
                            <p className="mt-1 text-sm font-medium text-forest/70">{v.hotelSnapshot.name}</p>
                            <p className="mt-0.5 text-xs text-forest/40">{formatDate(v.checkInDate)} → {formatDate(v.checkOutDate)}</p>
                          </div>
                          <StatusBadge status={v.status} />
                        </div>
                        {v.document &&
                <a href={`${API_ORIGIN}${v.document.fileUrl}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-forest/60 hover:text-forest">
                            <DownloadIcon className="h-3.5 w-3.5" /> Download
                          </a>
                }
                      </div>
              )}
                  </div>
            }
              </div>
          }
          </div>
        }
      </div>
    </div>);

}
