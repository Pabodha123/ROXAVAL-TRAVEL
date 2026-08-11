import React, { useState } from 'react';
import { CheckCircle2Icon, CreditCardIcon, Loader2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { apiPost, ApiRequestError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export interface BookingSource {
  type: 'package' | 'itinerary';
  id: string;
  name: string;
  price: number;
  currency: string;
  minTravelers?: number;
  maxTravelers?: number;
  // Known from the accepted custom tour request — pre-fills the form instead
  // of asking the customer to re-enter what they already told us.
  defaultTravelDate?: string;
  defaultTravelers?: { adults: number; children: number; infants: number };
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  source: BookingSource;
  onSuccess: (booking: { _id: string; bookingReference: string }) => void;
}

export function BookingModal({ open, onClose, source, onSuccess }: BookingModalProps) {
  const { t } = useTranslation('booking');
  const toast = useToast();
  const [travelDate, setTravelDate] = useState(source.defaultTravelDate ? source.defaultTravelDate.slice(0, 10) : '');
  const [adults, setAdults] = useState(source.defaultTravelers?.adults ?? source.minTravelers ?? 2);
  const [children, setChildren] = useState(source.defaultTravelers?.children ?? 0);
  const [infants, setInfants] = useState(source.defaultTravelers?.infants ?? 0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<{ _id: string; bookingReference: string } | null>(null);

  const estimatedTotal = source.price * Math.max(adults + children, 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!travelDate) {
      setError(t('modal.selectDateError'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        travelDate: new Date(travelDate).toISOString(),
        travelers: { adults, children, infants },
        specialRequests: specialRequests || undefined
      };
      const booking = source.type === 'package' ?
      await apiPost<{ _id: string; bookingReference: string }>('/bookings/from-package', { tourPackage: source.id, ...payload }) :
      await apiPost<{ _id: string; bookingReference: string }>('/bookings/from-itinerary', { itinerary: source.id, ...payload });

      toast(t('modal.successToast', { reference: booking.bookingReference }));
      setCreatedBooking(booking);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : t('modal.createError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCreatedBooking(null);
    onClose();
  };

  const goToPayment = () => {
    if (!createdBooking) return;
    onSuccess(createdBooking);
    setCreatedBooking(null);
  };

  if (createdBooking) {
    return (
      <Modal open={open} onClose={handleClose} title={t('modal.bookingConfirmedTitle')} maxWidth="max-w-lg">
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald/10 text-emerald">
            <CheckCircle2Icon className="h-7 w-7" />
          </div>
          <p className="text-sm text-forest/70">{t('modal.bookingConfirmedBody', { reference: createdBooking.bookingReference })}</p>
          <button onClick={goToPayment} className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition-transform hover:scale-[1.02] active:scale-95">
            <CreditCardIcon className="h-4 w-4" /> {t('modal.goToPayment')}
          </button>
        </div>
      </Modal>);

  }

  return (
    <Modal open={open} onClose={handleClose} title={t('modal.bookTitle', { name: source.name })} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest">{t('modal.travelDate')}</label>
          <input
            type="date"
            required
            value={travelDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setTravelDate(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-cream/40 px-4 py-2.5 text-sm outline-none focus:border-emerald" />

        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest">{t('modal.adults')}</label>
            <input type="number" min={1} max={source.maxTravelers} value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="w-full rounded-xl border border-forest/15 bg-cream/40 px-3 py-2.5 text-sm outline-none focus:border-emerald" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest">{t('modal.children')}</label>
            <input type="number" min={0} value={children} onChange={(e) => setChildren(Number(e.target.value))} className="w-full rounded-xl border border-forest/15 bg-cream/40 px-3 py-2.5 text-sm outline-none focus:border-emerald" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest">{t('modal.infants')}</label>
            <input type="number" min={0} value={infants} onChange={(e) => setInfants(Number(e.target.value))} className="w-full rounded-xl border border-forest/15 bg-cream/40 px-3 py-2.5 text-sm outline-none focus:border-emerald" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest">{t('modal.specialRequests')}</label>
          <textarea rows={3} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} className="w-full rounded-xl border border-forest/15 bg-cream/40 px-4 py-2.5 text-sm outline-none focus:border-emerald" />
        </div>

        <div className="flex items-center justify-between rounded-xl bg-forest/5 px-4 py-3 text-sm">
          <span className="text-forest/60">{t('modal.estimatedTotal')}</span>
          <span className="font-display text-lg font-semibold text-forest">{source.currency} {estimatedTotal.toLocaleString()}</span>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70">
          {submitting && <Loader2Icon className="h-4 w-4 animate-spin" />}
          {t('modal.confirmBooking')}
        </button>
      </form>
    </Modal>);

}
