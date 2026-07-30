import React from 'react';
import { motion } from 'framer-motion';
import { BreadcrumbBackRow } from './BreadcrumbBackRow';

interface Crumb {
  label: string;
  href?: string;
}

interface PageBannerProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  breadcrumbs: Crumb[];
}

/**
 * Shared hero banner for top-level public pages (About, Contact, Blog,
 * Reviews, Terms) — a Back button + breadcrumb trail over a forest-toned
 * band, matching the "hero band" style already used on Activities.tsx /
 * TourPackages.tsx and the breadcrumb pattern from DestinationDetails.tsx.
 */
export function PageBanner({ eyebrow, title, subtitle, breadcrumbs }: PageBannerProps) {
  return (
    <section className="relative overflow-hidden bg-forest pb-16 pt-8 text-center text-white">
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald/30 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <BreadcrumbBackRow breadcrumbs={breadcrumbs} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto mt-10 max-w-2xl px-4">

        {eyebrow &&
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">
            <span className="h-px w-8 bg-gold" />
            {eyebrow}
          </span>
        }
        <h1 className="font-display mt-4 text-4xl font-semibold sm:text-6xl">{title}</h1>
        {subtitle && <p className="mt-4 text-cream/80">{subtitle}</p>}
      </motion.div>
    </section>);

}
