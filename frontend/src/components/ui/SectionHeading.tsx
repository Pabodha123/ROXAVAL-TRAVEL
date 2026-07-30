
import React from 'react';
import { motion } from 'framer-motion';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  light?: boolean;
  stagger?: boolean;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18 } }
};
const eyebrowVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } }
};
const titleVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};
const subtitleVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } }
};

export function SectionHeading({ eyebrow, title, subtitle, align = 'center', light = false, stagger = false }: SectionHeadingProps) {
  const wrapperClass = align === 'center' ? 'text-center mx-auto max-w-2xl' : 'max-w-2xl';

  const eyebrowEl =
  <span className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] ${light ? 'text-gold-light' : 'text-emerald'}`}>
      <span className="h-px w-8 bg-gold" />
      {eyebrow}
    </span>;

  const titleEl =
  <h2 className={`font-display mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight ${light ? 'text-white' : 'text-forest'}`}>
      {title}
    </h2>;

  const subtitleEl = subtitle &&
  <p className={`mt-4 text-base sm:text-lg leading-relaxed ${light ? 'text-cream/80' : 'text-forest/70'}`}>
      {subtitle}
    </p>;

  if (!stagger) {
    return (
      <Reveal className={wrapperClass}>
        {eyebrowEl}
        {titleEl}
        {subtitleEl}
      </Reveal>);

  }

  return (
    <motion.div
      className={wrapperClass}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={containerVariants}>

      <motion.div variants={eyebrowVariants}>{eyebrowEl}</motion.div>
      <motion.div variants={titleVariants}>{titleEl}</motion.div>
      {subtitleEl && <motion.div variants={subtitleVariants}>{subtitleEl}</motion.div>}
    </motion.div>);

}
