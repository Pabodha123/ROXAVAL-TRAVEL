import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';

const HOTEL_PARTNERS = ['Amaya Resorts', 'Browns Hotels', 'Cinnamon Hotels', 'Teardrop Hotels', '98 Acres'];

// Duplicated once so the CSS marquee can loop seamlessly at -50% translateX.
const MARQUEE_ITEMS = [...HOTEL_PARTNERS, ...HOTEL_PARTNERS];

export function HotelPartners() {
  return (
    <section className="bg-cream py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Who We Work With" title="Our Hotel Partners" subtitle="Preferred rates and priority service from Sri Lanka's leading hotel groups." />
      </div>

      <div className="relative mt-14 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-cream to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-cream to-transparent sm:w-32" />
        <div className="flex w-max animate-marquee gap-6">
          {MARQUEE_ITEMS.map((name, i) =>
          <div
            key={i}
            className="flex h-28 w-64 shrink-0 items-center justify-center rounded-2xl border border-forest/10 bg-white px-8 shadow-soft transition-shadow hover:shadow-lift">

              <p className="font-display text-center text-xl font-semibold tracking-wide text-forest/80">{name}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}
