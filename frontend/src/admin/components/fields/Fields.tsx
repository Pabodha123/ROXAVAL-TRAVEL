import React, { useRef, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, Loader2Icon, PlusIcon, UploadCloudIcon, XIcon } from 'lucide-react';
import { apiUploadImage, apiUploadImages } from '../../../lib/api';

const baseInput = 'w-full rounded-xl border border-forest/15 bg-white px-3.5 py-2.5 text-sm text-forest outline-none transition-colors focus:border-emerald placeholder:text-forest/35';
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-forest/60';

interface FieldWrapProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export function FieldWrap({ label, required, error, hint, children }: FieldWrapProps) {
  return (
    <div>
      <label className={labelClass}>{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-forest/40">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>);

}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  error?: string;
}

export function TextField({ label, value, onChange, type = 'text', placeholder, required, minLength, error }: TextFieldProps) {
  return (
    <FieldWrap label={label} required={required} error={error}>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} minLength={minLength} className={baseInput} />
    </FieldWrap>);

}

interface NumberFieldProps {
  label: string;
  value: number | '';
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  required?: boolean;
  error?: string;
}

export function NumberField({ label, value, onChange, min, step, required, error }: NumberFieldProps) {
  return (
    <FieldWrap label={label} required={required} error={error}>
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        className={baseInput} />

    </FieldWrap>);

}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  required?: boolean;
  minLength?: number;
  error?: string;
}

export function TextAreaField({ label, value, onChange, rows = 4, required, minLength, error }: TextAreaFieldProps) {
  return (
    <FieldWrap label={label} required={required} error={error}>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} required={required} minLength={minLength} className={`${baseInput} resize-y`} />
    </FieldWrap>);

}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  required?: boolean;
  error?: string;
}

export function SelectField({ label, value, onChange, options, required, error }: SelectFieldProps) {
  return (
    <FieldWrap label={label} required={required} error={error}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={baseInput}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </FieldWrap>);

}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-forest">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-forest/30 text-emerald focus:ring-emerald" />
      {label}
    </label>);

}

interface TagListInputProps {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}

export function TagListInput({ label, value, onChange, placeholder = 'Type and press Enter' }: TagListInputProps) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setDraft('');
  };

  return (
    <FieldWrap label={label}>
      <div className="flex flex-wrap gap-2 rounded-xl border border-forest/15 bg-white p-2.5">
        {value.map((tag, i) =>
        <span key={tag + i} className="inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-forest">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="text-forest/40 hover:text-red-500">
              <XIcon className="h-3 w-3" />
            </button>
          </span>
        )}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          onBlur={add}
          placeholder={placeholder}
          className="min-w-[140px] flex-1 border-none bg-transparent px-1 py-1 text-sm outline-none placeholder:text-forest/35" />

      </div>
    </FieldWrap>);

}

interface RefOption {
  value: string;
  label: string;
}

interface RefMultiSelectProps {
  label: string;
  options: RefOption[];
  value: string[];
  onChange: (v: string[]) => void;
}

export function RefMultiSelect({ label, options, value, onChange }: RefMultiSelectProps) {
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  return (
    <FieldWrap label={label}>
      <div className="max-h-44 overflow-y-auto rounded-xl border border-forest/15 bg-white p-2">
        {options.length === 0 && <p className="p-2 text-xs text-forest/40">No options available.</p>}
        {options.map((opt) =>
        <label key={opt.value} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-forest hover:bg-cream">
            <input type="checkbox" checked={value.includes(opt.value)} onChange={() => toggle(opt.value)} className="h-4 w-4 rounded border-forest/30 text-emerald focus:ring-emerald" />
            {opt.label}
          </label>
        )}
      </div>
    </FieldWrap>);

}

interface OrderedRefListProps {
  label: string;
  options: RefOption[];
  value: string[];
  onChange: (v: string[]) => void;
}

/**
 * Like RefMultiSelect but preserves and lets you edit the *order* of the
 * selected items (a dropdown adds to the end; each row can move up/down or
 * be removed) — used where sequence matters, e.g. the order destinations/
 * activities are visited within an itinerary day.
 */
