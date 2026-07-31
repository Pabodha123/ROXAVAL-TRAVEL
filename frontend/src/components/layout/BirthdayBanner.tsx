import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { XIcon, GiftIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiGetOne } from '../../lib/api';

interface BirthdayInfo {
  isBirthdayToday: boolean;
  firstName?: string;
  message?: string;
  backgroundImageUrl?: string;
  coupon?: { code: string; discountPercent: number } | null;
}

const CONFETTI_COLORS = ['#c8a24c', '#0f3d2e', '#f3ede1', '#2f6b4f'];

function fireConfetti() {
  const duration = 2500;
  const end = Date.now() + duration;
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors: CONFETTI_COLORS });
    confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors: CONFETTI_COLORS });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 }, colors: CONFETTI_COLORS, startVelocity: 45 });
}

/**
 * Shown once per page load when the logged-in customer's birthday is today
 * (see backend/src/controllers/birthday.controller.js#getMyBirthdayToday).
 * Dismissal is remembered in sessionStorage per calendar day so it doesn't
 * reappear on every route change within the same visit, but does show
 * again on a fresh visit later that same day.
 */
export function BirthdayBanner() {
  const { user, loading: authLoading } = useAuth();
  const [info, setInfo] = useState<BirthdayInfo | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (authLoading || !user || user.role !== 'customer') return;
    const todayKey = `roxaval_birthday_seen_${new Date().toISOString().slice(0, 10)}`;
    if (sessionStorage.getItem(todayKey)) return;

    apiGetOne<BirthdayInfo>('/birthdays/me/today').
    then((data) => {
      if (data.isBirthdayToday) {
        setInfo(data);
        setOpen(true);
        sessionStorage.setItem(todayKey, '1');
        fireConfetti();
      }
    }).
    catch(() => {});
  }, [authLoading, user]);

  if (!info) return null;

  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-forest/70 backdrop-blur-sm" />

          <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] border border-gold/40 shadow-lift">

            <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/30">

              <XIcon className="h-4 w-4" />
            </button>

            <div
            className="relative flex h-56 items-end bg-forest bg-cover bg-center p-6"
            style={{ backgroundImage: `linear-gradient(180deg, rgba(15,61,46,0.15) 0%, rgba(15,61,46,0.9) 100%), url('${info.backgroundImageUrl}')` }}>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Roxaval Travels</p>
                <h2 className="font-display mt-2 text-3xl font-bold leading-tight text-white drop-shadow-lg">
                  🎉 Happy Birthday,<br />{info.firstName}!
                </h2>
              </div>
            </div>

            <div className="bg-forest px-7 pb-7 pt-5">
              <p className="text-sm leading-relaxed text-cream/85">{info.message}</p>

              {info.coupon &&
            <div className="mt-4 rounded-2xl border border-dashed border-gold/60 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold">Birthday Gift · {info.coupon.discountPercent}% Off</p>
                  <p className="mt-1.5 flex items-center justify-center gap-2 font-display text-xl font-bold tracking-wider text-white">
                    <GiftIcon className="h-5 w-5 text-gold" /> {info.coupon.code}
                  </p>
                </div>
            }

              <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition-transform hover:scale-[1.02] active:scale-95">

                Thank You!
              </button>
            </div>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}
