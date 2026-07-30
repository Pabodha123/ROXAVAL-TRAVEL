import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GlobeIcon, CheckIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../../i18n';

interface LanguageSwitcherProps {
  variant?: 'dark' | 'light';
  className?: string;
}

export function LanguageSwitcher({ variant = 'dark', className = '' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = i18n.language?.slice(0, 2) || 'en';

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const iconClasses =
    variant === 'dark'
      ? 'p-2.5 rounded-full text-cream/90 hover:bg-white/10 hover:text-white transition-colors'
      : 'p-2.5 rounded-full text-forest/70 hover:bg-forest/5 hover:text-forest transition-colors';

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t('nav.changeLanguage')}
        aria-expanded={open}
        className={iconClasses}
      >
        <GlobeIcon className="h-5 w-5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-44 rounded-2xl bg-white shadow-lift p-2 overflow-hidden z-50"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-sm text-forest/80 rounded-xl hover:bg-cream hover:text-emerald transition-colors"
              >
                <span>{lang.nativeLabel}</span>
                {current === lang.code && <CheckIcon className="h-4 w-4 text-emerald" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
