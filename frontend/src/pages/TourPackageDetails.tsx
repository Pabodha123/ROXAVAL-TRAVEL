import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  UserIcon,
  RouteIcon,
  UtensilsIcon } from
'lucide-react';
import { apiGetOne, apiGetList } from '../lib/api';
import { LoadingState, ErrorState } from '../components/ui/StatusState';
import { PackageCard } from '../components/packages/PackageCard';
import { BreadcrumbBackRow } from '../components/layout/BreadcrumbBackRow';
import { BookingModal } from '../components/booking/BookingModal';
import { useAuth } from '../context/AuthContext';
import type { TourPackage, Review } from '../types/tourPackage';

// Day descriptions authored as "Distance: ... Travel Time: ... <narrative>" get their
// facts pulled out into badges instead of buried in a wall of text. Descriptions that
// don't follow this pattern (e.g. admin-built itineraries) render unchanged.
function parseDayDescription(description: string) {
  const match = description.match(/^Distance:\s*(.+?)\s*Travel Time:\s*(.+?)\.\s+(?=[A-Z])/);
  if (!match) return { distance: null as string | null, travelTime: null as string | null, body: description };
  return {
    distance: match[1].replace(/\.$/, '').trim(),
    travelTime: match[2].trim(),
    body: description.slice(match[0].length).trim()
  };
}

