import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CalendarIcon, UsersIcon, DownloadIcon, Loader2Icon, MapPinIcon,
  BedDoubleIcon, MessageCircleIcon, PackageIcon, SendIcon, CheckIcon,
  XCircleIcon, SparklesIcon, StarIcon, CompassIcon, ChevronDownIcon, ExternalLinkIcon, TargetIcon } from
'lucide-react';
import { useAdminList } from '../admin/hooks/useAdminList';
import { StatusBadge } from '../admin/components/StatusBadge';
import { apiGetList, apiGetOne, apiPatch, apiPost, apiPostForm, ApiRequestError, documentFileUrl } from '../lib/api';
import { formatDate } from '../lib/date';
import { useToast } from '../context/ToastContext';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { BookingModal, BookingSource } from '../components/booking/BookingModal';
import { NotesBlock } from '../components/quotation/NotesBlock';
import { BackButton } from '../components/ui/BackButton';
import { Timeline } from '../components/ui/Timeline';
import { resolveRequestStage, resolveFullStage } from '../lib/tourTimeline';
import { MessagingPanel } from '../components/messaging/MessagingPanel';
import { CustomerDashboardSummary } from '../components/dashboard/CustomerDashboardSummary';
import { CountdownWidget } from '../components/dashboard/CountdownWidget';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import type { Review } from '../types/review';

interface BookingItem {
  _id: string;
  bookingReference: string;
  sourceType: string;
  tourPackage?: { _id: string; name: string; heroImage?: string };
  itinerary?: { _id: string; title?: string; pricing?: { totalPrice: number } };
  travelDate: string;
  travelers: { adults: number; children: number; infants: number };
  pricing: { subtotal: number; discount: number; totalAmount: number; advanceAmount: number; balanceAmount: number; amountPaid: number; currency: string };
  status: string;
  specialRequests: string;
  statusHistory: { status: string; note: string; at: string }[];
  createdAt: string;
}

interface HotelRef {
  _id: string;
  name: string;
  category?: string;
  starRating?: number;
}

interface ActivityPricingEntry {
  activity?: { _id: string; name: string; category?: string };
  adultCount: number;
  childCount: number;
  infantCount: number;
  selected?: boolean;
}

interface ItineraryDay {
  dayNumber: number;
  title: string;
  schedule: string;
  hotel?: HotelRef;
  roomType?: string;
  meals?: string[];
  transport?: string;
  arrivalTime?: string;
  departureTime?: string;
  travelTime?: string;
  activityPricing?: ActivityPricingEntry[];
  customDestinations?: string[];
  customActivities?: string[];
  notes?: string;
}

interface ItineraryDetail {
  _id: string;
  title: string;
  summary: string;
  days: ItineraryDay[];
  hotels: HotelRef[];
  pricing: { basePrice: number; discount: number; totalPrice: number; currency: string; pricePerPerson: boolean };
  customerFacingNotes: string;
  status: 'Draft' | 'Sent' | 'Changes Requested' | 'Accepted' | 'Rejected';
}

interface AiItineraryDay {
  dayNumber: number;
  title: string;
  schedule: string;
  destinations?: { _id: string; name: string }[];
  activities?: { _id: string; name: string }[];
  hotel?: { _id: string; name: string };
  meals?: string[];
}

interface AiGeneratedItinerary {
  summary: string;
  days: AiItineraryDay[];
  estimatedTotal?: number;
  currency: string;
}

interface CustomRequestItem {
  _id: string;
  referenceNumber: string;
  travelDates: { startDate: string; endDate: string; isFlexible: boolean };
  travelers: { adults: number; children: number; infants: number };
  hotelCategory: string;
  mealPreferences: string[];
  travelStyle: string;
  estimatedBudget: { amount: number; currency: string; perPerson: boolean };
  specialRequests: string;
  status: string;
  itinerary?: ItineraryDetail;
  aiGeneratedItinerary?: AiGeneratedItinerary;
  revisionHistory: { action: string; note: string; at: string }[];
  createdAt: string;
}

