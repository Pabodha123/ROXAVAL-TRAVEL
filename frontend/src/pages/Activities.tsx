import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApiList } from '../hooks/useApiList';
import { ActivityCard } from '../components/activities/ActivityCard';
import { BreadcrumbBackRow } from '../components/layout/BreadcrumbBackRow';
import { FilterBar } from '../components/ui/FilterBar';
import { Pagination } from '../components/ui/Pagination';
import { LoadingState, EmptyState, ErrorState } from '../components/ui/StatusState';
import type { Activity } from '../types/activity';

const CATEGORY_OPTIONS = ['Adventure', 'Wildlife', 'Culture', 'Relaxation', 'Scenic', 'Water Sports', 'Nature'].map((v) => ({ label: v, value: v }));
const LOCATION_OPTIONS = ['Sigiriya', 'Kandy', 'Ella', 'Nuwara Eliya', 'Galle Fort', 'Mirissa Harbour', 'Bentota River', 'Yala National Park', 'Kandy to Ella Railway', 'Udawalawe National Park'].map((v) => ({ label: v, value: v }));
const DIFFICULTY_OPTIONS = ['Easy', 'Moderate', 'Hard'].map((v) => ({ label: v, value: v }));

export function Activities() {
  const { t } = useTranslation('activities');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sort, setSort] = useState('-createdAt');

  const SORT_OPTIONS = [
    { label: t('sort.newest'), value: '-createdAt' },
    { label: t('sort.priceLowToHigh'), value: 'priceFrom' },
    { label: t('sort.priceHighToLow'), value: '-priceFrom' },
    { label: t('sort.durationShortToLong'), value: 'durationHours' },
  ];

  const { items, meta, loading, error, hasMore, loadMore } = useApiList<Activity>('/activities', {
    q: search || undefined,
    category: category || undefined,
    location: location || undefined,
    difficultyLevel: difficulty || undefined,
    sort
  });

  return (
    <main className="min-h-screen bg-cream pt-24">
      <section className="relative overflow-hidden bg-forest py-20 text-center text-white">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-left sm:px-6 lg:px-8">
          <BreadcrumbBackRow breadcrumbs={[{ label: t('breadcrumb.home'), href: '/' }, { label: t('breadcrumb.activities') }]} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 mx-auto max-w-2xl px-4">

          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">
            <span className="h-px w-8 bg-gold" />
            {t('eyebrow')}
          </span>
          <h1 className="font-display mt-4 text-4xl font-semibold sm:text-6xl">{t('title')}</h1>
          <p className="mt-4 text-cream/80">{t('subtitle')}</p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('searchPlaceholder')}
          filters={[
          { key: 'category', label: t('filters.categories'), options: CATEGORY_OPTIONS },
          { key: 'location', label: t('filters.locations'), options: LOCATION_OPTIONS },
          { key: 'difficulty', label: t('filters.difficulty'), options: DIFFICULTY_OPTIONS }]}

          values={{ category, location, difficulty }}
          onFilterChange={(key, value) => {
            if (key === 'category') setCategory(value);
            if (key === 'location') setLocation(value);
            if (key === 'difficulty') setDifficulty(value);
          }}
          sortOptions={SORT_OPTIONS}
          sort={sort}
          onSortChange={setSort} />


        {loading && items.length === 0 && <LoadingState title={t('loading')} />}
        {error && <ErrorState title={t('loadError')} message={error} />}
        {!loading && !error && items.length === 0 &&
        <EmptyState title={t('noResults')} message={t('noResultsHint')} />
        }

        {items.length > 0 &&
        <>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((activity, i) =>
            <ActivityCard key={activity._id} activity={activity} index={i} />
            )}
            </div>
            <Pagination meta={meta} shown={items.length} hasMore={hasMore} loading={loading} onLoadMore={loadMore} />
          </>
        }
      </section>
    </main>);

}
