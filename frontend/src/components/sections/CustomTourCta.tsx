import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  CheckIcon,
  MapPinIcon,
  MessageCircleIcon,
  SparklesIcon } from
'lucide-react';
import { Reveal } from '../ui/Reveal';

const SRI_LANKA_PATH = 'M110,10 C142,12 158,45 158,78 C158,110 142,132 152,164 C162,196 180,218 176,255 C172,290 162,312 158,338 C154,368 134,400 112,416 C96,398 74,376 60,347 C46,318 38,291 34,262 C30,230 40,200 46,176 C52,152 36,135 36,105 C36,80 44,55 62,38 C76,25 88,18 110,10 Z';

const topDestinations = [
{ name: 'Sigiriya', x: 115, y: 125 },
{ name: 'Kandy', x: 108, y: 185 },
{ name: 'Colombo', x: 55, y: 205 },
{ name: 'Ella', x: 128, y: 270 },
{ name: 'Yala', x: 150, y: 310 },
{ name: 'Mirissa', x: 95, y: 370 }];

export function CustomTourCta() {
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
            Made around you
          </span>
          <h2 className="font-display mt-5 max-w-2xl text-4xl font-semibold leading-[1.1] text-white sm:text-5xl">
            Can&apos;t Find Your <span className="italic text-gold">Perfect Tour?</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/80 sm:text-lg">
            Design your own Sri Lanka holiday based on your travel preferences. Tell us your requirements, and our travel experts will create a personalized itinerary specially for you.
          </p>

          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {['Tailored to your pace', 'Handpicked stays & experiences', 'Local expertise, end to end', 'No obligation to book'].map((benefit) =>
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

              Create My Custom Tour
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://wa.me/94771234567"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest">
              
              <MessageCircleIcon className="h-4 w-4" />
              Talk to an Expert
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <motion.div
            initial={{ rotate: 2, opacity: 0 }}
            whileInView={{ rotate: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[2rem] border border-white/15 bg-white/[0.09] p-5 shadow-2xl backdrop-blur-md sm:p-6">
            
            <div className="flex items-center justify-between border-b border-white/15 pb-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold text-forest">
                  <MapPinIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Top Destinations</p>
                  <p className="mt-0.5 text-xs text-cream/60">Explore the island with us</p>
                </div>
              </div>
              <SparklesIcon className="h-5 w-5 text-gold" />
            </div>

            <div className="relative mx-auto mt-6 aspect-[11/21] w-full max-w-[220px]">
              <svg viewBox="0 0 220 420" className="h-full w-full overflow-visible">
                <motion.path
                  d={SRI_LANKA_PATH}
                  fill="rgba(219,187,111,0.08)"
                  stroke="#dbbb6f"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />

                {topDestinations.map((d, i) =>
                <g key={d.name}>
                    <motion.circle
                    cx={d.x}
                    cy={d.y}
                    r={9}
                    fill="rgba(200,162,76,0.35)"
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: [0, 1.6, 1.6], opacity: [0, 0.6, 0] }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.1 + i * 0.15, duration: 1.8, repeat: Infinity, repeatDelay: 0.8 }} />

                    <motion.circle
                    cx={d.x}
                    cy={d.y}
                    r={4}
                    fill="#c8a24c"
                    stroke="#0f3d2e"
                    strokeWidth={1.5}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 + i * 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />
                  </g>
                )}
              </svg>
              {topDestinations.map((d, i) =>
              <motion.span
                key={d.name}
                initial={{ opacity: 0, y: 4 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.15 + i * 0.15, duration: 0.4 }}
                className="absolute -translate-x-1/2 translate-y-1.5 whitespace-nowrap text-[10px] font-medium text-cream/90"
                style={{ left: `${d.x / 220 * 100}%`, top: `${d.y / 420 * 100}%` }}>

                  {d.name}
                </motion.span>
              )}
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/10 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-light text-white">
                <SparklesIcon className="h-4 w-4" />
              </span>
              <p className="text-xs leading-relaxed text-cream/75">
                Share your ideas. We&apos;ll send a one-of-a-kind itinerary within 24 hours.
              </p>
            </div>
          </motion.div>
          <div className="absolute -right-4 -top-5 hidden rounded-full bg-gold px-4 py-2 text-xs font-bold text-forest shadow-lg sm:block">
            100% your way
          </div>
        </Reveal>
      </div>
    </section>);

}