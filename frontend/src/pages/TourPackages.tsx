import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CustomTourWizard } from '../components/packages/CustomTourWizard';
import { useApiList } from '../hooks/useApiList';
import { PackageCard } from '../components/packages/PackageCard';
import { BreadcrumbBackRow } from '../components/layout/BreadcrumbBackRow';
import { FilterBar } from '../components/ui/FilterBar';
import { Pagination } from '../components/ui/Pagination';
import { LoadingState, EmptyState, ErrorState } from '../components/ui/StatusState';
import type { TourPackage } from '../types/tourPackage';

const CATEGORY_OPTIONS = ['Best Seller', 'Scenic', 'Adventure', 'Relax', 'Luxury', 'Signature', 'Honeymoon', 'Family', 'Wildlife'].map((v) => ({ label: v, value: v }));
const TOUR_TYPE_OPTIONS = ['Private', 'Group'].map((v) => ({ label: v, value: v }));

export function TourPackages() {
  const { t } = useTranslation('packages');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [tourType, setTourType] = useState('');
  const [sort, setSort] = useState('-createdAt');

  const SORT_OPTIONS = [
    { label: t('sort.newest'), value: '-createdAt' },
    { label: t('sort.priceLowToHigh'), value: 'price' },
    { label: t('sort.priceHighToLow'), value: '-price' },
    { label: t('sort.highestRated'), value: '-rating' },
    { label: t('sort.durationShortToLong'), value: 'durationDays' },
  ];

  const { items, meta, loading, error, hasMore, loadMore } = useApiList<TourPackage>('/packages', {
    q: search || undefined,
    category: category || undefined,
    tourType: tourType || undefined,
    sort
  });

  return (
    <main className="min-h-screen bg-cream pt-24">
      {/* Hero Banner */}
      <section className="relative bg-forest py-20 text-center text-white overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-left sm:px-6 lg:px-8">
          <BreadcrumbBackRow breadcrumbs={[{ label: t('breadcrumb.home'), href: '/' }, { label: t('breadcrumb.packages') }]} />
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

      {/* Package Catalog */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('searchPlaceholder')}
          filters={[
          { key: 'category', label: t('filters.categories'), options: CATEGORY_OPTIONS },
          { key: 'tourType', label: t('filters.types'), options: TOUR_TYPE_OPTIONS }]}

          values={{ category, tourType }}
          onFilterChange={(key, value) => {
            if (key === 'category') setCategory(value);
            if (key === 'tourType') setTourType(value);
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
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((pkg, i) => <PackageCard key={pkg._id} pkg={pkg} index={i} />)}
            </div>
            <Pagination meta={meta} shown={items.length} hasMore={hasMore} loading={loading} onLoadMore={loadMore} />
          </>
        }
      </section>

      {/* Colorful CTA & Wizard Section */}
      <section id="custom-tour" className="relative py-24 overflow-hidden">
        {/* Vibrant Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald via-forest to-emerald-light" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gold via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
              <SparklesIcon className="h-4 w-4 text-gold" /> {t('customTour.badge')}
            </span>
            <h2 className="font-display mt-6 text-4xl sm:text-6xl font-bold text-white">{t('customTour.title')}</h2>
            <p className="mt-4 text-lg text-cream/90 max-w-2xl mx-auto">{t('customTour.subtitle')}</p>
          </div>

          <CustomTourWizard />
        </div>
      </section>
    </main>);

}
