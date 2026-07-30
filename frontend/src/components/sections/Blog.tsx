
import React from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, ArrowRightIcon } from 'lucide-react';
import { blogPosts } from '../../data/content';
import { SectionHeading } from '../ui/SectionHeading';

export function Blog() {
  return (
    <section id="blog" className="relative py-24 bg-sand">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionHeading
            align="left"
            eyebrow="From the journal"
            title="Latest Travel Stories"
            subtitle="Guides, tips and tales to inspire your next Sri Lankan adventure." />
          
          <a href="#" className="hidden md:inline-flex items-center gap-2 rounded-full border border-forest/20 px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-white">
            View all posts <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {blogPosts.map((b, i) =>
          <motion.article
            key={b.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8 }}
            className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft transition-shadow hover:shadow-lift">
            
              <div className="relative h-52 overflow-hidden">
                <img src={b.image} alt={b.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-emerald">{b.category}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-1.5 text-xs text-forest/50">
                  <CalendarIcon className="h-3.5 w-3.5" /> {b.date}
                </div>
                <h3 className="font-display mt-2 text-lg font-semibold leading-snug text-forest group-hover:text-emerald transition-colors">{b.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-forest/65">{b.preview}</p>
                <a href="#" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald">
                  Read More <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </motion.article>
          )}
        </div>
      </div>
    </section>);

}