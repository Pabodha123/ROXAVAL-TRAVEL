import React, { useEffect, useRef, useState } from 'react';
import { CalendarIcon } from 'lucide-react';

interface DateFieldProps {
  value: string;
  onChange: (isoValue: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
  placeholder?: string;
  className: string;
  id?: string;
}

function isoToDisplay(iso: string) {
  const [y, m, d] = (iso || '').split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
}

function displayToIso(display: string) {
  const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  const day = Number(d);
  const month = Number(m);
  const year = Number(y);
  const test = new Date(Date.UTC(year, month - 1, day));
  const isRealDate = test.getUTCFullYear() === year && test.getUTCMonth() === month - 1 && test.getUTCDate() === day;
  return isRealDate ? `${y}-${m}-${d}` : null;
}

// Native <input type="date"> renders its displayed (not just stored) format
// according to the visitor's browser/OS locale, which we can't override —
// some visitors see mm/dd/yyyy, others yyyy-mm-dd. This wraps a plain text
// input (always shown/typed as dd/mm/yyyy) with a hidden native date input
// used only to power a real calendar picker via showPicker().
export function DateField({ value, onChange, min, max, required, placeholder = 'dd/mm/yyyy', className, id }: DateFieldProps) {
  const [text, setText] = useState(isoToDisplay(value));
  const nativeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(isoToDisplay(value));
  }, [value]);

  const handleTextChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    else if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    setText(formatted);
    if (formatted.length === 10) {
      const iso = displayToIso(formatted);
      if (iso) onChange(iso);
    } else if (formatted.length === 0) {
      onChange('');
    }
  };

  const openPicker = () => {
    const el = nativeRef.current;
    if (!el) return;
    if (typeof el.showPicker === 'function') {
      try {
        el.showPicker();
        return;
      } catch {
        // unsupported in this browser — fall back to focusing it
      }
    }
    el.focus();
  };

  // Callers pass their own full input className (border/shape/left-icon
  // padding etc.) — strip any px-* shorthand (which also sets padding-right)
  // and replace with explicit left-only padding, so our own pr-10 for the
  // calendar button always applies cleanly instead of racing px-* in the
  // cascade.
  const baseClassName = className.replace(/\bpx-(\S+)/g, 'pl-$1').replace(/\bpr-\S+/g, '').trim();

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`${baseClassName} pr-10`} />

      <button type="button" onClick={openPicker} tabIndex={-1} aria-label="Open calendar" className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/40 hover:text-forest">
        <CalendarIcon className="h-4 w-4" />
      </button>
      <input
        ref={nativeRef}
        type="date"
        value={value || ''}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0" />

    </div>);

}
