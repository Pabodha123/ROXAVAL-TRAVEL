import React, { useEffect, useState } from 'react';
import {
  ChevronDownIcon, ChevronUpIcon, DownloadIcon, Loader2Icon,
  MailIcon, PencilIcon, RefreshCwIcon, SparklesIcon, TrashIcon } from
'lucide-react';
import { apiGetOne, apiPatch, apiPost, apiDelete, ApiRequestError, resolveFileUrl } from '../../lib/api';
import { formatDate } from '../../lib/date';
import { useToast } from './ToastProvider';
import { useConfirm } from './ConfirmDialog';
import { StatusBadge } from './StatusBadge';
import { TextField, TextAreaField, NumberField, SelectField } from './fields/Fields';

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
  onDelete,
  onEmailHotel,
  onEmailCustomer,
  deleting,
  emailingHotel,
  emailingCustomer
}: {
  voucher: HotelVoucherItem;
  onSave: (patch: Partial<HotelVoucherItem>) => Promise<void>;
  onDelete: () => void;
  onEmailHotel: () => void;
  onEmailCustomer: () => void;
  deleting: boolean;
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

  const deletable = voucher.status !== 'Sent';

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
        <a href={resolveFileUrl(voucher.document.fileUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-forest/10 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-cream">
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
        {deletable &&
        <button onClick={onDelete} disabled={deleting} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">
            {deleting ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <TrashIcon className="h-3.5 w-3.5" />} Delete
          </button>
        }
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

// Reused wherever a Confirmed/Completed booking needs its per-hotel-stay
// vouchers managed — the regular Bookings Detail page, and the Custom Tour
// Request Detail page once a request's accepted itinerary has a linked
// booking. One voucher is generated automatically per consecutive hotel
// stay in the itinerary; see hotelVoucher.service.js#groupHotelStays.
export function HotelVouchersPanel({ bookingId, bookingStatus }: {bookingId: string;bookingStatus: string;}) {
  const toast = useToast();
  const confirm = useConfirm();

  const [vouchers, setVouchers] = useState<{ current: HotelVoucherItem[]; history: HotelVoucherItem[] }>({ current: [], history: [] });
  const [vouchersLoading, setVouchersLoading] = useState(true);
  const [generatingVouchers, setGeneratingVouchers] = useState(false);
  const [emailingVoucher, setEmailingVoucher] = useState<string | null>(null);
  const [deletingVoucher, setDeletingVoucher] = useState<string | null>(null);
  const [showVoucherHistory, setShowVoucherHistory] = useState(false);

  const canHaveVouchers = ['Confirmed', 'Completed'].includes(bookingStatus);

  const loadVouchers = () => {
    if (!bookingId) return;
    setVouchersLoading(true);
    apiGetOne<{ current: HotelVoucherItem[]; history: HotelVoucherItem[] }>(`/bookings/${bookingId}/hotel-vouchers`).
    then(setVouchers).
    finally(() => setVouchersLoading(false));
  };

  useEffect(loadVouchers, [bookingId]);

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
          await apiPost(`/bookings/${bookingId}/hotel-vouchers/generate`);
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

  const deleteVoucher = (voucherId: string, hotelName: string) => {
    confirm({
      title: 'Delete this hotel voucher?',
      message: `This permanently removes the voucher for ${hotelName}, including its PDF. This can't be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
      onConfirm: async () => {
        setDeletingVoucher(voucherId);
        try {
          await apiDelete(`/hotel-vouchers/${voucherId}`);
          toast('Voucher deleted.');
          loadVouchers();
        } catch (err) {
          toast(err instanceof ApiRequestError ? err.message : 'Failed to delete voucher.', 'error');
        } finally {
          setDeletingVoucher(null);
        }
      }
    });
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

  return (
    <div className="rounded-2xl bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-sm font-semibold text-forest">Hotel Vouchers</p>
          <p className="mt-0.5 text-xs text-forest/50">One voucher is generated automatically per consecutive hotel stay in the itinerary.</p>
        </div>
        {canHaveVouchers &&
        <button
          onClick={generateVouchers}
          disabled={generatingVouchers}
          className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald disabled:opacity-60">

            {generatingVouchers ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : vouchers.current.length > 0 ? <RefreshCwIcon className="h-3.5 w-3.5" /> : <SparklesIcon className="h-3.5 w-3.5" />}
            {vouchers.current.length > 0 ? 'Regenerate All Vouchers' : 'Generate Hotel Vouchers'}
          </button>
        }
      </div>

      {!canHaveVouchers &&
      <p className="mt-4 text-sm text-forest/40">Vouchers become available once this booking is Confirmed.</p>
      }

      {canHaveVouchers &&
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
            onDelete={() => deleteVoucher(v._id, v.hotelSnapshot.name)}
            onEmailHotel={() => emailVoucher(v._id, 'hotel')}
            onEmailCustomer={() => emailVoucher(v._id, 'customer')}
            deleting={deletingVoucher === v._id}
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
              <a href={resolveFileUrl(v.document.fileUrl)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-forest/60 hover:text-forest">
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
    </div>);

}
