import { useEffect, useState } from 'react';

let listener: ((m: string) => void) | null = null;
export const toast = (message: string) => listener?.(message);

export function Toast() {
  const [msg, setMsg] = useState(''); const [show, setShow] = useState(false);
  useEffect(() => {
    let t: number | undefined;
    listener = m => { setMsg(m); setShow(true); window.clearTimeout(t); t = window.setTimeout(() => setShow(false), 1800); };
    return () => { listener = null; };
  }, []);
  return <div className={`toast${show ? ' show' : ''}`} role="status" aria-live="polite">{msg}</div>;
}
