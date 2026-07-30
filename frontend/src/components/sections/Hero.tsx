
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightIcon, PlayIcon, ChevronDownIcon } from 'lucide-react';

const slides = [
{ name: 'Sigiriya', image: "/f1dc4405-8788-4026-86f6-8dcd6433d54c.jpg" },
{ name: 'Ella', image: "/28226e86-8f8e-4d79-b1fa-e1c155bc045c.jpg" },
{ name: 'Mirissa', image: "/5173712e-19bd-4ede-810a-b1fd443e9ef1.jpg" },
{ name: 'Yala', image: "/60b4c194-d3e8-44d7-8a8c-b9d58a908c56.jpg" }];


export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="home" className="relative h-screen min-h-[640px] w-full overflow-hidden">
      {/* Background slider */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={slides[index].image}
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.2 }, scale: { duration: 7, ease: 'linear' } }}
          className="absolute inset-0">
          
          <img src={slides[index].image} alt={`${slides[index].name}, Sri Lanka`} className="h-full w-full object-cover" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-forest/70 via-forest/40 to-forest/85" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="font-display mt-6 max-w-3xl text-4xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] text-white">
          
          Discover the Beauty of Sri Lanka
          <span className="block text-gold">with Roxaval Travels</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 max-w-xl text-base sm:text-lg text-cream/85 leading-relaxed">
          
          From misty tea hills to golden beaches and ancient kingdoms  we craft luxurious, fully personalized journeys
          across the pearl of the Indian Ocean.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="mt-9 flex flex-col sm:flex-row gap-4">
          
          <a
            href="#packages"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-4 text-sm font-semibold text-forest shadow-lift transition-transform hover:scale-105 active:scale-95">
            
            Explore Tour Packages
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <Link
            to="/packages#custom-tour"
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 backdrop-blur px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest">

            <PlayIcon className="h-4 w-4" /> Customize Your Tour
          </Link>
        </motion.div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((s, i) =>
        <button
          key={s.name}
          onClick={() => setIndex(i)}
          aria-label={`Show ${s.name}`}
          className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-10 bg-gold' : 'w-3 bg-white/50 hover:bg-white/80'}`} />

        )}
      </div>

      {/* Scroll cue */}
      <motion.a
        href="#destinations"
        aria-label="Scroll down"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 grid place-items-center h-11 w-11 rounded-full border border-white/30 text-white">
        
        <ChevronDownIcon className="h-5 w-5" />
      </motion.a>
    </section>);

}