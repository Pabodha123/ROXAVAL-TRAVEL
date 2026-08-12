import React, { useState } from 'react';
import { XIcon } from 'lucide-react';

export type LocalizedString = { en: string; de: string; fr: string };
export const emptyLocalizedString = (): LocalizedString => ({ en: '', de: '', fr: '' });

const baseInput = 'w-full rounded-xl border border-forest/15 bg-white px-3.5 py-2.5 text-sm text-forest outline-none transition-colors focus:border-emerald placeholder:text-forest/35';
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-forest/60';

const LANGS: { code: keyof LocalizedString; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'fr', label: 'FR' },
];

function LangTabs({ active, onChange, missing }: { active: keyof LocalizedString; onChange: (l: keyof LocalizedString) => void; missing: Record<string, boolean> }) {
  return (
    <div className="flex gap-1">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => onChange(l.code)}
          className={`relative rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
            active === l.code ? 'bg-emerald text-white' : 'bg-forest/5 text-forest/50 hover:bg-forest/10'
          }`}
        >
          {l.label}
          {missing[l.code] && l.code !== 'en' && (
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-gold" title="Not translated yet" />
          )}
        </button>
      ))}
    </div>
  );
}

interface TranslatedInputProps {
  label: string;
  value: LocalizedString;
  onChange: (v: LocalizedString) => void;
  required?: boolean;
  placeholder?: string;
}

/** Single-line text field with EN/DE/FR tabs — EN is the required baseline, DE/FR fall back to it on the live site when left blank. */
export function TranslatedInput({ label, value, onChange, required, placeholder }: TranslatedInputProps) {
  const [lang, setLang] = useState<keyof LocalizedString>('en');
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className={labelClass}>{label}{required && <span className="text-red-500"> *</span>}</label>
        <LangTabs active={lang} onChange={setLang} missing={{ de: !value.de, fr: !value.fr }} />
      </div>
      <input
        value={value[lang] || ''}
        onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
        placeholder={placeholder}
        required={required && lang === 'en'}
        className={baseInput}
      />
      {lang !== 'en' && !value[lang] && <p className="mt-1 text-[11px] text-forest/40">Not translated yet - the English text is shown instead.</p>}
    </div>
  );
}

interface TranslatedTextareaProps {
  label: string;
  value: LocalizedString;
  onChange: (v: LocalizedString) => void;
  required?: boolean;
  rows?: number;
}

export function TranslatedTextarea({ label, value, onChange, required, rows = 4 }: TranslatedTextareaProps) {
  const [lang, setLang] = useState<keyof LocalizedString>('en');
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className={labelClass}>{label}{required && <span className="text-red-500"> *</span>}</label>
        <LangTabs active={lang} onChange={setLang} missing={{ de: !value.de, fr: !value.fr }} />
      </div>
      <textarea
        value={value[lang] || ''}
        onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
        rows={rows}
        required={required && lang === 'en'}
        className={`${baseInput} resize-y`}
      />
      {lang !== 'en' && !value[lang] && <p className="mt-1 text-[11px] text-forest/40">Not translated yet - the English text is shown instead.</p>}
    </div>
  );
}

interface TranslatedTagListInputProps {
  label: string;
  value: LocalizedString[];
  onChange: (v: LocalizedString[]) => void;
  placeholder?: string;
}

/**
 * Order-aligned localized tag list — items are added/removed from the EN
 * tab (the structural source of truth); DE/FR tabs only translate the text
 * of items that already exist, keeping all three arrays the same length.
 */
export function TranslatedTagListInput({ label, value, onChange, placeholder = 'Type and press Enter' }: TranslatedTagListInputProps) {
  const [lang, setLang] = useState<keyof LocalizedString>('en');
  const [draft, setDraft] = useState('');

  const addEn = () => {
    const trimmed = draft.trim();
    if (trimmed) onChange([...value, { en: trimmed, de: '', fr: '' }]);
    setDraft('');
  };
  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const updateAt = (i: number, text: string) => onChange(value.map((v, idx) => (idx === i ? { ...v, [lang]: text } : v)));

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className={labelClass}>{label}</label>
        <LangTabs active={lang} onChange={setLang} missing={{ de: value.some((v) => !v.de), fr: value.some((v) => !v.fr) }} />
      </div>
      {lang === 'en' ? (
        <div className="flex flex-wrap gap-2 rounded-xl border border-forest/15 bg-white p-2.5">
          {value.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-forest">
              {tag.en}
              <button type="button" onClick={() => removeAt(i)} className="text-forest/40 hover:text-red-500">
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addEn();
              }
            }}
            onBlur={addEn}
            placeholder={placeholder}
            className="min-w-[140px] flex-1 border-none bg-transparent px-1 py-1 text-sm outline-none placeholder:text-forest/35"
          />
        </div>
      ) : (
        <div className="space-y-2">
          {value.length === 0 && <p className="text-xs text-forest/35">Add items in the EN tab first, then translate them here.</p>}
          {value.map((tag, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-28 shrink-0 truncate text-xs text-forest/40" title={tag.en}>{tag.en}</span>
              <input
                value={tag[lang] || ''}
                onChange={(e) => updateAt(i, e.target.value)}
                placeholder={`Translate to ${lang.toUpperCase()}`}
                className={baseInput}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
