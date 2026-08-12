
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { StarIcon, QuoteIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiGetList } from '../../lib/api';
import { SectionHeading } from '../ui/SectionHeading';
import type { Review } from '../../types/review';

const AUTOPLAY_INTERVAL = 4000;
const SWIPE_THRESHOLD = 50;
const TEXT_LIMIT = 220;

const WELCOME_PHOTOS = [
'/welcome-photos/welcome-1.jpeg',
'/welcome-photos/welcome-2.jpeg',
'/welcome-photos/welcome-3.jpeg',
'/welcome-photos/welcome-4.jpeg',
'/welcome-photos/welcome-5.jpeg',
'/welcome-photos/welcome-6.jpeg'];

// Real reviews (especially TripAdvisor ones) run long — trim to a clean,
// word-boundary snippet for the homepage card and point to /reviews for
// the rest, rather than showing a wall of text.
function truncate(text: string, limit: number) {
  if (text.length <= limit) return text;
  return text.slice(0, text.lastIndexOf(' ', limit)) + '…';
}

export function Reviews() {
  const { t } = useTranslation('home');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    apiGetList<Review>('/reviews', { isFeatured: true, limit: 8, sort: '-createdAt' }).
    then(async ({ data }) => {
      if (data.length > 0) {
        setReviews(data);
        return;
      }
      const fallback = await apiGetList<Review>('/reviews', { limit: 8, sort: '-createdAt' });
      setReviews(fallback.data);
    }).
    catch(() => {});
  }, []);

  const go = useCallback((d: number) => {
    setDir(d);
    setIndex((i) => (i + d + reviews.length) % reviews.length);
  }, [reviews.length]);

  useEffect(() => {
    if (isPaused || reviews.length < 2) return;
    const id = setInterval(() => go(1), AUTOPLAY_INTERVAL);
    return () => clearInterval(id);
  }, [isPaused, go, reviews.length]);

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x <= -SWIPE_THRESHOLD) {
      go(1);
    } else if (info.offset.x >= SWIPE_THRESHOLD) {
      go(-1);
    }
  };

  if (reviews.length === 0) return null;

  const r = reviews[index];
  const name = r.customer?.user?.fullName || r.reviewerName || 'Verified Traveler';

  return (
    <section id="reviews" className="relative py-24 bg-white overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('reviews.eyebrow')}
          title={t('reviews.title')}
          subtitle={t('reviews.subtitle')} />


        <div
          className="relative mt-14"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}>

          <div className="relative min-h-[260px] rounded-3xl bg-cream p-8 sm:p-12 shadow-soft overflow-hidden">
            <QuoteIcon className="absolute top-6 right-8 h-20 w-20 text-emerald/10" />
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={r._id}
                custom={dir}
                initial={{ opacity: 0, x: dir >= 0 ? 60 : -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir >= 0 ? -60 : 60 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={handleDragEnd}
                className="touch-pan-y cursor-grab active:cursor-grabbing">

                <div className="flex gap-1">
                  {Array.from({ length: r.rating }).map((_, i) =>
                  <StarIcon key={i} className="h-5 w-5 fill-gold text-gold" />
                  )}
                </div>
                <p className="font-display mt-5 text-base sm:text-lg leading-relaxed text-forest">
                  “{truncate(r.text, TEXT_LIMIT)}”
                  {r.text.length > TEXT_LIMIT &&
                  <Link to="/reviews" className="ml-2 whitespace-nowrap text-sm font-semibold text-emerald hover:underline">Read full review</Link>
                  }
                </p>
                <div className="mt-8 flex items-center gap-4">
                  {r.images?.[0] ?
                  <img src={r.images[0]} alt={name} className="h-14 w-14 rounded-full object-cover ring-2 ring-gold/40" /> :

                  <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald/10 text-lg font-bold text-emerald ring-2 ring-gold/40">{name.charAt(0).toUpperCase()}</span>
                  }
                  <div>
                    <p className="font-semibold text-forest">{name}</p>
                    <p className="text-sm text-forest/60">{r.country || (r.source === 'tripadvisor' ? 'via Tripadvisor' : '')}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button onClick={() => go(-1)} aria-label={t('reviews.previous')} className="grid h-11 w-11 place-items-center rounded-full border border-forest/15 text-forest transition-colors hover:bg-forest hover:text-white">
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {reviews.map((rv, i) =>
              <button
                key={rv._id}
                onClick={() => {setDir(i > index ? 1 : -1);setIndex(i);}}
                aria-label={`Review ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-emerald' : 'w-2 bg-forest/20 hover:bg-forest/40'}`} />

              )}
            </div>
            <button onClick={() => go(1)} aria-label={t('reviews.next')} className="grid h-11 w-11 place-items-center rounded-full border border-forest/15 text-forest transition-colors hover:bg-forest hover:text-white">
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-16">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-emerald/70">Fresh Off the Plane</p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
            {WELCOME_PHOTOS.map((src, i) =>
            <motion.div
              key={src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group aspect-square overflow-hidden rounded-2xl shadow-soft ring-1 ring-forest/5">

                <img src={src} alt="Guest welcomed by Roxaval Travels at the airport" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>);

}
