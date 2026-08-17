import React from 'react';
import { motion } from 'framer-motion';
import { AwardIcon, SparklesIcon, CompassIcon, BedDoubleIcon, BadgePercentIcon, ShieldCheckIcon, HeadphonesIcon, CarFrontIcon, CheckIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { whyChoose } from '../../data/content';
import { SectionHeading } from '../ui/SectionHeading';

// A plain `import * as Icons from 'lucide-react'` (needed since `f.icon`
// below is a data-driven string, not a static import) pulls in every icon
// in the library -- lucide-react doesn't tree-shake through a namespace
// import, so that one line was bloating this chunk to 800KB+. Only the
// handful actually referenced by data/content.ts's `whyChoose` are needed.
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Award: AwardIcon, Sparkles: SparklesIcon, Compass: CompassIcon, BedDouble: BedDoubleIcon,
  BadgePercent: BadgePercentIcon, ShieldCheck: ShieldCheckIcon, Headphones: HeadphonesIcon, CarFront: CarFrontIcon,
};

export function WhyChoose() {
  const { t } = useTranslation('home');
  return (
    <section id="my-tours" className="bg-cream py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('whyChoose.eyebrow')}
          title={t('whyChoose.title')}
          subtitle={t('whyChoose.subtitle')}
          stagger />

        <div className="relative mt-14 overflow-hidden rounded-[2.5rem] bg-forest px-6 py-14 shadow-lift sm:px-10 lg:px-14">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

          <div className="relative grid gap-x-12 gap-y-5 sm:grid-cols-2">
            {whyChoose.map((f, i) => {
              const Icon = ICONS[f.icon] || CheckIcon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: Math.floor(i / 2) * 0.1 }}
                  className="group flex items-center gap-3">

                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-emerald shadow-soft transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="h-px w-6 shrink-0 bg-gold/50" />
                  <div className="min-w-0 flex-1 rounded-full bg-white/10 px-6 py-3.5 ring-1 ring-white/15 backdrop-blur-sm transition-colors duration-300 group-hover:bg-white/15">
                    <p className="truncate font-display text-sm font-semibold text-white sm:text-base">{f.title}</p>
                  </div>
                </motion.div>);

            })}
          </div>
        </div>
      </div>
    </section>);

}
