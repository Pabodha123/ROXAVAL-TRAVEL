import React, { useState } from 'react';
import { Loader2Icon } from 'lucide-react';
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
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  source: BookingSource;
  onSuccess: (booking: { _id: string; bookingReference: string }) => void;
}

export function BookingModal({ open, onClose, source, onSuccess }: BookingModalProps) {
  const toast = useToast();
  const [travelDate, setTravelDate] = useState('');
  const [adults, setAdults] = useState(source.minTravelers || 2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimatedTotal = source.price * Math.max(adults + children, 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!travelDate) {
      setError('Please select a travel date.');
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

      toast(`Booking ${booking.bookingReference} created — proceed to payment in My Tours.`);
      onSuccess(booking);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Book ${source.name}`} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest">Travel Date</label>
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
            <label className="mb-1.5 block text-sm font-medium text-forest">Adults</label>
            <input type="number" min={1} max={source.maxTravelers} value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="w-full rounded-xl border border-forest/15 bg-cream/40 px-3 py-2.5 text-sm outline-none focus:border-emerald" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest">Children</label>
            <input type="number" min={0} value={children} onChange={(e) => setChildren(Number(e.target.value))} className="w-full rounded-xl border border-forest/15 bg-cream/40 px-3 py-2.5 text-sm outline-none focus:border-emerald" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest">Infants</label>
            <input type="number" min={0} value={infants} onChange={(e) => setInfants(Number(e.target.value))} className="w-full rounded-xl border border-forest/15 bg-cream/40 px-3 py-2.5 text-sm outline-none focus:border-emerald" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest">Special Requests (optional)</label>
          <textarea rows={3} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} className="w-full rounded-xl border border-forest/15 bg-cream/40 px-4 py-2.5 text-sm outline-none focus:border-emerald" />
        </div>

        <div className="flex items-center justify-between rounded-xl bg-forest/5 px-4 py-3 text-sm">
          <span className="text-forest/60">Estimated total</span>
          <span className="font-display text-lg font-semibold text-forest">{source.currency} {estimatedTotal.toLocaleString()}</span>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70">
          {submitting && <Loader2Icon className="h-4 w-4 animate-spin" />}
          Confirm Booking
        </button>
      </form>
    </Modal>);

}