export function OrderedRefList({ label, options, value, onChange }: OrderedRefListProps) {
  const [draft, setDraft] = useState('');
  const labelFor = (id: string) => options.find((o) => o.value === id)?.label || id;
  const available = options.filter((o) => !value.includes(o.value));

  const add = () => {
    if (!draft) return;
    onChange([...value, draft]);
    setDraft('');
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <FieldWrap label={label}>
      <div className="space-y-2">
        {value.map((id, i) =>
        <div key={id + i} className="flex items-center gap-2 rounded-lg border border-forest/10 bg-white px-2.5 py-1.5 text-sm text-forest">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cream text-[10px] font-bold text-forest/50">{i + 1}</span>
            <span className="flex-1 truncate">{labelFor(id)}</span>
            <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="text-forest/40 hover:text-forest disabled:opacity-20"><ChevronUpIcon className="h-3.5 w-3.5" /></button>
            <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="text-forest/40 hover:text-forest disabled:opacity-20"><ChevronDownIcon className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => remove(i)} className="text-forest/40 hover:text-red-500"><XIcon className="h-3.5 w-3.5" /></button>
          </div>
        )}
        {value.length === 0 && <p className="text-xs text-forest/35">No items added yet.</p>}
        <div className="flex gap-2">
          <select value={draft} onChange={(e) => setDraft(e.target.value)} className="flex-1 rounded-lg border border-forest/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-emerald">
            <option value="">Add item…</option>
            {available.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button type="button" onClick={add} disabled={!draft} className="rounded-lg bg-cream px-3 py-1.5 text-xs font-semibold text-forest hover:bg-emerald/10 disabled:opacity-40">Add</button>
        </div>
      </div>
    </FieldWrap>);

}

interface ImageUploaderProps {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  multiple?: boolean;
}

export function ImageUploader({ label, value, onChange, multiple = true }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      if (multiple) {
        const { urls } = await apiUploadImages(Array.from(files));
        onChange([...value, ...urls]);
      } else {
        const { url } = await apiUploadImage(files[0]);
        onChange([url]);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <FieldWrap label={label}>
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) =>
        <div key={url + i} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-forest/10">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
            type="button"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="absolute inset-0 flex items-center justify-center bg-forest/60 text-white opacity-0 transition-opacity group-hover:opacity-100">

              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="grid h-20 w-20 place-items-center rounded-xl border-2 border-dashed border-forest/20 text-forest/40 transition-colors hover:border-emerald hover:text-emerald disabled:opacity-50">

          {uploading ? <Loader2Icon className="h-5 w-5 animate-spin" /> : <UploadCloudIcon className="h-5 w-5" />}
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>
    </FieldWrap>);

}

interface CollapsibleRowProps {
  isOpen: boolean;
  onToggle: () => void;
  summary: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function CollapsibleRow({ isOpen, onToggle, summary, actions, children }: CollapsibleRowProps) {
  return (
    <div className="rounded-xl border border-forest/10">
      <div className="flex items-center justify-between gap-2 p-4">
        <button type="button" onClick={onToggle} className="flex flex-1 items-center gap-2 text-left text-sm font-semibold text-forest">
          {isOpen ? <ChevronUpIcon className="h-4 w-4 shrink-0 text-forest/40" /> : <ChevronDownIcon className="h-4 w-4 shrink-0 text-forest/40" />}
          <span className="truncate">{summary}</span>
        </button>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </div>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>);

}

interface RepeatSectionProps {
  label: string;
  onAdd: () => void;
  addLabel?: string;
  children: React.ReactNode;
}

export function RepeatSection({ label, onAdd, addLabel = 'Add', children }: RepeatSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className={labelClass}>{label}</p>
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald hover:underline">
          <PlusIcon className="h-3.5 w-3.5" /> {addLabel}
        </button>
      </div>
      <div className="mt-2 space-y-3">{children}</div>
    </div>);

}
