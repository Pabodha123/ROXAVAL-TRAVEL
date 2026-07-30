import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-2xl' }: ModalProps) {
  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto p-4 py-10 sm:p-6">
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-forest/60 backdrop-blur-sm" />

          <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={`relative z-10 w-full ${maxWidth} rounded-3xl bg-white shadow-lift`}>

            <div className="flex items-center justify-between border-b border-forest/10 px-6 py-5">
              <h2 className="font-display text-lg font-semibold text-forest">{title}</h2>
              <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-forest/50 transition-colors hover:bg-cream hover:text-forest">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto p-6">{children}</div>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}
