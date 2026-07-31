import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon, CompassIcon } from 'lucide-react';
import { Reveal } from '../ui/Reveal';

const DOT_PATTERN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Ccircle cx='2' cy='2' r='1.6' fill='%230f3d2e'/%3E%3C/svg%3E";

export function CustomTourCta() {
  const { t } = useTranslation('home');

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#eef6ec] via-[#f6f9ef] to-[#eaf5ee] py-14 sm:py-16">
      {/* Subtle abstract travel-themed pattern + gold accents, all very low opacity */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("${DOT_PATTERN}")` }} aria-hidden="true" />
      <CompassIcon aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rotate-12 text-forest/[0.04] sm:h-72 sm:w-72" strokeWidth={1} />
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-emerald/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold leading-[1.15] text-forest sm:text-4xl lg:text-[2.75rem]">
            {t('customTourCta.titleLine1')} <span className="italic text-[#a67c2e]">{t('customTourCta.titleHighlight')}</span>
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-forest/65 sm:text-base">
            {t('customTourCta.subtitle')}
          </p>

          <Link
            to="/packages#custom-tour"
            className="group mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-forest shadow-lift transition-all duration-300 ease-out hover:scale-[1.05] hover:shadow-xl active:scale-95">

            {t('customTourCta.createMyCustomTour')}
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
          </Link>
        </Reveal>
      </div>
    </section>);

}
