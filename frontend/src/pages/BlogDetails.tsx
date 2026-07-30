import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarIcon, EyeIcon, FacebookIcon, LinkIcon, TwitterIcon, CheckIcon } from 'lucide-react';
import { PageBanner } from '../components/layout/PageBanner';
import { LoadingState, ErrorState } from '../components/ui/StatusState';
import { apiGetOne, apiGetList, API_ORIGIN } from '../lib/api';
import type { BlogPost, BlogListItem } from '../types/blog';

// Admin-uploaded images are stored as backend-relative paths (/uploads/images/...);
// seeded/static images already live in the frontend's own /public folder.
function resolveImage(url: string) {
  return url.startsWith('/uploads') ? `${API_ORIGIN}${url}` : url;
}

function formatDate(d?: string) {
  return d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
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

        <div className="prose max-w-none text-base leading-relaxed text-forest/75">
          {post.content.split(/\n\s*\n/).map((para, i) => <p key={i} className="mb-5">{para}</p>)}
        </div>

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
