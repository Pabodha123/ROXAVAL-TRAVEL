
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon, ArrowRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { activities } from '../../data/content';
import { SectionHeading } from '../ui/SectionHeading';

export function Activities() {
  const { t } = useTranslation('home');
  return (
    <section id="activities" className="relative py-24 bg-forest overflow-hidden">
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald/30 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          light
          eyebrow={t('activities.eyebrow')}
          title={t('activities.title')}
          subtitle={t('activities.subtitle')} />


        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map((a, i) =>
          <motion.article
            key={a.id}
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8 }}
            className="group relative h-80 overflow-hidden rounded-3xl">
            
              <img src={a.image} alt={a.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/40 to-transparent transition-opacity group-hover:from-forest/95" />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <h3 className="font-display text-xl font-semibold text-white">{a.name}</h3>
                <p className="mt-1.5 text-sm text-cream/80 leading-relaxed line-clamp-2">{a.description}</p>
                <button className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-4 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-gold group-hover:text-forest">
                  {t('activities.exploreActivity')} <ArrowUpRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.article>
          )}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            to="/activities"
            className="group inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest">

            {t('activities.viewAllActivities')}
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>);

}