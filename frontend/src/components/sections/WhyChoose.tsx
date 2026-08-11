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

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('whyChoose.eyebrow')}
          title={t('whyChoose.title')}
          subtitle={t('whyChoose.subtitle')}
          stagger />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyChoose.map((f, i) => {
            const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[f.icon] || Icons.CheckIcon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
                className="group relative flex items-start gap-4 rounded-2xl bg-white p-5 shadow-soft transition-shadow duration-300 hover:shadow-lift">

                <div
                  style={{ transform: `rotate(${STAMP_TILT[i % STAMP_TILT.length]}deg)` }}
                  className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-dashed border-emerald/40 bg-cream text-emerald transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105">

                  <Icon className="h-5 w-5" />
                  <span className="absolute -bottom-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-gold font-display text-[10px] font-bold text-forest">
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0 pt-1">
                  <p className="font-display text-sm font-semibold leading-snug text-forest">{f.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-forest/60">{f.text}</p>
                </div>
              </motion.div>);

          })}
        </div>
      </div>
    </section>);

}
