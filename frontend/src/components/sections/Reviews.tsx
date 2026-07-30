
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { StarIcon, QuoteIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { reviews } from '../../data/content';
import { SectionHeading } from '../ui/SectionHeading';

const AUTOPLAY_INTERVAL = 4000;
const SWIPE_THRESHOLD = 50;

export function Reviews() {
  const { t } = useTranslation('home');
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const go = useCallback((d: number) => {
    setDir(d);
    setIndex((i) => (i + d + reviews.length) % reviews.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => go(1), AUTOPLAY_INTERVAL);
    return () => clearInterval(id);
  }, [isPaused, go]);

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x <= -SWIPE_THRESHOLD) {
      go(1);
    } else if (info.offset.x >= SWIPE_THRESHOLD) {
      go(-1);
    }
  };

  const r = reviews[index];

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

          <div className="relative min-h-[300px] rounded-3xl bg-cream p-8 sm:p-12 shadow-soft overflow-hidden">
            <QuoteIcon className="absolute top-6 right-8 h-20 w-20 text-emerald/10" />
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={r.id}
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
                <p className="font-display mt-6 text-xl sm:text-2xl leading-relaxed text-forest">“{r.text}”</p>
                <div className="mt-8 flex items-center gap-4">
                  <img src={r.avatar} alt={r.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-gold/40" />
                  <div>
                    <p className="font-semibold text-forest">{r.name}</p>
                    <p className="text-sm text-forest/60">{r.country}</p>
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
                key={rv.id}
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
      </div>
    </section>);

}