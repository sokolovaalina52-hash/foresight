import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { copyText, download } from '../lib/io';

// ---------- toast ----------
const ToastCtx = createContext<(msg: string) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('');
  const tm = useRef<number>();
  const show = useCallback((m: string) => {
    setMsg(m);
    window.clearTimeout(tm.current);
    tm.current = window.setTimeout(() => setMsg(''), 2000);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div role="status" aria-live="polite" className="sr-only">{msg}</div>
      {msg && <div className="toast" aria-hidden="true">{msg}</div>}
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

export function CopyButton({ text, label = 'Копировать', className = 'btn sm' }: { text: string | (() => string); label?: string; className?: string }) {
  const toast = useToast();
  return (
    <button type="button" className={className} onClick={async () => {
      const ok = await copyText(typeof text === 'function' ? text() : text);
      toast(ok ? 'Скопировано' : 'Выделите текст и скопируйте вручную');
    }}>{label}</button>
  );
}

export function DownloadButton({ name, content, label = 'Скачать .md', className = 'btn sm', type }: { name: string; content: string | (() => string); label?: string; className?: string; type?: string }) {
  return <button type="button" className={className} onClick={() => download(name, typeof content === 'function' ? content() : content, type)}>{label}</button>;
}

// ---------- fields ----------
type FieldProps = { label: ReactNode; hint?: ReactNode; required?: boolean; children: (id: string, hintId?: string) => ReactNode };
export function Field({ label, hint, required, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-h` : undefined;
  return (
    <div className="f">
      <label className="lbl" htmlFor={id}>{label}{required && <span className="req" aria-hidden="true">*</span>}{required && <span className="sr-only"> (обязательно)</span>}</label>
      {children(id, hintId)}
      {hint && <div className="hint" id={hintId}>{hint}</div>}
    </div>
  );
}

export function TextArea({ label, hint, value, onChange, placeholder, required, small, rows }: {
  label: ReactNode; hint?: ReactNode; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; small?: boolean; rows?: number;
}) {
  return (
    <Field label={label} hint={hint} required={required}>
      {(id, h) => <textarea id={id} aria-describedby={h} className={small ? 'sm' : undefined} rows={rows} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />}
    </Field>
  );
}

export function TextInput({ label, hint, value, onChange, placeholder, required, type = 'text' }: {
  label: ReactNode; hint?: ReactNode; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <Field label={label} hint={hint} required={required}>
      {(id, h) => <input id={id} type={type} aria-describedby={h} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />}
    </Field>
  );
}

export function ScoreSelect({ label, value, onChange, hint }: { label: ReactNode; value: number | null; onChange: (v: number | null) => void; hint?: ReactNode }) {
  return (
    <Field label={label} hint={hint}>
      {(id, h) => (
        <select id={id} aria-describedby={h} value={value ?? ''} onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}>
          <option value="">— не задано</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      )}
    </Field>
  );
}

// ---------- modal ----------
export function Modal({ title, onClose, children, footer }: { title: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev?.focus(); };
  }, [onClose]);
  return (
    <div className="modal-back" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={ref} tabIndex={-1}>
        <div className="mh"><h3 id={titleId}>{title}</h3><button type="button" className="btn sm" onClick={onClose}>Закрыть</button></div>
        <div className="mb">{children}</div>
        {footer && <div className="mf">{footer}</div>}
      </div>
    </div>
  );
}

export const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');
