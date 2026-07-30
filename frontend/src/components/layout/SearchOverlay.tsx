import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchIcon, XIcon, Loader2Icon } from 'lucide-react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { searchAll, totalResultCount, EMPTY_RESULTS } from '../../lib/search';
import type { SearchResults, SearchResultItem, SearchCategory } from '../../lib/search';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const debounced = useDebouncedValue(query, 300);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setResults(EMPTY_RESULTS);
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = debounced.trim();
    if (!q) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchAll(q, 4).
    then((r) => !cancelled && setResults(r)).
    finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debounced, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const goToResults = () => {
    const q = query.trim();
    if (!q) return;
    onClose();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSelect = (item: SearchResultItem) => {
    if (!item.href) return;
    onClose();
    navigate(item.href);
  };

  const groups: { key: SearchCategory; items: SearchResultItem[] }[] = [
  { key: 'Tour Packages', items: results.packages },
  { key: 'Destinations', items: results.destinations },
  { key: 'Activities', items: results.activities },
  { key: 'Hotels', items: results.hotels },
  { key: 'Blog', items: results.blog }];

  const total = totalResultCount(results);

  return (
    <AnimatePresence>
      {open &&
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] flex items-start justify-center bg-forest/60 px-4 pt-24 backdrop-blur-sm sm:pt-32">

          <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

            <form onSubmit={(e) => { e.preventDefault(); goToResults(); }} className="flex items-center gap-3 border-b border-forest/10 px-5 py-4">
              <SearchIcon className="h-5 w-5 shrink-0 text-forest/40" />
              <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tours, destinations, activities, hotels, blog…"
              className="flex-1 text-sm text-forest outline-none placeholder:text-forest/40 sm:text-base" />

              {loading && <Loader2Icon className="h-4 w-4 shrink-0 animate-spin text-forest/40" />}
              <button type="button" onClick={onClose} aria-label="Close search" className="shrink-0 text-forest/40 hover:text-forest">
                <XIcon className="h-5 w-5" />
              </button>
            </form>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!query.trim() &&
            <p className="p-6 text-center text-sm text-forest/40">Start typing to search across tours, destinations, activities, hotels and our blog.</p>
            }
              {query.trim() && !loading && total === 0 &&
            <p className="p-6 text-center text-sm text-forest/40">No results for &ldquo;{query}&rdquo;.</p>
            }
              {groups.map((g) => g.items.length === 0 ? null :
            <div key={g.key} className="px-2 py-2">
                  <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-forest/40">{g.key}</p>
                  {g.items.map((item) =>
              <button
                key={`${g.key}-${item.id}`}
                type="button"
                disabled={!item.href}
                onClick={() => handleSelect(item)}
                className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors ${item.href ? 'cursor-pointer hover:bg-cream' : 'cursor-default'}`}>

                      {item.image ?
                <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" /> :

                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cream text-forest/30">
                          <SearchIcon className="h-4 w-4" />
                        </span>
                }
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-forest">{item.title}</span>
                        {item.subtitle && <span className="block truncate text-xs text-forest/50">{item.subtitle}</span>}
                      </span>
                    </button>
              )}
                </div>
            )}
            </div>

            {query.trim() && total > 0 &&
          <button
            type="button"
            onClick={goToResults}
            className="flex w-full items-center justify-center gap-2 border-t border-forest/10 bg-cream/40 px-5 py-3 text-sm font-semibold text-emerald hover:bg-cream">

                View all results for &ldquo;{query}&rdquo;
              </button>
          }
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}
