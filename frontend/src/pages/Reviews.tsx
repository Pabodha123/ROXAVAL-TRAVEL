import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { StarIcon, PackageIcon, CalendarIcon, ExternalLinkIcon } from 'lucide-react';
import { PageBanner } from '../components/layout/PageBanner';
import { Pagination } from '../components/ui/Pagination';
import { LoadingState, EmptyState, ErrorState } from '../components/ui/StatusState';
import { useApiList } from '../hooks/useApiList';
import { apiGetOne } from '../lib/api';
import { formatDate } from '../lib/date';
import type { Review, ReviewStats } from '../types/review';

const RATING_OPTIONS = [5, 4, 3, 2, 1];


function Stars({ rating, size = 'h-4 w-4' }: {rating: number;size?: string;}) {
  return (
    <div className="flex gap-0.5 text-gold">
      {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} className={`${size} ${i < rating ? 'fill-gold' : 'fill-none text-forest/20'}`} />)}
    </div>);

}

function ReviewCard({ review, index }: {review: Review;index: number;}) {
  const { t } = useTranslation('reviews');
  const name = review.customer?.user?.fullName || review.reviewerName || t('verifiedTraveler');
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4, delay: (index % 6) * 0.06 }} className="rounded-3xl bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {review.images?.[0] ?
          <img src={review.images[0]} alt={name} className="h-11 w-11 rounded-full object-cover" /> :

          <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald/10 text-sm font-bold text-emerald">{name.charAt(0).toUpperCase()}</span>
          }
          <div>
            <p className="text-sm font-semibold text-forest">{name}</p>
            {review.country && <p className="text-xs text-forest/50">{review.country}</p>}
          </div>
        </div>
        {review.source === 'tripadvisor' &&
        <span className="shrink-0 rounded-full bg-[#34e0a1]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#00695c]">{t('viaTripadvisor')}</span>
        }
      </div>
      <div className="mt-3"><Stars rating={review.rating} /></div>
      {review.title && <p className="mt-2 font-display text-base font-semibold text-forest">{review.title}</p>}
      <p className="mt-2 text-sm leading-relaxed text-forest/65">{review.text}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-forest/5 pt-3 text-xs text-forest/45">
        {review.tourPackage?.name && <span className="flex items-center gap-1.5"><PackageIcon className="h-3.5 w-3.5" /> {review.tourPackage.name}</span>}
        <span className="flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5" /> {formatDate(review.createdAt)}</span>
      </div>
    </motion.div>);

}

export function Reviews() {
  const { t } = useTranslation('reviews');
  const { t: tc } = useTranslation('common');
  const [rating, setRating] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [stats, setStats] = useState<ReviewStats | null>(null);

  const SORT_OPTIONS = [
  { label: t('sortNewest'), value: '-createdAt' },
  { label: t('sortHighest'), value: '-rating' },
  { label: t('sortLowest'), value: 'rating' }];

  const { items, meta, loading, error, hasMore, loadMore } = useApiList<Review>('/reviews', {
    rating: rating || undefined,
    sort
  });

  useEffect(() => {
    apiGetOne<ReviewStats>('/reviews/stats').then(setStats).catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-cream pt-16">
      <PageBanner
        eyebrow={t('eyebrow')}
        title={t('title')}
        subtitle={t('subtitle')}
        breadcrumbs={[{ label: tc('nav.home'), href: '/' }, { label: t('breadcrumb') }]} />


      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {stats &&
        <div className="mb-10 grid gap-8 rounded-3xl bg-white p-8 shadow-soft sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="text-center sm:border-r sm:border-forest/10 sm:pr-8">
              <p className="font-display text-5xl font-semibold text-forest">{stats.avgRating.toFixed(1)}</p>
              <div className="mt-2 flex justify-center"><Stars rating={Math.round(stats.avgRating)} size="h-5 w-5" /></div>
              <p className="mt-2 text-sm text-forest/50">{t('reviewCount', { count: stats.totalReviews })}</p>
            </div>
            <div className="space-y-2">
              {RATING_OPTIONS.map((r) => {
                const count = stats.breakdown[String(r) as keyof typeof stats.breakdown] || 0;
                const pct = stats.totalReviews > 0 ? count / stats.totalReviews * 100 : 0;
                return (
                  <div key={r} className="flex items-center gap-3 text-sm">
                    <span className="w-10 shrink-0 text-forest/60">{t('starRow', { count: r })}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-forest/5">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs text-forest/40">{count}</span>
                  </div>);

              })}
            </div>
          </div>
        }

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-soft">
          <div className="flex flex-wrap gap-3">
            <select value={rating} onChange={(e) => setRating(e.target.value)} className="rounded-full border border-forest/15 bg-white px-4 py-2.5 text-sm font-medium text-forest/80 outline-none focus:border-emerald">
              <option value="">{t('allRatings')}</option>
              {RATING_OPTIONS.map((r) => <option key={r} value={r}>{t('starOption', { count: r })}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border border-forest/15 bg-white px-4 py-2.5 text-sm font-medium text-forest/80 outline-none focus:border-emerald">
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <Link to="/my-tours" className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-forest transition-transform hover:scale-105">{t('bookTourCta')}</Link>
        </div>

        {loading && items.length === 0 && <LoadingState title={t('loadingReviews')} />}
        {error && <ErrorState message={error} />}
        {!loading && !error && items.length === 0 &&
        <EmptyState title={t('noReviewsYet')} message={t('noReviewsHint')} />
        }

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r, i) => <ReviewCard key={r._id} review={r} index={i} />)}
        </div>

        <Pagination meta={meta} shown={items.length} hasMore={hasMore} loading={loading} onLoadMore={loadMore} />

        <div className="mt-14 flex flex-col items-center gap-3 rounded-3xl border border-forest/10 bg-white p-8 text-center shadow-soft">
          <p className="font-display text-lg font-semibold text-forest">{t('tripadvisorTitle')}</p>
          <p className="max-w-md text-sm text-forest/60">{t('tripadvisorSubtitle')}</p>
          <a
            href="https://www.tripadvisor.com/Attraction_Review-g293962-d27987234-Reviews-Roxaval_Travels-Colombo_Western_Province.html"
            target="_blank"
            rel="noreferrer"
            className="mt-1 flex items-center gap-2 rounded-full bg-[#34e0a1] px-6 py-3 text-sm font-semibold text-[#00332a] transition-transform hover:scale-105">
            {t('viewOnTripadvisor')} <ExternalLinkIcon className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>);

}
