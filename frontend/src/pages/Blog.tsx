import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarIcon, EyeIcon, FlameIcon, ClockIcon } from 'lucide-react';
import { PageBanner } from '../components/layout/PageBanner';
import { FilterBar } from '../components/ui/FilterBar';
import { Pagination } from '../components/ui/Pagination';
import { LoadingState, EmptyState, ErrorState } from '../components/ui/StatusState';
import { useApiList } from '../hooks/useApiList';
import { apiGetList, API_ORIGIN } from '../lib/api';
import { formatDate } from '../lib/date';
import type { BlogListItem } from '../types/blog';

// Admin-uploaded images are stored as backend-relative paths (/uploads/images/...);
// seeded/static images already live in the frontend's own /public folder.
function resolveImage(url: string) {
  return url.startsWith('/uploads') ? `${API_ORIGIN}${url}` : url;
}

const CATEGORY_OPTIONS = ['Travel Guide', 'Food & Culture', 'Adventure', 'Culture', 'Wildlife', 'Tips & Advice'].map((v) => ({ label: v, value: v }));
const SORT_OPTIONS = [
{ label: 'Newest', value: '-publishedAt' },
{ label: 'Oldest', value: 'publishedAt' },
{ label: 'Most Popular', value: '-views' }];


function ArticleCard({ post, large = false }: {post: BlogListItem;large?: boolean;}) {
  return (
    <Link to={`/blog/${post.slug}`} className="group block overflow-hidden rounded-3xl bg-white shadow-soft transition-shadow hover:shadow-lift">
      <div className={`overflow-hidden ${large ? 'h-72 sm:h-96' : 'h-48'}`}>
        <img src={resolveImage(post.featuredImage)} alt={post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 text-xs text-forest/50">
          <span className="rounded-full bg-emerald/10 px-2.5 py-1 font-semibold uppercase tracking-wide text-emerald">{post.category}</span>
          <span className="flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" /> {formatDate(post.publishedAt || post.createdAt)}</span>
        </div>
        <h3 className={`font-display mt-3 font-semibold text-forest transition-colors group-hover:text-emerald ${large ? 'text-2xl' : 'text-lg'}`}>{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-forest/60">{post.excerpt}</p>
      </div>
    </Link>);

}

function SidebarList({ title, icon: Icon, posts }: {title: string;icon: React.ComponentType<{className?: string;}>;posts: BlogListItem[];}) {
  if (posts.length === 0) return null;
  return (
    <div className="rounded-3xl bg-white p-6 shadow-soft">
      <p className="flex items-center gap-2 font-display text-sm font-semibold text-forest"><Icon className="h-4 w-4 text-emerald" /> {title}</p>
      <div className="mt-4 space-y-4">
        {posts.map((p) =>
        <Link key={p._id} to={`/blog/${p.slug}`} className="flex gap-3 group">
            <img src={resolveImage(p.featuredImage)} alt={p.title} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
            <div>
              <p className="text-sm font-medium text-forest transition-colors group-hover:text-emerald line-clamp-2">{p.title}</p>
              <p className="mt-1 text-xs text-forest/40">{formatDate(p.publishedAt || p.createdAt)}</p>
            </div>
          </Link>
        )}
      </div>
    </div>);

}

export function Blog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('-publishedAt');
  const [popular, setPopular] = useState<BlogListItem[]>([]);
  const [recent, setRecent] = useState<BlogListItem[]>([]);

  const { items, meta, loading, error, hasMore, loadMore } = useApiList<BlogListItem>('/blogs', {
    q: search || undefined,
    category: category || undefined,
    sort
  });

  useEffect(() => {
    apiGetList<BlogListItem>('/blogs', { sort: '-views', limit: 4 }).then(({ data }) => setPopular(data)).catch(() => {});
    apiGetList<BlogListItem>('/blogs', { sort: '-publishedAt', limit: 4 }).then(({ data }) => setRecent(data)).catch(() => {});
  }, []);

  const featured = items[0];
  const rest = items.slice(1);

  return (
    <main className="min-h-screen bg-cream pt-16">
      <PageBanner
        eyebrow="Stories & Guides"
        title="The Roxaval Blog"
        subtitle="Travel guides, culture, food and inspiration for your next Sri Lankan adventure."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />


      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search articles…"
          filters={[{ key: 'category', label: 'Categories', options: CATEGORY_OPTIONS }]}
          values={{ category }}
          onFilterChange={(_key, value) => setCategory(value)}
          sortOptions={SORT_OPTIONS}
          sort={sort}
          onSortChange={setSort} />


        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            {loading && items.length === 0 && <LoadingState title="Loading articles…" />}
            {error && <ErrorState message={error} />}
            {!loading && !error && items.length === 0 &&
            <EmptyState title="No articles found" message="Try a different search term or category." />
            }

            {featured &&
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
                <span className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold"><FlameIcon className="h-3.5 w-3.5" /> Featured</span>
                <ArticleCard post={featured} large />
              </motion.div>
            }

            <div className="grid gap-6 sm:grid-cols-2">
              {rest.map((post, i) =>
              <motion.div key={post._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}>
                  <ArticleCard post={post} />
                </motion.div>
              )}
            </div>

            <Pagination meta={meta} shown={items.length} hasMore={hasMore} loading={loading} onLoadMore={loadMore} />
          </div>

          <div className="space-y-6">
            <SidebarList title="Popular Posts" icon={EyeIcon} posts={popular} />
            <SidebarList title="Recent Posts" icon={ClockIcon} posts={recent} />
          </div>
        </div>
      </section>
    </main>);

}