interface DocumentItem {
  _id: string;
  type: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
}

const DOC_LABELS: Record<string, string> = {
  itinerary: 'Itinerary',
  hotel_voucher: 'Hotel Voucher',
  booking_confirmation: 'Booking Confirmation',
  invoice: 'Invoice',
  payment_receipt: 'Payment Receipt',
  quotation: 'Quotation'
};

function BookingDocuments({ bookingId }: { bookingId: string }) {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGetList<DocumentItem>('/documents/my-documents', { booking: bookingId, limit: 20 }).
    then(({ data }) => setDocs(data)).
    catch(() => setDocs([])).
    finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <p className="text-sm text-forest/40">Loading documents…</p>;
  if (docs.length === 0) return <p className="text-sm text-forest/40">No documents generated yet.</p>;

  return (
    <div className="space-y-2">
      {docs.map((d) =>
      <a
        key={d._id}
        href={documentFileUrl(d._id)}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between rounded-xl border border-forest/10 px-4 py-2.5 text-sm text-forest transition-colors hover:border-emerald hover:bg-emerald/5">

          {DOC_LABELS[d.type] || d.type}
          <DownloadIcon className="h-4 w-4" />
        </a>
      )}
    </div>);

}

function PayNowPanel({ booking, onPaid }: {booking: BookingItem;onPaid: () => void;}) {
  const toast = useToast();
  const remaining = Math.max(Math.round((booking.pricing.totalAmount - (booking.pricing.amountPaid || 0)) * 100) / 100, 0);
  const [method, setMethod] = useState<'bank_transfer' | 'whatsapp' | 'cash'>('bank_transfer');
  const [paymentType, setPaymentType] = useState<'advance' | 'balance' | 'full'>('advance');
  const [amount, setAmount] = useState(Math.min(booking.pricing.advanceAmount, remaining));
  const [bankReference, setBankReference] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);

  // 'balance' and 'full' both mean "pay off what's left" — using the actual
  // remaining amount (not the static at-booking-time balanceAmount) so this
  // stays correct even after a partial payment has already been verified.
  const handlePaymentTypeChange = (type: 'advance' | 'balance' | 'full') => {
    setPaymentType(type);
    setAmount(type === 'advance' ? Math.min(booking.pricing.advanceAmount, remaining) : remaining);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const { payment, whatsappLink: link } = await apiPost<{ payment: { _id: string }; whatsappLink?: string }>('/payments', {
        booking: booking._id,
        method,
        paymentType,
        amount,
        currency: booking.pricing.currency,
        bankReference: bankReference || undefined
      });

      if (method === 'bank_transfer' && receipt) {
        const formData = new FormData();
        formData.append('receipt', receipt);
        await apiPostForm(`/payments/${payment._id}/receipt`, formData);
      }

      if (link) {
        setWhatsappLink(link);
        window.open(link, '_blank');
      }

      toast('Payment submitted - our team will verify it shortly.');
      onPaid();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to submit payment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {(['advance', 'balance', 'full'] as const).map((t) =>
        <button key={t} onClick={() => handlePaymentTypeChange(t)} className={`rounded-xl py-2 text-xs font-semibold capitalize transition-colors ${paymentType === t ? 'bg-emerald text-white' : 'bg-cream text-forest hover:bg-emerald/10'}`}>{t}</button>
        )}
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-forest/70">Amount ({booking.pricing.currency})</label>
        <input type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full rounded-xl border border-forest/15 px-3 py-2 text-sm outline-none focus:border-emerald" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-forest/70">Payment Method</label>
        <select value={method} onChange={(e) => setMethod(e.target.value as typeof method)} className="w-full rounded-xl border border-forest/15 px-3 py-2 text-sm outline-none focus:border-emerald">
          <option value="bank_transfer">Bank Transfer</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="cash">Cash on Arrival</option>
        </select>
      </div>
      {method === 'bank_transfer' &&
      <>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-forest/70">Bank Reference (optional)</label>
            <input type="text" value={bankReference} onChange={(e) => setBankReference(e.target.value)} className="w-full rounded-xl border border-forest/15 px-3 py-2 text-sm outline-none focus:border-emerald" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-forest/70">Upload Receipt</label>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setReceipt(e.target.files?.[0] || null)} className="w-full text-xs text-forest/70" />
          </div>
        </>
      }
      <button onClick={submit} disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-forest transition-transform hover:scale-[1.02] disabled:opacity-70">
        {submitting && <Loader2Icon className="h-4 w-4 animate-spin" />}
        Submit Payment
      </button>
      {whatsappLink &&
      <a href={whatsappLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald hover:underline">
          <MessageCircleIcon className="h-3.5 w-3.5" /> Reopen WhatsApp chat
        </a>
      }
    </div>);

}

