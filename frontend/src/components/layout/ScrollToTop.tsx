import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SETTLE_CHECKS = 6; // consecutive stable reads before we stop correcting
const MAX_ATTEMPTS = 60; // ~6s hard cap in case content never stops shifting
const POSITION_THRESHOLD_PX = 4;

/**
 * Scrolls to the top of the page on every route change, unless the new URL
 * carries a hash — in that case it scrolls the matching element into view
 * instead. Below-the-fold content (e.g. package card images) can still be
 * loading and pushing the target section down after the first scroll, so
 * this keeps re-checking the element's position and re-corrects until it
 * settles, rather than scrolling once and risking landing short.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return;
    }

    const id = hash.replace('#', '');
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let lastTop: number | null = null;
    let stableCount = 0;
    let attempts = 0;

    const tick = () => {
      if (cancelled) return;
      attempts += 1;

      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top;
        const inView = top >= 0 && top < 120;
        const moved = lastTop === null || Math.abs(top - lastTop) > POSITION_THRESHOLD_PX;

        if (!inView || moved) {
          el.scrollIntoView({ behavior: lastTop === null ? 'smooth' : 'auto', block: 'start' });
          stableCount = 0;
        } else {
          stableCount += 1;
        }
        lastTop = top;

        if (stableCount >= SETTLE_CHECKS || attempts >= MAX_ATTEMPTS) return;
      } else if (attempts >= MAX_ATTEMPTS) {
        return;
      }

      timer = setTimeout(tick, 100);
    };

    timer = setTimeout(tick, 50);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pathname, hash]);

  return null;
}
