import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClockIcon, MapPinIcon, GaugeIcon, ArrowRightIcon } from 'lucide-react';
import type { Activity } from '../../types/activity';

const difficultyStyles: Record<Activity['difficultyLevel'], string> = {
  Easy: 'bg-emerald/90 text-white',
  Moderate: 'bg-gold/95 text-forest',
  Hard: 'bg-red-500/90 text-white'
};

interface ActivityCardProps {
  activity: Activity;
  index?: number;
}

export function ActivityCard({ activity, index = 0 }: ActivityCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index % 6 * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="group flex flex-col overflow-hidden rounded-3xl bg-cream shadow-soft transition-shadow hover:shadow-lift">

      <div className="relative h-52 overflow-hidden">
        <img src={activity.image} alt={activity.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <span className="absolute top-4 left-4 rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-forest">{activity.category}</span>
        <span className={`absolute top-4 right-4 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur ${difficultyStyles[activity.difficultyLevel]}`}>
          {activity.difficultyLevel}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold text-forest">{activity.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-forest/65 line-clamp-2">{activity.description}</p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-forest/60">
          {activity.location &&
          <span className="inline-flex items-center gap-1"><MapPinIcon className="h-3.5 w-3.5" /> {activity.location}</span>
          }
          <span className="inline-flex items-center gap-1"><ClockIcon className="h-3.5 w-3.5" /> {activity.durationHours}h</span>
          {activity.bestSeason &&
          <span className="inline-flex items-center gap-1"><GaugeIcon className="h-3.5 w-3.5" /> {activity.bestSeason}</span>
          }
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-forest/10 pt-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-forest/50">From</p>
            <p className="font-display text-2xl font-semibold text-forest">${activity.priceFrom}</p>
          </div>
          <Link
            to={`/activity/${activity._id}`}
            className="group/btn inline-flex items-center gap-1.5 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-emerald">

            View Details
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.article>);

}