function ReviewPanel({ booking, myReview, onSubmitted }: {booking: BookingItem;myReview?: Review;onSubmitted: () => void;}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [country, setCountry] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (myReview) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-soft">
        <p className="font-display text-sm font-semibold text-forest">Your Review</p>
        <div className="mt-2 flex gap-0.5 text-gold">
          {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} className={`h-4 w-4 ${i < myReview.rating ? 'fill-gold' : 'fill-none text-forest/20'}`} />)}
        </div>
        <p className="mt-2 text-sm text-forest/60">{myReview.text}</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-forest/40">
          {myReview.status === 'approved' ? 'Published' : myReview.status === 'rejected' ? 'Not approved' : 'Pending approval'}
        </p>
      </div>);

  }

  const submit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await apiPost('/reviews', { booking: booking._id, tourPackage: booking.tourPackage?._id, rating, title, text, country });
      toast('Thank you - your review has been submitted for approval.');
      setOpen(false);
      onSubmitted();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to submit review.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-soft">
      <p className="font-display text-sm font-semibold text-forest">Leave a Review</p>
      {!open ?
      <button onClick={() => setOpen(true)} className="mt-3 flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-forest transition-transform hover:scale-105">
          <StarIcon className="h-4 w-4" /> Leave a Review
        </button> :

      <div className="mt-3 space-y-3">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) =>
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star`}>
                <StarIcon className={`h-6 w-6 ${n <= rating ? 'fill-gold text-gold' : 'fill-none text-forest/20'}`} />
              </button>
          )}
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Review title (optional)" className="w-full rounded-xl border border-forest/15 px-4 py-2.5 text-sm outline-none focus:border-emerald" />
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} minLength={10} placeholder="Tell other travelers about your experience…" className="w-full rounded-xl border border-forest/15 px-4 py-2.5 text-sm outline-none focus:border-emerald" />
          <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Your country (optional)" className="w-full rounded-xl border border-forest/15 px-4 py-2.5 text-sm outline-none focus:border-emerald" />
          <div className="flex gap-2">
            <button onClick={submit} disabled={submitting || text.trim().length < 10} className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald disabled:opacity-60">
              {submitting && <Loader2Icon className="h-4 w-4 animate-spin" />} Submit Review
            </button>
            <button onClick={() => setOpen(false)} className="rounded-full border border-forest/15 px-5 py-2.5 text-sm font-semibold text-forest hover:bg-cream">Cancel</button>
          </div>
        </div>
      }
    </div>);

}

function BookingsTab({ initialSelectedId }: {initialSelectedId?: string;}) {
  const { items, loading, error, refetch } = useAdminList<BookingItem>('/bookings/my-bookings', {}, 20);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId || null);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [showRawHistory, setShowRawHistory] = useState(false);

  useEffect(() => {
    if (!selectedId && items.length > 0) setSelectedId(items[0]._id);
  }, [items, selectedId]);

  const loadMyReviews = () => {
    apiGetOne<Review[]>('/reviews/my-reviews').then(setMyReviews).catch(() => {});
  };

  useEffect(loadMyReviews, []);

  const selected = items.find((b) => b._id === selectedId) || null;

  if (loading) return <div className="grid h-64 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (items.length === 0) return <p className="rounded-2xl bg-white p-10 text-center text-sm text-forest/50 shadow-soft">You have no bookings yet - book a package to see it here.</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <div className="space-y-3">
        {items.map((b) =>
        <button
          key={b._id}
          onClick={() => setSelectedId(b._id)}
          className={`block w-full rounded-2xl border p-4 text-left transition-colors ${selectedId === b._id ? 'border-emerald bg-emerald/5' : 'border-forest/10 bg-white hover:border-emerald/40'}`}>

            <div className="flex items-center justify-between">
              <p className="font-mono text-xs font-semibold text-forest/60">{b.bookingReference}</p>
              <StatusBadge status={b.status} />
            </div>
            <p className="mt-1.5 text-sm font-semibold text-forest">{b.tourPackage?.name || b.itinerary?.title || 'Customized Tour'}</p>
            <p className="mt-1 text-xs text-forest/50">{formatDate(b.travelDate)}</p>
          </button>
        )}
      </div>

      {selected &&
      <div className="space-y-5">
          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-forest">{selected.tourPackage?.name || selected.itinerary?.title || 'Customized Tour'}</p>
              <StatusBadge status={selected.status} />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
              <p className="flex items-center gap-1.5 text-forest/70"><CalendarIcon className="h-4 w-4" /> {formatDate(selected.travelDate)}</p>
              <p className="flex items-center gap-1.5 text-forest/70"><UsersIcon className="h-4 w-4" /> {selected.travelers.adults} Adults, {selected.travelers.children} Children</p>
            </div>
            {selected.specialRequests && <p className="mt-3 text-sm text-forest/60">{selected.specialRequests}</p>}

            <div className="mt-5 space-y-1.5 border-t border-forest/10 pt-4 text-sm">
              <div className="flex justify-between"><span className="text-forest/60">Total</span><span className="font-semibold text-forest">{selected.pricing.currency} {selected.pricing.totalAmount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-forest/60">Advance (30%)</span><span className="text-forest">{selected.pricing.currency} {selected.pricing.advanceAmount.toLocaleString()}</span></div>
              <div className="flex justify-between border-t border-forest/10 pt-1.5"><span className="text-forest/60">Paid so far</span><span className="font-semibold text-emerald">{selected.pricing.currency} {(selected.pricing.amountPaid || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-forest/60">Remaining</span><span className="font-semibold text-forest">{selected.pricing.currency} {Math.max(Math.round((selected.pricing.totalAmount - (selected.pricing.amountPaid || 0)) * 100) / 100, 0).toLocaleString()}</span></div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <p className="font-display text-sm font-semibold text-forest">Tour Progress</p>
            {/* Once a Booking exists, its parent CustomTourRequest is always 'Booking Confirmed'
                (see booking.service.js) - package-sourced bookings never have a request at all -
                so the pre-booking stages are always treated as already passed here. */}
            <Timeline
              className="mt-4"
              {...resolveFullStage({ requestStatus: 'Booking Confirmed', bookingStatus: selected.status })} />

            <button onClick={() => setShowRawHistory((v) => !v)} className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-forest/50 hover:text-forest">
              <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${showRawHistory ? 'rotate-180' : ''}`} /> {showRawHistory ? 'Hide' : 'Show'} full status log
            </button>
            {showRawHistory &&
            <div className="mt-3 space-y-2.5">
                {selected.statusHistory.map((h, i) =>
              <div key={i} className="flex items-center justify-between border-b border-forest/5 pb-2 last:border-0">
                    <StatusBadge status={h.status} />
                    <span className="text-xs text-forest/40">{formatDate(h.at)}</span>
                  </div>
              )}
              </div>
            }
          </div>

          {selected.status === 'Payment Pending' &&
        <div className="rounded-2xl bg-white p-6 shadow-soft">
              <p className="font-display text-sm font-semibold text-forest">Pay Now</p>
              <div className="mt-3"><PayNowPanel booking={selected} onPaid={refetch} /></div>
            </div>
        }

          {selected.status === 'Completed' &&
        <ReviewPanel booking={selected} myReview={myReviews.find((r) => r.booking === selected._id)} onSubmitted={loadMyReviews} />
        }

          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <p className="font-display text-sm font-semibold text-forest">Documents</p>
            <div className="mt-3"><BookingDocuments bookingId={selected._id} /></div>
          </div>
        </div>
      }
    </div>);

}

