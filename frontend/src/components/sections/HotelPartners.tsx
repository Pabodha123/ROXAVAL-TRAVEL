import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';

const HOTEL_PARTNERS = [
{ name: 'Amaya Resorts', logo: 'https://upload.wikimedia.org/wikipedia/en/3/31/Amaya_Resorts_%26_Spas_logo.jpeg' },
{ name: 'Browns Hotels', logo: 'https://dz3vy4jhqsnnj.cloudfront.net/2025/03/browns-logo-white-full-1-1-1.png' },
{ name: 'Cinnamon Hotels', logo: 'https://api.liabots.ai/files/cinnamon/chat-widget-icons/bubble2.png' },
{ name: 'Teardrop Hotels', logo: 'https://pbs.twimg.com/profile_images/821617386122002432/f_QPimTQ_400x400.jpg' },
{ name: '98 Acres', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_c4ACAmZgmv4IOUrCY8OUFq7tt_69smfb8HCDsFUSo33tAozQl3CHPRZgyCc5T9g&s=10&ec=121924574' }];


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
          {MARQUEE_ITEMS.map((partner, i) =>
          <div
            key={i}
            className="flex h-28 w-64 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-forest/10 bg-white px-8 py-4 shadow-soft transition-shadow hover:shadow-lift">

              <img src={partner.logo} alt={partner.name} className="h-14 max-w-full object-contain" />
              <p className="font-display text-center text-xs font-semibold tracking-wide text-forest/50">{partner.name}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}
