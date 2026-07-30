import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClockIcon, StarIcon, ArrowRightIcon, Users2Icon, UserIcon } from 'lucide-react';
import type { TourPackage } from '../../types/tourPackage';

const MotionLink = motion(Link);

interface PackageCardProps {
  pkg: TourPackage;
  index?: number;
}

export function PackageCard({ pkg, index = 0 }: PackageCardProps) {
  return (
    <MotionLink
      to={`/packages/${pkg._id}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index % 6 * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="group relative mx-auto block aspect-[3/5] w-full max-w-xs overflow-hidden rounded-full shadow-soft transition-shadow hover:shadow-lift">

      <img src={pkg.heroImage} alt={pkg.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/45 to-forest/10" />

      {/* Top badges — inset well clear of the curved cap */}
      <div className="absolute inset-x-10 top-10 flex items-start justify-between gap-2">
        <span className="rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-forest">{pkg.category}</span>
        <span className="flex items-center gap-1 rounded-full bg-forest/85 backdrop-blur px-2.5 py-1 text-xs font-semibold text-white">
          <StarIcon className="h-3.5 w-3.5 fill-gold text-gold" /> {pkg.rating.toFixed(1)}
        </span>
      </div>

      {/* Bottom content — centered and inset well clear of the curved cap */}
      <div className="absolute inset-x-8 bottom-16 flex flex-col items-center gap-1.5 text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-forest">
          {pkg.tourType === 'Private' ? <UserIcon className="h-3 w-3" /> : <Users2Icon className="h-3 w-3" />} {pkg.tourType}
        </span>
        <h3 className="font-display mt-1 text-lg font-semibold leading-tight text-white">{pkg.name}</h3>
        <p className="flex items-center gap-1 text-[11px] text-cream/80">
          <ClockIcon className="h-3 w-3" /> {pkg.durationDays}D / {pkg.durationNights}N
        </p>
        <div className="mt-1 flex items-baseline gap-1.5">
          {pkg.discountPrice &&
          <span className="text-xs text-cream/50 line-through">${pkg.price.toLocaleString()}</span>
          }
          <span className="font-display text-xl font-bold text-white">${(pkg.discountPrice ?? pkg.price).toLocaleString()}</span>
        </div>
        <span className="mt-2 grid h-9 w-9 place-items-center rounded-full bg-gold text-forest transition-transform group-hover:scale-110">
          <ArrowRightIcon className="h-4 w-4" />
        </span>
      </div>
    </MotionLink>);

}
