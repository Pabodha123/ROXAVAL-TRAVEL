import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: 'forest' | 'emerald' | 'gold';
  index?: number;
}

const accentStyles = {
  forest: 'bg-forest/8 text-forest',
  emerald: 'bg-emerald/10 text-emerald',
  gold: 'bg-gold/15 text-gold'
};

export function StatCard({ icon: Icon, label, value, accent = 'forest', index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl bg-white p-5 shadow-soft">

      <div className="flex items-center justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${accentStyles[accent]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="font-display mt-4 text-2xl font-semibold text-forest">{value}</p>
      <p className="mt-1 text-xs font-medium text-forest/50">{label}</p>
    </motion.div>);

}