export function TourPackageDetails() {
  const { t } = useTranslation('packages');
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

  if (loading) return <main className="min-h-screen bg-cream pt-24"><LoadingState title={t('detail.loading')} /></main>;
  if (error || !pkg) return <main className="min-h-screen bg-cream pt-24"><ErrorState title={t('detail.notFoundTitle')} message={error || undefined} /></main>;

  const displayPrice = pkg.discountPrice ?? pkg.price;

  return (
    <main className="min-h-screen bg-cream pt-16">
      {/* Hero */}
      <section className="relative h-[65vh] min-h-[460px] w-full overflow-hidden">
        <img src={pkg.heroImage} alt={pkg.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/40 to-forest/10" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-4 py-6 sm:px-6 lg:px-8">
          <BreadcrumbBackRow breadcrumbs={[{ label: t('breadcrumb.home'), href: '/' }, { label: t('breadcrumb.packages'), href: '/packages' }, { label: pkg.name }]} />
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
              <ClockIcon className="h-4 w-4" /> {t('detail.durationLabel', { days: pkg.durationDays, nights: pkg.durationNights })}
              {pkg.destinations.length > 0 && <span>• {pkg.destinations.map((d) => d.name).join(', ')}</span>}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:px-8">
        <div>
          {/* Overview */}
          <div>
            <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.overview')}</h2>
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
              <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.gallery')}</h2>
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
              <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.dayByDayItinerary')}</h2>
              <div className="mt-6">
                {pkg.itinerary.map((day, i) => {
                const { distance, travelTime, body } = parseDayDescription(day.description);
                return (
                  <div key={day.dayNumber} className="flex gap-5">
                      <div className="flex flex-col items-center">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald text-sm font-bold text-white ring-4 ring-emerald/15">
                          {day.dayNumber}
                        </div>
                        {i < pkg.itinerary.length - 1 && <div className="my-1 w-px flex-1 bg-forest/10" />}
                      </div>
                      <div className={`flex-1 rounded-3xl bg-white p-6 shadow-soft ${i < pkg.itinerary.length - 1 ? 'mb-5' : ''}`}>
                        <h3 className="font-display text-lg font-semibold text-forest">{day.title}</h3>
                        {(distance || travelTime) &&
                      <div className="mt-3 flex flex-wrap gap-2">
                            {distance &&
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/8 px-3 py-1 text-xs font-semibold text-emerald">
                                <RouteIcon className="h-3.5 w-3.5" /> {distance}
                              </span>
                        }
                            {travelTime &&
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-forest/70">
                                <ClockIcon className="h-3.5 w-3.5" /> {travelTime}
                              </span>
                        }
                          </div>
                      }
                        <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-forest/65">{body}</p>
                        {(day.hotel || day.meals && day.meals.length > 0) &&
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-forest/8 pt-3.5">
                            {day.hotel &&
                        <p className="flex items-center gap-1.5 text-xs font-medium text-forest/55">
                                <BedDoubleIcon className="h-3.5 w-3.5 text-forest/35" /> {t('detail.overnightAt', { hotel: day.hotel.name })}
                              </p>
                        }
                            {day.meals && day.meals.length > 0 &&
                        <p className="flex items-center gap-1.5 text-xs font-medium text-forest/55">
                                <UtensilsIcon className="h-3.5 w-3.5 text-forest/35" /> {day.meals.join(', ')}
                              </p>
                        }
                          </div>
                      }
                      </div>
                    </div>);

              })}
              </div>
            </div>
          }

          {/* Destinations & Activities */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {pkg.destinations.length > 0 &&
            <div>
                <h3 className="font-display text-lg font-semibold text-forest">{t('detail.destinations')}</h3>
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
                <h3 className="font-display text-lg font-semibold text-forest">{t('detail.activities')}</h3>
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
              <h3 className="font-display text-lg font-semibold text-forest">{t('detail.hotels')}</h3>
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
                <h3 className="font-display text-lg font-semibold text-forest">{t('detail.included')}</h3>
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
                <h3 className="font-display text-lg font-semibold text-forest">{t('detail.excluded')}</h3>
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
          {reviews.length > 0 &&
          <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.reviews')}</h2>
              <div className="mt-4 space-y-4">
                {reviews.map((r) =>
              <div key={r._id} className="rounded-3xl bg-white p-6 shadow-soft">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: r.rating }).map((_, i) => <StarIcon key={i} className="h-4 w-4 fill-gold text-gold" />)}
                    </div>
                    {r.title && <p className="mt-2 font-semibold text-forest">{r.title}</p>}
                    <p className="mt-1.5 text-sm leading-relaxed text-forest/70">{r.text}</p>
                    <p className="mt-2 text-xs text-forest/50">{r.customer?.user?.fullName || r.reviewerName || t('detail.verifiedTraveler')}{r.country ? ` • ${r.country}` : ''}</p>
                  </div>
              )}
              </div>
            </div>
          }
        </div>

        {/* Sidebar CTA */}
        <aside>
          <div className="sticky top-28 rounded-3xl bg-forest p-7 text-white shadow-lift">
            {pkg.showPrice ?
            <>
                <p className="font-display text-3xl font-bold">
                  {pkg.currency} {displayPrice.toLocaleString()}
                  {pkg.discountPrice != null && pkg.discountPrice < pkg.price &&
                  <span className="ml-2 text-base font-normal text-cream/50 line-through">{pkg.currency} {pkg.price.toLocaleString()}</span>
                  }
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-cream/60">{t('detail.perPerson', { min: pkg.minTravelers, max: pkg.maxTravelers })}</p>
              </> :

            <p className="font-display text-xl font-semibold">{t('detail.contactForPricing')}</p>
            }
            <button
              onClick={() => user ? setBookingOpen(true) : navigate('/auth', { state: { from: { pathname: `/packages/${pkg._id}` } } })}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition-transform hover:scale-[1.03] active:scale-95">

              {t('detail.bookNow')} <ArrowRightIcon className="h-4 w-4" />
            </button>
            <Link
              to="/packages#custom-tour"
              state={{ packageId: pkg._id }}
              className="mt-3 flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest">

              <SparklesIcon className="h-4 w-4" /> {t('detail.planMyTour')}
            </Link>
          </div>
        </aside>
      </section>

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        source={{ type: 'package', id: pkg._id, name: pkg.name, price: displayPrice, currency: pkg.currency, minTravelers: pkg.minTravelers, maxTravelers: pkg.maxTravelers, childPricePercent: pkg.childPricePercent }}
        onSuccess={() => {
          setBookingOpen(false);
          navigate('/my-tours');
        }} />

      {/* Related packages */}
      {related.length > 0 &&
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.relatedPackages')}</h2>
            <Link to="/packages" className="text-sm font-semibold text-emerald hover:underline">{t('detail.viewAll')}</Link>
          </div>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => <PackageCard key={p._id} pkg={p} index={i} />)}
          </div>
        </section>
      }
    </main>);

}
