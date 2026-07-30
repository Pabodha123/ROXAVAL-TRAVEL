import React, { useMemo, useRef, useState } from 'react';
import { CheckIcon, PlusIcon, XIcon } from 'lucide-react';

export interface AutocompleteOption {
  id: string;
  label: string;
}

interface AutocompleteTagInputProps {
  label: string;
  placeholder?: string;
  options: AutocompleteOption[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  customValues: string[];
  onCustomValuesChange: (values: string[]) => void;
}

/**
 * Free-text tag input with an autocomplete dropdown against known options.
 * Selecting a suggestion adds it to `selectedIds`; typing something with no
 * match and pressing Enter/comma adds it to `customValues` instead, so a
 * customer can request a destination/activity that isn't in the system yet.
 */
export function AutocompleteTagInput({
  label,
  placeholder = 'Type to search or add your own…',
  options,
  selectedIds,
  onSelectedIdsChange,
  customValues,
  onCustomValuesChange
}: AutocompleteTagInputProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout>>();

  const selectedLabels = useMemo(
    () => selectedIds.map((id) => options.find((o) => o.id === id)).filter((o): o is AutocompleteOption => Boolean(o)),
    [selectedIds, options]
  );

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return options.filter((o) => !selectedIds.includes(o.id) && o.label.toLowerCase().includes(q)).slice(0, 8);
  }, [query, options, selectedIds]);

  const exactMatch = options.some((o) => o.label.toLowerCase() === query.trim().toLowerCase());

  const addCustom = () => {
    const value = query.trim();
    if (!value || exactMatch || customValues.some((v) => v.toLowerCase() === value.toLowerCase())) {
      setQuery('');
      return;
    }
    onCustomValuesChange([...customValues, value]);
    setQuery('');
  };

  const selectOption = (option: AutocompleteOption) => {
    onSelectedIdsChange([...selectedIds, option.id]);
    setQuery('');
  };

  const removeSelected = (id: string) => onSelectedIdsChange(selectedIds.filter((x) => x !== id));
  const removeCustom = (value: string) => onCustomValuesChange(customValues.filter((x) => x !== value));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (suggestions.length > 0) selectOption(suggestions[0]);
      else addCustom();
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-forest">{label}</label>

      {(selectedLabels.length > 0 || customValues.length > 0) &&
      <div className="mb-3 flex flex-wrap gap-2">
          {selectedLabels.map((o) =>
        <span key={o.id} className="flex items-center gap-1.5 rounded-full bg-emerald/10 px-3 py-1.5 text-xs font-semibold text-emerald">
              {o.label}
              <button type="button" onClick={() => removeSelected(o.id)} aria-label={`Remove ${o.label}`} className="text-emerald/60 hover:text-emerald">
                <XIcon className="h-3 w-3" />
              </button>
            </span>
        )}
          {customValues.map((v) =>
        <span key={v} className="flex items-center gap-1.5 rounded-full border border-dashed border-gold bg-gold/10 px-3 py-1.5 text-xs font-semibold text-forest">
              {v} <span className="text-[10px] uppercase text-forest/40">custom</span>
              <button type="button" onClick={() => removeCustom(v)} aria-label={`Remove ${v}`} className="text-forest/40 hover:text-forest">
                <XIcon className="h-3 w-3" />
              </button>
            </span>
        )}
        </div>
      }

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            blurTimeout.current = setTimeout(() => setFocused(false), 150);
          }}
          placeholder={placeholder}
          className="w-full rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" />


        {focused && query.trim() &&
        <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-forest/10 bg-white shadow-lift">
            {suggestions.map((o) =>
          <button
            key={o.id}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => selectOption(o)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-forest hover:bg-cream">

                <CheckIcon className="h-3.5 w-3.5 text-emerald" /> {o.label}
              </button>
          )}
            {!exactMatch &&
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={addCustom}
            className="flex w-full items-center gap-2 border-t border-forest/5 px-4 py-2.5 text-left text-sm font-semibold text-emerald hover:bg-cream">

                <PlusIcon className="h-3.5 w-3.5" /> Add "{query.trim()}" as a custom entry
              </button>
          }
          </div>
        }
      </div>
    </div>);

}
