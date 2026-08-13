import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarIcon, EyeIcon, FacebookIcon, LinkIcon, TwitterIcon, CheckIcon, HeartIcon, MapPinIcon, ArrowLeftIcon } from 'lucide-react';
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
  const navigate = useNavigate();
  // Same history.state.idx fallback as BackButton/BreadcrumbBackRow — a
  // visitor arriving straight from a shared link has no in-app history to
  // go back to, so this falls back to the blog list instead of stranding them.
  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);else
    navigate('/blog');
  };
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
      <main className="min-h-screen bg-[#faf3e8]">
        <div className="px-4 pt-8 sm:pt-10">
          <button onClick={goBack} className="inline-flex items-center gap-1.5 rounded-full border border-[#3a2b1f]/15 bg-white/70 px-3.5 py-2 text-xs font-semibold text-[#3a2b1f] shadow-soft backdrop-blur transition-colors hover:bg-white">
            <ArrowLeftIcon className="h-3.5 w-3.5" /> Back
          </button>
        </div>
        <div className="px-4 pt-16 pb-8 text-center sm:pt-24">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.4em] text-gold">
            <MapPinIcon className="h-3.5 w-3.5" /> Sri Lanka
          </span>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-3xl font-bold uppercase leading-tight tracking-wide text-[#3a2b1f] sm:text-5xl">{post.title}</h1>
          <p className="mt-3 font-display text-xl italic text-gold sm:text-2xl">A Sri Lanka Honeymoon Guide</p>
          <div className="mx-auto mt-5 flex items-center justify-center gap-3 text-gold/70">
            <span className="h-px w-10 bg-gold/40" />
            <HeartIcon className="h-4 w-4 fill-gold text-gold" />
            <span className="h-px w-10 bg-gold/40" />
          </div>
        </div>

        <div className="mx-auto max-w-md px-4 sm:max-w-lg sm:px-6">
          <div className="overflow-hidden rounded-t-[5rem] rounded-b-[2rem] shadow-2xl ring-8 ring-white sm:rounded-t-[7rem]">
            <img src={resolveImage(post.featuredImage)} alt={post.title} className="h-[26rem] w-full object-cover sm:h-[32rem]" />
          </div>
        </div>

        <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-4 border-b border-[#3a2b1f]/10 pb-8 text-sm text-[#3a2b1f]/45">
            <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4" /> {formatDate(post.publishedAt || post.createdAt)}</span>
            <span className="flex items-center gap-1.5"><EyeIcon className="h-4 w-4" /> {post.views} views</span>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" aria-label="Share on Facebook" className="text-[#3a2b1f]/40 hover:text-gold"><FacebookIcon className="h-4 w-4" /></a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer" aria-label="Share on X" className="text-[#3a2b1f]/40 hover:text-gold"><TwitterIcon className="h-4 w-4" /></a>
            <button onClick={share} aria-label="Copy link" className="flex items-center gap-1.5 text-[#3a2b1f]/40 hover:text-gold">
              {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />} {copied ? 'Copied!' : 'Share'}
            </button>
          </div>

          {post.content &&
          <div className="mt-10 space-y-5 text-center font-display text-xl italic leading-relaxed text-[#3a2b1f]/70">
              {post.content.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}
            </div>
          }

          <div className="mt-16 space-y-16">
            {post.sections.map((s, i) =>
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }}>
                {s.image &&
              <div className="-mx-4 mb-8 overflow-hidden rounded-[1.5rem] shadow-lift ring-1 ring-gold/20 sm:-mx-6 sm:rounded-[2rem]">
                    <img src={resolveImage(s.image)} alt={s.heading} loading="lazy" className="h-72 w-full object-cover sm:h-[26rem]" />
                  </div>
              }
                <div className="text-center">
                  <div className="mx-auto mb-3 flex items-center justify-center gap-2.5">
                    <span className="h-px w-6 bg-gold/50" />
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                    <span className="h-px w-6 bg-gold/50" />
                  </div>
                  <h2 className="font-display text-2xl italic font-semibold text-[#3a2b1f] sm:text-3xl">{s.heading}</h2>
                </div>
                <div className="prose mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-[#3a2b1f]/70">
                  {s.body.split(/\n\s*\n/).map((para, pi) => <p key={pi} className="mb-4">{para}</p>)}
                </div>
              </motion.div>
            )}
          </div>

          {post.tags?.length > 0 &&
          <div className="mt-16 flex flex-wrap justify-center gap-2 border-t border-[#3a2b1f]/10 pt-8">
              {post.tags.map((t) => <span key={t} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#3a2b1f]/60 shadow-soft ring-1 ring-gold/15">#{t}</span>)}
            </div>
          }
        </article>

        {related.length > 0 &&
        <section className="bg-white py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-center font-display text-2xl italic font-semibold text-[#3a2b1f]">More Love Stories</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                {related.map((p) =>
              <Link key={p._id} to={`/blog/${p.slug}`} className="group block overflow-hidden rounded-3xl bg-[#faf3e8] shadow-soft transition-shadow hover:shadow-lift">
                    <div className="h-40 overflow-hidden">
                      <img src={resolveImage(p.featuredImage)} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-base font-semibold text-[#3a2b1f] transition-colors group-hover:text-gold line-clamp-2">{p.title}</h3>
                      <p className="mt-1.5 text-xs text-[#3a2b1f]/50">{formatDate(p.publishedAt || p.createdAt)}</p>
                    </div>
                  </Link>
              )}
              </div>
            </div>
          </section>
        }
      </main>);

  }

  if (post.template === 'coastal') {
    const storySections = post.sections.filter((s) => s.image);
    const infoSections = post.sections.filter((s) => !s.image);
    return (
      <main className="min-h-screen bg-[#0a1e38]">
        <div className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-sky-100 to-[#0a1e38] pb-24 pt-8 sm:pb-32 sm:pt-10">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <button onClick={goBack} className="inline-flex items-center gap-1.5 rounded-full border border-[#0a1e38]/15 bg-white/70 px-3.5 py-2 text-xs font-semibold text-[#0a1e38] shadow-soft backdrop-blur transition-colors hover:bg-white">
              <ArrowLeftIcon className="h-3.5 w-3.5" /> Back
            </button>
          </div>
          <div className="mx-auto max-w-2xl px-4 pt-20 text-center sm:px-6 sm:pt-24">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700">{post.category}</span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-[#0a1e38] sm:text-5xl">{post.title}</h1>
            {post.excerpt &&
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-[#0a1e38]/60">{post.excerpt}</p>
            }
          </div>
          <div className="mx-auto mt-10 max-w-4xl px-4 sm:px-6">
            <div className="overflow-hidden rounded-[2rem] shadow-2xl ring-[10px] ring-white/50 sm:rounded-[2.5rem]">
              <img src={resolveImage(post.featuredImage)} alt={post.title} className="h-60 w-full object-cover sm:h-[26rem]" />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-4 rounded-full bg-white/5 px-6 py-3 text-sm text-white/55 ring-1 ring-white/10">
            <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4" /> {formatDate(post.publishedAt || post.createdAt)}</span>
            <span className="flex items-center gap-1.5"><EyeIcon className="h-4 w-4" /> {post.views} views</span>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" aria-label="Share on Facebook" className="text-white/45 hover:text-white"><FacebookIcon className="h-4 w-4" /></a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer" aria-label="Share on X" className="text-white/45 hover:text-white"><TwitterIcon className="h-4 w-4" /></a>
            <button onClick={share} aria-label="Copy link" className="flex items-center gap-1.5 text-white/45 hover:text-white">
              {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />} {copied ? 'Copied!' : 'Share'}
            </button>
          </div>

          {post.content &&
          <div className="mx-auto mt-10 max-w-2xl space-y-5 text-center text-base leading-relaxed text-white/65">
              {post.content.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}
            </div>
          }
        </div>

        <div className="mx-auto max-w-5xl space-y-14 px-4 py-16 sm:px-6 sm:space-y-20">
          {storySections.map((s, i) =>
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="grid items-center gap-8 overflow-hidden rounded-[2rem] bg-white/[0.04] p-3 ring-1 ring-white/10 lg:grid-cols-2 lg:gap-0 lg:p-0">

              <div className={`overflow-hidden rounded-[1.5rem] lg:rounded-none lg:h-full ${i % 2 === 1 ? 'lg:order-last' : ''}`}>
                <img src={resolveImage(s.image)} alt={s.heading} loading="lazy" className="h-56 w-full object-cover sm:h-72 lg:h-full lg:min-h-[20rem]" />
              </div>
              <div className="px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
                <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">{s.heading}</h2>
                <div className="prose mt-4 max-w-none text-base leading-relaxed text-white/65">
                  {s.body.split(/\n\s*\n/).map((para, pi) => <p key={pi} className="mb-4">{para}</p>)}
                </div>
              </div>
            </motion.div>
          )}

          {infoSections.length > 0 &&
          <div className="grid gap-6 sm:grid-cols-2">
              {infoSections.map((s, i) =>
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5 }} className="rounded-3xl bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-8">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300/70">{String(i + 1).padStart(2, '0')}</span>
                  <h2 className="mt-2 font-display text-lg font-semibold text-white sm:text-xl">{s.heading}</h2>
                  <div className="prose mt-3 max-w-none text-sm leading-relaxed text-white/60">
                    {s.body.split(/\n\s*\n/).map((para, pi) => <p key={pi} className="mb-3">{para}</p>)}
                  </div>
                </motion.div>
            )}
            </div>
          }

          {post.tags?.length > 0 &&
          <div className="flex flex-wrap justify-center gap-2 border-t border-white/10 pt-8">
              {post.tags.map((t) => <span key={t} className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-white/55 ring-1 ring-white/10">#{t}</span>)}
            </div>
          }
        </div>

        {related.length > 0 &&
        <section className="bg-[#081729] py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-center font-display text-2xl font-semibold text-white">More Coastal Reads</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                {related.map((p) =>
              <Link key={p._id} to={`/blog/${p.slug}`} className="group block overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 transition-colors hover:bg-white/[0.07]">
                    <div className="h-40 overflow-hidden">
                      <img src={resolveImage(p.featuredImage)} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-base font-semibold text-white transition-colors group-hover:text-sky-300 line-clamp-2">{p.title}</h3>
                      <p className="mt-1.5 text-xs text-white/40">{formatDate(p.publishedAt || p.createdAt)}</p>
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
