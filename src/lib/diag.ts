// Экспресс-диагностика установки и самооценка S (логика функции POST.diagnostics из HTML).
import { DIAG_Q, DIAG_RESULT } from '../content/model';
import type { Attitude, AttitudeResult, Checkpoint, SelfScore } from './types';

export function computeAttitude(answers: (number | null)[]): AttitudeResult | null {
  if (answers.length < DIAG_Q.length || answers.some(a => a === null)) return null;
  const cnt = [0, 0, 0];
  answers.forEach(a => { cnt[a as number]++; });
  const max = Math.max(...cnt);
  const tie = cnt.filter(c => c === max).length > 1;
  const keys: Attitude[] = ['retro', 'adaptive', 'prospective'];
  return { retro: cnt[0], adaptive: cnt[1], prospective: cnt[2], dominant: tie ? 'mixed' : keys[cnt.indexOf(max)] };
}

const IDX: Record<Attitude, number> = { retro: 0, adaptive: 1, prospective: 2, mixed: -1 };

export function attitudeName(a: Attitude): string {
  if (a === 'mixed') return 'Смешанный профиль';
  const n = DIAG_RESULT.names[IDX[a]];
  return n.charAt(0).toUpperCase() + n.slice(1);
}

export function attitudeText(a: Attitude): string {
  return a === 'mixed' ? DIAG_RESULT.tie : DIAG_RESULT.desc[IDX[a]];
}

export const LEVEL_NAMES = ['критический', 'допустимый', 'оптимальный'];
export const levelIndex = (x: number) => (x >= 8 ? 2 : x >= 5 ? 1 : 0);
export const sInt = (s: SelfScore) => (s.mc + s.kp + s.od) / 3;
export const fmt = (x: number, d = 2) => x.toFixed(d).replace('.', ',');
export const COMPONENTS: { k: keyof SelfScore; sub: string; name: string }[] = [
  { k: 'mc', sub: 'мц', name: 'мотивационно-ценностный' },
  { k: 'kp', sub: 'кп', name: 'когнитивно-прогностический' },
  { k: 'od', sub: 'од', name: 'операционально-деятельностный' },
];

/** Точка входа или выхода, в которой есть и установка, и самооценка. */
export const isFull = (c: Checkpoint | undefined): c is Required<Checkpoint> => !!c?.attitude && !!c?.selfScore;