function RequestsTab({ initialSelectedId, onBookingCreated }: {initialSelectedId?: string;onBookingCreated: (bookingId: string) => void;}) {
  const { items, loading, error, refetch } = useAdminList<CustomRequestItem>('/custom-tours/my-requests', {}, 20);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId || null);
  const [note, setNote] = useState('');
  const [acting, setActing] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const messagingRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (!selectedId && items.length > 0) setSelectedId(items[0]._id);
  }, [items, selectedId]);

  const selected = items.find((r) => r._id === selectedId) || null;

  const accept = async () => {
    if (!selected) return;
    setActing(true);
    try {
      await apiPatch(`/custom-tours/${selected._id}/accept`);
      toast('Itinerary accepted - you can now book it.');
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to accept itinerary.', 'error');
    } finally {
      setActing(false);
    }
  };

  const requestChanges = async () => {
    if (!selected || !note.trim()) return;
    setActing(true);
    try {
      await apiPatch(`/custom-tours/${selected._id}/request-changes`, { note });
      toast('Change request sent to our travel experts.');
      setNote('');
      setRequestChangesOpen(false);
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to send change request.', 'error');
    } finally {
      setActing(false);
    }
  };

  const reject = async () => {
    if (!selected) return;
    setActing(true);
    try {
      await apiPatch(`/custom-tours/${selected._id}/reject`);
      toast('Itinerary rejected. You can submit a new inquiry or request changes.');
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to reject itinerary.', 'error');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <div className="grid h-64 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (items.length === 0) return <p className="rounded-2xl bg-white p-10 text-center text-sm text-forest/50 shadow-soft">You haven't submitted a custom tour request yet.</p>;

  const itin = selected?.itinerary;
  const bookingSource: BookingSource | null = itin ? {
    type: 'itinerary',
    id: itin._id,
    name: itin.title,
    price: itin.pricing.totalPrice,
    currency: itin.pricing.currency,
    defaultTravelDate: selected?.travelDates.startDate,
    defaultTravelers: selected?.travelers
  } : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <div className="space-y-3">
        {items.map((r) =>
        <button
          key={r._id}
          onClick={() => { setSelectedId(r._id); setShowComparison(false); }}
          className={`block w-full rounded-2xl border p-4 text-left transition-colors ${selectedId === r._id ? 'border-emerald bg-emerald/5' : 'border-forest/10 bg-white hover:border-emerald/40'}`}>

            <div className="flex items-center justify-between">
              <p className="font-mono text-xs font-semibold text-forest/60">{r.referenceNumber}</p>
              <StatusBadge status={r.status} />
            </div>
            <p className="mt-1.5 text-xs text-forest/50">{formatDate(r.travelDates.startDate)} - {r.travelers.adults + r.travelers.children} travelers</p>
          </button>
        )}
      </div>

      {selected &&
      <div className="space-y-5">
          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-forest">Request {selected.referenceNumber}</p>
              <StatusBadge status={selected.status} />
            </div>
            <Timeline
              className="mt-5"
              {...resolveRequestStage({ requestStatus: selected.status, itineraryStatus: itin?.status })} />

            <div className="mt-5 grid gap-3 sm:grid-cols-2 text-sm">
              <p className="flex items-center gap-1.5 text-forest/70"><CalendarIcon className="h-4 w-4" /> {formatDate(selected.travelDates.startDate)} – {formatDate(selected.travelDates.endDate)}</p>
              <p className="flex items-center gap-1.5 text-forest/70"><UsersIcon className="h-4 w-4" /> {selected.travelers.adults} Adults, {selected.travelers.children} Children</p>
              <p className="text-forest/70">Hotel: {selected.hotelCategory}</p>
              <p className="text-forest/70">Style: {selected.travelStyle}</p>
            </div>
            {selected.specialRequests && <p className="mt-3 text-sm text-forest/60">{selected.specialRequests}</p>}
          </div>

          {(() => {
            const lastEntry = selected.revisionHistory[selected.revisionHistory.length - 1];
            if (!lastEntry || lastEntry.action !== 'cannot_modify') return null;
            return (
              <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5">
                <p className="text-sm font-semibold text-forest">A note from our travel experts</p>
                <p className="mt-1.5 text-sm text-forest/70">{lastEntry.note}</p>
              </div>);

          })()}

          {itin ?
        <div className="rounded-2xl bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-semibold text-forest">{itin.title}</p>
                <StatusBadge status={itin.status} />
              </div>
              {itin.summary && <p className="mt-2 text-sm text-forest/60">{itin.summary}</p>}

              <Link to={`/my-tours/requests/${selected._id}/quotation`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]">
                <ExternalLinkIcon className="h-3.5 w-3.5" /> View Full Quotation
              </Link>

              <div className="mt-4 space-y-3">
                {itin.days.map((d) =>
            <div key={d.dayNumber} className="flex gap-3 rounded-xl bg-cream/50 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald text-xs font-bold text-white">{d.dayNumber}</div>
                    <div>
                      <p className="text-sm font-semibold text-forest">{d.title}</p>
                      {d.schedule && <p className="mt-1 text-xs leading-relaxed text-forest/60">{d.schedule}</p>}
                      {d.hotel &&
                  <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-forest/60">
                          <BedDoubleIcon className="h-3.5 w-3.5 text-forest/35" /> {d.hotel.name}{d.roomType ? ` (${d.roomType})` : ''}
                        </p>
                  }
                      {d.activityPricing && d.activityPricing.filter((a) => a.selected !== false && a.activity).length > 0 &&
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {d.activityPricing.filter((a) => a.selected !== false && a.activity).map((a, i) =>
                    <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-forest/60">
                              <TargetIcon className="h-3.5 w-3.5 text-forest/35" /> {a.activity?.name}
                            </span>
                    )}
                        </div>
                  }
                      {(d.arrivalTime || d.departureTime) &&
                  <p className="mt-1.5 text-xs text-forest/50">
                          {d.arrivalTime && <span>Arrive {d.arrivalTime}</span>}
                          {d.departureTime && <span>{d.arrivalTime ? ' · ' : ''}Depart {d.departureTime}</span>}
                        </p>
                  }
                      {((d.customDestinations && d.customDestinations.length > 0) || (d.customActivities && d.customActivities.length > 0)) &&
                  <p className="mt-1 text-xs italic text-forest/40">{[...(d.customDestinations || []), ...(d.customActivities || [])].join(', ')}</p>
                  }
                    </div>
                  </div>
            )}
              </div>

              {itin.customerFacingNotes &&
          <div className="mt-5 rounded-xl bg-cream/50 p-4">
                  <NotesBlock text={itin.customerFacingNotes} />
                </div>
          }

              <div className="mt-4 flex items-center justify-between border-t border-forest/10 pt-4">
                <span className="text-sm text-forest/60">Total Price</span>
                <span className="font-display text-xl font-semibold text-forest">{itin.pricing.currency} {itin.pricing.totalPrice.toLocaleString()}{itin.pricing.pricePerPerson ? ' / person' : ''}</span>
              </div>

              {itin.status === 'Sent' &&
          <div className="mt-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={accept} disabled={acting} className="flex items-center justify-center gap-2 rounded-2xl bg-gold px-5 py-3.5 text-sm font-semibold text-forest transition-transform hover:scale-[1.02] disabled:opacity-60">
                      <CheckIcon className="h-4 w-4" /> Accept Tour
                    </button>
                    <button onClick={() => setRequestChangesOpen((v) => !v)} className="flex items-center justify-center gap-2 rounded-2xl border border-forest/15 px-5 py-3.5 text-sm font-semibold text-forest transition-colors hover:bg-cream">
                      <SendIcon className="h-4 w-4" /> Request Changes
                    </button>
                    <Link to="/packages#custom-tour" className="flex items-center justify-center gap-2 rounded-2xl border border-forest/15 px-5 py-3.5 text-sm font-semibold text-forest transition-colors hover:bg-cream">
                      <CompassIcon className="h-4 w-4" /> Plan Another Tour
                    </Link>
                    <button onClick={() => messagingRef.current?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center justify-center gap-2 rounded-2xl border border-forest/15 px-5 py-3.5 text-sm font-semibold text-forest transition-colors hover:bg-cream">
                      <MessageCircleIcon className="h-4 w-4" /> Contact Roxaval
                    </button>
                  </div>

                  {requestChangesOpen &&
              <div className="flex gap-2">
                      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What would you like changed?" className="flex-1 rounded-full border border-forest/15 px-4 py-2.5 text-sm outline-none focus:border-emerald" autoFocus />
                      <button onClick={requestChanges} disabled={acting || !note.trim()} className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                        <SendIcon className="h-4 w-4" /> Send
                      </button>
                    </div>
              }

                  <button onClick={reject} disabled={acting} className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline disabled:opacity-60">
                    <XCircleIcon className="h-3.5 w-3.5" /> Reject Itinerary
                  </button>
                </div>
          }

              {itin.status === 'Rejected' &&
          <div className="mt-5 flex gap-2">
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What would you like changed?" className="flex-1 rounded-full border border-forest/15 px-4 py-2.5 text-sm outline-none focus:border-emerald" />
                  <button onClick={requestChanges} disabled={acting || !note.trim()} className="flex items-center gap-2 rounded-full border border-forest/20 px-5 py-2.5 text-sm font-semibold text-forest disabled:opacity-60">
                    <SendIcon className="h-4 w-4" /> Request Changes
                  </button>
                </div>
          }

              {itin.status === 'Accepted' &&
          <button onClick={() => setBookingOpen(true)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-forest transition-transform hover:scale-[1.02]">
                  <PackageIcon className="h-4 w-4" /> Book This Itinerary
                </button>
          }

              {selected.aiGeneratedItinerary &&
          <div className="mt-5 border-t border-forest/10 pt-4">
                  <button onClick={() => setShowComparison((v) => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-emerald hover:underline">
                    <SparklesIcon className="h-3.5 w-3.5" /> {showComparison ? 'Hide' : 'Compare with your original AI itinerary'}
                  </button>
                  {showComparison &&
            <div className="mt-3 rounded-xl bg-cream/50 p-4">
                      {selected.aiGeneratedItinerary.summary && <p className="text-xs text-forest/60">{selected.aiGeneratedItinerary.summary}</p>}
                      <div className="mt-3 space-y-2.5">
                        {selected.aiGeneratedItinerary.days.map((d) =>
                  <div key={d.dayNumber} className="rounded-lg bg-white p-3">
                            <p className="text-xs font-semibold text-forest">Day {d.dayNumber}: {d.title}</p>
                            <p className="mt-1 text-xs text-forest/60">{d.schedule}</p>
                            {d.hotel && <p className="mt-1 text-xs text-forest/45">{d.hotel.name}</p>}
                          </div>
                  )}
                      </div>
                      {selected.aiGeneratedItinerary.estimatedTotal &&
              <p className="mt-3 text-xs text-forest/50">AI-estimated total: {selected.aiGeneratedItinerary.currency} {selected.aiGeneratedItinerary.estimatedTotal.toLocaleString()}</p>
              }
                    </div>
            }
                </div>
          }
            </div> :

        <div className="rounded-2xl bg-white p-6 text-center shadow-soft">
              <p className="text-sm text-forest/50">Our travel experts are preparing your personalized itinerary. You'll be notified as soon as it's ready.</p>

              {selected.aiGeneratedItinerary &&
          <div className="mt-5 border-t border-forest/10 pt-4 text-left">
                  <button onClick={() => setShowComparison((v) => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-emerald hover:underline">
                    <SparklesIcon className="h-3.5 w-3.5" /> {showComparison ? 'Hide' : 'View your original AI itinerary'}
                  </button>
                  {showComparison &&
            <div className="mt-3 space-y-2.5">
                      {selected.aiGeneratedItinerary.days.map((d) =>
              <div key={d.dayNumber} className="rounded-lg bg-cream/50 p-3">
                          <p className="text-xs font-semibold text-forest">Day {d.dayNumber}: {d.title}</p>
                          <p className="mt-1 text-xs text-forest/60">{d.schedule}</p>
                        </div>
              )}
                    </div>
            }
                </div>
          }
            </div>
        }

          <div ref={messagingRef}>
            <MessagingPanel requestId={selected._id} />
          </div>
        </div>
      }

      {bookingSource &&
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        source={bookingSource}
        onSuccess={(booking) => {
          setBookingOpen(false);
          onBookingCreated(booking._id);
        }} />

      }
    </div>);

}

export function MyTours() {
  const { t } = useTranslation('dashboard');
  const { section, id } = useParams<{section?: string;id?: string;}>();
  const [tab, setTab] = useState<'bookings' | 'requests'>(section === 'requests' ? 'requests' : 'bookings');
  const [selectedBookingId, setSelectedBookingId] = useState<string | undefined>(section === 'bookings' ? id : undefined);
  const requestsUnread = useUnreadCount('CustomTourRequest');

  const handleBookingCreated = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setTab('bookings');
  };

  return (
    <main className="min-h-screen bg-cream pt-28 pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <BackButton className="mb-6" />
        <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">{t('myTours.title')}</h1>
        <p className="mt-2 text-forest/60">{t('myTours.subtitle')}</p>

        <div className="mt-8"><CustomerDashboardSummary /></div>
        <CountdownWidget />
        <RecentActivityFeed />

        <div className="mt-8 inline-flex rounded-full bg-white p-1 shadow-soft">
          <button onClick={() => setTab('bookings')} className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${tab === 'bookings' ? 'bg-forest text-white' : 'text-forest/60 hover:text-forest'}`}>
            <span className="flex items-center gap-2"><MapPinIcon className="h-4 w-4" /> {t('myTours.bookings')}</span>
          </button>
          <button onClick={() => setTab('requests')} className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${tab === 'requests' ? 'bg-forest text-white' : 'text-forest/60 hover:text-forest'}`}>
            <span className="flex items-center gap-2"><PackageIcon className="h-4 w-4" /> {t('myTours.customRequests')}</span>
            {requestsUnread > 0 &&
            <span className={`grid h-5 min-w-[1.25rem] place-items-center rounded-full px-1 text-[10px] font-bold ${tab === 'requests' ? 'bg-gold text-forest' : 'bg-gold/90 text-forest'}`}>
                {requestsUnread > 9 ? '9+' : requestsUnread}
              </span>
            }
          </button>
        </div>

        <div className="mt-8">
          {tab === 'bookings' ? <BookingsTab initialSelectedId={selectedBookingId} /> : <RequestsTab initialSelectedId={section === 'requests' ? id : undefined} onBookingCreated={handleBookingCreated} />}
        </div>
      </div>
    </main>);

}
