import { ATTITUDE_DESC, ATTITUDE_MIXED, ATTITUDE_NAMES, DIAG_Q } from '../content/diagnostics';
import type { AttitudeKey, AttitudeResult, ScoreTriple } from './types';

const KEYS: AttitudeKey[] = ['retro', 'adaptive', 'prospective'];

/** Подсчёт установки — та же логика, что в исходном навигаторе (POST.diagnostics) */
export function computeAttitude(picks: (number | null)[]): AttitudeResult | null {
  if (picks.length < DIAG_Q.length || picks.some(p => p == null)) return null;
  const cnt = [0, 0, 0];
  picks.forEach(p => { cnt[p as number]++; });
  const max = Math.max(...cnt);
  const tie = cnt.filter(c => c === max).length > 1;
  return { retro: cnt[0], adaptive: cnt[1], prospective: cnt[2], dominant: tie ? 'mixed' : KEYS[cnt.indexOf(max)] };
}

export function attitudeName(a: AttitudeResult | null | undefined): string {
  if (!a) return '—';
  if (a.dominant === 'mixed') return 'Смешанный профиль';
  const n = ATTITUDE_NAMES[KEYS.indexOf(a.dominant)];
  return n.charAt(0).toUpperCase() + n.slice(1);
}

export function attitudeText(a: AttitudeResult): string {
  return a.dominant === 'mixed' ? ATTITUDE_MIXED : ATTITUDE_DESC[KEYS.indexOf(a.dominant)];
}

export const LEVEL_NAMES = ['критический', 'допустимый', 'оптимальный'] as const;
/** Пороги как в исходном калькуляторе: ≥ 8 — оптимальный, ≥ 5 — допустимый, иначе критический */
export const levelIndex = (x: number) => (x >= 8 ? 2 : x >= 5 ? 1 : 0);
export const sInt = (s: ScoreTriple) => (s.mc + s.kp + s.od) / 3;
export const fmt2 = (x: number) => x.toFixed(2).replace('.', ',');
