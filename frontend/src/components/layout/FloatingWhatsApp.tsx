import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircleIcon } from 'lucide-react';
import { whatsAppLink } from '../../lib/contact';

export function FloatingWhatsApp() {
  return (
    <motion.a
      href={whatsAppLink("Hi Roxaval Travels, I'd like to know more about your tours.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="group fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-4 text-white shadow-lift sm:px-5">

      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/60" />
      <MessageCircleIcon className="h-6 w-6 shrink-0" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-xs sm:inline-block">
        Chat on WhatsApp
      </span>
    </motion.a>);

}
