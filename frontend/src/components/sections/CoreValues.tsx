import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, CompassIcon, SparklesIcon, HeartHandshakeIcon } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';

const CORE_VALUES = [
{ icon: ShieldCheckIcon, title: 'Trust', text: 'Transparent pricing and honest advice, every single time.' },
{ icon: CompassIcon, title: 'Authenticity', text: 'Real local experiences, not cookie-cutter tours.' },
{ icon: SparklesIcon, title: 'Excellence', text: 'Meticulous planning so every detail feels effortless.' },
{ icon: HeartHandshakeIcon, title: 'Care', text: 'Your comfort and safety, looked after from arrival to departure.' }];


export function CoreValues() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="What We Stand For" title="Our Core Values" />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CORE_VALUES.map((v, i) =>
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="rounded-3xl bg-cream p-7 text-center shadow-soft">

              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald/10 text-emerald">
                <v.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-forest">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest/65">{v.text}</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}
