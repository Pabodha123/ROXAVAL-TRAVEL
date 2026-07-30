import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowRightIcon,
  CheckIcon,
  MessageCircleIcon } from
'lucide-react';
import { Reveal } from '../ui/Reveal';

export function CustomTourCta() {
  const { t } = useTranslation('home');
  const benefits = [
    t('customTourCta.benefit1'),
    t('customTourCta.benefit2'),
    t('customTourCta.benefit3'),
    t('customTourCta.benefit4'),
  ];
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald via-emerald to-forest py-20 sm:py-24">
      <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true">
        <div className="absolute -left-24 -top-32 h-96 w-96 rounded-full border-[70px] border-gold" />
        <div className="absolute -bottom-40 right-0 h-[30rem] w-[30rem] rounded-full border-[85px] border-emerald-light" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20 lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">
            <span className="h-px w-8 bg-gold" />
            {t('customTourCta.eyebrow')}
          </span>
          <h2 className="font-display mt-5 max-w-2xl text-4xl font-semibold leading-[1.1] text-white sm:text-5xl">
            {t('customTourCta.titleLine1')} <span className="italic text-gold">{t('customTourCta.titleHighlight')}</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/80 sm:text-lg">
            {t('customTourCta.subtitle')}
          </p>

          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) =>
            <li key={benefit} className="flex items-center gap-2.5 text-sm font-medium text-cream/90">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-gold text-forest">
                  <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {benefit}
              </li>
            )}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/packages#custom-tour"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-4 text-sm font-semibold text-forest shadow-lift transition-transform hover:scale-[1.04] active:scale-95">

              {t('customTourCta.createMyCustomTour')}
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://wa.me/94771234567"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest">

              <MessageCircleIcon className="h-4 w-4" />
              {t('customTourCta.talkToExpert')}
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <motion.div
            initial={{ rotate: 2, opacity: 0 }}
            whileInView={{ rotate: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden rounded-[2rem] bg-[#e6f6ec] p-6 shadow-2xl sm:p-10">

            <motion.div
              aria-hidden="true"
              animate={{ opacity: [0.35, 0.65, 0.35] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute -left-12 -top-12 h-56 w-56 rounded-full bg-gold/30 blur-3xl" />

            <motion.div
              aria-hidden="true"
              animate={{ opacity: [0.3, 0.55, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="pointer-events-none absolute -bottom-14 -right-10 h-64 w-64 rounded-full bg-emerald-light/30 blur-3xl" />

            <motion.div
              className="relative mx-auto aspect-square w-full max-w-[380px]"
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.06, rotate: -1 }}
              style={{ transformOrigin: 'center' }}>

              <img
                src="/sri-lanka-map.webp"
                alt="Sri Lanka"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain drop-shadow-[0_25px_50px_rgba(15,61,46,0.35)] transition-transform duration-700 ease-out will-change-transform" />

            </motion.div>
          </motion.div>
          <div className="absolute -right-4 -top-5 hidden rounded-full bg-gold px-4 py-2 text-xs font-bold text-forest shadow-lg sm:block">
            {t('customTourCta.cardBadge')}
          </div>
        </Reveal>
      </div>
    </section>);

}