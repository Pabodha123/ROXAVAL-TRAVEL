
import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { whyChoose } from '../../data/content';
import { SectionHeading } from '../ui/SectionHeading';

export function WhyChoose() {
  const { t } = useTranslation('home');
  return (
    <section id="my-tours" className="relative py-24 bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('whyChoose.eyebrow')}
          title={t('whyChoose.title')}
          subtitle={t('whyChoose.subtitle')}
          stagger />


        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyChoose.map((f, i) => {
            const Icon = (Icons as Record<string, React.ComponentType<{className?: string;}>>)[f.icon] || Icons.CheckIcon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i % 4 * 0.18, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -10, scale: 1.03, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                className="group rounded-3xl bg-white p-7 shadow-soft transition-shadow duration-[350ms] ease-out hover:shadow-lift">

                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald/10 text-emerald transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald group-hover:text-white group-hover:rotate-6">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-forest">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-forest/65">{f.text}</p>
              </motion.div>);

          })}
        </div>
      </div>
    </section>);

}