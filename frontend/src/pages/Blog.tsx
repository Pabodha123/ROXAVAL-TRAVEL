import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarIcon, EyeIcon, FlameIcon, ClockIcon, ArrowRightIcon } from 'lucide-react';
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

// One illustrative tile per category — a quick, colourful way into the
// archive that a plain dropdown filter doesn't give you. Each gets its own
// tint so the row reads as a curated set rather than a repeated pattern.
const CATEGORY_TILES = [
{ label: 'Travel Guide', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Sigiriya_Fortress%2C_Sri_Lanka.jpg/640px-Sigiriya_Fortress%2C_Sri_Lanka.jpg', from: 'from-forest/85' },
{ label: 'Wildlife', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Elephants_of_Minneriya_National_Park%2C_Sri_Lanka.jpg/640px-Elephants_of_Minneriya_National_Park%2C_Sri_Lanka.jpg', from: 'from-yellow-900/80' },
{ label: 'Culture', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Traditional_masks_-_Ambalangoda_01.jpg/640px-Traditional_masks_-_Ambalangoda_01.jpg', from: 'from-purple-900/80' },
{ label: 'Food & Culture', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/SL-rice_and_curry.jpg/640px-SL-rice_and_curry.jpg', from: 'from-orange-800/80' },
{ label: 'Tips & Advice', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bentota_Sunset_-_panoramio.jpg/640px-Bentota_Sunset_-_panoramio.jpg', from: 'from-rose-800/80' },
{ label: 'Adventure', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Nine_Arches_Bridge_in_Ella.jpg/640px-Nine_Arches_Bridge_in_Ella.jpg', from: 'from-emerald/85' }];


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
      <section className="border-b border-forest/10 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.35em] text-gold">Stories &amp; Guides</p>
          <h1 className="mt-3 text-center font-display text-4xl font-semibold text-forest sm:text-5xl">The Roxaval Journal</h1>
          <p className="mx-auto mt-3 max-w-xl text-center font-display text-base italic text-forest/55">Travel guides, culture, food and inspiration for your next Sri Lankan adventure.</p>

          {featured &&
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mt-12 grid gap-8 overflow-hidden rounded-[2rem] bg-cream shadow-lift lg:grid-cols-2">
              <Link to={`/blog/${featured.slug}`} className="block h-64 overflow-hidden lg:h-full">
                <img src={resolveImage(featured.featuredImage)} alt={featured.title} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
              </Link>
              <div className="flex flex-col justify-center p-8 sm:p-12">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest"><FlameIcon className="h-3.5 w-3.5 text-gold" /> Featured Story</span>
                <Link to={`/blog/${featured.slug}`} className="mt-4 font-display text-2xl font-semibold leading-snug text-forest transition-colors hover:text-emerald sm:text-3xl">{featured.title}</Link>
                <p className="mt-3 font-display text-base italic leading-relaxed text-forest/60">{featured.excerpt}</p>
                <Link to={`/blog/${featured.slug}`} className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-emerald">
                  Read the Full Story <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          }

          <div className="mt-14">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-forest/40">Explore by Interest</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {CATEGORY_TILES.map((c) =>
              <button
                key={c.label}
                type="button"
                onClick={() => { setCategory(c.label); document.getElementById('blog-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                className="group relative h-24 overflow-hidden rounded-2xl text-left shadow-soft sm:h-28">

                  <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${c.from} to-transparent`} />
                  <span className="absolute bottom-2.5 left-3 right-3 font-display text-sm font-semibold text-white">{c.label}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="blog-results" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
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
