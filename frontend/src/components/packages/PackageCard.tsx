import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClockIcon, StarIcon, ArrowRightIcon, Users2Icon, UserIcon } from 'lucide-react';
import type { TourPackage } from '../../types/tourPackage';

interface PackageCardProps {
  pkg: TourPackage;
  index?: number;
}

export function PackageCard({ pkg, index = 0 }: PackageCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index % 6 * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft transition-shadow hover:shadow-lift">

      <Link to={`/packages/${pkg._id}`} className="flex flex-1 flex-col">
        <div className="relative h-52 overflow-hidden">
          <img src={pkg.heroImage} alt={pkg.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <span className="absolute top-4 left-4 rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-forest">{pkg.category}</span>
          <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-forest/85 backdrop-blur px-2.5 py-1 text-xs font-semibold text-white">
            <StarIcon className="h-3.5 w-3.5 fill-gold text-gold" /> {pkg.rating.toFixed(1)}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-cream px-2.5 py-1 text-[10px] font-semibold text-forest/70">
            {pkg.tourType === 'Private' ? <UserIcon className="h-3 w-3" /> : <Users2Icon className="h-3 w-3" />} {pkg.tourType}
          </span>
          <h3 className="font-display mt-2.5 text-xl font-semibold text-forest">{pkg.name}</h3>
          <p className="mt-2 flex-1 flex items-center gap-1 text-xs text-forest/60">
            <ClockIcon className="h-3.5 w-3.5" /> {pkg.durationDays}D / {pkg.durationNights}N
          </p>

          <div className="mt-5 flex items-end justify-between border-t border-forest/10 pt-4">
            <div>
              {pkg.discountPrice &&
              <p className="text-xs text-forest/40 line-through">${pkg.price.toLocaleString()}</p>
              }
              <p className="font-display text-2xl font-semibold text-forest">${(pkg.discountPrice ?? pkg.price).toLocaleString()}</p>
            </div>
            <span className="group/btn inline-flex items-center gap-1.5 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream transition-colors group-hover:bg-emerald">
              View Details
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>);

}
