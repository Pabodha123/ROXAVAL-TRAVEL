import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, CompassIcon, SparklesIcon, HeartHandshakeIcon } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';

// objectPosition is tuned per photo so the actual subject shows — the two
// portrait-oriented sources (Excellence, Care) get cropped hard to fit
// these wide cards, and a plain "top" position was cutting the subject out
// entirely (showing empty sky instead of the trophy / joined hands).
const CORE_VALUES = [
{ icon: ShieldCheckIcon, title: 'Trust', text: 'Transparent pricing and honest advice, every single time.', image: 'https://i.pinimg.com/1200x/74/a5/c5/74a5c5256dff6317fda83322f9ea8076.jpg', objectPosition: 'center 75%' },
{ icon: CompassIcon, title: 'Authenticity', text: 'Real local experiences, not cookie-cutter tours.', image: 'https://i.pinimg.com/1200x/09/04/cc/0904cc5fb13d2d7d30afa341b5138098.jpg', objectPosition: 'center 55%' },
{ icon: SparklesIcon, title: 'Excellence', text: 'Meticulous planning so every detail feels effortless.', image: 'https://i.pinimg.com/736x/c8/93/36/c893364fb36b5860b20672fa52d0d082.jpg', objectPosition: 'center 40%' },
{ icon: HeartHandshakeIcon, title: 'Care', text: 'Your comfort and safety, looked after from arrival to departure.', image: 'https://i.pinimg.com/736x/d2/c3/73/d2c3734879e0f54a15c330f142a92740.jpg', objectPosition: 'center 45%' }];


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
            className="group relative overflow-hidden rounded-3xl bg-cream p-7 text-center shadow-soft">

              <img
              src={v.image}
              alt=""
              aria-hidden="true"
              style={{ objectPosition: v.objectPosition }}
              className="absolute inset-0 h-full w-full object-cover opacity-25 grayscale transition-opacity duration-500 group-hover:opacity-40" />

              <div className="absolute inset-0 bg-gradient-to-b from-cream/60 via-cream/80 to-cream/95" />

              <div className="relative">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald/10 text-emerald">
                  <v.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-forest">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-forest/65">{v.text}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}
