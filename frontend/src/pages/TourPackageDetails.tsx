import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  StarIcon,
  CheckIcon,
  XIcon,
  SparklesIcon,
  ArrowRightIcon,
  MapPinIcon,
  BedDoubleIcon,
  Users2Icon,
  UserIcon } from
'lucide-react';
import { apiGetOne, apiGetList } from '../lib/api';
import { LoadingState, ErrorState } from '../components/ui/StatusState';
import { PackageCard } from '../components/packages/PackageCard';
import { BreadcrumbBackRow } from '../components/layout/BreadcrumbBackRow';
import { BookingModal } from '../components/booking/BookingModal';
import { useAuth } from '../context/AuthContext';
import type { TourPackage, Review } from '../types/tourPackage';

export function TourPackageDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<TourPackage | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiGetOne<TourPackage>(`/packages/${id}`).
    then((data) => {
      if (cancelled) return;
      setPkg(data);
      return Promise.all([
      apiGetList<Review>('/reviews', { tourPackage: data._id, limit: 10 }).then(({ data: r }) => !cancelled && setReviews(r)),
      apiGetList<TourPackage>('/packages', { category: data.category, limit: 4 }).then(({ data: list }) => !cancelled && setRelated(list.filter((p) => p._id !== data._id).slice(0, 3)))]
      );
    }).
    catch((err: Error) => !cancelled && setError(err.message)).
    finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <main className="min-h-screen bg-cream pt-24"><LoadingState title="Loading tour package…" /></main>;
  if (error || !pkg) return <main className="min-h-screen bg-cream pt-24"><ErrorState title="Tour package not found" message={error || undefined} /></main>;

  const displayPrice = pkg.discountPrice ?? pkg.price;

  return (
    <main className="min-h-screen bg-cream pt-16">
      {/* Hero */}
      <section className="relative h-[65vh] min-h-[460px] w-full overflow-hidden">
        <img src={pkg.heroImage} alt={pkg.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/40 to-forest/10" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-4 py-6 sm:px-6 lg:px-8">
          <BreadcrumbBackRow breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Tour Packages', href: '/packages' }, { label: pkg.name }]} />
          <div className="pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-forest">{pkg.category}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold text-white">
                {pkg.tourType === 'Private' ? <UserIcon className="h-3.5 w-3.5" /> : <Users2Icon className="h-3.5 w-3.5" />} {pkg.tourType}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold text-white">
                <StarIcon className="h-3.5 w-3.5 fill-gold text-gold" /> {pkg.rating.toFixed(1)} ({pkg.reviewsCount})
              </span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display mt-4 max-w-3xl text-4xl font-semibold text-white sm:text-6xl">

              {pkg.name}
            </motion.h1>
            <p className="mt-3 flex items-center gap-2 text-cream/80">
              <ClockIcon className="h-4 w-4" /> {pkg.durationDays} Days / {pkg.durationNights} Nights
              {pkg.destinations.length > 0 && <span>• {pkg.destinations.map((d) => d.name).join(', ')}</span>}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:px-8">
        <div>
          {/* Overview */}
          <div>
            <h2 className="font-display text-2xl font-semibold text-forest">Overview</h2>
            <p className="mt-3 leading-relaxed text-forest/70">{pkg.description}</p>
            {pkg.highlights.length > 0 &&
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {pkg.highlights.map((h) =>
              <li key={h} className="flex items-start gap-2.5 text-sm text-forest/75">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold text-forest">
                      <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {h}
                  </li>
              )}
              </ul>
            }
          </div>

          {/* Gallery */}
          {pkg.gallery.length > 0 &&
          <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-forest">Gallery</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {pkg.gallery.map((src, i) =>
              <div key={i} className="aspect-square overflow-hidden rounded-2xl">
                    <img src={src} alt={`${pkg.name} ${i + 1}`} className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" />
                  </div>
              )}
              </div>
            </div>
          }

          {/* Itinerary */}
          {pkg.itinerary.length > 0 &&
          <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-forest">Day-by-Day Itinerary</h2>
              <div className="mt-5 space-y-4">
                {pkg.itinerary.map((day) =>
              <div key={day.dayNumber} className="flex gap-4 rounded-3xl bg-white p-6 shadow-soft">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald text-sm font-bold text-white">
                      {day.dayNumber}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-forest">{day.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-forest/65">{day.description}</p>
                      {day.hotel &&
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-forest/50">
                          <BedDoubleIcon className="h-3.5 w-3.5" /> Overnight at {day.hotel.name}
                        </p>
                  }
                      {day.meals && day.meals.length > 0 &&
                  <p className="mt-1 text-xs text-forest/50">Meals: {day.meals.join(', ')}</p>
                  }
                    </div>
                  </div>
              )}
              </div>
            </div>
          }

          {/* Destinations & Activities */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {pkg.destinations.length > 0 &&
            <div>
                <h3 className="font-display text-lg font-semibold text-forest">Destinations</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pkg.destinations.map((d) =>
                <span key={d._id} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-medium text-forest shadow-soft">
                      <MapPinIcon className="h-3.5 w-3.5 text-emerald" /> {d.name}
                    </span>
                )}
                </div>
              </div>
            }
            {pkg.activities.length > 0 &&
            <div>
                <h3 className="font-display text-lg font-semibold text-forest">Activities</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pkg.activities.map((a) =>
                <span key={a._id} className="rounded-full bg-white px-3.5 py-2 text-sm font-medium text-forest shadow-soft">
                      {a.name}
                    </span>
                )}
                </div>
              </div>
            }
          </div>

          {/* Hotels */}
          {pkg.hotels.length > 0 &&
          <div className="mt-10">
              <h3 className="font-display text-lg font-semibold text-forest">Hotels</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {pkg.hotels.map((h) =>
              <div key={h._id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald/10 text-emerald">
                      <BedDoubleIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-forest">{h.name}</p>
                      <p className="text-xs text-forest/50">{h.category}{h.starRating ? ` • ${h.starRating}★` : ''}</p>
                    </div>
                  </div>
              )}
              </div>
            </div>
          }

          {/* Included / Excluded */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {pkg.includedServices.length > 0 &&
            <div className="rounded-3xl bg-white p-6 shadow-soft">
                <h3 className="font-display text-lg font-semibold text-forest">Included</h3>
                <ul className="mt-3 space-y-2">
                  {pkg.includedServices.map((s) =>
                <li key={s} className="flex items-center gap-2 text-sm text-forest/70">
                      <CheckIcon className="h-4 w-4 text-emerald" /> {s}
                    </li>
                )}
                </ul>
              </div>
            }
            {pkg.excludedServices.length > 0 &&
            <div className="rounded-3xl bg-white p-6 shadow-soft">
                <h3 className="font-display text-lg font-semibold text-forest">Excluded</h3>
                <ul className="mt-3 space-y-2">
                  {pkg.excludedServices.map((s) =>
                <li key={s} className="flex items-center gap-2 text-sm text-forest/70">
                      <XIcon className="h-4 w-4 text-red-400" /> {s}
                    </li>
                )}
                </ul>
              </div>
            }
          </div>

          {/* Reviews */}
          <div className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-forest">Reviews</h2>
            {reviews.length === 0 ?
            <p className="mt-3 text-sm text-forest/60">No reviews yet — be the first to share your experience.</p> :

            <div className="mt-4 space-y-4">
                {reviews.map((r) =>
              <div key={r._id} className="rounded-3xl bg-white p-6 shadow-soft">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: r.rating }).map((_, i) => <StarIcon key={i} className="h-4 w-4 fill-gold text-gold" />)}
                    </div>
                    {r.title && <p className="mt-2 font-semibold text-forest">{r.title}</p>}
                    <p className="mt-1.5 text-sm leading-relaxed text-forest/70">{r.text}</p>
                    <p className="mt-2 text-xs text-forest/50">{r.customer?.user?.fullName || 'Verified traveler'}{r.country ? ` • ${r.country}` : ''}</p>
                  </div>
              )}
              </div>
            }
          </div>
        </div>

        {/* Sidebar CTA */}
        <aside>
          <div className="sticky top-28 rounded-3xl bg-forest p-7 text-white shadow-lift">
            <p className="text-xs uppercase tracking-wide text-cream/60">Starting from</p>
            <div className="flex items-baseline gap-2">
              {pkg.discountPrice && <p className="text-sm text-cream/50 line-through">${pkg.price.toLocaleString()}</p>}
              <p className="font-display text-3xl font-semibold">${displayPrice.toLocaleString()}</p>
            </div>
            <p className="mt-1 text-xs text-cream/50">per person, {pkg.minTravelers}-{pkg.maxTravelers} travelers</p>
            <button
              onClick={() => user ? setBookingOpen(true) : navigate('/auth', { state: { from: { pathname: `/packages/${pkg._id}` } } })}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition-transform hover:scale-[1.03] active:scale-95">

              Book Now <ArrowRightIcon className="h-4 w-4" />
            </button>
            <Link
              to="/packages#custom-tour"
              state={{ packageId: pkg._id }}
              className="mt-3 flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest">

              <SparklesIcon className="h-4 w-4" /> Plan My Tour
            </Link>
          </div>
        </aside>
      </section>

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        source={{ type: 'package', id: pkg._id, name: pkg.name, price: displayPrice, currency: pkg.currency, minTravelers: pkg.minTravelers, maxTravelers: pkg.maxTravelers }}
        onSuccess={() => {
          setBookingOpen(false);
          navigate('/my-tours');
        }} />

      {/* Related packages */}
      {related.length > 0 &&
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-forest">Related Packages</h2>
            <Link to="/packages" className="text-sm font-semibold text-emerald hover:underline">View All</Link>
          </div>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => <PackageCard key={p._id} pkg={p} index={i} />)}
          </div>
        </section>
      }
    </main>);

}
