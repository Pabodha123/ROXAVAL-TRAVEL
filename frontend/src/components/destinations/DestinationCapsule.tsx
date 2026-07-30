import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { DestinationListItem } from '../../types/destination';

interface DestinationCapsuleProps {
  destination: DestinationListItem;
  index?: number;
}

export function DestinationCapsule({ destination, index = 0 }: DestinationCapsuleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index % 8 * 0.05, ease: [0.22, 1, 0.36, 1] }}>

      <Link to={`/destinations/${destination._id}`} className="group block">
        <motion.div
          whileHover={{ scale: 1.045, y: -6 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative aspect-[3/4] overflow-hidden rounded-[2.5rem] shadow-soft transition-shadow duration-500 group-hover:shadow-lift">

          <img
            src={destination.heroImage}
            alt={destination.name}
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.dataset.fallback) return;
              img.dataset.fallback = 'true';
              img.src = '/f1dc4405-8788-4026-86f6-8dcd6433d54c.jpg';
            }}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />

          <div className="absolute inset-0 bg-gradient-to-t from-forest/70 via-forest/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-forest shadow-soft backdrop-blur">
            {destination.tag}
          </span>
        </motion.div>

        <div className="mt-4 text-center">
          <h3 className="font-display text-lg font-semibold text-forest transition-colors group-hover:text-emerald">{destination.name}</h3>
          {destination.region && <p className="mt-0.5 text-xs text-forest/50">{destination.region}</p>}
        </div>
      </Link>
    </motion.div>);

}
