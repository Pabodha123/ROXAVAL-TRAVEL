
import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';

const stats = [
{ value: '12+', label: 'Years of Experience' },
{ value: '8k+', label: 'Happy Travelers' },
{ value: '50+', label: 'Curated Tours' },
{ value: '5.0', label: 'Average Rating' }];


function parseStatValue(value: string) {
  const match = value.match(/^([\d.]+)(.*)$/);
  if (!match) return { number: 0, suffix: value, decimals: 0 };
  const [, numStr, suffix] = match;
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  return { number: parseFloat(numStr), suffix, decimals };
}

function AnimatedStat({ value }: { value: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const { number, suffix, decimals } = parseStatValue(value);
  const [display, setDisplay] = useState(`${(0).toFixed(decimals)}${suffix}`);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, number, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(`${latest.toFixed(decimals)}${suffix}`)
    });
    return () => controls.stop();
  }, [isInView, number, suffix, decimals]);

  return (
    <p ref={ref} className="font-display text-4xl sm:text-5xl font-semibold text-white">
      {display}
    </p>);

}

export function Stats() {
  return (
    <section className="relative bg-emerald py-14">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) =>
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="text-center">

              <AnimatedStat value={s.value} />
              <p className="mt-1 text-sm text-cream/80">{s.label}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>);

}
