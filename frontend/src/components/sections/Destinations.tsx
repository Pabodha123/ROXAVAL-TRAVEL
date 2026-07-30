import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightIcon, BookmarkIcon, StarIcon } from 'lucide-react';
import { destinations } from '../../data/content';

export function Destinations() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDest = destinations[activeIndex];

  // Filter out the active destination to show the rest as thumbnails
  const thumbnails = destinations.filter((d) => d.id !== activeDest.id);

  return (
    <section id="destinations" className="relative flex min-h-[100svh] w-full flex-col justify-end overflow-hidden bg-forest lg:flex-row lg:items-center">
      {/* Background Image with Crossfade and Slow Zoom */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeDest.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0">
          
          <motion.img
            src={activeDest.image}
            alt={activeDest.name}
            animate={{ scale: [1, 1.1] }}
            transition={{ duration: 25, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
            className="h-full w-full object-cover" />
          
        </motion.div>
      </AnimatePresence>

      {/* Gradient Overlays for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/60 to-transparent lg:bg-gradient-to-r lg:from-forest/95 lg:via-forest/50 lg:to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-between lg:flex-row lg:items-center">
        
        {/* Left Content: Active Destination Details */}
        <div className="flex w-full flex-col justify-center px-4 pt-32 pb-8 sm:px-6 lg:w-1/2 lg:px-8 lg:py-32">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-gold-light">
            <span className="h-0.5 w-8 bg-gold-light" />
            Popular Destinations
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeDest.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6">
              
              <h2 className="font-sans text-6xl font-black uppercase tracking-tighter text-white sm:text-8xl lg:text-[7rem] drop-shadow-xl">
                {activeDest.name}
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-cream/90 sm:text-lg drop-shadow-md">
                {activeDest.description}
              </p>
              <Link to="/destinations" className="group mt-8 inline-flex items-center gap-2 rounded-full bg-emerald px-8 py-4 text-sm font-semibold text-white shadow-lift transition-all hover:scale-105 hover:bg-emerald-light active:scale-95">
                Explore <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Content: Thumbnails Carousel */}
        <div className="flex w-full gap-4 overflow-x-auto px-4 pb-12 pt-4 no-scrollbar snap-x snap-mandatory sm:px-6 lg:w-1/2 lg:px-8 lg:pb-0 lg:pt-0">
          <AnimatePresence mode="popLayout">
            {thumbnails.map((d) =>
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.8, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -40 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              key={d.id}
              onClick={() => setActiveIndex(destinations.findIndex((x) => x.id === d.id))}
              className="group relative h-64 w-44 shrink-0 snap-start cursor-pointer overflow-hidden rounded-3xl shadow-2xl sm:h-80 sm:w-56">
              
                <img
                src={d.image}
                alt={d.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              
                <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/20 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />

                {/* Bookmark Icon */}
                <div className="absolute right-3 top-3 rounded-full bg-white/20 p-2 backdrop-blur-md transition-colors group-hover:bg-white/40">
                  <BookmarkIcon className="h-4 w-4 text-white" />
                </div>

                {/* Thumbnail Details */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="font-sans text-xl font-bold text-white sm:text-2xl">{d.name}</h4>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) =>
                    <StarIcon
                      key={i}
                      className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${i < 4 ? 'fill-gold text-gold' : 'fill-gold/30 text-gold/30'}`} />

                    )}
                    </div>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md sm:text-xs">
                      {d.tag.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>);

}