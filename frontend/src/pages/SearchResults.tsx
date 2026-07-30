import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SearchIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { searchAll, totalResultCount, EMPTY_RESULTS } from '../lib/search';
import type { SearchResults as SearchResultsData, SearchResultItem, SearchCategory } from '../lib/search';
import { BreadcrumbBackRow } from '../components/layout/BreadcrumbBackRow';
import { LoadingState, EmptyState } from '../components/ui/StatusState';


function ResultCard({ item }: {item: SearchResultItem;}) {
  const body =
  <>
      <div className="h-40 w-full overflow-hidden bg-cream">
        {item.image ?
      <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> :

      <div className="grid h-full w-full place-items-center text-forest/20"><SearchIcon className="h-8 w-8" /></div>
      }
      </div>
      <div className="p-4">
        <p className="font-display text-base font-semibold text-forest">{item.title}</p>
        {item.subtitle && <p className="mt-1 text-sm text-forest/60">{item.subtitle}</p>}
      </div>
    </>;


  const className = 'group overflow-hidden rounded-2xl bg-white shadow-soft transition-shadow hover:shadow-lift';

  return item.href ?
  <Link to={item.href} className={className}>{body}</Link> :
  <div className={className}>{body}</div>;
}

export function SearchResults() {
  const { t } = useTranslation();
  const CATEGORIES: { key: SearchCategory; label: string; pick: (r: SearchResultsData) => SearchResultItem[] }[] = [
    { key: 'Tour Packages', label: t('nav.packages'), pick: (r) => r.packages },
    { key: 'Destinations', label: t('nav.destinations'), pick: (r) => r.destinations },
    { key: 'Activities', label: t('nav.activities'), pick: (r) => r.activities },
    { key: 'Hotels', label: t('search.categoryHotels'), pick: (r) => r.hotels },
    { key: 'Blog', label: t('nav.blog'), pick: (r) => r.blog },
  ];
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [input, setInput] = useState(query);
  const [results, setResults] = useState<SearchResultsData>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInput(query);
    if (!query.trim()) {
      setResults(EMPTY_RESULTS);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchAll(query, 24).
    then((r) => !cancelled && setResults(r)).
    finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [query]);

  const total = totalResultCount(results);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) navigate(`/search?q=${encodeURIComponent(input.trim())}`);
  };

  return (
    <main className="min-h-screen bg-cream pt-24">
      <section className="bg-forest py-16 text-center text-white">
        <div className="mx-auto mb-8 max-w-7xl px-4 text-left sm:px-6 lg:px-8">
          <BreadcrumbBackRow breadcrumbs={[{ label: t('nav.home'), href: '/' }, { label: t('search.breadcrumb') }]} />
        </div>
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t('search.title')}</h1>
          <form onSubmit={submit} className="mt-6 flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-lift">
            <SearchIcon className="h-5 w-5 shrink-0 text-forest/40" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('search.placeholder')}
              className="flex-1 bg-transparent px-2 py-2.5 text-sm text-forest outline-none placeholder:text-forest/40" />

            <button type="submit" className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-forest transition-transform hover:scale-105">
              {t('search.submit')}
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {!query.trim() && <EmptyState title={t('search.searchForSomething')} message={t('search.searchHint')} />}
        {query.trim() && loading && <LoadingState title={t('search.searchingFor', { query })} />}
        {query.trim() && !loading && total === 0 &&
        <EmptyState title={t('status.noResults')} message={t('search.noResultsFor', { query })} />
        }

        {query.trim() && !loading && total > 0 &&
        <div className="space-y-14">
            <p className="text-sm text-forest/60">{t('search.resultCount', { count: total, query })}</p>
            {CATEGORIES.map(({ key, label, pick }) => {
              const items = pick(results);
              if (items.length === 0) return null;
              return (
                <motion.div key={key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5 }}>
                  <h2 className="font-display text-2xl font-semibold text-forest">{label}</h2>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((item) => <ResultCard key={item.id} item={item} />)}
                  </div>
                </motion.div>);

            })}
          </div>
        }
      </section>
    </main>);

}
