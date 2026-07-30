
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PalmtreeIcon } from 'lucide-react';

export function Loader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done &&
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.6 } }}
        className="fixed inset-0 z-[100] grid place-items-center bg-forest">
        
          <div className="flex flex-col items-center">
            <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="grid h-16 w-16 place-items-center rounded-2xl bg-gold text-forest">
            
              <PalmtreeIcon className="h-8 w-8" />
            </motion.div>
            <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display mt-5 text-2xl font-semibold text-white">
            
              Roxaval Travels
            </motion.p>
            <div className="mt-4 h-1 w-40 overflow-hidden rounded-full bg-white/15">
              <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              className="h-full w-full bg-gold" />
            
            </div>
          </div>
        </motion.div>
      }
    </AnimatePresence>);

}