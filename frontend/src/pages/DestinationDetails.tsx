import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  CloudSunIcon,
  MapPinIcon,
  PackageIcon,
  SparklesIcon,
  TicketIcon } from
'lucide-react';
import { apiGetOne, apiGetList } from '../lib/api';
import { LoadingState, ErrorState } from '../components/ui/StatusState';
import { PackageCard } from '../components/packages/PackageCard';
import { BreadcrumbBackRow } from '../components/layout/BreadcrumbBackRow';
import type { Destination } from '../types/destination';
import type { TourPackage } from '../types/tourPackage';

export function DestinationDetails() {
  const { t } = useTranslation('destinations');
  const { id } = useParams<{ id: string }>();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiGetOne<Destination>(`/destinations/${id}`).
    then((data) => {
      if (cancelled) return;
      setDestination(data);
      return apiGetList<TourPackage>('/packages', { destinations: data._id, limit: 3 }).
      then(({ data: list }) => !cancelled && setPackages(list));
    }).
    catch((err: Error) => !cancelled && setError(err.message)).
    finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <main className="min-h-screen bg-cream pt-24"><LoadingState title={t('detail.loading')} /></main>;
  if (error || !destination) return <main className="min-h-screen bg-cream pt-24"><ErrorState title={t('detail.notFoundTitle')} message={error || undefined} /></main>;

  const d = destination;

  return (
    <main className="min-h-screen bg-cream pt-16">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <img
          src={d.heroImage}
          alt={d.name}
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.fallback) return;
            img.dataset.fallback = 'true';
            img.src = '/f1dc4405-8788-4026-86f6-8dcd6433d54c.jpg';
          }}
          className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/40 to-forest/10" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-4 py-6 sm:px-6 lg:px-8">
          <BreadcrumbBackRow breadcrumbs={[{ label: t('breadcrumb.home'), href: '/' }, { label: t('breadcrumb.destinations'), href: '/destinations' }, { label: d.name }]} />

          <div className="pb-4">
            <span className="w-fit rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-forest">{d.tag}</span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display mt-4 max-w-3xl text-4xl font-semibold text-white sm:text-6xl">

              {d.name}
            </motion.h1>
            {d.region && <p className="mt-2 flex items-center gap-1.5 text-sm text-cream/80"><MapPinIcon className="h-4 w-4" /> {d.region}</p>}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:px-8">
        {/* Main content */}
        <div>
          {/* Quick facts */}
          <div className="grid grid-cols-2 gap-4 rounded-3xl bg-white p-6 shadow-soft sm:grid-cols-3">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <CalendarIcon className="h-5 w-5 text-emerald" />
              <p className="text-xs text-forest/50">{t('detail.bestTimeToVisit')}</p>
              <p className="text-sm font-semibold text-forest">{d.bestTimeToVisit || t('detail.yearRound')}</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <ClockIcon className="h-5 w-5 text-emerald" />
              <p className="text-xs text-forest/50">{t('detail.openingHours')}</p>
              <p className="text-sm font-semibold text-forest">{d.openingHours || t('detail.alwaysOpen')}</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <TicketIcon className="h-5 w-5 text-emerald" />
              <p className="text-xs text-forest/50">{t('detail.entranceFee')}</p>
              <p className="text-sm font-semibold text-forest">
                {d.entranceFee?.amount ? `${d.entranceFee.currency} ${d.entranceFee.amount}` : t('detail.free')}
              </p>
            </div>
          </div>

          {/* Overview */}
          <div className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.overview')}</h2>
            <p className="mt-3 leading-relaxed text-forest/70">{d.description}</p>
          </div>

          {/* History */}
          {d.history &&
          <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.history')}</h2>
              <p className="mt-3 leading-relaxed text-forest/70">{d.history}</p>
            </div>
          }

          {/* Gallery */}
          {d.gallery.length > 0 &&
          <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.gallery')}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {d.gallery.map((src, i) =>
              <div key={i} className="aspect-square overflow-hidden rounded-2xl">
                    <img
                  src={src}
                  alt={`${d.name} ${i + 1}`}
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.dataset.fallback) return;
                    img.dataset.fallback = 'true';
                    img.src = '/f1dc4405-8788-4026-86f6-8dcd6433d54c.jpg';
                  }}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" />

                  </div>
              )}
              </div>
            </div>
          }

          {/* Why Visit */}
          {d.whyVisit.length > 0 &&
          <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.whyVisitQuestion')}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {d.whyVisit.map((h) =>
              <li key={h} className="flex items-start gap-2.5 text-sm text-forest/75">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold text-forest">
                      <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {h}
                  </li>
              )}
              </ul>
            </div>
          }

          {/* Top Attractions */}
          {d.attractions.length > 0 &&
          <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.attractions')}</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {d.attractions.map((a) =>
              <div key={a._id} className="overflow-hidden rounded-3xl bg-white shadow-soft">
                    {a.images[0] && <img src={a.images[0]} alt={a.name} loading="lazy" className="h-40 w-full object-cover" />}
                    <div className="p-5">
                      <h3 className="font-display text-base font-semibold text-forest">{a.name}</h3>
                      <p className="mt-1.5 text-sm text-forest/65 line-clamp-3">{a.description}</p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-forest/50">
                        {a.estimatedVisitDuration && <span>⏱ {a.estimatedVisitDuration}</span>}
                        {a.entryFee > 0 && <span>🎟 ${a.entryFee}</span>}
                      </div>
                    </div>
                  </div>
              )}
              </div>
            </div>
          }

          {/* Popular Activities */}
          {d.popularActivities.length > 0 &&
          <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.popularActivities')}</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {d.popularActivities.map((a) =>
              <span key={a} className="flex items-center gap-2 rounded-full bg-emerald/10 px-4 py-2 text-sm font-medium text-emerald">
                    <SparklesIcon className="h-3.5 w-3.5" /> {a}
                  </span>
              )}
              </div>
            </div>
          }

          {/* Travel Tips */}
          {d.travelTips.length > 0 &&
          <div className="mt-10 rounded-3xl bg-white p-6 shadow-soft">
              <h3 className="font-display text-lg font-semibold text-forest">{t('detail.travelTips')}</h3>
              <ul className="mt-3 space-y-2">
                {d.travelTips.map((t) =>
              <li key={t} className="flex items-start gap-2 text-sm text-forest/70">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /> {t}
                  </li>
              )}
              </ul>
            </div>
          }

          {/* Weather placeholder */}
          <div className="mt-10 rounded-3xl border border-dashed border-forest/15 bg-white/60 p-6">
            <div className="flex items-center gap-2.5">
              <CloudSunIcon className="h-5 w-5 text-emerald" />
              <h3 className="font-display text-lg font-semibold text-forest">{t('detail.weather')}</h3>
              <span className="rounded-full bg-forest/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-forest/40">{t('detail.sampleData')}</span>
            </div>
            <p className="mt-2 text-sm text-forest/65">
              {t('detail.climateBlurb', { name: d.name })}
              {d.bestTimeToVisit ? t('detail.bestConditions', { time: d.bestTimeToVisit }) : ''} {t('detail.checkForecast')}
            </p>
          </div>

          {/* Map */}
          {d.mapLocation &&
          <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.locationOnMap')}</h2>
              <div className="mt-4 overflow-hidden rounded-3xl shadow-soft">
                <iframe
                title={`${d.name} location`}
                width="100%"
                height="320"
                loading="lazy"
                className="border-0"
                src={`https://www.google.com/maps?q=${d.mapLocation.lat},${d.mapLocation.lng}&output=embed`} />

              </div>
            </div>
          }

          {/* Nearby Attractions */}
          {d.nearbyDestinations.length > 0 &&
          <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.nearbyAttractions')}</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {d.nearbyDestinations.map((n) =>
              <Link
                key={n._id}
                to={`/destinations/${n._id}`}
                className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-forest shadow-soft transition-colors hover:bg-emerald hover:text-white">

                    <MapPinIcon className="h-3.5 w-3.5" /> {n.name}
                  </Link>
              )}
              </div>
            </div>
          }
        </div>

        {/* Sidebar CTA */}
        <aside>
          <div className="sticky top-28 rounded-3xl bg-forest p-7 text-white shadow-lift">
            <p className="text-xs uppercase tracking-wide text-cream/60">{t('detail.readyToExplore')}</p>
            <p className="font-display mt-1 text-2xl font-semibold">{d.name}</p>
            <Link
              to="/packages#custom-tour"
              state={{ destinationId: d._id }}
              className="mt-6 flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition-transform hover:scale-[1.03] active:scale-95">

              {t('detail.planMyTour')} <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              to="/packages#custom-tour"
              state={{ destinationId: d._id }}
              className="mt-3 flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest">

              <PackageIcon className="h-4 w-4" /> {t('detail.bookThisDestination')}
            </Link>
          </div>
        </aside>
      </section>

      {/* Recommended Tour Packages */}
      {packages.length > 0 &&
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.recommendedPackages')}</h2>
            <Link to="/packages" className="text-sm font-semibold text-emerald hover:underline">{t('detail.viewAll')}</Link>
          </div>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((p, i) => <PackageCard key={p._id} pkg={p} index={i} />)}
          </div>
        </section>
      }
    </main>);

}
