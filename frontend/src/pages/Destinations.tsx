import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApiList } from '../hooks/useApiList';
import { DestinationCapsule } from '../components/destinations/DestinationCapsule';
import { BreadcrumbBackRow } from '../components/layout/BreadcrumbBackRow';
import { FilterBar } from '../components/ui/FilterBar';
import { Pagination } from '../components/ui/Pagination';
import { LoadingState, EmptyState, ErrorState } from '../components/ui/StatusState';
import type { DestinationListItem } from '../types/destination';

const CATEGORY_OPTIONS = ['Cultural', 'Wildlife', 'Beach', 'Hill Country', 'City', 'Nature', 'Adventure'].map((v) => ({ label: v, value: v }));

export function Destinations() {
  const { t } = useTranslation('destinations');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('-createdAt');

  const SORT_OPTIONS = [
    { label: t('sort.newest'), value: '-createdAt' },
    { label: t('sort.nameAZ'), value: 'name' },
    { label: t('sort.nameZA'), value: '-name' },
  ];

  const { items, meta, loading, error, hasMore, loadMore } = useApiList<DestinationListItem>('/destinations', {
    q: search || undefined,
    tag: category || undefined,
    sort
  }, 100);

  return (
    <main className="min-h-screen bg-cream pt-24">
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[380px] w-full overflow-hidden">
        <img
          src="/f1dc4405-8788-4026-86f6-8dcd6433d54c.jpg"
          alt="Sri Lanka"
          className="absolute inset-0 h-full w-full object-cover" />

        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/50 to-forest/20" />
        <div className="absolute inset-x-0 top-0 z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <BreadcrumbBackRow breadcrumbs={[{ label: t('breadcrumb.home'), href: '/' }, { label: t('breadcrumb.destinations') }]} />
        </div>
        <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>

            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">
              <span className="h-px w-8 bg-gold" />
              {t('eyebrow')}
            </span>
            <h1 className="font-display mt-4 text-4xl font-semibold text-white sm:text-6xl">{t('title')}</h1>
            <p className="mt-4 text-base text-cream/85 sm:text-lg">{t('subtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('searchPlaceholder')}
          filters={[{ key: 'category', label: t('filters.categories'), options: CATEGORY_OPTIONS }]}
          values={{ category }}
          onFilterChange={(key, value) => {
            if (key === 'category') setCategory(value);
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
            <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((d, i) => <DestinationCapsule key={d._id} destination={d} index={i} />)}
            </div>
            <Pagination meta={meta} shown={items.length} hasMore={hasMore} loading={loading} onLoadMore={loadMore} />
          </>
        }
      </section>
    </main>);

}
