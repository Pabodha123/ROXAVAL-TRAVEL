import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ClockIcon,
  MapPinIcon,
  CalendarIcon,
  GaugeIcon,
  CheckIcon,
  BackpackIcon,
  MessageCircleIcon,
  ArrowRightIcon } from
'lucide-react';
import { apiGetOne, apiGetList } from '../lib/api';
import { LoadingState, ErrorState } from '../components/ui/StatusState';
import { ActivityCard } from '../components/activities/ActivityCard';
import { BreadcrumbBackRow } from '../components/layout/BreadcrumbBackRow';
import { whatsAppLink } from '../lib/contact';
import type { Activity } from '../types/activity';

export function ActivityDetails() {
  const { t } = useTranslation('activities');
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [related, setRelated] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiGetOne<Activity>(`/activities/${id}`).
    then((data) => {
      if (cancelled) return;
      setActivity(data);
      return apiGetList<Activity>('/activities', { category: data.category, limit: 4 }).
      then(({ data: list }) => {
        if (cancelled) return;
        setRelated(list.filter((a) => a._id !== data._id).slice(0, 3));
      });
    }).
    catch((err: Error) => !cancelled && setError(err.message)).
    finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <main className="min-h-screen bg-cream pt-24"><LoadingState title={t('detail.loading')} /></main>;
  if (error || !activity) return <main className="min-h-screen bg-cream pt-24"><ErrorState title={t('detail.notFoundTitle')} message={error || undefined} /></main>;

  const relatedDestinations = activity.destinations;

  return (
    <main className="min-h-screen bg-cream pt-16">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <img src={activity.image} alt={activity.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/40 to-forest/10" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-4 py-6 sm:px-6 lg:px-8">
          <BreadcrumbBackRow breadcrumbs={[{ label: t('breadcrumb.home'), href: '/' }, { label: t('breadcrumb.activities'), href: '/activities' }, { label: activity.name }]} />
          <div className="pb-6">
            <span className="w-fit rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-forest">{activity.category}</span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display mt-4 max-w-3xl text-4xl font-semibold text-white sm:text-6xl">

              {activity.name}
            </motion.h1>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:px-8">
        {/* Main content */}
        <div>
          {/* Quick facts */}
          <div className="grid grid-cols-2 gap-4 rounded-3xl bg-white p-6 shadow-soft sm:grid-cols-4">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <ClockIcon className="h-5 w-5 text-emerald" />
              <p className="text-xs text-forest/50">{t('detail.duration')}</p>
              <p className="text-sm font-semibold text-forest">{activity.durationHours}h</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <GaugeIcon className="h-5 w-5 text-emerald" />
              <p className="text-xs text-forest/50">{t('detail.difficulty')}</p>
              <p className="text-sm font-semibold text-forest">{activity.difficultyLevel}</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <CalendarIcon className="h-5 w-5 text-emerald" />
              <p className="text-xs text-forest/50">{t('detail.bestSeason')}</p>
              <p className="text-sm font-semibold text-forest">{activity.bestSeason || t('detail.yearRound')}</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <MapPinIcon className="h-5 w-5 text-emerald" />
              <p className="text-xs text-forest/50">{t('detail.location')}</p>
              <p className="text-sm font-semibold text-forest">{activity.location}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.overview')}</h2>
            <p className="mt-3 leading-relaxed text-forest/70">{activity.description}</p>
          </div>

          {/* Gallery */}
          {activity.gallery.length > 0 &&
          <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.gallery')}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {activity.gallery.map((src, i) =>
              <div key={i} className="aspect-square overflow-hidden rounded-2xl">
                    <img src={src} alt={`${activity.name} ${i + 1}`} className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" />
                  </div>
              )}
              </div>
            </div>
          }

          {/* Highlights */}
          {activity.highlights.length > 0 &&
          <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.highlights')}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {activity.highlights.map((h) =>
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

          {/* Included / Bring */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {activity.thingsIncluded.length > 0 &&
            <div className="rounded-3xl bg-white p-6 shadow-soft">
                <h3 className="font-display text-lg font-semibold text-forest">{t('detail.thingsIncluded')}</h3>
                <ul className="mt-3 space-y-2">
                  {activity.thingsIncluded.map((t) =>
                <li key={t} className="flex items-center gap-2 text-sm text-forest/70">
                      <CheckIcon className="h-4 w-4 text-emerald" /> {t}
                    </li>
                )}
                </ul>
              </div>
            }
            {activity.thingsToBring.length > 0 &&
            <div className="rounded-3xl bg-white p-6 shadow-soft">
                <h3 className="font-display text-lg font-semibold text-forest">{t('detail.thingsToBring')}</h3>
                <ul className="mt-3 space-y-2">
                  {activity.thingsToBring.map((t) =>
                <li key={t} className="flex items-center gap-2 text-sm text-forest/70">
                      <BackpackIcon className="h-4 w-4 text-emerald" /> {t}
                    </li>
                )}
                </ul>
              </div>
            }
          </div>

          {/* Map */}
          {activity.mapLocation &&
          <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.locationOnMap')}</h2>
              <div className="mt-4 overflow-hidden rounded-3xl shadow-soft">
                <iframe
                title="Activity location"
                width="100%"
                height="320"
                loading="lazy"
                className="border-0"
                src={`https://www.google.com/maps?q=${activity.mapLocation.lat},${activity.mapLocation.lng}&output=embed`} />

              </div>
            </div>
          }

          {/* Related destinations */}
          {relatedDestinations.length > 0 &&
          <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.relatedDestinations')}</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {relatedDestinations.map((d) =>
              <span key={d._id} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-forest shadow-soft">
                    {d.name}
                  </span>
              )}
              </div>
            </div>
          }
        </div>

        {/* Sidebar CTA */}
        <aside>
          <div className="sticky top-28 rounded-3xl bg-forest p-7 text-white shadow-lift">
            <p className="text-xs uppercase tracking-wide text-cream/60">{t('detail.startingFrom')}</p>
            <p className="font-display text-3xl font-semibold">${activity.priceFrom}<span className="text-sm font-normal text-cream/60">{t('detail.perPerson')}</span></p>
            <a
              href="mailto:info@roxavaltravels.com?subject=Plan%20My%20Tour"
              className="mt-6 flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition-transform hover:scale-[1.03] active:scale-95">

              {t('detail.planMyTour')} <ArrowRightIcon className="h-4 w-4" />
            </a>
            <a
              href={whatsAppLink()}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest">

              <MessageCircleIcon className="h-4 w-4" /> {t('detail.talkToExpert')}
            </a>
          </div>
        </aside>
      </section>

      {/* Related activities */}
      {related.length > 0 &&
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-forest">{t('detail.relatedActivities')}</h2>
            <Link to="/activities" className="text-sm font-semibold text-emerald hover:underline">{t('detail.viewAll')}</Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a, i) => <ActivityCard key={a._id} activity={a} index={i} />)}
          </div>
        </section>
      }
    </main>);

}
