import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { apiGetList } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface UpcomingBooking {
  _id: string;
  bookingReference: string;
  tourPackage?: { name: string };
  itinerary?: { title?: string };
  travelDate: string;
}

/**
 * "Hello {name} — your next adventure starts in N days" hero, based on the
 * nearest upcoming Confirmed booking. Renders nothing if none exists.
 */
export function CountdownWidget() {
  const { user } = useAuth();
  const [booking, setBooking] = useState<UpcomingBooking | null>(null);

  useEffect(() => {
    let cancelled = false;
    const today = new Date().toISOString();
    apiGetList<UpcomingBooking>('/bookings/my-bookings', {
      status: 'Confirmed',
      'travelDate[gte]': today,
      sort: 'travelDate',
      limit: 1,
    }).
    then(({ data }) => {
      if (!cancelled) setBooking(data[0] || null);
    }).
    catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!booking) return null;

  const days = Math.max(0, Math.ceil((new Date(booking.travelDate).getTime() - Date.now()) / 86400000));
  const tourName = booking.tourPackage?.name || booking.itinerary?.title || 'your custom tour';

  return (
    <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-gradient-to-br from-forest to-emerald p-6 text-white shadow-lift sm:flex-row sm:items-center">
      <div>
        <p className="text-lg font-semibold">Hello {user?.fullName?.split(' ')[0] || 'there'} 👋</p>
        <p className="mt-1 text-cream/85">
          Your next adventure - <span className="font-semibold text-white">{tourName}</span> - starts in{' '}
          <span className="font-display text-2xl font-bold text-gold">{days}</span> {days === 1 ? 'Day' : 'Days'}
        </p>
      </div>
      <Link
        to={`/my-tours/bookings/${booking._id}`}
        className="flex shrink-0 items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-forest transition-transform hover:scale-105">
        View Tour <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>);

}
