import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { whyChoose } from '../../data/content';
import { SectionHeading } from '../ui/SectionHeading';

// Alternating hand-stamped rotation so the passport-stamp badges don't
// look machine-perfect — a few degrees off in either direction per stop.
const STAMP_TILT = [-6, 4, -3, 5, -5, 3, -4, 6];

export function WhyChoose() {
  const { t } = useTranslation('home');
  return (
    <section id="my-tours" className="relative overflow-hidden bg-cream py-24">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('whyChoose.eyebrow')}
          title={t('whyChoose.title')}
          subtitle={t('whyChoose.subtitle')}
          stagger />

        <div className="relative mt-20">
          {/* The route line every stop is pinned to — a travel trail, not a feature list */}
          <div className="absolute left-[27px] top-0 h-full w-px border-l-2 border-dashed border-emerald/25 sm:left-1/2 sm:-translate-x-1/2" />

          <div className="space-y-10 sm:space-y-4">
            {whyChoose.map((f, i) => {
              const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[f.icon] || Icons.CheckIcon;
              const onRight = i % 2 === 1;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, delay: (i % 4) * 0.1 }}
                  className={`group relative flex items-center gap-5 sm:gap-0 ${onRight ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}>

                  {/* Stamp badge — sits on the route line */}
                  <div className="relative z-10 shrink-0 sm:w-1/2 sm:px-10">
                    <div className={`flex sm:justify-center ${onRight ? 'sm:justify-start' : 'sm:justify-end'}`}>
                      <div
                        style={{ transform: `rotate(${STAMP_TILT[i % STAMP_TILT.length]}deg)` }}
                        className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-dashed border-emerald/40 bg-white text-emerald shadow-soft transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105">

                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* Milepost number, dead center on the line (desktop only) */}
                  <div className="absolute left-[27px] top-1/2 hidden h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold font-display text-[11px] font-bold text-forest sm:left-1/2 sm:grid">
                    {i + 1}
                  </div>

                  {/* Card */}
                  <div className="min-w-0 flex-1 sm:w-1/2 sm:px-10">
                    <div className={`rounded-2xl bg-white p-5 shadow-soft transition-shadow duration-300 group-hover:shadow-lift sm:max-w-sm ${onRight ? 'sm:ml-auto sm:text-right' : ''}`}>
                      <p className="font-display text-lg font-semibold text-forest">{f.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-forest/60">{f.text}</p>
                    </div>
                  </div>
                </motion.div>);

            })}
          </div>
        </div>
      </div>
    </section>);

}
