
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClockIcon, StarIcon, ArrowRightIcon } from 'lucide-react';
import { packages } from '../../data/content';
import { SectionHeading } from '../ui/SectionHeading';

export function Packages() {
  return (
    <section id="packages" className="relative py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Curated journeys"
          title="Featured Tour Packages"
          subtitle="Thoughtfully designed itineraries — or the foundation for a trip we tailor entirely around you." />
        

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((p, i) =>
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i % 3 * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -10 }}
            className="group flex flex-col overflow-hidden rounded-3xl bg-cream shadow-soft transition-shadow hover:shadow-lift">
            
              <div className="relative h-56 overflow-hidden">
                <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <span className="absolute top-4 left-4 rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-forest">{p.tag}</span>
                <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-forest/85 backdrop-blur px-2.5 py-1 text-xs font-semibold text-white">
                  <StarIcon className="h-3.5 w-3.5 fill-gold text-gold" /> {p.rating}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald">
                  <ClockIcon className="h-4 w-4" /> {p.duration}
                </div>
                <h3 className="font-display mt-2 text-xl font-semibold text-forest">{p.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-forest/65">{p.description}</p>

                <div className="mt-5 flex items-end justify-between border-t border-forest/10 pt-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-forest/50">From</p>
                    <p className="font-display text-2xl font-semibold text-forest">${p.price.toLocaleString()}</p>
                  </div>
                  <button className="group/btn inline-flex items-center gap-1.5 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-emerald">
                    View Details
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            </motion.article>
          )}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            to="/packages"
            className="group inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-emerald">

            View All Packages
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>);

}