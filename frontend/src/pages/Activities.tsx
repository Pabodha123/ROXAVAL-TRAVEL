import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
const SORT_OPTIONS = [
{ label: 'Newest', value: '-createdAt' },
{ label: 'Price: Low to High', value: 'priceFrom' },
{ label: 'Price: High to Low', value: '-priceFrom' },
{ label: 'Duration: Short to Long', value: 'durationHours' }];


export function Activities() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sort, setSort] = useState('-createdAt');

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
          <BreadcrumbBackRow breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Activities' }]} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 mx-auto max-w-2xl px-4">

          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">
            <span className="h-px w-8 bg-gold" />
            Things to do
          </span>
          <h1 className="font-display mt-4 text-4xl font-semibold sm:text-6xl">Thrilling Activities</h1>
          <p className="mt-4 text-cream/80">Adventure, wildlife and culture — unforgettable experiences woven into every journey.</p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search activities…"
          filters={[
          { key: 'category', label: 'Categories', options: CATEGORY_OPTIONS },
          { key: 'location', label: 'Locations', options: LOCATION_OPTIONS },
          { key: 'difficulty', label: 'Difficulty', options: DIFFICULTY_OPTIONS }]}

          values={{ category, location, difficulty }}
          onFilterChange={(key, value) => {
            if (key === 'category') setCategory(value);
            if (key === 'location') setLocation(value);
            if (key === 'difficulty') setDifficulty(value);
          }}
          sortOptions={SORT_OPTIONS}
          sort={sort}
          onSortChange={setSort} />


        {loading && items.length === 0 && <LoadingState title="Loading activities…" />}
        {error && <ErrorState title="Couldn't load activities" message={error} />}
        {!loading && !error && items.length === 0 &&
        <EmptyState title="No activities found" message="Try a different search term or clear your filters." />
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
