import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangleIcon, Loader2Icon } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: 'danger' | 'default';
  onConfirm: () => Promise<void> | void;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => void;
}

const ConfirmContext = React.createContext<ConfirmContextValue | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [busy, setBusy] = useState(false);

  const confirm = (opts: ConfirmOptions) => setOptions(opts);

  const handleConfirm = async () => {
    if (!options) return;
    setBusy(true);
    try {
      await options.onConfirm();
      setOptions(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {options &&
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4">
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !busy && setOptions(null)}
            className="fixed inset-0 bg-forest/60 backdrop-blur-sm" />

            <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-lift">

              <span className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl ${options.tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-gold/15 text-gold'}`}>
                <AlertTriangleIcon className="h-6 w-6" />
              </span>
              <h3 className="font-display mt-4 text-lg font-semibold text-forest">{options.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest/60">{options.message}</p>
              <div className="mt-6 flex gap-3">
                <button
                disabled={busy}
                onClick={() => setOptions(null)}
                className="flex-1 rounded-full border border-forest/15 px-4 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-cream disabled:opacity-50">

                  Cancel
                </button>
                <button
                disabled={busy}
                onClick={handleConfirm}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-70 ${
                options.tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-forest hover:bg-emerald'}`
                }>

                  {busy && <Loader2Icon className="h-4 w-4 animate-spin" />}
                  {options.confirmLabel || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </ConfirmContext.Provider>);

}

export function useConfirm() {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmDialogProvider');
  return ctx.confirm;
}
