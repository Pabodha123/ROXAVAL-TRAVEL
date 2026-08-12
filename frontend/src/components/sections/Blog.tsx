import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarIcon, ArrowRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeading } from '../ui/SectionHeading';
import { apiGetList, API_ORIGIN } from '../../lib/api';
import { formatDate } from '../../lib/date';
import type { BlogListItem } from '../../types/blog';

// Admin-uploaded images are stored as backend-relative paths (/uploads/images/...);
// seeded/static images already live in the frontend's own /public folder.
function resolveImage(url: string) {
  return url.startsWith('/uploads') ? `${API_ORIGIN}${url}` : url;
}

export function Blog() {
  const { t } = useTranslation('home');
  const [posts, setPosts] = useState<BlogListItem[]>([]);

  useEffect(() => {
    apiGetList<BlogListItem>('/blogs', { sort: '-views', limit: 3 }).then(({ data }) => setPosts(data)).catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  return (
    <section id="blog" className="relative py-24 bg-sand">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionHeading
            align="left"
            eyebrow={t('blog.eyebrow')}
            title={t('blog.title')}
            subtitle={t('blog.subtitle')} />

          <Link to="/blog" className="hidden md:inline-flex items-center gap-2 rounded-full border border-forest/20 px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-white">
            {t('blog.viewAllPosts')} <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {posts.map((b, i) =>
          <motion.article
            key={b._id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8 }}
            className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft transition-shadow hover:shadow-lift">

              <Link to={`/blog/${b.slug}`} className="relative h-52 overflow-hidden">
                <img src={resolveImage(b.featuredImage)} alt={b.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-emerald">{b.category}</span>
              </Link>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-1.5 text-xs text-forest/50">
                  <CalendarIcon className="h-3.5 w-3.5" /> {formatDate(b.publishedAt || b.createdAt)}
                </div>
                <Link to={`/blog/${b.slug}`} className="font-display mt-2 text-lg font-semibold leading-snug text-forest group-hover:text-emerald transition-colors">{b.title}</Link>
                <p className="mt-2 flex-1 line-clamp-3 text-sm leading-relaxed text-forest/65">{b.excerpt}</p>
                <Link to={`/blog/${b.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald">
                  {t('blog.readMore')} <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.article>
          )}
        </div>
      </div>
    </section>);

}
