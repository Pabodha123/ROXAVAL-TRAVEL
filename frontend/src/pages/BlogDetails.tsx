import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarIcon, EyeIcon, FacebookIcon, LinkIcon, TwitterIcon, CheckIcon, HeartIcon } from 'lucide-react';
import { PageBanner } from '../components/layout/PageBanner';
import { LoadingState, ErrorState } from '../components/ui/StatusState';
import { apiGetOne, apiGetList, API_ORIGIN } from '../lib/api';
import { formatDateLong as formatDate } from '../lib/date';
import type { BlogPost, BlogListItem } from '../types/blog';

// Admin-uploaded images are stored as backend-relative paths (/uploads/images/...);
// seeded/static images already live in the frontend's own /public folder.
function resolveImage(url: string) {
  return url.startsWith('/uploads') ? `${API_ORIGIN}${url}` : url;
}

export function BlogDetails() {
  const { slug } = useParams<{slug: string;}>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiGetOne<BlogPost>(`/blogs/slug/${slug}`).
    then((data) => {
      if (cancelled) return;
      setPost(data);
      return apiGetList<BlogListItem>('/blogs', { category: data.category, limit: 4 }).
      then(({ data: list }) => !cancelled && setRelated(list.filter((p) => p.slug !== slug).slice(0, 3)));
    }).
    catch((err: Error) => !cancelled && setError(err.message)).
    finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <main className="min-h-screen bg-cream pt-24"><LoadingState title="Loading article…" /></main>;
  if (error || !post) return <main className="min-h-screen bg-cream pt-24"><ErrorState title="Article not found" message={error || undefined} /></main>;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url: shareUrl });
        return;
      } catch {
        // user cancelled or share failed — fall through to copy-link
      }
    }
    await navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (post.template === 'romantic') {
    return (
      <main className="min-h-screen bg-[#fbf4ee]">
        <div className="relative h-[62vh] min-h-[420px] w-full overflow-hidden sm:h-[80vh]">
          <img src={resolveImage(post.featuredImage)} alt={post.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
          <div className="absolute inset-0 flex flex-col items-center justify-end px-4 pb-12 text-center sm:pb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-gold">{post.category}</span>
            <h1 className="mt-4 max-w-3xl font-display text-3xl italic leading-tight text-white sm:text-5xl">{post.title}</h1>
            <div className="mt-5 flex items-center gap-3 text-gold/80">
              <span className="h-px w-10 bg-gold/50" />
              <HeartIcon className="h-4 w-4 fill-gold text-gold" />
              <span className="h-px w-10 bg-gold/50" />
            </div>
          </div>
        </div>

        <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-4 border-b border-forest/10 pb-8 text-sm text-forest/45">
            <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4" /> {formatDate(post.publishedAt || post.createdAt)}</span>
            <span className="flex items-center gap-1.5"><EyeIcon className="h-4 w-4" /> {post.views} views</span>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" aria-label="Share on Facebook" className="text-forest/40 hover:text-forest"><FacebookIcon className="h-4 w-4" /></a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer" aria-label="Share on X" className="text-forest/40 hover:text-forest"><TwitterIcon className="h-4 w-4" /></a>
            <button onClick={share} aria-label="Copy link" className="flex items-center gap-1.5 text-forest/40 hover:text-forest">
              {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />} {copied ? 'Copied!' : 'Share'}
            </button>
          </div>

          {post.content &&
          <div className="mt-10 space-y-5 text-center font-display text-xl italic leading-relaxed text-forest/70">
              {post.content.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}
            </div>
          }

          <div className="mt-16 space-y-16">
            {post.sections.map((s, i) =>
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }}>
                {s.image &&
              <div className="-mx-4 mb-8 overflow-hidden rounded-[1.5rem] shadow-lift sm:-mx-6 sm:rounded-[2rem]">
                    <img src={resolveImage(s.image)} alt={s.heading} loading="lazy" className="h-72 w-full object-cover sm:h-[26rem]" />
                  </div>
              }
                <div className="text-center">
                  <div className="mx-auto mb-3 flex items-center justify-center gap-2.5">
                    <span className="h-px w-6 bg-gold/50" />
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                    <span className="h-px w-6 bg-gold/50" />
                  </div>
                  <h2 className="font-display text-2xl italic font-semibold text-forest sm:text-3xl">{s.heading}</h2>
                </div>
                <div className="prose mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-forest/70">
                  {s.body.split(/\n\s*\n/).map((para, pi) => <p key={pi} className="mb-4">{para}</p>)}
                </div>
              </motion.div>
            )}
          </div>

          {post.tags?.length > 0 &&
          <div className="mt-16 flex flex-wrap justify-center gap-2 border-t border-forest/10 pt-8">
              {post.tags.map((t) => <span key={t} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-forest/60 shadow-soft">#{t}</span>)}
            </div>
          }
        </article>

        {related.length > 0 &&
        <section className="bg-white py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-center font-display text-2xl italic font-semibold text-forest">More Love Stories</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                {related.map((p) =>
              <Link key={p._id} to={`/blog/${p.slug}`} className="group block overflow-hidden rounded-3xl bg-cream shadow-soft transition-shadow hover:shadow-lift">
                    <div className="h-40 overflow-hidden">
                      <img src={resolveImage(p.featuredImage)} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-base font-semibold text-forest transition-colors group-hover:text-emerald line-clamp-2">{p.title}</h3>
                      <p className="mt-1.5 text-xs text-forest/50">{formatDate(p.publishedAt || p.createdAt)}</p>
                    </div>
                  </Link>
              )}
              </div>
            </div>
          </section>
        }
      </main>);

  }

  return (
    <main className="min-h-screen bg-cream pt-16">
      <PageBanner
        eyebrow={post.category}
        title={post.title}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: post.title }]} />


      <article className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="overflow-hidden rounded-[2rem] shadow-lift">
          <img src={resolveImage(post.featuredImage)} alt={post.title} className="h-72 w-full object-cover sm:h-[420px]" />
        </motion.div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest/10 pb-6">
          <div className="flex items-center gap-4 text-sm text-forest/50">
            <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4" /> {formatDate(post.publishedAt || post.createdAt)}</span>
            <span className="flex items-center gap-1.5"><EyeIcon className="h-4 w-4" /> {post.views} views</span>
          </div>
          <div className="flex items-center gap-2">
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" aria-label="Share on Facebook" className="grid h-9 w-9 place-items-center rounded-full bg-forest/5 text-forest hover:bg-forest hover:text-white transition-colors">
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer" aria-label="Share on X" className="grid h-9 w-9 place-items-center rounded-full bg-forest/5 text-forest hover:bg-forest hover:text-white transition-colors">
              <TwitterIcon className="h-4 w-4" />
            </a>
            <button onClick={share} aria-label="Copy link" className="flex items-center gap-1.5 rounded-full bg-forest/5 px-3.5 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white transition-colors">
              {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />} {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>

        {post.sections?.length > 0 ?
        <div className="space-y-16 sm:space-y-24">
            {post.content &&
          <div className="prose max-w-none text-base leading-relaxed text-forest/75">
                {post.content.split(/\n\s*\n/).map((para, i) => <p key={i} className="mb-5">{para}</p>)}
              </div>
          }
            {post.sections.map((s, i) =>
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">

                <div className={s.image ? '' : 'lg:col-span-2'}>
                  <span className="block font-display text-6xl font-bold leading-none text-forest/10 sm:text-8xl">{String(i + 1).padStart(2, '0')}</span>
                  <h2 className="-mt-4 font-display text-xl font-semibold text-forest sm:-mt-6 sm:text-2xl">{s.heading}</h2>
                  <div className="prose mt-4 max-w-none text-base leading-relaxed text-forest/70">
                    {s.body.split(/\n\s*\n/).map((para, pi) => <p key={pi} className="mb-4">{para}</p>)}
                  </div>
                </div>
                {s.image &&
            <div className={`overflow-hidden rounded-[2rem] shadow-soft ${i % 2 === 1 ? 'lg:order-first' : ''}`}>
                    <img src={resolveImage(s.image)} alt={s.heading} loading="lazy" className="h-64 w-full object-cover sm:h-96" />
                  </div>
            }
              </motion.div>
          )}
          </div> :

        <div className="prose max-w-none text-base leading-relaxed text-forest/75">
            {post.content.split(/\n\s*\n/).map((para, i) => <p key={i} className="mb-5">{para}</p>)}
          </div>
        }

        {post.gallery?.length > 0 &&
        <div className="grid gap-4 sm:grid-cols-3">
            {post.gallery.map((img, i) => <img key={i} src={resolveImage(img)} alt="" loading="lazy" className="h-48 w-full rounded-2xl object-cover" />)}
          </div>
        }

        {post.tags?.length > 0 &&
        <div className="flex flex-wrap gap-2 border-t border-forest/10 pt-6">
            {post.tags.map((t) => <span key={t} className="rounded-full bg-cream px-3 py-1.5 text-xs font-medium text-forest/60">#{t}</span>)}
          </div>
        }
      </article>

      {related.length > 0 &&
      <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-semibold text-forest">Related Articles</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {related.map((p) =>
            <Link key={p._id} to={`/blog/${p.slug}`} className="group block overflow-hidden rounded-3xl bg-cream shadow-soft transition-shadow hover:shadow-lift">
                  <div className="h-40 overflow-hidden">
                    <img src={resolveImage(p.featuredImage)} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-base font-semibold text-forest transition-colors group-hover:text-emerald line-clamp-2">{p.title}</h3>
                    <p className="mt-1.5 text-xs text-forest/50">{formatDate(p.publishedAt || p.createdAt)}</p>
                  </div>
                </Link>
            )}
            </div>
          </div>
        </section>
      }
    </main>);

}
