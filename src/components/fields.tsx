// Поля ввода: у каждого есть label, подсказка под полем, плейсхолдер — только пример. В демо-режиме поля только для чтения.
import { useId, type ReactNode } from 'react';
import { useReadOnly } from '../store/store';

type Base = { label: ReactNode; hint?: ReactNode; required?: boolean; placeholder?: string };

const Label = ({ label, required }: { label: ReactNode; required?: boolean }) => (
  <span>{label}{required && <span className="req" aria-hidden="true"> *</span>}</span>
);

export function TextField({ label, hint, required, placeholder, value, onChange, type = 'text' }: Base & { value: string; onChange: (v: string) => void; type?: 'text' | 'url' | 'date' }) {
  const id = useId(); const ro = useReadOnly();
  return (
    <div className="f">
      <label htmlFor={id}><Label label={label} required={required} /></label>
      <input id={id} type={type} value={value ?? ''} placeholder={placeholder} readOnly={ro} required={required}
        aria-describedby={hint ? `${id}-h` : undefined} onChange={e => onChange(e.target.value)} />
      {hint && <span className="hint" id={`${id}-h`}>{hint}</span>}
    </div>
  );
}

export function TextArea({ label, hint, required, placeholder, value, onChange, rows = 3 }: Base & { value: string; onChange: (v: string) => void; rows?: number }) {
  const id = useId(); const ro = useReadOnly();
  return (
    <div className="f">
      <label htmlFor={id}><Label label={label} required={required} /></label>
      <textarea id={id} value={value ?? ''} placeholder={placeholder} readOnly={ro} rows={rows} required={required}
        aria-describedby={hint ? `${id}-h` : undefined} onChange={e => onChange(e.target.value)} />
      {hint && <span className="hint" id={`${id}-h`}>{hint}</span>}
    </div>
  );
}

export function NumberField({ label, hint, value, onChange, min, max }: Base & { value: number | null; onChange: (v: number | null) => void; min?: number; max?: number }) {
  const id = useId(); const ro = useReadOnly();
  return (
    <div className="f">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="number" inputMode="numeric" min={min} max={max} readOnly={ro} value={value ?? ''}
        aria-describedby={hint ? `${id}-h` : undefined}
        onChange={e => onChange(e.target.value === '' ? null : Math.max(min ?? -Infinity, Math.min(max ?? Infinity, Number(e.target.value))))} />
      {hint && <span className="hint" id={`${id}-h`}>{hint}</span>}
    </div>
  );
}

export function SelectField<T extends string | number>({ label, hint, required, value, onChange, options, empty = 'Выберите…' }: Base & {
  value: T | null | ''; onChange: (v: T) => void; options: { value: T; label: string }[]; empty?: string;
}) {
  const id = useId(); const ro = useReadOnly();
  return (
    <div className="f">
      <label htmlFor={id}><Label label={label} required={required} /></label>
      <select id={id} value={value === null ? '' : String(value)} disabled={ro} aria-describedby={hint ? `${id}-h` : undefined}
        onChange={e => { const o = options.find(x => String(x.value) === e.target.value); if (o) onChange(o.value); }}>
        <option value="" disabled>{empty}</option>
        {options.map(o => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
      </select>
      {hint && <span className="hint" id={`${id}-h`}>{hint}</span>}
    </div>
  );
}

export function RadioGroup<T extends string | number>({ legend, hint, required, value, onChange, options, inline }: {
  legend: ReactNode; hint?: ReactNode; required?: boolean; value: T | null; onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[]; inline?: boolean;
}) {
  const name = useId(); const ro = useReadOnly();
  return (
    <fieldset>
      <legend><Label label={legend} required={required} /></legend>
      {hint && <p className="hint small muted" style={{ marginBottom: '.4rem' }}>{hint}</p>}
      <div className={`opts${inline ? ' inline' : ''}`}>
        {options.map(o => (
          <label className="opt" key={String(o.value)}>
            <input type="radio" name={name} checked={value === o.value} disabled={ro} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Checkbox({ label, checked, onChange, hint }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void; hint?: ReactNode }) {
  const ro = useReadOnly();
  return (
    <label className="check">
      <input type="checkbox" checked={checked} disabled={ro} onChange={e => onChange(e.target.checked)} />
      <span>{label}{hint && <span className="hint small muted" style={{ display: 'block' }}>{hint}</span>}</span>
    </label>
  );
}

export function Slider({ label, value, onChange, min = 1, max = 10 }: { label: ReactNode; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const id = useId(); const ro = useReadOnly();
  return (
    <div className="f">
      <label htmlFor={id} className="row between"><span>{label}</span><b className="num" aria-hidden="true">{value}</b></label>
      <input id={id} type="range" min={min} max={max} value={value} disabled={ro} onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}

/** Кнопка изменения данных: в демо-режиме не показывается. */
export function EditButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ro = useReadOnly();
  if (ro) return null;
  return <button type="button" className="btn sm" {...props} />;
}

/** Заменяет элемент массива по индексу. */
export function setAt<T>(arr: T[], i: number, v: T): T[] {
  const next = [...arr]; next[i] = v; return next;
}
